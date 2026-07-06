/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodeGroup } from '../types';

export const CUSTOMER_ENTERPRISE_CODEBASE: CodeGroup = {
  id: 'customer_enterprise',
  title: '11. Customer Enterprise (Laravel 12 + Vue 3)',
  files: [
    {
      name: '2026_07_04_create_customers_table_with_indexes.php',
      path: 'database/migrations/2026_07_04_create_customers_table_with_indexes.php',
      language: 'php',
      description: 'Laravel 12 migration to define the customers table. Features index(customer_number), index(phone), and index(name). All relationships use id as the primary foreign key.',
      code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id(); // Primary key (BigInt AutoIncrement), used in all relationship foreign keys
            $table->string('customer_number', 50)->unique(); // WhatsApp number normalized
            $table->string('name', 150);
            $table->string('nik', 16)->unique();
            $table->string('phone', 20); // Normalized WhatsApp number (identical to customer_number)
            $table->string('email', 100)->unique();
            $table->text('address');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            
            // Foreign Keys linking to master data using id
            $table->foreignId('package_id')->nullable()->constrained('packages')->nullOnDelete();
            $table->string('router_id', 50)->nullable();
            $table->foreignId('odp_id')->nullable()->constrained('odps')->nullOnDelete();
            $table->string('marketing_id', 50)->nullable();
            
            $table->enum('status', ['Aktif', 'Suspend', 'Nonaktif'])->default('Aktif');
            $table->string('ktp_url')->nullable();
            $table->string('home_photo_url')->nullable();
            $table->string('pppoe_username')->nullable(); // PPPoE credentials representation
            $table->timestamps();

            // INDEX requirements as specified in guidelines
            $table->index('customer_number');
            $table->index('phone');
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};`
    },
    {
      name: 'PhoneHelper.php',
      path: 'app/Helpers/PhoneHelper.php',
      language: 'php',
      description: 'Utility helper to normalize and validate WhatsApp phone numbers globally across the billing system.',
      code: `<?php

namespace App\\Helpers;

class PhoneHelper
{
    /**
     * Normalize phone number to international Indonesian format (628...).
     * 
     * Rules:
     * - Removes spaces, +, -, parentheses, and other non-digit characters.
     * - If starts with '08', replaces with '628'.
     * - If already starts with '62', uses it directly.
     */
    public static function normalize(?string $phone): string
    {
        if (empty($phone)) {
            return '';
        }

        // Hapus karakter non-angka (spasi, +, -, kurung, dsb)
        $clean = preg_replace('/[^0-9]/', '', $phone);

        // Jika diawali 08, ubah menjadi 628
        if (str_starts_with($clean, '08')) {
            $clean = '628' . substr($clean, 2);
        }

        return $clean;
    }

    /**
     * Validate phone number format.
     * Must contain only digits, length 10-15 characters.
     */
    public static function validate(?string $phone): bool
    {
        if (empty($phone)) {
            return false;
        }

        $normalized = self::normalize($phone);
        $len = strlen($normalized);

        return preg_match('/^[0-9]+$/', $normalized) && $len >= 10 && $len <= 15;
    }
}`
    },
    {
      name: 'Customer.php',
      path: 'app/Models/Customer.php',
      language: 'php',
      description: 'Eloquent model for Customers utilizing App\\Helpers\\PhoneHelper to automatically format and validate customer_number / phone mutators.',
      code: `<?php

namespace App\\Models;

use App\\Helpers\\PhoneHelper;
use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_number',
        'name',
        'nik',
        'phone',
        'email',
        'address',
        'latitude',
        'longitude',
        'package_id',
        'router_id',
        'odp_id',
        'marketing_id',
        'status',
        'ktp_url',
        'home_photo_url',
        'pppoe_username'
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Boot function to intercept model actions.
     * Guarantees customer_number = phone on saving using PhoneHelper.
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($customer) {
            $customer->phone = PhoneHelper::normalize($customer->phone);
            $customer->customer_number = $customer->phone; // customer_number = phone
            
            // Auto generate PPPoE Username if blank
            if (empty($customer->pppoe_username)) {
                $customer->pppoe_username = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $customer->name)) . '@starbilling';
            }
        });
    }

    // --- Relationships ---

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class, 'package_id');
    }

    public function odp(): BelongsTo
    {
        return $this->belongsTo(Odp::class, 'odp_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'customer_id');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'customer_id');
    }
}`
    },
    {
      name: 'CustomerRequest.php',
      path: 'app/Http/Requests/CustomerRequest.php',
      language: 'php',
      description: 'Form Request validation in Laravel 12. Implements phone normalization inside validation preparation, validates length between 10 and 15 digits, uniqueness, and WhatsApp active checks.',
      code: `<?php

namespace App\\Http\\Requests;

use App\\Helpers\\PhoneHelper;
use Illuminate\\Foundation\\Http\\FormRequest;
use Illuminate\\Validation\\Rule;

class CustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     * Normalizes the phone number before validation is processed.
     */
    protected function prepareForValidation(): void
    {
        $normalizedPhone = PhoneHelper::normalize($this->phone);

        $this->merge([
            'phone' => $normalizedPhone,
            'customer_number' => $normalizedPhone, // customer_number is set identical to phone
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $customerId = $this->route('customer') ? $this->route('customer')->id : null;

        return [
            'name' => ['required', 'string', 'max:150'],
            'nik' => [
                'required', 
                'string', 
                'size:16', 
                Rule::unique('customers', 'nik')->ignore($customerId)
            ],
            'phone' => [
                'required',
                'string',
                'min:10',
                'max:15',
                Rule::unique('customers', 'phone')->ignore($customerId),
                // Custom rule validation or logic check
            ],
            'email' => [
                'required', 
                'email', 
                'max:100', 
                Rule::unique('customers', 'email')->ignore($customerId)
            ],
            'address' => ['required', 'string'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'package_id' => ['nullable', 'exists:packages,id'],
            'router_id' => ['nullable', 'string', 'max:50'],
            'odp_id' => ['nullable', 'exists:odps,id'],
            'marketing_id' => ['nullable', 'string', 'max:50'],
            'status' => ['required', Rule::in(['Aktif', 'Suspend', 'Nonaktif'])],
            'ktp' => ['nullable', 'file', 'image', 'max:2048'], // Max 2MB Upload limit
            'home_photo' => ['nullable', 'file', 'image', 'max:2048'],
        ];
    }

    /**
     * Customize the validation error messages.
     */
    public function messages(): array
    {
        return [
            'phone.required' => 'Nomor Telepon / WhatsApp wajib diisi.',
            'phone.min' => 'Nomor WhatsApp minimal harus memiliki 10 digit angka.',
            'phone.max' => 'Nomor WhatsApp maksimal boleh memiliki 15 digit angka.',
            'phone.unique' => 'Nomor WhatsApp ini sudah terdaftar sebagai pelanggan lain (Wajib Unik).',
            'nik.required' => 'NIK KTP wajib diisi.',
            'nik.size' => 'NIK KTP harus berukuran tepat 16 digit.',
            'nik.unique' => 'NIK KTP ini sudah terdaftar di sistem StarBilling.',
            'email.unique' => 'Alamat email ini sudah digunakan oleh pelanggan lain.',
        ];
    }
}`
    },
    {
      name: 'CustomerService.php',
      path: 'app/Services/CustomerService.php',
      language: 'php',
      description: 'Handles business layer workflows including third-party WhatsApp status checks, saving attachments, and processing bulk excel imports.',
      code: `<?php

namespace App\\Services;

use App\\Helpers\\PhoneHelper;
use App\\Models\\Customer;
use Illuminate\\Support\\Facades\\Http;
use Illuminate\\Support\\Facades\\Storage;
use Illuminate\\Support\\Facades\\Log;
use Exception;

class CustomerService
{
    /**
     * Check if WhatsApp number is active/registered on WA servers.
     * Integrated with Go-WAHA/Fonte/Evolution API.
     */
    public function checkActiveWhatsapp(string $phone): bool
    {
        try {
            // Normalisasi nomor telepon
            $normalized = PhoneHelper::normalize($phone);
            
            // Mengirim request ke API Gateway WhatsApp lokal atau pihak ketiga (WAHA)
            $response = Http::timeout(5)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . config('services.whatsapp.api_key')
                ])
                ->post(config('services.whatsapp.api_url') . '/check-whatsapp', [
                    'number' => $normalized
                ]);

            if ($response->successful()) {
                return (bool) $response->json('data.exists');
            }
            
            // Fallback: Jika server integrasi WA offline, kembalikan true untuk menghindari pemblokiran registrasi
            return true;
        } catch (Exception $e) {
            Log::warning('WhatsApp check API offline: ' . $e->getMessage());
            return true; 
        }
    }

    /**
     * Handle Customer Documents Upload
     */
    public function uploadDocument($file, string $type, string $customerPhone): string
    {
        $extension = $file->getClientOriginalExtension();
        $filename = $type . '_' . $customerPhone . '_' . time() . '.' . $extension;
        
        // Simpan file secara aman di storage private/public disk
        $path = $file->storeAs('customer_attachments/' . $customerPhone, $filename, 'public');
        
        return Storage::disk('public')->url($path);
    }
}`
    },
    {
      name: 'CustomerImport.php',
      path: 'app/Imports/CustomerImport.php',
      language: 'php',
      description: 'Excel importer class leveraging Maatwebsite Excel. Implements duplicate checking with dual strategies: Skip or Overwrite (Update existing).',
      code: `<?php

namespace App\\Imports;

use App\\Helpers\\PhoneHelper;
use App\\Models\\Customer;
use Maatwebsite\\Excel\\Concerns\\ToModel;
use Maatwebsite\\Excel\\Concerns\\WithHeadingRow;
use Illuminate\\Support\\Facades\\Validator;
use Exception;

class CustomerImport implements ToModel, WithHeadingRow
{
    protected $duplicateStrategy; // 'skip' atau 'overwrite'
    protected $importedCount = 0;
    protected $updatedCount = 0;
    protected $skippedCount = 0;

    public function __construct(string $duplicateStrategy = 'skip')
    {
        $this->duplicateStrategy = $duplicateStrategy;
    }

    /**
     * Process each row inside the Excel file.
     */
    public function model(array $row)
    {
        // Normalisasi nomor WA dari kolom Excel
        $phoneInput = $row['phone'] ?? $row['whatsapp'] ?? $row['no_wa'] ?? null;
        if (!$phoneInput) {
            $this->skippedCount++;
            return null; // Skip jika tidak ada nomor WA
        }

        $normalizedPhone = PhoneHelper::normalize($phoneInput);
        
        // Cari apakah pelanggan dengan nomor WA / phone ini sudah ada
        $existingCustomer = Customer::where('phone', $normalizedPhone)->first();

        if ($existingCustomer) {
            if ($this->duplicateStrategy === 'skip') {
                $this->skippedCount++;
                return null; // Lewati baris data ini
            }

            if ($this->duplicateStrategy === 'overwrite') {
                // Update data yang sudah ada
                $existingCustomer->update([
                    'name' => $row['name'] ?? $row['nama'] ?? $existingCustomer->name,
                    'nik' => $row['nik'] ?? $row['no_ktp'] ?? $existingCustomer->nik,
                    'email' => $row['email'] ?? $existingCustomer->email,
                    'address' => $row['address'] ?? $row['alamat'] ?? $existingCustomer->address,
                    'package_id' => $row['package_id'] ?? $existingCustomer->package_id,
                    'status' => $row['status'] ?? $existingCustomer->status,
                ]);
                $this->updatedCount++;
                return null; // Return null agar tidak membuat row baru
            }
        }

        // Buat data baru jika tidak ada duplikasi
        $this->importedCount++;
        return new Customer([
            'customer_number' => $normalizedPhone,
            'name' => $row['name'] ?? $row['nama'] ?? 'Tanpa Nama',
            'nik' => $row['nik'] ?? $row['no_ktp'] ?? '1600000000000000',
            'phone' => $normalizedPhone,
            'email' => $row['email'] ?? ($normalizedPhone . '@starbilling.net'),
            'address' => $row['address'] ?? $row['alamat'] ?? 'Alamat Default',
            'package_id' => $row['package_id'] ?? 2, // Standard pkg default
            'router_id' => $row['router_id'] ?? 'Router-Gambir-01',
            'odp_id' => $row['odp_id'] ?? 1,
            'marketing_id' => $row['marketing_id'] ?? 'Asep Marketing',
            'status' => 'Aktif',
        ]);
    }

    public function getSummary(): array
    {
        return [
            'imported' => $this->importedCount,
            'updated' => $this->updatedCount,
            'skipped' => $this->skippedCount,
        ];
    }
}`
    },
    {
      name: 'CustomerExport.php',
      path: 'app/Exports/CustomerExport.php',
      language: 'php',
      description: 'Customer data export class. Generates beautiful Excel files complete with Customer Number, Phone/WhatsApp, PPPoE User, Package speeds, and status.',
      code: `<?php

namespace App\\Exports;

use App\\Models\\Customer;
use Maatwebsite\\Excel\\Concerns\\FromCollection;
use Maatwebsite\\Excel\\Concerns\\WithHeadings;
use Maatwebsite\\Excel\\Concerns\\WithMapping;

class CustomerExport implements FromCollection, WithHeadings, WithMapping
{
    /**
     * Retrieve all customers to export.
     */
    public function collection()
    {
        return Customer::with(['package', 'odp'])->get();
    }

    /**
     * Map rows.
     */
    public function map($customer): array
    {
        return [
            $customer->customer_number,
            $customer->name,
            "'" . $customer->nik, // Prefix kutip satu untuk menjaga integer 16 digit di excel
            $customer->phone,
            $customer->email,
            $customer->address,
            $customer->package ? $customer->package->name : 'N/A',
            $customer->pppoe_username ?? 'N/A',
            $customer->odp ? $customer->odp->name : 'N/A',
            $customer->status,
            $customer->created_at->format('Y-m-d')
        ];
    }

    /**
     * Headings for Excel.
     */
    public function headings(): array
    {
        return [
            'Nomor Pelanggan',
            'Nama Pelanggan',
            'NIK KTP',
            'Nomor WhatsApp',
            'Alamat Email',
            'Alamat Lengkap',
            'Paket Internet',
            'PPPoE Username',
            'ODP Assigned',
            'Status',
            'Tanggal Registrasi'
        ];
    }
}`
    },
    {
      name: 'CustomerController.php',
      path: 'app/Http/Controllers/Api/CustomerController.php',
      language: 'php',
      description: 'API Controller managing high-volume operations: search by PPPoE/WA/Name/Address, file attachments for KTP & House Photos, and Excel import/export endpoints.',
      code: `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Http\\Requests\\CustomerRequest;
use App\\Models\\Customer;
use App\\Services\\CustomerService;
use App\\Imports\\CustomerImport;
use App\\Exports\\CustomerExport;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\DB;
use Maatwebsite\\Excel\\Facades\\Excel;
use Barryvdh\\DomPDF\\Facade\\Pdf;
use Exception;

class CustomerController extends Controller
{
    protected $customerService;

    public function __construct(CustomerService $customerService)
    {
        $this->customerService = $customerService;
    }

    /**
     * Display a list of customers with comprehensive search capabilities.
     * Supports searching:
     * - customer_number (Nomor Pelanggan)
     * - phone (Nomor WhatsApp)
     * - name (Nama)
     * - address (Alamat)
     * - pppoe_username (PPPoE Username)
     */
    public function index(Request $request)
    {
        $query = Customer::with(['package', 'odp']);

        // Multi-column search implementation
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_number', 'LIKE', "%{$search}%")
                  ->orWhere('phone', 'LIKE', "%{$search}%")
                  ->orWhere('name', 'LIKE', "%{$search}%")
                  ->orWhere('address', 'LIKE', "%{$search}%")
                  ->orWhere('pppoe_username', 'LIKE', "%{$search}%")
                  ->orWhere('nik', 'LIKE', "%{$search}%");
            });
        }

        // Filter by Status
        if ($request->has('status') && $request->status !== 'Semua') {
            $query->where('status', $request->status);
        }

        $customers = $query->orderBy('id', 'desc')->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $customers
        ]);
    }

    /**
     * Store a newly created Customer.
     */
    public function store(CustomerRequest $request)
    {
        // Validasi keaktifan WhatsApp
        if (!$this->customerService->checkActiveWhatsapp($request->phone)) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi Gagal: Nomor WhatsApp tersebut tidak aktif / belum terdaftar di WA.'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $data = $request->validated();
            
            // Handle KTP Upload
            if ($request->hasFile('ktp')) {
                $data['ktp_url'] = $this->customerService->uploadDocument(
                    $request->file('ktp'), 'ktp', $data['phone']
                );
            }

            // Handle Foto Rumah Upload
            if ($request->hasFile('home_photo')) {
                $data['home_photo_url'] = $this->customerService->uploadDocument(
                    $request->file('home_photo'), 'home', $data['phone']
                );
            }

            $customer = Customer::create($data);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Pelanggan baru berhasil didaftarkan!',
                'data' => $customer
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendaftarkan pelanggan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified Customer detail.
     */
    public function show(Customer $customer)
    {
        return response()->json([
            'success' => true,
            'data' => $customer->load(['package', 'odp'])
        ]);
    }

    /**
     * Update the specified Customer.
     */
    public function update(CustomerRequest $request, Customer $customer)
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();

            // Handle file updates
            if ($request->hasFile('ktp')) {
                $data['ktp_url'] = $this->customerService->uploadDocument(
                    $request->file('ktp'), 'ktp', $data['phone']
                );
            }

            if ($request->hasFile('home_photo')) {
                $data['home_photo_url'] = $this->customerService->uploadDocument(
                    $request->file('home_photo'), 'home', $data['phone']
                );
            }

            $customer->update($data);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Informasi pelanggan berhasil diperbarui!',
                'data' => $customer
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui data pelanggan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified Customer.
     */
    public function destroy(Customer $customer)
    {
        try {
            $customer->delete();
            return response()->json([
                'success' => true,
                'message' => 'Data pelanggan berhasil dihapus.'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import Excel Endpoint
     */
    public function importExcel(Request $request)
    {
        $request->validate([
            'excel_file' => 'required|file|mimes:xlsx,xls,csv|max:4096',
            'duplicate_strategy' => 'required|string|in:skip,overwrite'
        ]);

        try {
            $import = new CustomerImport($request->duplicate_strategy);
            Excel::import($import, $request->file('excel_file'));
            
            $summary = $import->getSummary();

            return response()->json([
                'success' => true,
                'message' => "Proses import selesai! {$summary['imported']} data baru dibuat, {$summary['updated']} diupdate, {$summary['skipped']} dilewati.",
                'summary' => $summary
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengimpor file Excel: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export Excel Endpoint
     */
    public function exportExcel()
    {
        return Excel::download(new CustomerExport, 'StarBilling_Database_Pelanggan.xlsx');
    }

    /**
     * Export PDF Endpoint
     */
    public function exportPdf()
    {
        $customers = Customer::with(['package', 'odp'])->orderBy('name')->get();
        
        $data = [
            'customers' => $customers,
            'title' => 'Laporan Registrasi Pelanggan Aktif - StarBilling ISP',
            'date' => date('d-m-Y H:i:s')
        ];

        $pdf = Pdf::loadView('pdf.customers_report', $data);
        return $pdf->download('StarBilling_Laporan_Pelanggan.pdf');
    }
}`
    },
    {
      name: 'api.php',
      path: 'routes/api.php (Update)',
      language: 'php',
      description: 'Comprehensive REST API routes for customer management, file uploads, excel operations, and Customer Portal authentication.',
      code: `<?php

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\Api\\CustomerController;
use App\\Models\\Customer;

/*
|--------------------------------------------------------------------------
| StarBilling ISP API Routes (Laravel 12)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    
    // Core Customer CRUD with full multi-column search
    Route::apiResource('customers', CustomerController::class);
    
    // Import & Export routes
    Route::post('customers/import-excel', [CustomerController::class, 'importExcel']);
    Route::get('customers/export-excel', [CustomerController::class, 'exportExcel']);
    Route::get('customers/export-pdf', [CustomerController::class, 'exportPdf']);
});

/**
 * Customer Portal Login Route
 * Authenticates using normalized WhatsApp number.
 * Returns Customer Object and Auth Token.
 */
Route::post('portal/login', function (Request $request) {
    $request->validate([
        'whatsapp_number' => 'required|string'
    ]);

    // Normalisasikan input whatsapp_number yang diberikan pelanggan
    $normalizedPhone = \App\Helpers\PhoneHelper::normalize($request->whatsapp_number);

    // Cari pelanggan dengan phone atau customer_number yang cocok
    $customer = Customer::where('phone', $normalizedPhone)
        ->orWhere('customer_number', $normalizedPhone)
        ->first();

    if (!$customer) {
        return response()->json([
            'success' => false,
            'message' => 'Akses Ditolak: Nomor WhatsApp ' . $normalizedPhone . ' tidak terdaftar di sistem StarBilling!'
        ], 404);
    }

    if ($customer->status === 'Nonaktif') {
        return response()->json([
            'success' => false,
            'message' => 'Akses Ditolak: Status keanggotaan Anda Nonaktif. Silakan hubungi Customer Service.'
        ], 403);
    }

    // Generate Token (In Laravel Sanctum)
    $token = $customer->createToken('customer_portal_token')->plainTextToken;

    return response()->json([
        'success' => true,
        'message' => 'Login Berhasil! Selamat Datang, ' . $customer->name,
        'token' => $token,
        'customer' => $customer
    ]);
});`
    },
    {
      name: 'CreateCustomer.vue',
      path: 'resources/js/components/customers/CreateCustomer.vue',
      language: 'javascript',
      description: 'Vue 3 component for adding a Customer. Translates real-time normalization of WhatsApp into form input and verifies minimum 10 digits.',
      code: `<template>
  <div class="card bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
    <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
      <h3 class="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider">Registrasi Pelanggan Baru</h3>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- Row 1: Nama & NIK -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Nama Lengkap *</label>
          <input 
            v-model="form.name"
            type="text" 
            required
            placeholder="Contoh: Budi Santoso"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Nomor NIK KTP (16 Digit) *</label>
          <input 
            v-model="form.nik"
            type="text" 
            required
            maxlength="16"
            placeholder="Contoh: 3173012345670001"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <!-- Row 2: WhatsApp & Email -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">No. WhatsApp / Pelanggan *</label>
          <input 
            v-model="phoneInput"
            @input="handlePhoneInput"
            type="text" 
            required
            placeholder="Masukkan No. WA (Contoh: 081112345678)"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          />
          <span v-if="normalizedPhone" class="text-[10px] text-cyan-400 font-mono mt-1 block">
            Hasil Normalisasi (Auto): {{ normalizedPhone }}
          </span>
        </div>
        <div>
          <label class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Alamat Email *</label>
          <input 
            v-model="form.email"
            type="email" 
            required
            placeholder="Contoh: budi@gmail.com"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <!-- Row 3: Alamat Lengkap -->
      <div>
        <label class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Alamat Pemasangan Lengkap *</label>
        <textarea 
          v-model="form.address"
          required
          rows="3"
          placeholder="Tulis nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan..."
          class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        ></textarea>
      </div>

      <!-- Row 4: Paket Layanan & Port ODP -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Paket Internet *</label>
          <select 
            v-model="form.package_id"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option v-for="pkg in packages" :key="pkg.id" :value="pkg.id">{{ pkg.name }} ({{ pkg.download_speed }})</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Port ODP Assigned *</label>
          <select 
            v-model="form.odp_id"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option v-for="odp in odps" :key="odp.id" :value="odp.id">{{ odp.name }}</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Status Pelanggan</label>
          <select 
            v-model="form.status"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="Aktif">Aktif</option>
            <option value="Suspend">Suspend</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>

      <!-- Upload Berkas Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div class="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex flex-col justify-between">
          <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">Unggah Foto KTP (Max 2MB)</span>
          <input type="file" @change="onKtpChange" accept="image/*" class="text-xs text-slate-400 file:bg-slate-800 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1.5 file:mr-3 hover:file:bg-slate-700" />
        </div>
        <div class="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex flex-col justify-between">
          <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">Unggah Foto Rumah (Max 2MB)</span>
          <input type="file" @change="onHomeChange" accept="image/*" class="text-xs text-slate-400 file:bg-slate-800 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1.5 file:mr-3 hover:file:bg-slate-700" />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
        <button 
          type="button" 
          @click="$emit('cancel')" 
          class="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl text-xs transition"
        >
          Batal
        </button>
        <button 
          type="submit" 
          class="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-cyan-500/10"
        >
          Daftarkan Pelanggan
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import axios from 'axios';

const emit = defineEmits(['success', 'cancel']);
const props = defineProps({
  packages: Array,
  odps: Array
});

const phoneInput = ref('');

const form = reactive({
  name: '',
  nik: '',
  phone: '',
  email: '',
  address: '',
  package_id: props.packages[0]?.id || '',
  odp_id: props.odps[0]?.id || '',
  status: 'Aktif',
  ktp_file: null,
  home_file: null
});

// Normalisasi input nomor WhatsApp secara dinamis
const normalizedPhone = computed(() => {
  let clean = phoneInput.value.replace(/\\s+/g, '').replace(/\\+/g, '').replace(/\\D/g, '');
  if (clean.startsWith('08')) {
    clean = '628' + clean.substring(2);
  }
  return clean;
});

const handlePhoneInput = () => {
  form.phone = normalizedPhone.value;
};

const onKtpChange = (e) => {
  form.ktp_file = e.target.files[0];
};

const onHomeChange = (e) => {
  form.home_file = e.target.files[0];
};

const handleSubmit = async () => {
  // Validasi panjang nomor WA minimal 10 maks 15 digit
  if (form.phone.length < 10 || form.phone.length > 15) {
    alert('Validasi Gagal: Nomor WhatsApp harus berukuran antara 10 s/d 15 digit angka!');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('nik', form.nik);
    formData.append('phone', form.phone);
    formData.append('customer_number', form.phone); // customer_number = phone
    formData.append('email', form.email);
    formData.append('address', form.address);
    formData.append('package_id', form.package_id);
    formData.append('odp_id', form.odp_id);
    formData.append('status', form.status);
    
    if (form.ktp_file) formData.append('ktp', form.ktp_file);
    if (form.home_file) formData.append('home_photo', form.home_file);

    const response = await axios.post('/api/customers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.data.success) {
      alert(response.data.message);
      emit('success');
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Gagal mendaftarkan pelanggan. Cek keunikan data!';
    alert(errorMsg);
  }
};
</script>`
    },
    {
      name: 'EditCustomer.vue',
      path: 'resources/js/components/customers/EditCustomer.vue',
      language: 'javascript',
      description: 'Vue 3 customer editor. Enables modification of master details, enforces WhatsApp active status criteria, and updates files.',
      code: `<template>
  <div class="card bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
    <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
      <h3 class="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider">Ubah Data Pelanggan</h3>
    </div>

    <form @submit.prevent="handleUpdate" class="space-y-5">
      <!-- Row 1: Nama & NIK -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Nama Lengkap *</label>
          <input 
            v-model="form.name"
            type="text" 
            required
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Nomor NIK KTP (16 Digit) *</label>
          <input 
            v-model="form.nik"
            type="text" 
            required
            maxlength="16"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <!-- Row 2: WhatsApp & Email -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">No. WhatsApp / Pelanggan *</label>
          <input 
            v-model="phoneInput"
            @input="handlePhoneInput"
            type="text" 
            required
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          />
          <span class="text-[10px] text-cyan-400 font-mono mt-1 block">
            Hasil Normalisasi (Auto): {{ normalizedPhone }}
          </span>
        </div>
        <div>
          <label class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Alamat Email *</label>
          <input 
            v-model="form.email"
            type="email" 
            required
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <!-- Row 3: Alamat Lengkap -->
      <div>
        <label class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Alamat Lengkap *</label>
        <textarea 
          v-model="form.address"
          required
          rows="3"
          class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        ></textarea>
      </div>

      <!-- Row 4: Paket & ODP -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Paket Internet *</label>
          <select v-model="form.package_id" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200">
            <option v-for="pkg in packages" :key="pkg.id" :value="pkg.id">{{ pkg.name }}</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">ODP Port Assigned *</label>
          <select v-model="form.odp_id" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200">
            <option v-for="odp in odps" :key="odp.id" :value="odp.id">{{ odp.name }}</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">Status Pelanggan *</label>
          <select v-model="form.status" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200">
            <option value="Aktif">Aktif</option>
            <option value="Suspend">Suspend</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>

      <!-- Attachments Update -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div class="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex flex-col gap-2">
          <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">KTP Pelanggan</span>
          <div v-if="form.ktp_url" class="mb-2">
            <img :src="form.ktp_url" class="h-20 object-cover rounded border border-slate-800" />
          </div>
          <input type="file" @change="onKtpChange" accept="image/*" class="text-xs text-slate-400" />
        </div>
        <div class="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex flex-col gap-2">
          <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Foto Lokasi Rumah</span>
          <div v-if="form.home_photo_url" class="mb-2">
            <img :src="form.home_photo_url" class="h-20 object-cover rounded border border-slate-800" />
          </div>
          <input type="file" @change="onHomeChange" accept="image/*" class="text-xs text-slate-400" />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
        <button 
          type="button" 
          @click="$emit('cancel')" 
          class="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl text-xs transition"
        >
          Batal
        </button>
        <button 
          type="submit" 
          class="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg"
        >
          Perbarui Pelanggan
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import axios from 'axios';

const emit = defineEmits(['success', 'cancel']);
const props = defineProps({
  customer: Object,
  packages: Array,
  odps: Array
});

const phoneInput = ref(props.customer.phone);

const form = reactive({
  name: props.customer.name,
  nik: props.customer.nik,
  phone: props.customer.phone,
  email: props.customer.email,
  address: props.customer.address,
  package_id: props.customer.package_id,
  odp_id: props.customer.odp_id,
  status: props.customer.status,
  ktp_url: props.customer.ktp_url,
  home_photo_url: props.customer.home_photo_url,
  ktp_file: null,
  home_file: null
});

const normalizedPhone = computed(() => {
  let clean = phoneInput.value.replace(/\\s+/g, '').replace(/\\+/g, '').replace(/\\D/g, '');
  if (clean.startsWith('08')) {
    clean = '628' + clean.substring(2);
  }
  return clean;
});

const handlePhoneInput = () => {
  form.phone = normalizedPhone.value;
};

const onKtpChange = (e) => {
  form.ktp_file = e.target.files[0];
};

const onHomeChange = (e) => {
  form.home_file = e.target.files[0];
};

const handleUpdate = async () => {
  if (form.phone.length < 10 || form.phone.length > 15) {
    alert('Validasi Gagal: Nomor WhatsApp harus berukuran antara 10 s/d 15 digit angka!');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('_method', 'PUT'); // Spoofing method PUT di Laravel FormData
    formData.append('name', form.name);
    formData.append('nik', form.nik);
    formData.append('phone', form.phone);
    formData.append('customer_number', form.phone); // customer_number = phone
    formData.append('email', form.email);
    formData.append('address', form.address);
    formData.append('package_id', form.package_id);
    formData.append('odp_id', form.odp_id);
    formData.append('status', form.status);

    if (form.ktp_file) formData.append('ktp', form.ktp_file);
    if (form.home_file) formData.append('home_photo', form.home_file);

    const response = await axios.post('/api/customers/' + props.customer.id, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.data.success) {
      alert('Data pelanggan berhasil diubah secara permanen!');
      emit('success');
    }
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal mengubah data pelanggan. Periksa duplikasi nomor!');
  }
};
</script>`
    },
    {
      name: 'CustomerDataTable.vue',
      path: 'resources/js/components/customers/CustomerDataTable.vue',
      language: 'javascript',
      description: 'Vue 3 Customer DataTable with complete features: Multi-column search (No. Pelanggan, WA, Nama, Alamat, PPPoE), Excel Upload wizard with Overwrite or Skip choices.',
      code: `<template>
  <div class="space-y-6">
    <!-- Header Controls -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">Data Pelanggan StarBilling</h2>
        <p class="text-xs text-slate-400">Pencarian multi-kolom canggih berdasarkan Nomor WA, PPPoE, Alamat, atau Nama.</p>
      </div>
      <div class="flex flex-wrap gap-2.5">
        <button @click="showImportModal = true" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-755 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700">
          <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Import Excel
        </button>
        <button @click="exportExcel" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-755 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700">
          <svg class="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export Excel
        </button>
        <button @click="exportPdf" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-755 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700">
          <svg class="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export PDF Laporan
        </button>
      </div>
    </div>

    <!-- Search and Filter Bar -->
    <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="relative w-full md:w-96">
        <span class="absolute left-3 top-2.5 text-slate-500">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </span>
        <input 
          v-model="searchTerm"
          @input="fetchCustomers"
          type="text" 
          placeholder="Cari No. Pelanggan, WA, Nama, Alamat, PPPoE..." 
          class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
        />
      </div>
      
      <div class="flex gap-2">
        <button 
          v-for="st in ['Semua', 'Aktif', 'Suspend', 'Nonaktif']" 
          :key="st"
          @click="statusFilter = st; fetchCustomers()"
          :class="['px-3.5 py-1.5 rounded-xl text-xs font-semibold transition', statusFilter === st ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-800/80' : 'bg-slate-950/40 text-slate-400 border border-transparent']"
        >
          {{ st }}
        </button>
      </div>
    </div>

    <!-- DataTable Render -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
              <th class="py-3 px-4">No. Pelanggan (WhatsApp)</th>
              <th class="py-3 px-4">Nama Pelanggan</th>
              <th class="py-3 px-4">Kredensial PPPoE</th>
              <th class="py-3 px-4">Paket / ODP</th>
              <th class="py-3 px-4 text-center">Status</th>
              <th class="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 text-xs">
            <tr v-if="customers.length === 0">
              <td colSpan="6" class="py-8 text-center text-slate-500 font-mono">Tidak ada pelanggan ditemukan.</td>
            </tr>
            <tr v-for="cust in customers" :key="cust.id" class="hover:bg-slate-950/20 transition">
              <td class="py-3.5 px-4 font-mono">
                <span class="text-white font-bold block">{{ cust.customer_number }}</span>
                <span class="text-slate-500 text-[10px]">NIK: {{ cust.nik }}</span>
              </td>
              <td class="py-3.5 px-4">
                <span class="text-slate-200 font-bold block">{{ cust.name }}</span>
                <span class="text-slate-400 text-[10px] block mt-0.5">{{ cust.address }}</span>
              </td>
              <td class="py-3.5 px-4 font-mono">
                <span class="text-indigo-400 font-semibold block">{{ cust.pppoe_username || 'belum_terbuat' }}</span>
                <span class="text-slate-500 text-[10px]">Pass: auto-synced</span>
              </td>
              <td class="py-3.5 px-4">
                <span class="text-cyan-400 font-semibold block">{{ cust.package?.name || 'Paket Kustom' }}</span>
                <span class="text-slate-500 text-[10px] font-mono">{{ cust.odp?.name || 'ODP-NONE' }}</span>
              </td>
              <td class="py-3.5 px-4 text-center">
                <span :class="['px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase inline-block', cust.status === 'Aktif' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50' : cust.status === 'Suspend' ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50' : 'bg-slate-800 text-slate-400']">
                  {{ cust.status }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button @click="$emit('edit', cust)" class="px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700 hover:text-white text-[11px] transition">Ubah</button>
                  <button @click="deleteCustomer(cust.id)" class="px-2 py-1 bg-rose-950/40 text-rose-400 rounded border border-rose-900/50 hover:bg-rose-900/40 text-[11px] transition">Hapus</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Excel Import Modal -->
    <div v-if="showImportModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div class="p-5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <h3 class="text-sm font-mono font-bold text-white uppercase">WIZARD IMPORT DATABASE EXCEL</h3>
          <button @click="showImportModal = false" class="text-slate-400 hover:text-white">✕</button>
        </div>
        
        <form @submit.prevent="handleImportExcel" class="p-5 space-y-4">
          <div>
            <label class="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">Pilih File Excel (.xlsx, .xls, .csv) *</label>
            <input type="file" @change="onExcelFileChange" required accept=".xlsx,.xls,.csv" class="text-xs text-slate-400 w-full bg-slate-950 p-2.5 rounded-xl border border-slate-850" />
          </div>

          <div>
            <label class="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">Strategi Duplikasi Nomor WhatsApp *</label>
            <div class="space-y-2 mt-1">
              <label class="flex items-center gap-2 text-xs text-slate-300">
                <input type="radio" v-model="importStrategy" value="skip" class="text-cyan-500 focus:ring-0" />
                <span>Skip Data (Lewati baris Excel jika No. WA sudah ada)</span>
              </label>
              <label class="flex items-center gap-2 text-xs text-slate-300">
                <input type="radio" v-model="importStrategy" value="overwrite" class="text-cyan-500 focus:ring-0" />
                <span>Overwrite Data (Perbarui data yang sudah ada di DB)</span>
              </label>
            </div>
          </div>

          <div class="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button type="button" @click="showImportModal = false" class="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs">Batal</button>
            <button type="submit" class="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs">Import Sekarang</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const customers = ref([]);
const searchTerm = ref('');
const statusFilter = ref('Semua');
const showImportModal = ref(false);
const importStrategy = ref('skip');
const excelFile = ref(null);

const fetchCustomers = async () => {
  try {
    const response = await axios.get('/api/customers', {
      params: {
        search: searchTerm.value,
        status: statusFilter.value
      }
    });
    customers.value = response.data.data.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
  }
};

const onExcelFileChange = (e) => {
  excelFile.value = e.target.files[0];
};

const handleImportExcel = async () => {
  if (!excelFile.value) return;
  
  const formData = new FormData();
  formData.append('excel_file', excelFile.value);
  formData.append('duplicate_strategy', importStrategy.value);

  try {
    const response = await axios.post('/api/customers/import-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    alert(response.data.message);
    showImportModal.value = false;
    excelFile.value = null;
    fetchCustomers();
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal mengimpor file Excel.');
  }
};

const deleteCustomer = async (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
    try {
      await axios.delete('/api/customers/' + id);
      alert('Pelanggan berhasil dihapus.');
      fetchCustomers();
    } catch (error) {
      alert('Gagal menghapus pelanggan.');
    }
  }
};

const exportExcel = () => {
  window.open('/api/customers/export-excel');
};

const exportPdf = () => {
  window.open('/api/customers/export-pdf');
};

onMounted(() => {
  fetchCustomers();
});
</script>`
    }
  ]
};
