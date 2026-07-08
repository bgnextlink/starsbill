const fs = require('fs');

const phpCode = `<?php
session_start();

$menus = [
    'Dashboard',
    'Setting Server' => [
        'Router Mikrotik',
        'GenieACS',
        'Import Data'
    ],
    'Members & Billing' => [
        'Setting Wilayah',
        'Setting ODP',
        'Setting Paket',
        'Data Pelanggan',
        'Pendaftaran Online',
        'Kolektor',
        'Ticket Komplain',
        'Pesan Otomatis'
    ],
    'Transaksi' => [
        'Transaksi Lain-Lain',
        'Pembayaran Tagihan',
        'Biaya & Diskon'
    ],
    'Laporan' => [
        'Mutasi Keuangan',
        'Reward Marketing',
        'Log Isolir',
        'Ganti Paket',
        'Penjualan Voucher',
        'Pembayaran Online',
        'Invoice Unpaid',
        'Log Open Isolir',
        'Laporan Omset',
        'Laporan Laba Rugi'
    ],
    'Master Bank',
    'Payment Gateway' => [
        'Xendit',
        'Tripay',
        'Duitku',
        'Flip',
        'Doku'
    ],
    'AddOn' => [
        'VPN Client',
        'Halaman Isolir',
        'Wa Gateway',
        'Pengaturan Portal Pelanggan'
    ],
    'Karyawan' => [
        'Jabatan & Hak Akses',
        'Data Karyawan',
        'Histori Login',
        'Log Pelanggan'
    ],
    'Sistem Setting' => [
        'Identitas',
        'Widget',
        'Riset Ulang Isolir',
        'Lisensi',
        'Update'
    ]
];

$active_menu = isset($_GET['menu']) ? $_GET['menu'] : 'Dashboard';

function renderTable($headers, $rows) {
    $html = '<div class="overflow-x-auto bg-slate-900 rounded-xl border border-slate-800"><table class="w-full text-sm text-left"><thead class="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800"><tr>';
    foreach ($headers as $h) {
        $html .= '<th class="px-6 py-4">' . htmlspecialchars($h) . '</th>';
    }
    $html .= '<th class="px-6 py-4 text-right">Aksi</th></tr></thead><tbody class="divide-y divide-slate-800/50">';
    
    foreach ($rows as $row) {
        $html .= '<tr class="hover:bg-slate-800/20">';
        foreach ($row as $col) {
            $html .= '<td class="px-6 py-4 text-slate-300">' . $col . '</td>';
        }
        $html .= '<td class="px-6 py-4 text-right"><button onclick="alert('Fitur ini masih dalam tahap pengembangan!')" class="text-blue-400 hover:text-blue-300">Edit</button></td></tr>';
    }
    $html .= '</tbody></table></div>';
    return $html;
}

function renderForm($fields, $title) {
    $html = '<div class="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl"><h3 class="font-bold mb-6 text-lg">' . htmlspecialchars($title) . '</h3><div class="space-y-4">';
    foreach ($fields as $f) {
        $html .= '<div><label class="block text-sm font-medium text-slate-400 mb-1">' . htmlspecialchars($f['label']) . '</label>';
        if ($f['type'] === 'textarea') {
            $html .= '<textarea class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-300 focus:outline-none focus:border-blue-500 min-h-[100px]"></textarea>';
        } else {
            $html .= '<input type="' . $f['type'] . '" value="' . htmlspecialchars($f['value'] ?? '') . '" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-300 focus:outline-none focus:border-blue-500">';
        }
        $html .= '</div>';
    }
    $html .= '</div><div class="mt-6"><button onclick="alert('Fitur ini masih dalam tahap pengembangan!')" class="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-sm font-medium transition-colors">Simpan Pengaturan</button></div></div>';
    return $html;
}

?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($active_menu) ?> - StarBilling ISP Suite</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { background-color: #020617; color: #f8fafc; font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="flex h-screen overflow-hidden">
    <!-- Mobile Overlay -->
    <div id="sidebar-overlay" onclick="document.getElementById('sidebar').classList.add('hidden'); document.getElementById('sidebar').classList.remove('flex'); this.classList.add('hidden')" class="fixed inset-0 bg-black/50 z-40 hidden md:hidden"></div>

    <!-- Sidebar -->
    <aside id="sidebar" class="w-64 bg-slate-900 border-r border-slate-800 flex-col h-full overflow-y-auto hidden md:flex absolute md:relative z-50">
        <div class="p-6 border-b border-slate-800 flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white"><i class="fas fa-wifi"></i></div>
            <span class="font-bold text-lg">StarBilling</span>
        </div>
        <nav class="flex-1 p-4 space-y-1">
            <?php foreach ($menus as $key => $item): ?>
                <?php if (is_array($item)): ?>
                    <?php $is_active_group = in_array($active_menu, $item); ?>
                    <div class="pt-2 pb-1">
                        <button onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.fa-chevron-down').classList.toggle('rotate-180')" class="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 hover:text-slate-300 transition-colors cursor-pointer">
                            <span><?= htmlspecialchars($key) ?></span>
                            <i class="fas fa-chevron-down transition-transform duration-200 <?= $is_active_group ? 'rotate-180' : '' ?>"></i>
                        </button>
                        <div class="space-y-1 <?= $is_active_group ? '' : 'hidden' ?>">
                            <?php foreach ($item as $subItem): ?>
                                <a href="?menu=<?= urlencode($subItem) ?>" class="block px-3 py-2 pl-6 rounded-lg text-sm transition-colors <?= $active_menu === $subItem ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' ?>">
                                    <?= htmlspecialchars($subItem) ?>
                                </a>
                            <?php endforeach; ?>
                        </div>
                    </div>
                <?php else: ?>
                    <a href="?menu=<?= urlencode($item) ?>" class="block px-3 py-2 rounded-lg font-medium transition-colors <?= $active_menu === $item ? 'bg-blue-600/10 text-blue-400' : 'text-slate-300 hover:bg-slate-800/50' ?>">
                        <?= htmlspecialchars($item) ?>
                    </a>
                <?php endif; ?>
            <?php endforeach; ?>
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-full overflow-y-auto">
        <!-- Header -->
        <header class="bg-slate-900/50 border-b border-slate-800 p-4 flex justify-between items-center backdrop-blur-sm sticky top-0 z-10">
            <div class="flex items-center gap-4">
                <button onclick="document.getElementById('sidebar').classList.toggle('hidden'); document.getElementById('sidebar').classList.toggle('flex'); document.getElementById('sidebar-overlay').classList.toggle('hidden')" class="md:hidden text-slate-400 hover:text-white"><i class="fas fa-bars"></i></button>
                <h1 class="text-xl font-bold capitalize"><?= htmlspecialchars($active_menu) ?></h1>
            </div>
            <div class="flex items-center gap-4">
                <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium"><i class="fas fa-check-circle mr-1"></i> Mode PHP Aktif</span>
                <div class="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 cursor-pointer">
                    <i class="fas fa-user text-sm text-slate-400"></i>
                </div>
            </div>
        </header>

        <!-- Content Area -->
        <div class="p-6">
            <?php if ($active_menu === 'Dashboard'): ?>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center">
                        <div class="text-slate-400 text-sm mb-2">PPP Screets</div>
                        <div class="text-4xl font-bold text-white">0</div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center">
                        <div class="text-slate-400 text-sm mb-2">PPP Online</div>
                        <div class="text-4xl font-bold text-emerald-400">0</div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center">
                        <div class="text-slate-400 text-sm mb-2">PPP Offline</div>
                        <div class="text-4xl font-bold text-rose-400">0</div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 class="font-bold text-white mb-4">Pendapatan vs Pengeluaran</h3>
                        <div class="h-48 flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg">
                            [Grafik Pendapatan vs Pengeluaran]
                        </div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="font-bold text-white">Metode Pembayaran</h3>
                            <div class="text-right">
                                <div class="text-xs text-slate-400">Periode</div>
                                <div class="text-sm font-medium text-blue-400">01-07-2026 s/d 09-07-2026</div>
                                <div class="text-xs text-slate-400 mt-1">25 Transaksi</div>
                            </div>
                        </div>
                        <div class="h-36 flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg">
                            [Grafik Metode Pembayaran]
                        </div>
                    </div>
                </div>

                <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
                    <div class="p-6 border-b border-slate-800">
                        <h3 class="font-bold text-white text-lg">Status Pelanggan</h3>
                        <p class="text-slate-400 text-sm mt-1">Daftar Pelanggan Layanan Belum Terpasang atau belum aktif</p>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                                <tr>
                                    <th class="px-6 py-4">No</th>
                                    <th class="px-6 py-4">Nama</th>
                                    <th class="px-6 py-4">Telp / Wa</th>
                                    <th class="px-6 py-4">Alamat</th>
                                    <th class="px-6 py-4">Area</th>
                                    <th class="px-6 py-4">Paket</th>
                                    <th class="px-6 py-4">Tarif</th>
                                    <th class="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800/50 text-slate-300">
                                <tr class="hover:bg-slate-800/20">
                                    <td colspan="8" class="px-6 py-8 text-center text-slate-500">
                                        Tidak ada data pelanggan yang belum terpasang/aktif
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            <?php elseif ($active_menu === 'Router Mikrotik' || $active_menu === 'Setting Server'): ?>
                <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div class="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 class="font-bold text-white text-lg">Router Mikrotik</h3>
                            <p class="text-slate-400 text-sm mt-1">Daftar koneksi Router Mikrotik yang terhubung dengan sistem</p>
                        </div>
                        <button onclick="alert('Fitur ini masih dalam tahap pengembangan!')" class="shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                            <i class="fas fa-plus"></i> Tambah Router
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                                <tr>
                                    <th class="px-6 py-4 whitespace-nowrap">No</th>
                                    <th class="px-6 py-4 whitespace-nowrap">Koneksi</th>
                                    <th class="px-6 py-4 whitespace-nowrap">Auto Isolir</th>
                                    <th class="px-6 py-4 whitespace-nowrap">Aksi Isolir</th>
                                    <th class="px-6 py-4 whitespace-nowrap">Profile</th>
                                    <th class="px-6 py-4 whitespace-nowrap">Status</th>
                                    <th class="px-6 py-4 whitespace-nowrap">Mode Aktif</th>
                                    <th class="px-6 py-4 whitespace-nowrap text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800/50 text-slate-300">
                                <tr class="hover:bg-slate-800/20">
                                    <td class="px-6 py-4">1</td>
                                    <td class="px-6 py-4">
                                        <div class="font-medium text-white whitespace-nowrap">Mikrotik Utama</div>
                                        <div class="text-xs text-slate-500 whitespace-nowrap">192.168.1.1:8728</div>
                                    </td>
                                    <td class="px-6 py-4"><span class="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs whitespace-nowrap">Aktif</span></td>
                                    <td class="px-6 py-4 whitespace-nowrap">Disable Secret</td>
                                    <td class="px-6 py-4 whitespace-nowrap">PPPoE</td>
                                    <td class="px-6 py-4"><span class="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs whitespace-nowrap">Connected</span></td>
                                    <td class="px-6 py-4 whitespace-nowrap">API</td>
                                    <td class="px-6 py-4 text-right">
                                        <div class="flex items-center justify-end gap-2">
                                            <button onclick="alert('Fitur ini masih dalam tahap pengembangan!')" class="p-2 text-blue-400 hover:bg-blue-400/10 rounded transition-colors" title="Edit"><i class="fas fa-edit"></i></button>
                                            <button onclick="alert('Fitur ini masih dalam tahap pengembangan!')" class="p-2 text-rose-400 hover:bg-rose-400/10 rounded transition-colors" title="Hapus"><i class="fas fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            <?php elseif ($active_menu === 'GenieACS'): ?>
                <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div class="p-6 border-b border-slate-800 flex justify-between items-center">
                        <div>
                            <h3 class="font-bold text-white text-lg">Devices List</h3>
                            <p class="text-slate-400 text-sm mt-1">Daftar perangkat GenieACS yang terhubung</p>
                        </div>
                        <button onclick="alert('Fitur ini masih dalam tahap pengembangan!')" class="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm">
                            <i class="fas fa-cog"></i> Konfigurasi
                        </button>
                    </div>
                    
                    <div class="p-6 border-b border-slate-800 bg-slate-950/30">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label class="block text-sm font-medium text-slate-400 mb-1">Cari Berdasarkan</label>
                                <select class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                                    <option value="all">SEMUA</option>
                                    <option value="mac">MAC Address</option>
                                    <option value="serial">Serial Number</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-400 mb-1">Pencarian</label>
                                <div class="relative">
                                    <input type="text" placeholder="Masukkan Kata Kunci Pencarian" class="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                                    <i class="fas fa-search absolute left-3 top-3 text-slate-500"></i>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-400 mb-1">Device Status</label>
                                <select class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                                    <option value="all">SEMUA</option>
                                    <option value="online">Online</option>
                                    <option value="offline">Offline</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                                <tr>
                                    <th class="px-6 py-4">No</th>
                                    <th class="px-6 py-4">Device Status</th>
                                    <th class="px-6 py-4">Product</th>
                                    <th class="px-6 py-4">Last Update</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800/50 text-slate-300">
                                <tr class="hover:bg-slate-800/20">
                                    <td colspan="4" class="px-6 py-8 text-center text-slate-500">
                                        Tidak ada data perangkat ditemukan
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            <?php elseif ($active_menu === 'Import Data'): ?>
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl">
                    <h3 class="font-bold mb-6 text-lg text-white">Import Data Pelanggan / Sistem</h3>
                    <div class="p-6 border border-dashed border-slate-700 rounded-lg bg-slate-950 text-center mb-6">
                        <i class="fas fa-file-excel text-3xl text-slate-500 mb-4"></i>
                        <p class="text-sm text-slate-400 mb-4">Upload file Excel (.xlsx, .csv) untuk mengimpor data pelanggan secara massal.</p>
                        <button onclick="alert('Fitur ini masih dalam tahap pengembangan!')" class="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">Pilih File Data</button>
                    </div>
                    <button onclick="alert('Fitur ini masih dalam tahap pengembangan!')" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors">Mulai Import Data</button>
                </div>
            <?php elseif ($active_menu === 'Update'): ?>
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-2xl mx-auto mt-10">
                    <div class="text-center mb-6">
                        <i class="fab fa-github text-4xl text-slate-400 mb-4"></i>
                        <h2 class="text-2xl font-bold mb-2">Update & GitHub Sync</h2>
                        <p class="text-slate-400">Sinkronisasi repositori secara real-time</p>
                    </div>
                    <div class="bg-slate-950 p-4 rounded border border-slate-800 mb-6 text-sm text-blue-400 font-mono text-center">
                        https://github.com/bgnextlink/starsbill/
                    </div>
                    
                    <div id="sync-alert" class="hidden mb-6 p-4 rounded-lg border"></div>

                    <div class="space-y-4">
                        <button id="btn-sync" onclick="runSync()" class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                            <i class="fab fa-github mr-2"></i> Jalankan Sinkronisasi (git pull)
                        </button>
                    </div>
                    <div class="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p class="text-yellow-200/80 text-sm">
                            <strong>Peringatan:</strong> Proses ini akan mengeksekusi <code>git pull origin main</code>. Pastikan server memiliki akses ke repositori.
                        </p>
                    </div>
                </div>
                
                <script>
                function runSync() {
                    const btn = document.getElementById('btn-sync');
                    const alertBox = document.getElementById('sync-alert');
                    
                    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> Sedang Sinkronisasi...';
                    btn.disabled = true;
                    btn.classList.add('opacity-50', 'cursor-not-allowed');
                    
                    alertBox.className = 'hidden mb-6 p-4 rounded-lg border';
                    
                    fetch('github_sync.php')
                        .then(res => res.json())
                        .then(data => {
                            btn.innerHTML = '<i class="fab fa-github mr-2"></i> Jalankan Sinkronisasi (git pull)';
                            btn.disabled = false;
                            btn.classList.remove('opacity-50', 'cursor-not-allowed');
                            
                            alertBox.classList.remove('hidden');
                            if(data.success) {
                                alertBox.classList.add('bg-emerald-500/10', 'border-emerald-500/20', 'text-emerald-400');
                                alertBox.innerHTML = '<div class="font-bold mb-1"><i class="fas fa-check-circle mr-2"></i> Berhasil!</div><p class="text-sm">' + data.message + '</p><pre class="mt-2 text-xs bg-slate-950 p-2 rounded overflow-x-auto text-emerald-200">' + data.log + '</pre>';
                            } else {
                                alertBox.classList.add('bg-rose-500/10', 'border-rose-500/20', 'text-rose-400');
                                alertBox.innerHTML = '<div class="font-bold mb-1"><i class="fas fa-exclamation-circle mr-2"></i> Gagal!</div><p class="text-sm">' + data.message + '</p><pre class="mt-2 text-xs bg-slate-950 p-2 rounded overflow-x-auto text-rose-200">' + data.log + '</pre>';
                            }
                        })
                        .catch(err => {
                            btn.innerHTML = '<i class="fab fa-github mr-2"></i> Jalankan Sinkronisasi (git pull)';
                            btn.disabled = false;
                            btn.classList.remove('opacity-50', 'cursor-not-allowed');
                            
                            alertBox.classList.remove('hidden');
                            alertBox.classList.add('bg-rose-500/10', 'border-rose-500/20', 'text-rose-400');
                            alertBox.innerHTML = '<div class="font-bold mb-1"><i class="fas fa-exclamation-circle mr-2"></i> Error Sistem!</div><p class="text-sm">Gagal terhubung ke github_sync.php</p>';
                        });
                }
                </script>
            <?php else: ?>
                <!-- FULL DEFAULT RENDERER SO IT NEVER LOOKS EMPTY -->
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-bold text-white capitalize"><?= htmlspecialchars($active_menu) ?></h2>
                        <button onclick="alert('Fitur ini masih dalam tahap pengembangan!')" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <i class="fas fa-plus mr-2"></i> Tambah Data
                        </button>
                    </div>
                    <?= renderTable(['ID', 'Keterangan', 'Status'], [
                        ['<span class="font-mono text-xs">#001</span>', 'Data dummy untuk ' . htmlspecialchars($active_menu), '<span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Aktif</span>'],
                        ['<span class="font-mono text-xs">#002</span>', 'Konfigurasi sistem tambahan', '<span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Aktif</span>']
                    ]) ?>
                </div>
            <?php endif; ?>
        </div>
    </main>
</body>
</html>
`;

fs.writeFileSync('admin/index.php', phpCode);
console.log('admin/index.php created successfully!');
