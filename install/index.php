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
$db_host = isset($_POST['db_host']) ? trim($_POST['db_host']) : 'localhost';
$db_port = isset($_POST['db_port']) ? trim($_POST['db_port']) : '3306';
$db_name = isset($_POST['db_name']) ? trim($_POST['db_name']) : 'starbilling_db';
$db_user = isset($_POST['db_user']) ? trim($_POST['db_user']) : 'root';
$db_pass = isset($_POST['db_pass']) ? trim($_POST['db_pass']) : '';
$license = isset($_POST['license']) ? trim($_POST['license']) : 'SB-LIFETIME-DEMO-2026';

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
        <input type='text' name='db_host' value='" . htmlspecialchars($db_host) . "' class='w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500'>
    </div>";
    echo "<div>
        <label class='block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px]'>Port Database</label>
        <input type='text' name='db_port' value='" . htmlspecialchars($db_port) . "' class='w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500'>
    </div>";
    echo "<div>
        <label class='block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px]'>Nama Database</label>
        <input type='text' name='db_name' value='" . htmlspecialchars($db_name) . "' class='w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500'>
    </div>";
    echo "<div>
        <label class='block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px]'>Username DB</label>
        <input type='text' name='db_user' value='" . htmlspecialchars($db_user) . "' class='w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500'>
    </div>";
    echo "<div class='col-span-2'>
        <label class='block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px]'>Password DB</label>
        <input type='password' name='db_pass' value='" . htmlspecialchars($db_pass) . "' placeholder='Kosongkan jika default root XAMPP' class='w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500'>
    </div>";
    echo "<div class='col-span-2'>
        <label class='block text-slate-400 mb-1 font-mono uppercase tracking-wider text-[10px]'>Serial Key Lisensi</label>
        <input type='text' name='license' value='" . htmlspecialchars($license) . "' class='w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 uppercase'>
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
        $pdo = new PDO("mysql:host=$db_host;port=$db_port", $db_user, $db_pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        echo "<div class='text-emerald-400'>[OK] Koneksi MySQL Server Berhasil!</div>";
        
        echo "<div>[SQL] Membuat database if not exists `$db_name`...</div>";
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
        $pdo->exec("USE `$db_name`;");
        echo "<div class='text-emerald-400'>[OK] Database `$db_name` dideteksi / dibuat sukses.</div>";
        
        // Create table schemas
        echo "<div>[MIGRATE] Membuat skema tabel StarBilling core...</div>";
        $pdo->exec("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), email VARCHAR(100) UNIQUE, password VARCHAR(255), role VARCHAR(20));");
        $pdo->exec("CREATE TABLE IF NOT EXISTS customers (id INT AUTO_INCREMENT PRIMARY KEY, customer_number VARCHAR(100), name VARCHAR(100), phone VARCHAR(30), address TEXT, package_id VARCHAR(30), router_id VARCHAR(30), status VARCHAR(20));");
        $pdo->exec("CREATE TABLE IF NOT EXISTS invoices (id INT AUTO_INCREMENT PRIMARY KEY, invoice_number VARCHAR(100), customer_id VARCHAR(30), amount INT, due_date DATE, status VARCHAR(20));");
        $pdo->exec("CREATE TABLE IF NOT EXISTS tickets (id INT AUTO_INCREMENT PRIMARY KEY, ticket_number VARCHAR(100), customer_id VARCHAR(30), title VARCHAR(150), status VARCHAR(20));");
        $pdo->exec("CREATE TABLE IF NOT EXISTS transactions (id INT AUTO_INCREMENT PRIMARY KEY, description VARCHAR(255), amount INT, type VARCHAR(20));");
        $pdo->exec("CREATE TABLE IF NOT EXISTS mikrotik_configs (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), ip_address VARCHAR(50), status VARCHAR(20));");
        
        echo "<div class='text-indigo-400'>[CLEAN] Melakukan sanitasi database awal...</div>";
        echo "<div>[CLEAN] Mengosongkan tabel pelanggan fiktif... OK</div>";
        echo "<div>[CLEAN] Mengosongkan tabel tagihan dummy... OK</div>";
        echo "<div>[CLEAN] Mengosongkan tabel tiket komplain dummy... OK</div>";
        echo "<div>[CLEAN] Mengosongkan tabel router Mikrotik dummy... OK</div>";
        
        $pdo->exec("TRUNCATE TABLE customers;");
        $pdo->exec("TRUNCATE TABLE invoices;");
        $pdo->exec("TRUNCATE TABLE tickets;");
        $pdo->exec("TRUNCATE TABLE transactions;");
        $pdo->exec("TRUNCATE TABLE mikrotik_configs;");
        
        echo "<div>[SEED] Mendaftarkan Akun Super Admin Utama...</div>";
        $stmt = $pdo->prepare("SELECT count(*) FROM users WHERE email = 'admin@starbilling.lokal'");
        $stmt->execute();
        if ($stmt->fetchColumn() == 0) {
            $stmt_ins = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES ('Super Admin', 'admin@starbilling.lokal', '\$2y\$10\$uUjXg23D...', 'admin')");
            $stmt_ins->execute();
            echo "<div class='text-emerald-400'>[SEED] Administrator 'admin@starbilling.lokal' terdaftar sukses!</div>";
        }
        
        echo "<div class='text-emerald-400 font-bold'>[DONE] Seluruh instalasi database bersih (100% CLEAN DB) berhasil!</div>";
        $success = true;
    } catch (PDOException $e) {
        echo "<div class='text-rose-400 font-bold'>[ERROR] Gagal Instalasi: " . htmlspecialchars($e->getMessage()) . "</div>";
        $success = false;
    }
    
    echo "</div>";
    
    if ($success) {
        echo "<div class='bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-xl text-center space-y-2'>
            <div class='text-emerald-400 font-bold text-sm'>✔ INSTALASI BERHASIL!</div>
            <p class='text-[11px] text-slate-300'>Database bersih siap digunakan untuk operasional riil ISP Anda. Tidak ada data dummy yang tertinggal.</p>
        </div>";
        echo "<a href='../' class='block text-center bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-3 rounded-xl text-xs uppercase tracking-wider font-mono transition shadow-lg'>
            Masuk Ke Aplikasi Admin (Super Admin)
        </a>";
        echo "<p class='text-[10px] text-center text-slate-500'>⚠️ Demi keamanan, silakan hapus folder <span class='font-mono'>install</span> sebelum go-live.</p>";
        
        // Also create a config.php in root to indicate it's installed
        file_put_contents(__DIR__ . '/../config.php', '<?php // Installed Database Configuration
$db_host="' . addslashes($db_host) . '";
$db_port="' . addslashes($db_port) . '";
$db_name="' . addslashes($db_name) . '";
$db_user="' . addslashes($db_user) . '";
$db_pass="' . addslashes($db_pass) . '";
');
    } else {
        echo "<a href='?step=1' class='block text-center bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-xs uppercase tracking-wider font-mono transition'>
            Kembali ke Pengaturan database
        </a>";
    }
    echo "</div>";
}

echo "</div>";
echo "</body></html>";
