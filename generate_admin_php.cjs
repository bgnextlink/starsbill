const fs = require('fs');

const phpCode = `<?php
session_start();

$menus = [
    'Dashboard',
    'Setting Server',
    'Members & Billing' => [
        'Kelola Data Pelanggan',
        'Setting Wilayah',
        'Setting ODP',
        'Setting Paket',
        'Data Pelanggan',
        'Pendaftaran Online',
        'Kolektor',
        'Ticket Komplain',
        'Pesan Otomatis',
        'Transaksi'
    ],
    'Pembayaran & Transaksi Lainya' => [
        'Transaksi Lain-Lain',
        'Pembayaran Tagihan',
        'Biaya & Diskon'
    ],
    'Laporan',
    'Setting' => [
        'Identitas & Lisensi',
        'Master Bank',
        'Payment Gateway',
        'AddOn',
        'Karyawan',
        'Sistem Setting'
    ],
    'Update & GitHub Sync'
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
        $html .= '<td class="px-6 py-4 text-right"><button class="text-blue-400 hover:text-blue-300">Edit</button></td></tr>';
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
    $html .= '</div><div class="mt-6"><button class="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-sm font-medium transition-colors">Simpan Pengaturan</button></div></div>';
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
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-y-auto hidden md:flex">
        <div class="p-6 border-b border-slate-800 flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white"><i class="fas fa-wifi"></i></div>
            <span class="font-bold text-lg">StarBilling</span>
        </div>
        <nav class="flex-1 p-4 space-y-1">
            <?php foreach ($menus as $key => $item): ?>
                <?php if (is_array($item)): ?>
                    <div class="pt-4 pb-1">
                        <p class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"><?= htmlspecialchars($key) ?></p>
                        <div class="space-y-1">
                            <?php foreach ($item as $subItem): ?>
                                <a href="?menu=<?= urlencode($subItem) ?>" class="block px-3 py-2 rounded-lg text-sm transition-colors <?= $active_menu === $subItem ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' ?>">
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
                <button class="md:hidden text-slate-400 hover:text-white"><i class="fas fa-bars"></i></button>
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
                <!-- Same dashboard content -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div class="text-slate-400 text-sm mb-1">Total Pelanggan</div>
                        <div class="text-2xl font-bold text-blue-400">1,248</div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div class="text-slate-400 text-sm mb-1">Pendapatan Bulan Ini</div>
                        <div class="text-2xl font-bold text-emerald-400">Rp 45.2M</div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div class="text-slate-400 text-sm mb-1">Tiket Aktif</div>
                        <div class="text-2xl font-bold text-rose-400">12</div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div class="text-slate-400 text-sm mb-1">Router Aktif</div>
                        <div class="text-2xl font-bold text-indigo-400">8</div>
                    </div>
                </div>
            <?php elseif ($active_menu === 'Setting Server'): ?>
                <?= renderForm([
                    ['label' => 'Nama Server', 'type' => 'text', 'value' => 'Mikrotik Utama'],
                    ['label' => 'IP Address / Host', 'type' => 'text', 'value' => '192.168.1.1'],
                    ['label' => 'API Port', 'type' => 'number', 'value' => '8728'],
                    ['label' => 'API Username', 'type' => 'text', 'value' => 'api_admin'],
                    ['label' => 'API Password', 'type' => 'password', 'value' => '*********']
                ], 'Koneksi RouterOS') ?>
            <?php elseif ($active_menu === 'Update & GitHub Sync'): ?>
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
                        <button class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
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
