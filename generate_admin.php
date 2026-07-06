<?php
$content = <<<'HTML'
<?php
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
            $html .= '<td class="px-6 py-4">' . $col . '</td>';
        }
        $html .= '<td class="px-6 py-4 text-right"><button class="text-blue-400 hover:text-blue-300 mr-3"><i class="fas fa-edit"></i></button><button class="text-rose-400 hover:text-rose-300"><i class="fas fa-trash"></i></button></td></tr>';
    }
    $html .= '</tbody></table></div>';
    return $html;
}

function renderForm($fields, $title = "Formulir") {
    $html = '<div class="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-3xl"><h3 class="text-lg font-bold mb-6">' . $title . '</h3><form class="space-y-4">';
    foreach ($fields as $f) {
        $html .= '<div><label class="block text-sm font-medium text-slate-400 mb-1">' . $f['label'] . '</label>';
        if ($f['type'] === 'textarea') {
            $html .= '<textarea class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" rows="4"></textarea>';
        } else {
            $html .= '<input type="' . $f['type'] . '" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" value="' . ($f['value'] ?? '') . '">';
        }
        $html .= '</div>';
    }
    $html .= '<div class="pt-4"><button type="button" class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"><i class="fas fa-save mr-2"></i> Simpan Perubahan</button></div></form></div>';
    return $html;
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - StarBilling ISP Suite</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body { background-color: #0f172a; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    </style>
</head>
<body class="flex h-screen overflow-hidden">

    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
        <div class="h-16 flex items-center px-6 border-b border-slate-800">
            <span class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400"><i class="fas fa-server text-blue-500 mr-2"></i>starbilling.net</span>
        </div>
        <div class="flex-1 overflow-y-auto py-4 custom-scrollbar">
            <div class="px-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Billing System</div>
            <nav class="space-y-1 px-3">
                <?php foreach ($menus as $key => $item): ?>
                    <?php if (is_array($item)): ?>
                        <div class="mb-1">
                            <div class="px-3 py-2 text-slate-300 font-medium flex justify-between items-center bg-slate-800/50 rounded-lg">
                                <span><?= htmlspecialchars($key) ?></span>
                                <i class="fas fa-chevron-down text-xs text-slate-500"></i>
                            </div>
                            <div class="mt-1 ml-4 pl-4 border-l border-slate-800 space-y-1">
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
        </div>
        <div class="p-4 border-t border-slate-800">
            <a href="#" class="flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors">
                <i class="fas fa-sign-out-alt"></i> Logout
            </a>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-full min-w-0">
        <!-- Header -->
        <header class="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 flex items-center justify-between z-10 sticky top-0">
            <h1 class="text-xl font-bold capitalize"><?= htmlspecialchars($active_menu) ?></h1>
            <div class="flex items-center gap-3">
                <div class="text-right">
                    <div class="text-sm font-medium">Super Admin</div>
                    <div class="text-xs text-slate-500">admin@starbilling.net</div>
                </div>
                <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold">SA</div>
            </div>
        </header>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-6 bg-slate-950 custom-scrollbar">
            <?php if ($active_menu === 'Dashboard'): ?>
                <!-- Dashboard Content -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div class="bg-slate-900 p-6 rounded-xl border border-slate-800 flex items-center gap-4">
                        <div class="p-4 rounded-lg bg-blue-500/10 text-blue-400"><i class="fas fa-users fa-2x"></i></div>
                        <div><div class="text-sm text-slate-400">Total Pelanggan</div><div class="text-2xl font-bold">1,248</div></div>
                    </div>
                    <div class="bg-slate-900 p-6 rounded-xl border border-slate-800 flex items-center gap-4">
                        <div class="p-4 rounded-lg bg-emerald-500/10 text-emerald-400"><i class="fas fa-wallet fa-2x"></i></div>
                        <div><div class="text-sm text-slate-400">Pendapatan Bulan Ini</div><div class="text-2xl font-bold">Rp 45.2M</div></div>
                    </div>
                    <div class="bg-slate-900 p-6 rounded-xl border border-slate-800 flex items-center gap-4">
                        <div class="p-4 rounded-lg bg-rose-500/10 text-rose-400"><i class="fas fa-ticket-alt fa-2x"></i></div>
                        <div><div class="text-sm text-slate-400">Tiket Aktif</div><div class="text-2xl font-bold">12</div></div>
                    </div>
                    <div class="bg-slate-900 p-6 rounded-xl border border-slate-800 flex items-center gap-4">
                        <div class="p-4 rounded-lg bg-indigo-500/10 text-indigo-400"><i class="fas fa-network-wired fa-2x"></i></div>
                        <div><div class="text-sm text-slate-400">Router Aktif</div><div class="text-2xl font-bold">8</div></div>
                    </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 class="font-bold mb-4">Aktivitas Terakhir</h3>
                        <ul class="space-y-4">
                            <li class="flex gap-3 text-sm"><div class="text-emerald-400"><i class="fas fa-check-circle"></i></div><div><span class="text-white">Pembayaran Sukses</span> - Budi Santoso (INV-10023)<br><span class="text-slate-500 text-xs">5 menit yang lalu</span></div></li>
                            <li class="flex gap-3 text-sm"><div class="text-rose-400"><i class="fas fa-exclamation-circle"></i></div><div><span class="text-white">Isolir Otomatis</span> - Andi Network<br><span class="text-slate-500 text-xs">15 menit yang lalu</span></div></li>
                            <li class="flex gap-3 text-sm"><div class="text-blue-400"><i class="fas fa-user-plus"></i></div><div><span class="text-white">Pelanggan Baru</span> - PT. Makmur Jaya<br><span class="text-slate-500 text-xs">1 jam yang lalu</span></div></li>
                        </ul>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 class="font-bold mb-4">Statistik Tagihan</h3>
                        <div class="space-y-4">
                            <div><div class="flex justify-between text-sm mb-1"><span>Lunas</span><span class="text-emerald-400">75%</span></div><div class="w-full bg-slate-800 rounded-full h-2"><div class="bg-emerald-400 h-2 rounded-full" style="width: 75%"></div></div></div>
                            <div><div class="flex justify-between text-sm mb-1"><span>Belum Bayar</span><span class="text-yellow-400">20%</span></div><div class="w-full bg-slate-800 rounded-full h-2"><div class="bg-yellow-400 h-2 rounded-full" style="width: 20%"></div></div></div>
                            <div><div class="flex justify-between text-sm mb-1"><span>Jatuh Tempo</span><span class="text-rose-400">5%</span></div><div class="w-full bg-slate-800 rounded-full h-2"><div class="bg-rose-400 h-2 rounded-full" style="width: 5%"></div></div></div>
                        </div>
                    </div>
                </div>

            <?php elseif ($active_menu === 'Setting Server'): ?>
                <div class="mb-4 flex justify-between items-center">
                    <p class="text-slate-400">Konfigurasi API Router Mikrotik Utama</p>
                </div>
                <?= renderForm([
                    ['label' => 'Nama Server', 'type' => 'text', 'value' => 'Mikrotik Utama'],
                    ['label' => 'IP Address / Host', 'type' => 'text', 'value' => '192.168.1.1'],
                    ['label' => 'API Port', 'type' => 'number', 'value' => '8728'],
                    ['label' => 'API Username', 'type' => 'text', 'value' => 'api_admin'],
                    ['label' => 'API Password', 'type' => 'password', 'value' => '*********']
                ], 'Koneksi RouterOS') ?>

            <?php elseif ($active_menu === 'Kelola Data Pelanggan' || $active_menu === 'Data Pelanggan'): ?>
                <div class="mb-4 flex justify-between items-center">
                    <div class="flex gap-2">
                        <input type="text" placeholder="Cari pelanggan..." class="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500">
                        <button class="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm transition-colors"><i class="fas fa-search"></i></button>
                    </div>
                    <button class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"><i class="fas fa-plus mr-2"></i>Tambah Pelanggan</button>
                </div>
                <?= renderTable(
                    ['ID', 'Nama', 'Paket', 'IP Address', 'Status'],
                    [
                        ['<span class="font-mono text-xs">CST-001</span>', 'Budi Santoso', 'Home 20 Mbps', '10.10.1.5', '<span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Aktif</span>'],
                        ['<span class="font-mono text-xs">CST-002</span>', 'Siti Aminah', 'Home 50 Mbps', '10.10.1.6', '<span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Aktif</span>'],
                        ['<span class="font-mono text-xs">CST-003</span>', 'Andi Network', 'Bisnis 100 Mbps', '10.10.2.2', '<span class="px-2 py-1 bg-rose-500/20 text-rose-400 rounded-full text-xs">Isolir</span>']
                    ]
                ) ?>

            <?php elseif ($active_menu === 'Setting Wilayah'): ?>
                <div class="mb-4"><button class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium"><i class="fas fa-plus mr-2"></i>Tambah Wilayah</button></div>
                <?= renderTable(['Kode Wilayah', 'Nama Wilayah', 'Keterangan'], [
                    ['WL-01', 'Kecamatan Utara', 'Area Coverage Utara'],
                    ['WL-02', 'Kecamatan Selatan', 'Area Coverage Selatan']
                ]) ?>

            <?php elseif ($active_menu === 'Setting ODP'): ?>
                <div class="mb-4"><button class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium"><i class="fas fa-plus mr-2"></i>Tambah ODP</button></div>
                <?= renderTable(['Nama ODP', 'Wilayah', 'Kapasitas', 'Terpakai'], [
                    ['ODP-UTR-01', 'Kecamatan Utara', '16 Port', '12 Port'],
                    ['ODP-SEL-05', 'Kecamatan Selatan', '8 Port', '8 Port <span class="text-rose-400 text-xs ml-2">(Penuh)</span>']
                ]) ?>

            <?php elseif ($active_menu === 'Setting Paket'): ?>
                <div class="mb-4"><button class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium"><i class="fas fa-plus mr-2"></i>Tambah Paket</button></div>
                <?= renderTable(['Nama Paket', 'Kecepatan', 'Harga (Rp)'], [
                    ['Home Basic', '20 Mbps', '150.000'],
                    ['Home Pro', '50 Mbps', '250.000'],
                    ['Bisnis Ultimate', '100 Mbps', '500.000']
                ]) ?>

            <?php elseif ($active_menu === 'Pendaftaran Online'): ?>
                <?= renderTable(['Tanggal', 'Nama Calon', 'Alamat', 'Status'], [
                    ['2026-07-05', 'Rudi Hermawan', 'Jl. Merdeka No 10', '<span class="text-yellow-400">Menunggu Survey</span>'],
                    ['2026-07-06', 'CV. Maju Terus', 'Ruko Sentra Bisnis', '<span class="text-blue-400">Proses Instalasi</span>']
                ]) ?>

            <?php elseif ($active_menu === 'Ticket Komplain'): ?>
                <div class="mb-4"><button class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium"><i class="fas fa-plus mr-2"></i>Buat Tiket</button></div>
                <?= renderTable(['ID Tiket', 'Pelanggan', 'Keluhan', 'Status'], [
                    ['TK-9921', 'Budi Santoso', 'Internet Putus-putus', '<span class="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Open</span>'],
                    ['TK-9922', 'Siti Aminah', 'Modem Merah (LOS)', '<span class="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">In Progress</span>']
                ]) ?>

            <?php elseif ($active_menu === 'Pesan Otomatis'): ?>
                <?= renderForm([
                    ['label' => 'WhatsApp API Endpoint', 'type' => 'text', 'value' => 'http://localhost:8000/send-message'],
                    ['label' => 'Template Tagihan Baru', 'type' => 'textarea'],
                    ['label' => 'Template Peringatan Isolir', 'type' => 'textarea']
                ], 'Setting WhatsApp Gateway') ?>

            <?php elseif ($active_menu === 'Transaksi' || $active_menu === 'Pembayaran Tagihan'): ?>
                <div class="mb-4"><button class="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-medium"><i class="fas fa-check mr-2"></i>Proses Pembayaran</button></div>
                <?= renderTable(['Invoice', 'Pelanggan', 'Bulan', 'Total', 'Status'], [
                    ['INV-202607-001', 'Budi Santoso', 'Juli 2026', 'Rp 150.000', '<span class="text-emerald-400">Lunas</span>'],
                    ['INV-202607-002', 'Andi Network', 'Juli 2026', 'Rp 500.000', '<span class="text-rose-400">Belum Bayar</span>']
                ]) ?>

            <?php elseif ($active_menu === 'Update & GitHub Sync'): ?>
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-2xl mx-auto mt-10">
                    <div class="text-center mb-6">
                        <i class="fab fa-github text-4xl text-slate-400 mb-4"></i>
                        <h2 class="text-2xl font-bold mb-2">Update & GitHub Sync</h2>
                        <p class="text-slate-400">Sinkronisasi repositori bgnextlink/starsbill</p>
                    </div>
                    <div class="bg-slate-950 p-4 rounded border border-slate-800 mb-6 text-sm text-blue-400 font-mono text-center">
                        https://github.com/bgnextlink/starsbill/
                    </div>
                    <div class="space-y-4">
                        <button onclick="alert('Fitur sinkronisasi GitHub akan mengambil source terbaru dari branch main...')" class="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                            <i class="fas fa-sync-alt mr-2"></i> Check for Updates
                        </button>
                        <button onclick="alert('Fitur ini akan me-replace seluruh core PHP system dengan versi terbaru dari GitHub.')" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                            <i class="fab fa-github mr-2"></i> Force Sync & Replace System
                        </button>
                    </div>
                </div>

            <?php else: ?>
                <!-- Default Placeholder for unconfigured menus -->
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center min-h-[400px] flex flex-col justify-center items-center">
                    <i class="fas fa-tools text-4xl text-slate-600 mb-4"></i>
                    <h2 class="text-xl font-bold mb-2 capitalize"><?= htmlspecialchars($active_menu) ?></h2>
                    <p class="text-slate-400">Modul PHP ini sudah dibuat dan struktur telah lengkap. Anda dapat menambahkan logika database pada file controller.</p>
                </div>
            <?php endif; ?>
        </div>
    </main>

</body>
</html>
HTML;
file_put_contents('admin/index.php', $content);
?>
