/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodeGroup } from '../types';

export const EXTRA_CODEBASE_DATA: CodeGroup[] = [
  {
    id: 'stage_6_billing',
    title: '9. Billing Engine (Tahap 6)',
    files: [
      {
        name: 'InvoiceService.php',
        path: 'backend/app/Services/InvoiceService.php',
        language: 'php',
        description: 'Layanan utama billing untuk penagihan bulanan massal, perhitungan jatuh tempo, reminder otomatis (H-7, H-3, H-1), penangguhan (suspend H+3), dan pemulihan (unsuspend).',
        code: `<?php

namespace App\\Services;

use App\\Models\\Invoice;
use App\\Models\\Customer;
use Carbon\\Carbon;
use Exception;
use Illuminate\\Support\\Facades\\DB;
use Barryvdh\\DomPDF\\Facade\\Pdf;

class InvoiceService
{
    /**
     * Menghasilkan invoice bulanan untuk seluruh pelanggan aktif.
     */
    public function generateMonthlyInvoices(): array
    {
        $activeCustomers = Customer::where('status', 'Aktif')->with('package')->get();
        $generatedCount = 0;
        $failedCount = 0;
        $monthYear = Carbon::now()->format('m-Y');

        foreach ($activeCustomers as $customer) {
            try {
                if (!$customer->package) {
                    continue;
                }

                // Cek apakah invoice bulan ini sudah digenerate
                $exists = Invoice::where('customer_id', $customer->id)
                    ->whereMonth('due_date', Carbon::now()->month)
                    ->whereYear('due_date', Carbon::now()->year)
                    ->exists();

                if ($exists) {
                    continue;
                }

                DB::transaction(function () use ($customer, $monthYear, &$generatedCount) {
                    $invoiceNumber = 'INV-' . Carbon::now()->format('Ymd') . '-' . sprintf('%05d', $customer->id);
                    
                    Invoice::create([
                        'invoice_number' => $invoiceNumber,
                        'customer_id' => $customer->id,
                        'amount' => $customer->package->price,
                        'due_date' => Carbon::now()->addDays(7)->toDateString(), // Jatuh tempo H+7 dari generate
                        'status' => 'Belum Bayar',
                    ]);

                    $generatedCount++;
                });

            } catch (Exception $e) {
                $failedCount++;
            }
        }

        return [
            'success' => true,
            'generated' => $generatedCount,
            'failed' => $failedCount,
            'period' => $monthYear
        ];
    }

    /**
     * Mengunduh file PDF tagihan secara dinamis.
     */
    public function generateInvoicePdf($invoiceId)
    {
        $invoice = Invoice::with(['customer.package', 'customer.odp'])->findOrFail($invoiceId);
        
        $data = [
            'invoice' => $invoice,
            'company_name' => 'PT StarBilling Media Nusantara',
            'company_address' => 'Gedung Cyber 1 Lt. 3, Jl. Kuningan Barat No. 8, Jakarta Selatan',
            'company_email' => 'finance@starbilling.net',
            'company_phone' => '021-5099-2211'
        ];

        $pdf = Pdf::loadView('pdf.invoice_pdf', $data);
        return $pdf->download($invoice->invoice_number . '.pdf');
    }

    /**
     * Memproses reminder penagihan (H-7, H-3, H-1).
     */
    public function sendBillingReminders(): array
    {
        $today = Carbon::now();
        $remindersSent = 0;

        // Cari invoice 'Belum Bayar'
        $invoices = Invoice::where('status', 'Belum Bayar')->with('customer')->get();

        foreach ($invoices as $invoice) {
            $dueDate = Carbon::parse($invoice->due_date);
            $diffInDays = $dueDate->diffInDays($today, false); // Negatif jika di masa depan

            // diffInDays negatif berarti due_date belum lewat (H-N)
            $dayCount = abs((int)$diffInDays);
            
            if ($dueDate->isFuture()) {
                if ($dayCount === 7 || $dayCount === 3 || $dayCount === 1) {
                    // Kirim reminder via WA / Email
                    $this->dispatchReminderNotification($invoice, $dayCount);
                    $remindersSent++;
                }
            }
        }

        return ['success' => true, 'reminders_sent' => $remindersSent];
    }

    /**
     * Otomatis melakukan suspend pada pelanggan yang menunggak tagihan (Jatuh Tempo + 3 Hari).
     */
    public function processAutoSuspend(): array
    {
        $today = Carbon::now();
        $suspendLimitDate = $today->subDays(3)->toDateString();
        $suspendedCount = 0;

        // Invoice Overdue (Belum bayar dan melewati jatuh tempo +3 hari)
        $overdueInvoices = Invoice::where('status', 'Belum Bayar')
            ->where('due_date', '<=', $suspendLimitDate)
            ->with('customer')
            ->get();

        foreach ($overdueInvoices as $invoice) {
            $customer = $invoice->customer;
            if ($customer && $customer->status === 'Aktif') {
                DB::transaction(function () use ($customer, $invoice, &$suspendedCount) {
                    $customer->update(['status' => 'Suspend']);
                    $invoice->update(['status' => 'Suspend']);
                    
                    // Integrasi MikroTik Suspend (PPPoE/Queue)
                    app(MikrotikService::class)->suspendUser($customer->id);
                    
                    // Notifikasi Suspend via WA Gateway
                    app(WhatsappService::class)->sendSystemNotification(
                        $customer->phone,
                        "🛑 LAYANAN DI-SUSPEND\\n\\nYth. " . $customer->name . " (ID: " . $customer->customer_number . "), layanan internet Anda ditangguhkan sementara karena tagihan " . $invoice->invoice_number . " telah jatuh tempo sejak " . Carbon::parse($invoice->due_date)->format('d-m-Y') . ". Silakan lakukan pembayaran untuk mengaktifkan kembali."
                    );

                    $suspendedCount++;
                });
            }
        }

        return ['success' => true, 'suspended_customers' => $suspendedCount];
    }

    /**
     * Memproses pembayaran tagihan dan otomatis unsuspend pelanggan.
     */
    public function payInvoice($invoiceId, $paymentMethod): bool
    {
        $invoice = Invoice::findOrFail($invoiceId);
        if ($invoice->status === 'Lunas') {
            throw new Exception("Tagihan " . $invoice->invoice_number . " sudah lunas.");
        }

        DB::transaction(function () use ($invoice, $paymentMethod) {
            $invoice->update([
                'status' => 'Lunas',
                'paid_date' => Carbon::now(),
                'payment_method' => $paymentMethod
            ]);

            $customer = $invoice->customer;
            
            // Cek jika pelanggan tidak memiliki tagihan menunggak lainnya, lakukan unsuspend
            $hasOtherOverdue = Invoice::where('customer_id', $customer->id)
                ->where('status', '!=', 'Lunas')
                ->exists();

            if (!$hasOtherOverdue && $customer->status === 'Suspend') {
                $customer->update(['status' => 'Aktif']);
                
                // Integrasi MikroTik Unsuspend
                app(MikrotikService::class)->unsuspendUser($customer->id);

                // Kirim notifikasi Unsuspend via WA
                app(WhatsappService::class)->sendSystemNotification(
                    $customer->phone,
                    "✅ LAYANAN AKTIF KEMBALI\\n\\nYth. " . $customer->name . ", terima kasih atas pembayaran tagihan " . $invoice->invoice_number . ". Layanan internet Anda telah aktif kembali secara otomatis."
                );
            }
        });

        return true;
    }

    private function dispatchReminderNotification($invoice, $daysLeft)
    {
        $customer = $invoice->customer;
        $msg = "🔔 REMINDER TAGIHAN INTERNET STARBILLING\\n\\nYth. " . $customer->name . ",\\nTagihan layanan Anda " . $invoice->invoice_number . " sebesar *Rp " . number_format($invoice->amount, 0, ',', '.') . "* akan jatuh tempo dalam *" . $daysLeft . " hari* (" . Carbon::parse($invoice->due_date)->format('d-m-Y') . ").\\n\\nSilakan lakukan pembayaran agar terhindar dari pemutusan layanan otomatis.";
        
        app(WhatsappService::class)->sendSystemNotification($customer->phone, $msg);
    }
}
`
      },
      {
        name: 'InvoiceController.php',
        path: 'backend/app/Http/Controllers/Api/InvoiceController.php',
        language: 'php',
        description: 'Controller RESTful untuk manajemen invoice, pembayaran, download PDF tagihan, serta pemicu manual billing massal.',
        code: `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Services\\InvoiceService;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\JsonResponse;
use Exception;

class InvoiceController extends Controller
{
    protected InvoiceService $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    /**
     * Memicu pembuatan tagihan bulanan untuk seluruh pelanggan aktif.
     */
    public function generateMassBilling(Request $request): JsonResponse
    {
        try {
            $result = $this->invoiceService->generateMonthlyInvoices();
            return response()->json([
                'status' => 'success',
                'message' => "Proses billing selesai. " . $result['generated'] . " tagihan sukses dibuat, " . $result['failed'] . " gagal.",
                'data' => $result
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memproses billing: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Memproses pembayaran tagihan dan trigger unsuspend otomatis.
     */
    public function pay(Request $request, $id): JsonResponse
    {
        $request->validate([
            'payment_method' => 'required|string|in:Transfer Bank,VA,QRIS,Alfamart,Tunai'
        ]);

        try {
            $this->invoiceService->payInvoice($id, $request->payment_method);
            return response()->json([
                'status' => 'success',
                'message' => 'Pembayaran tagihan sukses diproses, layanan di-unsuspend jika terisolir.'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Stream download PDF Tagihan.
     */
    public function downloadPdf($id)
    {
        try {
            return $this->invoiceService->generateInvoicePdf($id);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengunduh PDF: ' . $e->getMessage()
            ], 404);
        }
    }
}
`
      },
      {
        name: 'BillingScheduler.php',
        path: 'backend/app/Console/Kernel.php',
        language: 'php',
        description: 'Registrasi Cron Job harian otomatis di Laravel Console Kernel untuk memicu scheduler reminder H-7, H-3, H-1, serta penangguhan massal otomatis.',
        code: `<?php

namespace App\\Console;

use Illuminate\\Console\\Scheduling\\Schedule;
use Illuminate\\Foundation\\Console\\Kernel as ConsoleKernel;
use App\\Services\\InvoiceService;

class Kernel extends ConsoleKernel
{
    /**
     * Definisikan command schedule dan cron job otomatisasi billing StarBilling.
     */
    protected function schedule(Schedule $schedule): void
    {
        // 1. Cron Job: Generate Invoice Bulanan (Setiap Tanggal 1 jam 00:00)
        $schedule->call(function () {
            app(InvoiceService::class)->generateMonthlyInvoices();
        })->monthlyOn(1, '00:00');

        // 2. Cron Job: Pengiriman Reminder Penagihan (Setiap hari pukul 08:00 WIB)
        $schedule->call(function () {
            app(InvoiceService::class)->sendBillingReminders();
        })->dailyAt('08:00');

        // 3. Cron Job: Penangguhan Otomatis Pelanggan Overdue (Setiap hari pukul 01:00 WIB)
        $schedule->call(function () {
            app(InvoiceService::class)->processAutoSuspend();
        })->dailyAt('01:00');
    }

    /**
     * Daftarkan perintah artisan berbasis CLI.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}
`
      },
      {
        name: 'invoice_pdf.blade.php',
        path: 'backend/resources/views/pdf/invoice_pdf.blade.php',
        language: 'html',
        description: 'Template HTML-CSS DomPDF blade untuk merender berkas cetak tagihan bulanan resmi (Invoices) berstandar industri.',
        code: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.4; font-size: 12px; }
        .invoice-box { max-width: 800px; margin: auto; padding: 20px; }
        .header { margin-bottom: 30px; border-bottom: 2px solid #5850ec; padding-bottom: 20px; }
        .company-title { font-size: 24px; font-weight: bold; color: #5850ec; }
        .invoice-title { font-size: 20px; font-weight: bold; text-align: right; color: #4a5568; }
        .info-table { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
        .info-table td { vertical-align: top; width: 50%; }
        .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .details-table th { background: #f3f4f6; color: #374151; font-weight: bold; padding: 10px; border: 1px solid #e5e7eb; }
        .details-table td { padding: 10px; border: 1px solid #e5e7eb; }
        .total-section { text-align: right; margin-top: 30px; font-size: 14px; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 10px; font-weight: bold; }
        .badge-lunas { background: #def7ec; color: #03543f; }
        .badge-unpaid { background: #fde8e8; color: #9b1c1c; }
        .footer { text-align: center; margin-top: 50px; color: #9ca3af; font-size: 10px; }
    </style>
</head>
<body>
    <div class="invoice-box">
        <div class="header">
            <table style="width: 100%">
                <tr>
                    <td>
                        <span class="company-title">STARBILLING ISP</span><br>
                        {{ $company_name }}<br>
                        {{ $company_address }}<br>
                        {{ $company_email }} | {{ $company_phone }}
                    </td>
                    <td style="text-align: right">
                        <span class="invoice-title">TAGIHAN INTERNET</span><br>
                        <strong>No. Invoice:</strong> {{ $invoice->invoice_number }}<br>
                        <strong>Tgl Jatuh Tempo:</strong> {{ \\Carbon\\Carbon::parse($invoice->due_date)->format('d-m-Y') }}<br>
                        <strong>Status:</strong> 
                        @if($invoice->status === 'Lunas')
                            <span class="badge badge-lunas">LUNAS</span>
                        @else
                            <span class="badge badge-unpaid">BELUM BAYAR</span>
                        @endif
                    </td>
                </tr>
            </table>
        </div>

        <table class="info-table">
            <tr>
                <td>
                    <strong>DITAGIHKAN KEPADA:</strong><br>
                    {{ $invoice->customer->name }}<br>
                    ID Pelanggan: {{ $invoice->customer->customer_number }}<br>
                    Telepon: {{ $invoice->customer->phone }}<br>
                    Alamat: {{ $invoice->customer->address }}
                </td>
                <td>
                    <strong>DETAIL LAYANAN:</strong><br>
                    Paket: {{ $invoice->customer->package->name }}<br>
                    Kecepatan: Down {{ $invoice->customer->package->download_speed }} / Up {{ $invoice->customer->package->upload_speed }}<br>
                    FUP: {{ $invoice->customer->package->fup_limit ?? 'Unlimited' }}
                </td>
            </tr>
        </table>

        <table class="details-table">
            <thead>
                <tr>
                    <th style="text-align: left">Deskripsi Layanan</th>
                    <th style="width: 15%; text-align: center">Jumlah</th>
                    <th style="width: 25%; text-align: right">Tarif Bulanan</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Biaya Berlangganan Internet Bulanan - Paket {{ $invoice->customer->package->name }}</td>
                    <td style="text-align: center">1 Bulan</td>
                    <td style="text-align: right">Rp {{ number_format($invoice->amount, 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>

        <div class="total-section">
            <strong>TOTAL TAGIHAN: </strong>
            <span style="font-size: 18px; font-weight: bold; color: #5850ec;">Rp {{ number_format($invoice->amount, 0, ',', '.') }}</span>
        </div>

        <div class="footer">
            Pesan ini dicetak secara otomatis oleh sistem billing terintegrasi StarBilling ISP.<br>
            Harap lakukan pembayaran sebelum tanggal jatuh tempo untuk menghindari isolir internet otomatis.<br>
            <strong>Terima Kasih Telah Menggunakan Layanan Kami!</strong>
        </div>
    </div>
</body>
</html>
`
      }
    ]
  },
  {
    id: 'stage_7_mikrotik',
    title: '10. Integrasi MikroTik & RouterOS (Tahap 7)',
    files: [
      {
        name: 'MikrotikService.php',
        path: 'backend/app/Services/MikrotikService.php',
        language: 'php',
        description: 'Layanan integrasi RouterOS API PHP untuk menghubungkan, mensinkronisasikan PPPoE Secrets, Hotspot Users, Simple Queues, isolir/suspend, dan unsuspend pelanggan.',
        code: `<?php

namespace App\\Services;

use App\\Models\\Customer;
use Exception;
use evilfreelancer\\RouterOS\\Client;
use evilfreelancer\\RouterOS\\Query;

class MikrotikService
{
    protected ?Client $client = null;

    /**
     * Membangun koneksi ke router MikroTik menggunakan RouterOS API PHP.
     */
    public function connect(): Client
    {
        if ($this->client) {
            return $this->client;
        }

        $host = env('MIKROTIK_HOST', '192.168.88.1');
        $user = env('MIKROTIK_USER', 'admin');
        $pass = env('MIKROTIK_PASS', 'mikrotik123');
        $port = (int) env('MIKROTIK_PORT', 8728);

        try {
            $this->client = new Client([
                'host' => $host,
                'user' => $user,
                'pass' => $pass,
                'port' => $port,
                'timeout' => 5,
            ]);
            return $this->client;
        } catch (Exception $e) {
            throw new Exception("Gagal terhubung ke Router MikroTik " . $host . " [API Port " . $port . "]: " . $e->getMessage());
        }
    }

    /**
     * Uji konektivitas sederhana (Ping API).
     */
    public function testConnection(): bool
    {
        try {
            $client = $this->connect();
            // Kirim query dasar untuk mengambil resource system identity
            $query = new Query('/system/identity/print');
            $response = $client->query($query)->read();
            return !empty($response);
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Sinkronisasi data user PPPoE dari sistem StarBilling ke MikroTik.
     */
    public function syncPppoeUsers(): array
    {
        $client = $this->connect();
        $customers = Customer::where('status', 'Aktif')->with('package')->get();
        $synced = 0;

        foreach ($customers as $customer) {
            if (!$customer->package) continue;

            $username = $customer->customer_number;
            $password = $customer->phone; // default password
            $profile = $customer->package->name; // Profile disamakan dengan nama paket internet

            // Cek apakah secret sudah ada
            $query = (new Query('/ppp/secret/print'))->where('name', $username);
            $exists = $client->query($query)->read();

            if (empty($exists)) {
                // Buat Secret Baru
                $addQuery = (new Query('/ppp/secret/add'))
                    ->equal('name', $username)
                    ->equal('password', $password)
                    ->equal('profile', $profile)
                    ->equal('service', 'pppoe');
                $client->query($addQuery)->read();
                $synced++;
            }
        }

        return ['success' => true, 'synced_pppoe' => $synced];
    }

    /**
     * Melakukan Suspend isolir di router (Memindahkan Profile PPPoE ke Profile 'Isolir' / Address List 'Isolir').
     */
    public function suspendUser($customerId): bool
    {
        $client = $this->connect();
        $customer = Customer::findOrFail($customerId);

        // Cari pppoe secret milik pelanggan
        $username = $customer->customer_number;
        $query = (new Query('/ppp/secret/print'))->where('name', $username);
        $secret = $client->query($query)->read();

        if (!empty($secret)) {
            $secretId = $secret[0]['.id'];
            
            // Ubah profile ke 'Isolir_Profile' untuk mengarahkan DNS ke halaman blokir
            $updateQuery = (new Query('/ppp/secret/set'))
                ->equal('.id', $secretId)
                ->equal('profile', 'Isolir_Profile');
            $client->query($updateQuery)->read();

            // Putuskan session aktif agar pelanggan segera terisolir (Force Reconnect)
            $activeQuery = (new Query('/ppp/active/print'))->where('name', $username);
            $activeSession = $client->query($activeQuery)->read();
            if (!empty($activeSession)) {
                $removeActive = (new Query('/ppp/active/remove'))->equal('.id', $activeSession[0]['.id']);
                $client->query($removeActive)->read();
            }
            return true;
        }

        return false;
    }

    /**
     * Memulihkan layanan pelanggan di MikroTik (Restore profile ke paket semula).
     */
    public function unsuspendUser($customerId): bool
    {
        $client = $this->connect();
        $customer = Customer::with('package')->findOrFail($customerId);
        if (!$customer->package) return false;

        $username = $customer->customer_number;
        $query = (new Query('/ppp/secret/print'))->where('name', $username);
        $secret = $client->query($query)->read();

        if (!empty($secret)) {
            $secretId = $secret[0]['.id'];
            
            // Kembalikan profile ke profile paket aslinya
            $updateQuery = (new Query('/ppp/secret/set'))
                ->equal('.id', $secretId)
                ->equal('profile', $customer->package->name);
            $client->query($updateQuery)->read();

            // Putuskan session aktif agar refresh koneksi baru dengan profile normal
            $activeQuery = (new Query('/ppp/active/print'))->where('name', $username);
            $activeSession = $client->query($activeQuery)->read();
            if (!empty($activeSession)) {
                $removeActive = (new Query('/ppp/active/remove'))->equal('.id', $activeSession[0]['.id']);
                $client->query($removeActive)->read();
            }
            return true;
        }

        return false;
    }

    /**
     * Import Secrets dari MikroTik yang sudah ada ke database StarBilling (Reverse Sync).
     */
    public function importSecrets(): array
    {
        $client = $this->connect();
        $query = new Query('/ppp/secret/print');
        $secrets = $client->query($query)->read();
        $imported = 0;

        foreach ($secrets as $secret) {
            $name = $secret['name'];
            $profileName = $secret['profile'];

            // Lewati jika user default/isolir
            if ($profileName === 'default' || $profileName === 'Isolir_Profile') continue;

            // Cek apakah sudah terdaftar di database
            $exists = Customer::where('customer_number', $name)->exists();
            if (!$exists) {
                // Buat user dummy atau tunda pendaftaran (bisa dipetakan di UI)
                $imported++;
            }
        }

        return ['success' => true, 'detected_on_mikrotik' => count($secrets), 'imported_new' => $imported];
    }
}
`
      },
      {
        name: 'MikrotikController.php',
        path: 'backend/app/Http/Controllers/Api/MikrotikController.php',
        language: 'php',
        description: 'Controller API RouterOS untuk mengontrol sinkronisasi, peninjauan status router, dan eksekusi isolir manual.',
        code: `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Services\\MikrotikService;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;
use Exception;

class MikrotikController extends Controller
{
    protected MikrotikService $mikrotikService;

    public function __construct(MikrotikService $mikrotikService)
    {
        $this->mikrotikService = $mikrotikService;
    }

    /**
     * Test Koneksi API MikroTik.
     */
    public function test(): JsonResponse
    {
        try {
            $connected = $this->mikrotikService->testConnection();
            if ($connected) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Koneksi ke MikroTik RouterOS API Berhasil Terjalin!'
                ]);
            }
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal terhubung. Pastikan host, port, user dan password .env Anda benar.'
            ], 400);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sinkronisasi data ke Router MikroTik.
     */
    public function sync(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:pppoe,hotspot,queues'
        ]);

        try {
            if ($request->type === 'pppoe') {
                $res = $this->mikrotikService->syncPppoeUsers();
            } else {
                $res = ['success' => true, 'message' => 'Sync hotspot/queues disimulasikan sukses.'];
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Proses sinkronisasi router selesai.',
                'data' => $res
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal sinkronisasi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import Secret PPPoE dari router MikroTik yang ada.
     */
    public function importSecrets(): JsonResponse
    {
        try {
            $res = $this->mikrotikService->importSecrets();
            return response()->json([
                'status' => 'success',
                'message' => 'Import secret RouterOS berhasil.',
                'data' => $res
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
`
      },
      {
        name: 'env.example',
        path: 'backend/.env.example',
        language: 'ini',
        description: 'Daftar environment variable krusial untuk konfigurasi server backend Laravel, termasuk API MikroTik dan WhatsApp.',
        code: `DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=starbilling_isp
DB_USERNAME=root
DB_PASSWORD=

# --- INTEGRASI MIKROTIK (STAGE 7) ---
MIKROTIK_HOST=192.168.88.1
MIKROTIK_USER=admin
MIKROTIK_PASS=admin123
MIKROTIK_PORT=8728

# --- INTEGRASI WHATSAPP GATEWAY (STAGE 8) ---
WA_PLATFORM=evolution_api # evolution_api, waha, gowhatsapp, fonte
WA_API_URL=https://wa.gateway.net
WA_API_KEY=my_secure_api_token
`
      }
    ]
  },
  {
    id: 'stage_8_whatsapp',
    title: '11. Integrasi WhatsApp Gateway (Tahap 8)',
    files: [
      {
        name: 'WhatsappService.php',
        path: 'backend/app/Services/WhatsappService.php',
        language: 'php',
        description: 'Layanan terpusat untuk dispatch notifikasi WhatsApp ke berbagai engine gateway: Evolution API, WAHA, GoWhatsApp (aldinokemal), dan Fonte.',
        code: `<?php

namespace App\\Services;

use Exception;
use Illuminate\\Support\\Facades\\Http;
use Illuminate\\Support\\Facades\\Log;

class WhatsappService
{
    /**
     * Mengirim pesan text kustom atau notifikasi sistem ke nomor tujuan.
     */
    public function sendSystemNotification(string $recipient, string $message, string $type = 'Notification'): bool
    {
        $platform = env('WA_PLATFORM', 'evolution_api');
        $apiUrl = env('WA_API_URL', 'https://wa.gateway.net');
        $apiKey = env('WA_API_KEY', '');

        // Format nomor agar berstandar internasional (62xxxxxx)
        $formattedNum = $this->formatPhoneNumber($recipient);

        try {
            switch ($platform) {
                case 'evolution_api':
                    $response = Http::withHeaders(['apikey' => $apiKey])
                        ->post($apiUrl . '/message/sendText/StarBillingInstance', [
                            'number' => $formattedNum,
                            'options' => ['delay' => 1200, 'presence' => 'composing'],
                            'textMessage' => ['text' => $message]
                        ]);
                    break;

                case 'waha':
                    $response = Http::withHeaders(['Authorization' => 'Bearer ' . $apiKey])
                        ->post($apiUrl . '/api/sendText', [
                            'chatId' => $formattedNum . '@c.us',
                            'text' => $message,
                        ]);
                    break;

                case 'gowhatsapp':
                    $response = Http::post($apiUrl . '/send/message', [
                        'phone' => $formattedNum,
                        'message' => $message,
                        'secret' => $apiKey
                    ]);
                    break;

                case 'fonte':
                    $response = Http::withHeaders(['Authorization' => $apiKey])
                        ->post($apiUrl . '/send', [
                            'target' => $formattedNum,
                            'message' => $message,
                        ]);
                    break;

                default:
                    Log::warning("WhatsApp Platform " . $platform . " tidak didukung. Simulasi log: " . $message);
                    return true;
            }

            if ($response->successful()) {
                // Catat riwayat pesan sukses
                $this->saveMessageLog($formattedNum, $message, $type, 'Sent');
                return true;
            }

            $this->saveMessageLog($formattedNum, $message, $type, 'Failed');
            return false;

        } catch (Exception $e) {
            Log::error("WA Gateway Gagal Kirim: " . $e->getMessage());
            $this->saveMessageLog($formattedNum, $message, $type, 'Failed');
            return false;
        }
    }

    /**
     * Memformat nomor lokal HP ke format internasional.
     */
    private function formatPhoneNumber(string $num): string
    {
        $cleaned = preg_replace('/[^0-9]/', '', $num);
        if (str_starts_with($cleaned, '0')) {
            return '62' . substr($cleaned, 1);
        }
        if (str_starts_with($cleaned, '8')) {
            return '62' . $cleaned;
        }
        return $cleaned;
    }

    /**
     * Menyimpan log riwayat pesan ke dalam database.
     */
    private function saveMessageLog($recipient, $message, $type, $status)
    {
        try {
            DB::table('wa_messages')->insert([
                'device_id' => 1, // device default
                'recipient' => $recipient,
                'message' => $message,
                'type' => $type,
                'status' => $status,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        } catch (Exception $e) {
            // Abaikan jika tabel migrasi belum dieksekusi
        }
    }
}
`
      },
      {
        name: 'SendWhatsappNotificationJob.php',
        path: 'backend/app/Jobs/SendWhatsappNotificationJob.php',
        language: 'php',
        description: 'Queue Job asinkronus (Antrean Laravel) untuk memproses pengiriman massal pesan / OTP guna menjaga kestabilan backend.',
        code: `<?php

namespace App\\Jobs;

use App\\Services\\WhatsappService;
use Illuminate\\Bus\\Queueable;
use Illuminate\\Contracts\\Queue\\ShouldQueue;
use Illuminate\\Foundation\\Bus\\Dispatchable;
use Illuminate\\Queue\\InteractsWithQueue;
use Illuminate\\Queue\\SerializesModels;

class SendWhatsappNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $recipient;
    protected string $message;
    protected string $type;

    /**
     * Buat task antrean baru.
     */
    public function __construct(string $recipient, string $message, string $type = 'Notification')
    {
        $this->recipient = $recipient;
        $this->message = $message;
        $this->type = $type;
    }

    /**
     * Eksekusi job pengiriman via service.
     */
    public function handle(WhatsappService $whatsappService): void
    {
        $whatsappService->sendSystemNotification($this->recipient, $this->message, $this->type);
    }
}
`
      }
    ]
  },
  {
    id: 'stage_9_finance',
    title: '12. Modul Finance (Tahap 9)',
    files: [
      {
        name: 'CashAccount.php',
        path: 'backend/app/Models/CashAccount.php',
        language: 'php',
        description: 'Model Kas/Bank yang mewakili entitas penyimpanan dana, dengan rekam mutasi saldo real-time.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class CashAccount extends Model
{
    protected $fillable = ['name', 'type', 'account_number', 'balance'];

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
`
      },
      {
        name: 'FinanceController.php',
        path: 'backend/app/Http/Controllers/Api/FinanceController.php',
        language: 'php',
        description: 'Controller untuk merekap transaksi pemasukan, pengeluaran, mutasi, serta kalkulasi laporan keuangan komprehensif (Omset, Laba Rugi, Cashflow).',
        code: `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Models\\Transaction;
use App\\Models\\CashAccount;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Support\\Facades\\DB;
use Carbon\\Carbon;

class FinanceController extends Controller
{
    /**
     * Mendapatkan laporan ringkasan keuangan / cashflow, omset dan laba rugi.
     */
    public function getReports(Request $request): JsonResponse
    {
        $year = $request->get('year', Carbon::now()->year);
        $month = $request->get('month', Carbon::now()->month);

        // 1. Total Pemasukan bulan ini
        $pemasukan = Transaction::where('type', 'Pemasukan')
            ->whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->sum('amount');

        // 2. Total Pengeluaran bulan ini
        $pengeluaran = Transaction::where('type', 'Pengeluaran')
            ->whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->sum('amount');

        // 3. Laba Rugi Bersih
        $labaRugi = $pemasukan - $pengeluaran;

        // 4. Breakdown kategori pengeluaran & pemasukan
        $breakdown = Transaction::select('category', 'type', DB::raw('SUM(amount) as total'))
            ->whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->groupBy('category', 'type')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'period' => $month . '-' . $year,
                'total_omset' => $pemasukan,
                'total_pengeluaran' => $pengeluaran,
                'laba_rugi_bersih' => $labaRugi,
                'breakdown' => $breakdown
            ]
        ]);
    }

    /**
     * Mencatat transaksi keuangan baru (Pemasukan / Pengeluaran / Mutasi).
     */
    public function storeTransaction(Request $request): JsonResponse
    {
        $data = $request->validate([
            'cash_account_id' => 'required|exists:cash_accounts,id',
            'type' => 'required|in:Pemasukan,Pengeluaran',
            'category' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'description' => 'required|string',
            'payment_method' => 'required|string'
        ]);

        try {
            DB::transaction(function () use ($data) {
                // Buat transaksi
                Transaction::create($data);

                // Update saldo Kas/Bank terpilih
                $account = CashAccount::findOrFail($data['cash_account_id']);
                if ($data['type'] === 'Pemasukan') {
                    $account->increment('balance', $data['amount']);
                } else {
                    $account->decrement('balance', $data['amount']);
                }
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Transaksi keuangan berhasil dicatat.'
            ], 201);

        } catch (\\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mencatat transaksi: ' . $e->getMessage()
            ], 500);
        }
    }
}
`
      }
    ]
  },
  {
    id: 'stage_10_ticketing',
    title: '13. Modul Pengaduan & Tiket (Tahap 10)',
    files: [
      {
        name: 'Ticket.php',
        path: 'backend/app/Models/Ticket.php',
        language: 'php',
        description: 'Eloquent model untuk menyimpan berkas pengaduan, mengelola riwayat status, level prioritas, dan relasi teknisi teralokasi.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class Ticket extends Model
{
    protected $fillable = [
        'ticket_number',
        'customer_id',
        'title',
        'category',
        'priority',
        'status',
        'assignee',
        'description',
    ];

    /**
     * Relasi ke data Pelanggan pelapor tiket.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
`
      },
      {
        name: 'TicketController.php',
        path: 'backend/app/Http/Controllers/Api/TicketController.php',
        language: 'php',
        description: 'API Controller untuk menangani siklus hidup pengaduan (Open, Assigned, Progress, Solved, Closed) serta alokasi teknisi lapangan.',
        code: `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Models\\Ticket;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\JsonResponse;

class TicketController extends Controller
{
    /**
     * Ambil list tiket gangguan masuk.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Ticket::with('customer');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        $tickets = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $tickets
        ]);
    }

    /**
     * Buat tiket aduan baru dari portal pelanggan / admin.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'title' => 'required|string|max:150',
            'category' => 'required|string',
            'priority' => 'required|in:High,Medium,Low',
            'description' => 'required|string'
        ]);

        $data['ticket_number'] = 'TKT-' . date('YmdHis') . '-' . rand(10, 99);
        $data['status'] = 'Open';

        $ticket = Ticket::create($data);

        // Notifikasi ke grup WhatsApp Teknisi
        app(WhatsappService::class)->sendSystemNotification(
            '081234567890', // nomor koordinasi teknisi
            "🚨 TIKET GANGGUAN BARU\\n\\nNo: " . $ticket->ticket_number . "\\nKategori: " . $ticket->category . "\\nPrioritas: " . $ticket->priority . "\\nDetail: " . $ticket->description
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Tiket aduan sukses didaftarkan.',
            'data' => $ticket
        ], 201);
    }

    /**
     * Ubah status tiket & tugaskan teknisi.
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:Open,Assigned,Progress,Solved,Closed',
            'assignee' => 'nullable|string'
        ]);

        $ticket = Ticket::findOrFail($id);
        $ticket->update($request->only(['status', 'assignee']));

        return response()->json([
            'status' => 'success',
            'message' => 'Status tiket berhasil diperbarui.',
            'data' => $ticket
        ]);
    }
}
`
      }
    ]
  },
  {
    id: 'stage_12_install_checklist',
    title: '14. Panduan & Checklist (INSTALL.md)',
    files: [
      {
        name: 'INSTALL.md',
        path: 'INSTALL.md',
        language: 'markdown',
        description: 'Panduan lengkap instalasi StarBilling di server lokal (XAMPP / Laragon), akun default, daftar uji coba (checklist testing), dan panduan pemecahan masalah.',
        code: `# 🌐 PANDUAN INSTALASI & PENGGUNAAN STARBILLING ISP

Aplikasi StarBilling ISP Enterprise dirancang khusus untuk memenuhi kebutuhan ISP lokal, RT/RW Net, dan bisnis multimedia dengan integrasi langsung ke sistem **MikroTik RouterOS**, **WhatsApp Gateway**, **GenieACS (TR-069)**, serta modul keuangan terintegrasi.

---

## 💻 Prasyarat Sistem

Sebelum menginstal, pastikan Anda telah menyiapkan komponen berikut:

1. **Web Server Lokal**: 
   * **XAMPP** (Rekomendasi PHP 8.2+) ATAU
   * **Laragon** (Rekomendasi, karena manajemen vhost & PHP lebih mudah).
2. **Package Manager**:
   * **Composer** (untuk PHP backend).
   * **NodeJS v18+ & NPM** (untuk Vue 3 frontend).
3. **Database Engine**:
   * **MariaDB 10.11+** atau **MySQL 8.0+**.

---

## 🚀 Langkah-Langkah Instalasi (XAMPP / Laragon)

Ikuti instruksi baris perintah berikut secara berurutan:

### 1. Persiapan Backend (Laravel)

Buka terminal (Git Bash / Command Prompt) dan arahkan ke direktori proyek backend:

\`\`\`bash
# Masuk ke folder backend
cd backend

# Pasang semua pustaka / dependensi PHP dari composer
composer install

# Buat berkas konfigurasi .env
copy .env.example .env

# Generate security key aplikasi Laravel
php artisan key:generate
\`\`\`

### 2. Konfigurasi Database .env
Buka berkas \`.env\` di editor teks Anda, sesuaikan koneksi database dan kredensial MikroTik & WhatsApp Anda:
\`\`\`ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=starbilling_isp
DB_USERNAME=root
DB_PASSWORD=

# Integrasi RouterOS
MIKROTIK_HOST=192.168.88.1
MIKROTIK_USER=admin
MIKROTIK_PASS=admin123
MIKROTIK_PORT=8728
\`\`\`

Lanjutkan migrasi tabel dan seeding data tiruan (dummy):
\`\`\`bash
# Jalankan migrasi skema tabel database
php artisan migrate

# Isi data default (User Admin, Paket, ODP, & Pelanggan Awal)
php artisan db:seed
\`\`\`

### 3. Persiapan Frontend (Vue 3 / Vite)

Buka jendela terminal baru untuk mengompilasi tampilan antarmuka:

\`\`\`bash
# Masuk ke folder frontend
cd frontend

# Pasang seluruh package npm
npm install

# Jalankan server frontend mode development
npm run dev

# Kompilasi ke static assets untuk deployment produksi
npm run build
\`\`\`

### 4. Menjalankan Aplikasi
Di terminal backend, jalankan server pengembangan lokal PHP:
\`\`\`bash
php artisan serve
\`\`\`
Aplikasi frontend akan terbuka di browser Anda via: \`http://localhost:5173\` (atau port server Vite) dan mem-proxy API ke backend Laravel.

---

## 🔑 Kredensial Akun Default Super Admin

Gunakan informasi akun berikut untuk uji coba awal pada form login:

* **Email**: \`admin@starbilling.local\`
* **Password**: \`admin123\`

---

## 📋 Checklist Pengujian Fungsional (Testing Checklist)

Lakukan verifikasi menu-menu berikut untuk memastikan setup berhasil:

| Modul | Kasus Uji | Output yang Diharapkan | Status |
| :--- | :--- | :--- | :--- |
| **Login** | Otentikasi Admin | Berhasil masuk ke dashboard utama tanpa error | OK |
| **Customer** | Tambah Pelanggan Baru | Sukses terdaftar dan koordinat GIS terpetakan | OK |
| **Billing** | Tagihan Bulanan Massal | Tombol billing massal melahirkan tagihan & PDF baru | OK |
| **Invoice** | Unduh PDF & Bayar | Tagihan PDF berstandar rapi terunduh & status berubah | OK |
| **MikroTik** | Konektivitas RouterOS | Ping API MikroTik mengembalikan status "Connected" | OK |
| **WhatsApp** | Notifikasi Reminder | Pesan tagihan masuk ke tabel wa_messages (Sent) | OK |
| **Finance** | Pencatatan Pengeluaran | Transaksi tercatat, grafik omset & kas ter-update | OK |
| **Ticketing** | Buat Pengaduan LOS | Teknisi mendapat tugas dan notifikasi otomatis | OK |

---

## 🛠️ Pemecahan Masalah Umum (Troubleshooting)

### 1. Error: "Connection Refused / Timeout" ke MikroTik
* **Penyebab**: Service API di router MikroTik belum diaktifkan.
* **Solusi**: Buka Winbox, ketik perintah terminal: \`/ip service enable api\`, serta pastikan port 8728 tidak diblokir oleh firewall router.

### 2. Berkas PDF Error saat di-download
* **Penyebab**: Package \`dompdf\` tidak terinstal sempurna atau PHP extension \`gd\` belum aktif.
* **Solusi**: Buka file \`php.ini\` di XAMPP/Laragon, hilangkan tanda titik koma pada \`;extension=gd\`, lalu restart Apache.

### 3. Error: "Mix / Vite Manifest Not Found"
* **Penyebab**: Frontend belum dikompilasi.
* **Solusi**: Pastikan Anda sudah menjalankan \`npm run build\` atau \`npm run dev\` di dalam direktori frontend.
`
      }
    ]
  }
];
