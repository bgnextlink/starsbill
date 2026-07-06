<?php
session_start();
// Dummy authentication check
// if (!isset($_SESSION['user'])) { header("Location: ../login.php"); exit; }

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
            <a href="logout.php" class="flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors">
                <i class="fas fa-sign-out-alt"></i> Logout
            </a>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-full">
        <!-- Header -->
        <header class="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 flex items-center justify-between">
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
        <div class="flex-1 overflow-y-auto p-6 bg-slate-950">
            <?php if ($active_menu === 'Dashboard'): ?>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div class="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <div class="text-sm text-slate-400">Total Pelanggan</div>
                        <div class="text-2xl font-bold text-blue-400 mt-1">1,248</div>
                    </div>
                    <div class="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <div class="text-sm text-slate-400">Pendapatan Bulan Ini</div>
                        <div class="text-2xl font-bold text-emerald-400 mt-1">Rp 45.2M</div>
                    </div>
                    <div class="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <div class="text-sm text-slate-400">Tiket Aktif</div>
                        <div class="text-2xl font-bold text-rose-400 mt-1">12</div>
                    </div>
                    <div class="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <div class="text-sm text-slate-400">Router Aktif</div>
                        <div class="text-2xl font-bold text-indigo-400 mt-1">8</div>
                    </div>
                </div>
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center min-h-[300px] flex flex-col justify-center items-center">
                    <i class="fas fa-layer-group text-4xl text-slate-600 mb-4"></i>
                    <h2 class="text-xl font-bold mb-2">Welcome to StarBilling PHP Dashboard</h2>
                    <p class="text-slate-400">Modul utama billing ISP. Aplikasi PHP telah berjalan normal.</p>
                </div>
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
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center min-h-[400px] flex flex-col justify-center items-center">
                    <i class="fas fa-cog text-4xl text-slate-600 mb-4 fa-spin"></i>
                    <h2 class="text-xl font-bold mb-2 capitalize"><?= htmlspecialchars($active_menu) ?> Module</h2>
                    <p class="text-slate-400">Modul PHP ini siap dikembangkan.</p>
                </div>
            <?php endif; ?>
        </div>
    </main>

</body>
</html>
