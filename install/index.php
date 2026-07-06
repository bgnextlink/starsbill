<?php
/**
 * =========================================================================
 * STARBILLING WEB INSTALLER (install/index.php)
 * Platform     : Web Server (XAMPP / Cpanel / VPS)
 * Description  : Interactive installation wizard with Clean DB enforcement
 * =========================================================================
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
set_time_limit(300);

$step = isset($_GET['step']) ? (int)$_GET['step'] : 1;
$db_host = isset($_POST['db_host']) ? trim($_POST['db_host']) : '${installerDbHost}';
$db_port = isset($_POST['db_port']) ? trim($_POST['db_port']) : '${installerDbPort}';
$db_name = isset($_POST['db_name']) ? trim($_POST['db_name']) : '${installerDbName}';
$db_user = isset($_POST['db_user']) ? trim($_POST['db_user']) : '${installerDbUser}';
$db_pass = isset($_POST['db_pass']) ? trim($_POST['db_pass']) : '${installerDbPass}';
$license = isset($_POST['license']) ? trim($_POST['license']) : '${licenseKey}';

echo "<html><head><title>StarBilling ISP Web Installer</title>";
echo "<script src='https://cdn.tailwindcss.com'></script>";
echo "<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono&display=swap' rel='stylesheet'>";
echo "<style>
    body { font-family: 'Inter', sans-serif; background-color: #020617; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
</style></head><body class='text-slate-200 min-h-screen flex items-center justify-center p-6 bg-slate-950'>";

echo "<div class='w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6'>";

// Header
echo "<div class='text-center space-y-2 border-b border-slate-800 pb-4'>
    <h1 class='text-lg font-bold text-white tracking-wider font-mono uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500'>⚡ STARBILLING WEB INSTALLER</h1>
    <p class='text-xs text-slate-400'>Instalasi langsung ke direktori <span class='font-mono text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded'>install</span></p>
</div>";

if ($step === 1) {
    // Step 1: Form parameters
    echo "<form method='POST' action='?step=2' class='space-y-4'>";
    echo "<p class='text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-850/60'>
        Selamat datang di asisten instalasi interaktif StarBilling. Installer ini akan membuat database bersih <strong>tanpa data dummy</strong> (tanpa pelanggan fiktif, tanpa router tiruan) sehingga siap untuk operasional komersial ISP Anda.
    </p>";
    
    echo "<div class='grid grid-cols-2 gap-4 text-xs'>";
    echo "<div>
        <label class='block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px]'>Host Database</label>
        <input type='text' name='db_host' value='\" . htmlspecialchars($db_host) . \"' class='w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500'>
    </div>";
    echo "<div>
        <label class='block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px]'>Port Database</label>
        <input type='text' name='db_port' value='\" . htmlspecialchars($db_port) . \"' class='w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500'>
    </div>";
    echo "<div>
        <label class='block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px]'>Nama Database</label>
        <input type='text' name='db_name' value='\" . htmlspecialchars($db_name) . \"' class='w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500'>
    </div>";
    echo "<div>
        <label class='block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px]'>Username DB</label>
        <input type='text' name='db_user' value='\" . htmlspecialchars($db_user) . \"' class='w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500'>
    </div>";
    echo "<div class='col-span-2'>
        <label class='block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px]'>Password DB</label>
        <input type='password' name='db_pass' value='\" . htmlspecialchars($db_pass) . \"' placeholder='Kosongkan jika default root XAMPP' class='w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500'>
    </div>";
    echo "<div class='col-span-2'>
        <label class='block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px]'>Serial Key Lisensi</label>
        <input type='text' name='license' value='\" . htmlspecialchars($license) . \"' class='w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 uppercase'>
    </div>";
    echo "</div>";
    
    echo "<button type='submit' class='w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-3 rounded-xl text-xs uppercase tracking-wider font-mono transition shadow-lg'>
        Mulai Inisialisasi Database Bersih
    </button>";
    echo "</form>";
} else {
    // Step 2: Connection and query execution
    echo "<div class='space-y-4 text-xs font-mono'>";
    echo "<div class='bg-slate-950 border border-slate-850 p-4 rounded-xl text-[10px] text-slate-300 leading-relaxed space-y-1.5 h-64 overflow-y-auto'>";
    
    echo "<div>[INFO] Membuka asisten instalasi PHP PDO...</div>";
    echo "<div>[CONNECT] Menghubungkan ke MySQL Server pada $db_host:$db_port...</div>";
    
    try {
        $pdo = new PDO(\"mysql:host=$db_host;port=$db_port\", $db_user, $db_pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        echo "<div class='text-emerald-400'>[OK] Koneksi MySQL Server Berhasil!</div>";
        
        echo "<div>[SQL] Membuat database if not exists `$db_name`...</div>";
        $pdo->exec(\"CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\");
        $pdo->exec(\"USE `$db_name\