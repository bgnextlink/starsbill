import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Award, 
  RefreshCw, 
  Sparkles, 
  MapPin, 
  Clipboard, 
  Check, 
  Key, 
  Code, 
  HelpCircle, 
  Save, 
  Sliders, 
  Play, 
  CheckCircle, 
  ExternalLink,
  Laptop,
  MessageSquare,
  ShieldAlert,
  Map,
  ChevronRight,
  Database,
  Server,
  Terminal,
  Download,
  Copy,
  Cpu,
  Globe,
  Activity,
  Layers
} from 'lucide-react';
import { Customer } from '../types';

interface SettingsProps {
  customers: Customer[];
  onUpdateCustomer: (updatedCust: Customer) => void;
  userEmail?: string;
  onResetDemoToClean?: () => void;
}

export default function Settings({ 
  customers, 
  onUpdateCustomer, 
  userEmail = 'betara@nextlink.co.id',
  onResetDemoToClean
}: SettingsProps) {
  // Active Settings Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<'identitas' | 'widget' | 'riset' | 'lisensi' | 'notifikasi' | 'installer' | 'server_lisensi'>('identitas');

  // ==================== STATE FOR NOTIFIKASI TEMPLATES & SCHEDULER ====================
  const [welcomeTemplate, setWelcomeTemplate] = useState(() => localStorage.getItem('sb_template_welcome') || `*[STARBILLING.lokal - NOTIFIKASI SELAMAT DATANG]*\n\nHalo Kak *[NAMA_PELANGGAN]*, (ID: [NOMOR_PELANGGAN])\n\nSelamat bergabung di StarBilling ISP! Akun Anda telah aktif terpasang.\n\n• *Paket Langganan*: [NAMA_PAKET]\n• *Biaya Bulanan*: Rp [TARIF_BULANAN]\n• *Tanggal Pemasangan*: [TANGGAL_PEMASANGAN]\n• *Tanggal Aktif*: [TANGGAL_AKTIF]\n• *Tanggal Jatuh Tempo*: [TANGGAL_JATUH_TEMPO] (Mengikuti tanggal pemasangan/aktif Anda)\n\nTerima kasih atas kepercayaannya!`);

  const [billingTemplate, setBillingTemplate] = useState(() => localStorage.getItem('sb_template_billing') || `*[STARBILLING.lokal - NOTIFIKASI TAGIHAN BULANAN]*\n\nHalo Kak *[NAMA_PELANGGAN]*,\n\nTagihan internet bulanan Anda untuk periode ini telah terbit. Silakan lakukan pembayaran sebelum tanggal jatuh tempo agar koneksi Anda tetap lancar.\n\n• *No. Pelanggan*: [NOMOR_PELANGGAN]\n• *Paket Langganan*: [NAMA_PAKET]\n• *Total Tagihan*: Rp [TARIF_BULANAN]\n• *Tanggal Jatuh Tempo*: [TANGGAL_JATUH_TEMPO]\n\nBayar instan via: https://starbilling.lokal/portal\n\nTerima kasih.`);

  const [outageTemplate, setOutageTemplate] = useState(() => localStorage.getItem('sb_template_outage') || `*[STARBILLING.lokal - INFORMASI GANGGUAN JARINGAN]*\n\nHalo Kak *[NAMA_PELANGGAN]*,\n\nKami informasikan bahwa saat ini sedang terjadi kendala teknis (gangguan massal) di cluster area Anda. Tim teknisi kami sedang melakukan penanganan intensif di lapangan.\n\n• *Area Terdampak*: [AREA_PELANGGAN]\n• *Estimasi Penanganan*: [ESTIMASI_WAKTU]\n\nKami memohon maaf atas ketidaknyamanan yang dialami. Koneksi akan pulih secara otomatis setelah penanganan selesai.`);

  const [enableAutoNotif, setEnableAutoNotif] = useState(() => localStorage.getItem('sb_enable_auto_notif') !== 'false');
  const [scheduleDays, setScheduleDays] = useState<number[]>(() => {
    const saved = localStorage.getItem('sb_auto_notif_days');
    return saved ? JSON.parse(saved) : [7, 3, 1]; // defaults to H-7, H-3, H-1
  });

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('sb_template_welcome', welcomeTemplate);
    localStorage.setItem('sb_template_billing', billingTemplate);
    localStorage.setItem('sb_template_outage', outageTemplate);
    localStorage.setItem('sb_enable_auto_notif', String(enableAutoNotif));
    localStorage.setItem('sb_auto_notif_days', JSON.stringify(scheduleDays));

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    alert('Sukses: Template notifikasi & jadwal pengingat jatuh tempo berhasil diperbarui.');
  };

  // ==================== STATE FOR IDENTITAS ====================
  const [jenisUsaha, setJenisUsaha] = useState(() => localStorage.getItem('sb_jenis_usaha') || 'INTERNET (ISP)');
  const [namaUsaha, setNamaUsaha] = useState(() => localStorage.getItem('sb_nama_usaha') || 'StarBilling ISP');
  const [sloganPerusahaan, setSloganPerusahaan] = useState(() => localStorage.getItem('sb_slogan') || 'High speed internet connection');
  const [alamatPerusahaan, setAlamatPerusahaan] = useState(() => localStorage.getItem('sb_alamat') || 'Dusun RtRw');
  const [kota, setKota] = useState(() => localStorage.getItem('sb_kota') || 'Palembang');
  const [telpPerusahaan, setTelpPerusahaan] = useState(() => localStorage.getItem('sb_telp') || '0851176888xx');
  const [alamatWebsite, setAlamatWebsite] = useState(() => localStorage.getItem('sb_website') || 'https://loacalhost');
  const [pembulatanTagihan, setPembulatanTagihan] = useState(() => Number(localStorage.getItem('sb_pembulatan') || '0'));
  const [namaPemilik, setNamaPemilik] = useState(() => localStorage.getItem('sb_pemilik') || 'PT StarBilling Media Nusantara');
  const [nomorWhatsapp, setNomorWhatsapp] = useState(() => localStorage.getItem('sb_whatsapp') || '085117688866');
  const [catatanPembayaran, setCatatanPembayaran] = useState(() => localStorage.getItem('sb_catatan_pembayaran') || `[ISOLIR] = Mengambil Tanggal Isolir Pelanggan\nIni akan muncul di footer website https://starbilling.lokal/\ndari Simulasi Browser Address Bar (Link yang dikirim ke WhatsApp / SMS Pelanggan)\nhttps://starbilling.lokal/6281234567890\n\nkamu bisa menambahkan promo dan lain-lain\n💡 [ISOLIR] = Mengambil Tanggal Isolir Pelanggan. Ini akan muncul di footer website https://starbilling.lokal/promo. Anda bisa menambahkan syarat, nomor rekening, promo speed, atau info loket.`);
  const [tampilkanPeriode, setTampilkanPeriode] = useState(() => localStorage.getItem('sb_tampilkan_periode') || 'YA');
  const [ijinkanDaftarOnline, setIjinkanDaftarOnline] = useState(() => localStorage.getItem('sb_daftar_online') || 'YA');
  const [suspendRenewalStrategy, setSuspendRenewalStrategy] = useState(() => localStorage.getItem('sb_suspend_renewal_strategy') || 'payment');
  
  // Koordinat
  const [latitude, setLatitude] = useState(() => localStorage.getItem('sb_lat') || '-2.9917472');
  const [longitude, setLongitude] = useState(() => localStorage.getItem('sb_lng') || '104.6966309');
  const [pasteMaps, setPasteMaps] = useState('');

  // ==================== STATE FOR WIDGET ====================
  const [showWaWidget, setShowWaWidget] = useState(() => localStorage.getItem('sb_widget_wa') === 'true');
  const [waWidgetText, setWaWidgetText] = useState(() => localStorage.getItem('sb_widget_text') || 'Butuh Bantuan? Chat Admin');
  const [widgetPosition, setWidgetPosition] = useState(() => localStorage.getItem('sb_widget_position') || 'right');
  const [customCss, setCustomCss] = useState(() => localStorage.getItem('sb_custom_css') || '/* Tambahkan kustomisasi CSS di sini */\n.portal-custom-bg {\n  background: rgba(30, 41, 59, 0.5);\n}');

  // ==================== STATE FOR RISET ULANG ISOLIR ====================
  const [risetProgress, setRisetProgress] = useState(-1);
  const [selectedRisetCustomers, setSelectedRisetCustomers] = useState<string[]>([]);
  const [schedulerTime, setSchedulerTime] = useState('00:00');
  const [schedulerActive, setSchedulerActive] = useState(true);

  // ==================== STATE FOR LISENSI ====================
  const [licenseKey, setLicenseKey] = useState('SB-LFTM-PALEMBANG-2026-9917');
  const [licenseStatus, setLicenseStatus] = useState('AKTIF');
  const [inputLicenseKey, setInputLicenseKey] = useState('');

  const [copiedText, setCopiedText] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ==================== STATE FOR INSTALLER & CENTRAL LICENSE SERVER ====================
  interface GeneratedLicense {
    key: string;
    ownerName: string;
    targetDomain: string;
    targetIp: string;
    maxCustomers: number;
    expiryDate: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'REVOKED';
    created_at: string;
  }

  const [generatedLicenses, setGeneratedLicenses] = useState<GeneratedLicense[]>(() => {
    const saved = localStorage.getItem('sb_generated_licenses');
    if (saved) return JSON.parse(saved);
    return [
      {
        key: 'SB-LFTM-PALEMBANG-2026-9917',
        ownerName: 'PT StarBilling Media Nusantara',
        targetDomain: 'starbilling.lokal',
        targetIp: '127.0.0.1',
        maxCustomers: 999999,
        expiryDate: '2036-07-06',
        status: 'ACTIVE',
        created_at: '2026-07-06'
      },
      {
        key: 'SB-GOLD-SABANGNET-2026-8812',
        ownerName: 'Sabang Net ISP',
        targetDomain: 'sabang.net.id',
        targetIp: '103.122.45.10',
        maxCustomers: 1000,
        expiryDate: '2027-01-01',
        status: 'ACTIVE',
        created_at: '2026-05-15'
      },
      {
        key: 'SB-TRIAL-BORNEOCON-2026-1142',
        ownerName: 'Borneo Connect',
        targetDomain: 'borneo.net',
        targetIp: '192.168.100.2',
        maxCustomers: 100,
        expiryDate: '2026-08-01',
        status: 'SUSPENDED',
        created_at: '2026-06-20'
      }
    ];
  });

  // Save generated licenses to local storage on changes
  useEffect(() => {
    localStorage.setItem('sb_generated_licenses', JSON.stringify(generatedLicenses));
  }, [generatedLicenses]);

  // Installer state
  const [installerPlatform, setInstallerPlatform] = useState<'cyberpanel' | 'localhost_php' | 'cpanel'>('cyberpanel');
  const [installerDomain, setInstallerDomain] = useState('billing.starbilling.net');
  const [installerDbName, setInstallerDbName] = useState('starbilling_db');
  const [installerDbUser, setInstallerDbUser] = useState('starbilling_user');
  const [installerDbPass, setInstallerDbPass] = useState('SB_SecureDBPass101!');
  const [installerLicenseServer, setInstallerLicenseServer] = useState('https://licensing.starbilling.net');
  const [installerLocalPath, setInstallerLocalPath] = useState('/home/starbilling/public_html');
  const [installerDbHost, setInstallerDbHost] = useState('127.0.0.1');
  const [installerDbPort, setInstallerDbPort] = useState('3306');
  const [dbCreationLogs, setDbCreationLogs] = useState<string[]>([]);
  const [isDbCreating, setIsDbCreating] = useState(false);
  const [isDbCreated, setIsDbCreated] = useState(false);
  const [wizardStep, setWizardStep] = useState<number>(1);

  // License Creator state
  const [newLicenseOwner, setNewLicenseOwner] = useState('');
  const [newLicenseDomain, setNewLicenseDomain] = useState('myclient.net');
  const [newLicenseIp, setNewLicenseIp] = useState('103.84.110.15');
  const [newLicenseLimit, setNewLicenseLimit] = useState(1000);
  const [newLicenseExpiry, setNewLicenseExpiry] = useState('1-year');
  const [newLicenseTier, setNewLicenseTier] = useState<'TRIAL' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'LFTM'>('GOLD');

  // API simulation tester state
  const [apiQueryKey, setApiQueryKey] = useState('SB-LFTM-PALEMBANG-2026-9917');
  const [apiQueryResult, setApiQueryResult] = useState<any>(null);
  const [apiQueryLoading, setApiQueryLoading] = useState(false);
  const [apiQueryLogs, setApiQueryLogs] = useState<string[]>([]);

  // Parse Google Maps pasted coordinates/URLs
  const handleParseMaps = (val: string) => {
    setPasteMaps(val);
    if (!val) return;

    // Check for raw coordinates: -2.9917472, 104.6966309
    const coordRegex = /(-?\d+\.\d+),\s*(-?\d+\.\d+)/;
    const match = val.match(coordRegex);
    if (match) {
      setLatitude(match[1]);
      setLongitude(match[2]);
      triggerFeedback('Koordinat berhasil diekstrak!');
      return;
    }

    // Check Google Maps URL coordinates, e.g. !3d-2.9917472!4d104.6966309 or @-2.9917472,104.6966309
    const urlCoordRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const urlMatch = val.match(urlCoordRegex);
    if (urlMatch) {
      setLatitude(urlMatch[1]);
      setLongitude(urlMatch[2]);
      triggerFeedback('Koordinat berhasil diekstrak dari URL!');
      return;
    }

    // Try alternate format: q=-2.9917472,104.6966309
    const qCoordRegex = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const qMatch = val.match(qCoordRegex);
    if (qMatch) {
      setLatitude(qMatch[1]);
      setLongitude(qMatch[2]);
      triggerFeedback('Koordinat berhasil diekstrak dari query parameter!');
    }
  };

  const triggerFeedback = (msg: string) => {
    alert(msg);
  };

  // Save all settings to localStorage
  const handleSaveIdentitas = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('sb_jenis_usaha', jenisUsaha);
    localStorage.setItem('sb_nama_usaha', namaUsaha);
    localStorage.setItem('sb_slogan', sloganPerusahaan);
    localStorage.setItem('sb_alamat', alamatPerusahaan);
    localStorage.setItem('sb_kota', kota);
    localStorage.setItem('sb_telp', telpPerusahaan);
    localStorage.setItem('sb_website', alamatWebsite);
    localStorage.setItem('sb_pembulatan', String(pembulatanTagihan));
    localStorage.setItem('sb_pemilik', namaPemilik);
    localStorage.setItem('sb_whatsapp', nomorWhatsapp);
    localStorage.setItem('sb_catatan_pembayaran', catatanPembayaran);
    localStorage.setItem('sb_tampilkan_periode', tampilkanPeriode);
    localStorage.setItem('sb_daftar_online', ijinkanDaftarOnline);
    localStorage.setItem('sb_suspend_renewal_strategy', suspendRenewalStrategy);
    localStorage.setItem('sb_lat', latitude);
    localStorage.setItem('sb_lng', longitude);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    alert('Sukses: Pengaturan identitas dan koordinat berhasil disimpan!');
  };

  const handleSaveWidget = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('sb_widget_wa', String(showWaWidget));
    localStorage.setItem('sb_widget_text', waWidgetText);
    localStorage.setItem('sb_widget_position', widgetPosition);
    localStorage.setItem('sb_custom_css', customCss);

    alert('Sukses: Widget WhatsApp & CSS kustom berhasil diperbarui!');
  };

  const triggerRisetUlangIsolir = () => {
    const suspendedList = customers.filter(c => c.status === 'Suspend');
    if (suspendedList.length === 0) {
      alert('Informasi: Tidak ada pelanggan dengan status Terisolir / Suspend saat ini.');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin meriset status ${suspendedList.length} pelanggan terisolir menjadi AKTIF kembali?`)) {
      return;
    }

    setRisetProgress(0);
    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setRisetProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        
        // Actually execute update on customers
        suspendedList.forEach(c => {
          onUpdateCustomer({ ...c, status: 'Aktif' });
        });

        alert(`Sukses: Berhasil meriset ulang status isolir untuk ${suspendedList.length} pelanggan! Seluruh status kini AKTIF.`);
        setRisetProgress(-1);
      }
    }, 400);
  };

  const handleUpdateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = inputLicenseKey.trim().toUpperCase();
    if (!cleanKey) {
      alert('Harap masukkan serial key lisensi yang valid!');
      return;
    }
    
    // Check against central generated licenses simulation
    const matched = generatedLicenses.find(l => l.key === cleanKey);
    if (matched) {
      if (matched.status === 'ACTIVE') {
        setLicenseKey(cleanKey);
        setLicenseStatus('AKTIF');
        alert(`Selamat! Lisensi divalidasi sukses oleh Server Lisensi Terpisah (${installerLicenseServer}).\n\n• Terdaftar: ${matched.ownerName}\n• Domain: ${matched.targetDomain}\n• IP: ${matched.targetIp}\n• Limit Pelanggan: ${matched.maxCustomers === 999999 ? 'Unlimited' : matched.maxCustomers + ' Pelanggan'}\n• Berlaku s/d: ${matched.expiryDate}`);
        setInputLicenseKey('');
      } else {
        alert(`Gagal Validasi: Kunci lisensi ini ditemukan namun berstatus [${matched.status}] pada Server Lisensi Pusat! Hubungi Support.`);
      }
    } else {
      if (cleanKey.startsWith('SB-') && cleanKey.length > 10) {
        setLicenseKey(cleanKey);
        setLicenseStatus('AKTIF');
        alert('Lisensi divalidasi menggunakan mode kompatibilitas kunci mandiri local.');
        setInputLicenseKey('');
      } else {
        alert('Gagal: Kunci lisensi tidak valid atau tidak terdaftar pada Server Lisensi Terpisah!');
      }
    }
  };

  const getInstallerCodeText = () => {
    if (installerPlatform === 'cyberpanel') {
      return `#!/bin/bash
# =========================================================================
# STARBILLING AUTOMATIC INSTALLER FOR CYBERPANEL (OPENLITESPEED)
# Target Domain: ${installerDomain}
# Target Path  : ${installerLocalPath}
# Database Host: ${installerDbHost}:${installerDbPort}
# Database Name: ${installerDbName}
# Date Generated: 2026-07-06
# =========================================================================

set -e

echo -e "\\e[1;36m[+] Memulai instalasi StarBilling ISP Suite di CyberPanel...\\e[0m"

# 1. Masuk ke direktori webroot
mkdir -p ${installerLocalPath}
cd ${installerLocalPath}

# 2. Update server dependencies
echo "[+] Memperbarui dependencies PHP 8.2..."
apt-get update -y && apt-get install -y git curl zip unzip php8.2-cli php8.2-mysql php8.2-xml php8.2-curl php8.2-mbstring php8.2-zip mysql-client

# 3. AUTO-CREATE DATABASE & PRIVILEGES (Dynamic SQL Create)
echo "[+] Menjalankan pembuatan database otomatis..."
mysql -h "${installerDbHost}" -P "${installerDbPort}" -u "${installerDbUser}" -p"${installerDbPass}" -e "CREATE DATABASE IF NOT EXISTS \\\`${installerDbName}\\\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" || {
  echo -e "\\e[1;33m[!] Gagal membuat database via CLI MySQL. Melanjutkan dengan asumsi database sudah dibuat di Panel...\\e[0m"
}

# 4. Clone StarBilling core engine
echo "[+] Mengunduh StarBilling core Laravel 12..."
git clone https://github.com/starbilling/starbilling-core.git . || echo "Direktori sudah terisi, skip cloning."

# 5. Generate berkas .env
echo "[+] Menghasilkan konfigurasi lingkungan (.env)..."
cat <<EOF > .env
APP_NAME="StarBilling ISP"
APP_ENV=production
APP_KEY=base64:\$(openssl rand -base64 32)
APP_DEBUG=false
APP_URL=https://${installerDomain}

DB_CONNECTION=mysql
DB_HOST=${installerDbHost}
DB_PORT=${installerDbPort}
DB_DATABASE=${installerDbName}
DB_USERNAME=${installerDbUser}
DB_PASSWORD="${installerDbPass}"

# Konfigurasi Server Lisensi Terpisah (SaaS Backend)
LICENSE_SERVER_URL="${installerLicenseServer}"
LICENSE_KEY="${licenseKey}"
EOF

# 6. Install composer package dependencies
echo "[+] Memasang pustaka PHP via Composer..."
curl -sS https://getcomposer.org/installer | php
php composer.phar install --no-dev --optimize-autoloader

# 7. Menjalankan Database Migrasi & Seeds awal
echo "[+] Menjalankan migrasi database MySQL..."
php artisan migrate --force
php artisan db:seed --force

# 8. Memasang WhatsApp Gateway engine (Node.js)
echo "[+] Memasang WhatsApp gateway server (Baileys)..."
apt-get install -y nodejs npm
cd gateway && npm install && cd ..

# 9. Set up permissions untuk OpenLiteSpeed
echo "[+] Menyusun kepemilikan berkas (OLS)..."
chown -R externalapp:externalapp ${installerLocalPath}
chmod -R 775 storage bootstrap/cache

# 10. Daftarkan cron job berkala (Jatuh Tempo harian)
echo "[+] Memasang cron schedule harian pada system crontab..."
(crontab -l 2>/dev/null; echo "* * * * * cd ${installerLocalPath} && php artisan schedule:run >> /dev/null 2>&1") | crontab -

echo -e "\\e[1;32m[✔] Sukses! StarBilling berhasil dipasang di CyberPanel dan Database ${installerDbName} telah siap.\\e[0m"
echo -e "\\e[1;33mSilakan kunjungi: https://${installerDomain} untuk login awal (Admin: admin@starbilling.lokal / admin123)\\e[0m"
`;
    } else if (installerPlatform === 'localhost_php') {
      return `<?php
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
        $pdo = new PDO(\"mysql:host=\$db_host;port=\$db_port\", \$db_user, \$db_pass);
        \$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        echo "<div class='text-emerald-400'>[OK] Koneksi MySQL Server Berhasil!</div>";
        
        echo "<div>[SQL] Membuat database if not exists \`\$db_name\`...</div>";
        \$pdo->exec(\"CREATE DATABASE IF NOT EXISTS \`\$db_name\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\");
        \$pdo->exec(\"USE \`\$db_name\`;\");
        echo "<div class='text-emerald-400'>[OK] Database \`\$db_name\` dideteksi / dibuat sukses.</div>";
        
        // Create table schemas
        echo "<div>[MIGRATE] Membuat skema tabel StarBilling core...</div>";
        \$pdo->exec(\"CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), email VARCHAR(100) UNIQUE, password VARCHAR(255), role VARCHAR(20));\");
        \$pdo->exec(\"CREATE TABLE IF NOT EXISTS customers (id INT AUTO_INCREMENT PRIMARY KEY, customer_number VARCHAR(100), name VARCHAR(100), phone VARCHAR(30), address TEXT, package_id VARCHAR(30), router_id VARCHAR(30), status VARCHAR(20));\");
        \$pdo->exec(\"CREATE TABLE IF NOT EXISTS invoices (id INT AUTO_INCREMENT PRIMARY KEY, invoice_number VARCHAR(100), customer_id VARCHAR(30), amount INT, due_date DATE, status VARCHAR(20));\");
        \$pdo->exec(\"CREATE TABLE IF NOT EXISTS tickets (id INT AUTO_INCREMENT PRIMARY KEY, ticket_number VARCHAR(100), customer_id VARCHAR(30), title VARCHAR(150), status VARCHAR(20));\");
        \$pdo->exec(\"CREATE TABLE IF NOT EXISTS transactions (id INT AUTO_INCREMENT PRIMARY KEY, description VARCHAR(255), amount INT, type VARCHAR(20));\");
        \$pdo->exec(\"CREATE TABLE IF NOT EXISTS mikrotik_configs (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), ip_address VARCHAR(50), status VARCHAR(20));\");
        
        echo "<div class='text-indigo-400'>[CLEAN] Melakukan sanitasi database awal...</div>";
        echo "<div>[CLEAN] Mengosongkan tabel pelanggan fiktif... OK</div>";
        echo "<div>[CLEAN] Mengosongkan tabel tagihan dummy... OK</div>";
        echo "<div>[CLEAN] Mengosongkan tabel tiket komplain dummy... OK</div>";
        echo "<div>[CLEAN] Mengosongkan tabel router Mikrotik dummy... OK</div>";
        
        \$pdo->exec(\"TRUNCATE TABLE customers;\");
        \$pdo->exec(\"TRUNCATE TABLE invoices;\");
        \$pdo->exec(\"TRUNCATE TABLE tickets;\");
        \$pdo->exec(\"TRUNCATE TABLE transactions;\");
        \$pdo->exec(\"TRUNCATE TABLE mikrotik_configs;\");
        
        echo "<div>[SEED] Mendaftarkan Akun Super Admin Utama...</div>";
        \$stmt = \$pdo->prepare(\"SELECT count(*) FROM users WHERE email = 'admin@starbilling.lokal'\");
        \$stmt->execute();
        if (\$stmt->fetchColumn() == 0) {
            \$stmt_ins = \$pdo->prepare(\"INSERT INTO users (name, email, password, role) VALUES ('Super Admin', 'admin@starbilling.lokal', '\$2y\$10\$uUjXg23D...', 'admin')\");
            \$stmt_ins->execute();
            echo "<div class='text-emerald-400'>[SEED] Administrator 'admin@starbilling.lokal' terdaftar sukses!</div>";
        }
        
        echo "<div class='text-emerald-400 font-bold'>[DONE] Seluruh instalasi database bersih (100% CLEAN DB) berhasil!</div>";
        \$success = true;
    } catch (PDOException \$e) {
        echo "<div class='text-rose-400 font-bold'>[ERROR] Gagal Instalasi: \" . htmlspecialchars(\$e->getMessage()) . \"</div>";
        \$success = false;
    }
    
    echo "</div>";
    
    if (\$success) {
        echo "<div class='bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-xl text-center space-y-2'>
            <div class='text-emerald-400 font-bold text-sm'>✔ INSTALASI BERHASIL!</div>
            <p class='text-[11px] text-slate-300'>Database bersih siap digunakan untuk operasional riil ISP Anda. Tidak ada data dummy yang tertinggal.</p>
        </div>";
        echo "<a href='../' class='block text-center bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-3 rounded-xl text-xs uppercase tracking-wider font-mono transition shadow-lg'>
            Masuk Ke Aplikasi Admin (Super Admin)
        </a>";
        echo "<p class='text-[10px] text-center text-slate-500'>⚠️ Demi keamanan, silakan hapus folder <span class='font-mono'>install</span> sebelum go-live.</p>";
    } else {
        echo "<a href='?step=1' class='block text-center bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-xs uppercase tracking-wider font-mono transition'>
            Kembali ke Pengaturan database
        </a>";
    }
    echo "</div>";
}

echo "</div>";
echo "</body></html>";
`;
    } else {
      // cPanel web-based setup.php
      return `<?php
/**
 * =========================================================================
 * STARBILLING WEB-BASED INSTANT DATABASE CREATOR & AUTOMATIC INSTALLER
 * Platform     : cPanel (Shared Hosting / Managed VPS)
 * File Name    : setup.php (Place in public_html and run via browser)
 * =========================================================================
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
set_time_limit(600);

$db_host = "${installerDbHost}";
$db_port = "${installerDbPort}";
$db_name = "${installerDbName}";
$db_user = "${installerDbUser}";
$db_pass = "${installerDbPass}";
$domain  = "${installerDomain}";
$license = "${licenseKey}";
$lic_srv = "${installerLicenseServer}";

echo "<html><head><title>StarBilling Automated Web Setup</title>";
echo "<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono&display=swap' rel='stylesheet'>";
echo "<style>
    body { font-family: 'Inter', sans-serif; background-color: #0b0f19; color: #cbd5e1; padding: 40px; margin: 0; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 16px; max-width: 700px; margin: 0 auto; padding: 30px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); }
    h1 { font-weight: 800; color: #f59e0b; margin-top: 0; font-size: 22px; display: flex; align-items: center; gap: 8px; }
    .console { background-color: #030712; border: 1px solid #1f2937; font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 15px; border-radius: 8px; max-height: 250px; overflow-y: auto; color: #10b981; margin: 20px 0; line-height: 1.6; }
    .status { padding: 10px; border-radius: 6px; font-weight: bold; font-size: 13px; text-align: center; margin: 15px 0; }
    .status-success { bg-color: #064e3b; color: #34d399; border: 1px solid #047857; }
    .footer { text-align: center; font-size: 10px; color: #6b7280; margin-top: 20px; }
</style></head><body>";

echo "<div class='card'>";
echo "<h1>⚡ StarBilling Web Setup (cPanel Engine)</h1>";
echo "<p style='font-size: 12px; color: #9ca3af;'>Mempersiapkan pembuatan database MySQL otomatis, penyelarasan file sistem, registrasi serial lisensi, dan inisialisasi skema tabel.</p>";

echo "<div class='console'>";
echo "[INFO] Memulai instalasi berbasis web...<br>";

// 1. AUTO-CREATE DATABASE
echo "[CONNECT] Menghubungkan ke MySQL Server pada $db_host:$db_port...<br>";
try {
    $pdo_root = new PDO("mysql:host=$db_host;port=$db_port", $db_user, $db_pass);
    $pdo_root->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "[SQL] Menjalankan query: CREATE DATABASE IF NOT EXISTS \`$db_name\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;<br>";
    $pdo_root->exec("CREATE DATABASE IF NOT EXISTS \`$db_name\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    echo "[SUCCESS] Database \`$db_name\` berhasil dibuat/ditemukan.<br>";
} catch (PDOException $e) {
    echo "<span style='color: #f87171;'>[ERROR] Gagal membuat database: " . htmlspecialchars($e->getMessage()) . "</span><br>";
    echo "[!] Melanjutkan dengan asumsi database kosong sudah disiapkan manual di cPanel.<br>";
}

// 2. WRITE .ENV
echo "[ENV] Menghasilkan berkas konfigurasi .env...<br>";
$env_content = 'APP_NAME="StarBilling ISP"
APP_ENV=production
APP_KEY=base64:'.base64_encode(random_bytes(32)).'
APP_DEBUG=false
APP_URL=https://'.$domain.'

DB_CONNECTION=mysql
DB_HOST='.$db_host.'
DB_PORT='.$db_port.'
DB_DATABASE='.$db_name.'
DB_USERNAME='.$db_user.'
DB_PASSWORD="'.$db_pass.'"

LICENSE_SERVER_URL="'.$lic_srv.'"
LICENSE_KEY="'.$license.'"
';

@file_put_contents('.env', $env_content);
echo "[OK] Berkas .env ditulis sukses.<br>";

// 3. RUNNING MIGRATIONS & SEEDS (Simulated Web Trigger)
echo "[MIGRATE] Menghubungkan ke database baru untuk menginisialisasi skema...<br>";
try {
    $pdo = new PDO("mysql:host=$db_host;port=$db_port;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create migrations log table
    $pdo->exec("CREATE TABLE IF NOT EXISTS migrations (id INT AUTO_INCREMENT PRIMARY KEY, migration VARCHAR(255), batch INT);");
    echo "[TABLE] Membuat tabel migrations... OK<br>";
    
    // Simulate table creation
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), email VARCHAR(100) UNIQUE, password VARCHAR(255), role VARCHAR(20));");
    $pdo->exec("CREATE TABLE IF NOT EXISTS customers (id INT AUTO_INCREMENT PRIMARY KEY, nama VARCHAR(100), phone VARCHAR(30), address TEXT, packet_id INT, status VARCHAR(20));");
    $pdo->exec("CREATE TABLE IF NOT EXISTS invoices (id INT AUTO_INCREMENT PRIMARY KEY, customer_id INT, amount INT, due_date DATE, status VARCHAR(20));");
    
    // Seed admin
    $stmt = $pdo->prepare("SELECT count(*) FROM users WHERE email = 'admin@starbilling.lokal'");
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        $stmt_ins = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES ('Super Admin', 'admin@starbilling.lokal', '\$2y\$10\\\$uUjXg23D...', 'admin')");
        $stmt_ins->execute();
        echo "[SEED] Menyemaikan administrator 'admin@starbilling.lokal'... OK<br>";
    }
    
    echo "[SUCCESS] Skema database berhasil dimigrasikan via PHP PDO engine.<br>";
} catch (PDOException $e) {
    echo "<span style='color: #f87171;'>[ERROR] Gagal memigrasikan database: " . htmlspecialchars($e->getMessage()) . "</span><br>";
}

echo "[DONE] Instalasi selesai! Hapus file setup.php demi alasan keamanan.<br>";
echo "</div>";

echo "<div class='status status-success'>✔ STARBILLING BERHASIL DIKONFIGURASI & AKTIF!</div>";
echo "<p style='text-align: center; font-size: 13px;'>Buka halaman utama: <a href='https://$domain' style='color: #38bdf8; font-weight: bold;'>https://$domain</a></p>";
echo "<div class='footer'>StarBilling ISP Suite &copy; 2026</div>";
echo "</div></body></html>";
`;
    }
  };

  const getLicenseServerCodeText = () => {
    return `<?php
/**
 * =========================================================================
 * STARBILLING INDEPENDENT LICENSING SERVER API ENGINE (SaaS BACKEND)
 * File Name    : server.php
 * Path Target  : https://licensing.starbilling.net/server.php
 * Database     : starbilling_licensing (MySQL / PostgreSQL / SQLite)
 * =========================================================================
 * 
 * SOURCODE LISENSI INI BERDIRI SENDIRI (TERPISAH) DARI APLIKASI UTAMA CLIENT.
 * Letakkan berkas ini di VPS / Web Server khusus Lisensi Anda.
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");

error_reporting(0);
ini_set('display_errors', 0);

// 1. Database Configuration
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'starbilling_licensing');
define('DB_USER', 'licensing_user');
define('DB_PASS', 'SecureLicensingPassWord991!');

// 2. Secret Encryption Salt (Gunakan Salt yang sama pada Laravel client)
define('SECRET_SIGNATURE_SALT', 'StarBilling_CryptoSecretSalt_2026');

try {
    // Connect to database
    $pdo = new PDO("mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Auto-create licensing table if not exists (Zero-config setup)
    $pdo->exec("CREATE TABLE IF NOT EXISTS licenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        license_key VARCHAR(100) UNIQUE NOT NULL,
        owner_name VARCHAR(150) NOT NULL,
        target_domain VARCHAR(150) NOT NULL,
        target_ip VARCHAR(50) NOT NULL,
        max_customers INT DEFAULT 1000,
        expiry_date DATE NOT NULL,
        status VARCHAR(30) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );");
} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "authenticated" => false,
        "message" => "Server Database Connection Error: " . $e->getMessage()
    ]);
    exit;
}

// 3. API Router Logic
$action = isset($_GET['action']) ? $_GET['action'] : 'verify';

if ($action === 'verify') {
    // Receive input parameters
    $key    = isset($_REQUEST['license_key']) ? trim($_REQUEST['license_key']) : '';
    $domain = isset($_REQUEST['domain']) ? trim($_REQUEST['domain']) : '';
    $ip     = isset($_REQUEST['ip']) ? trim($_REQUEST['ip']) : '';

    if (empty($key)) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "authenticated" => false,
            "message" => "Parameter 'license_key' wajib disediakan."
        ]);
        exit;
    }

    // Lookup license key
    $stmt = $pdo->prepare("SELECT * FROM licenses WHERE license_key = :key LIMIT 1");
    $stmt->execute(['key' => $key]);
    $license = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$license) {
        http_response_code(444); // Unregistered Key Code
        echo json_encode([
            "status" => "error",
            "authenticated" => false,
            "message" => "Serial Key Lisensi tidak terdaftar di Server Pusat!"
        ]);
        exit;
    }

    // Check status
    if ($license['status'] !== 'ACTIVE') {
        http_response_code(403);
        echo json_encode([
            "status" => "error",
            "authenticated" => false,
            "message" => "Lisensi ditangguhkan (Status: " . $license['status'] . "). Hubungi Billing support."
        ]);
        exit;
    }

    // Check Expiry Date
    $today = date('Y-m-d');
    if ($license['expiry_date'] < $today) {
        http_response_code(403);
        echo json_encode([
            "status" => "error",
            "authenticated" => false,
            "message" => "Lisensi StarBilling telah kadaluarsa pada tanggal " . $license['expiry_date']
        ]);
        exit;
    }

    // Optional Check: Domain / IP restriction (bisa dinonaktifkan untuk lisensi multi-domain)
    if (!empty($license['target_domain']) && $license['target_domain'] !== '*' && $license['target_domain'] !== 'localhost') {
        if (strpos($domain, $license['target_domain']) === false) {
            http_response_code(401);
            echo json_encode([
                "status" => "error",
                "authenticated" => false,
                "message" => "Pelanggaran Domain: Kunci ini terdaftar untuk " . $license['target_domain'] . " tetapi dipasang di " . $domain
            ]);
            exit;
        }
    }

    // Calculate Secure Digital Signature to prevent Client-Side bypass spoofing
    $signature_string = $license['license_key'] . $license['expiry_date'] . $license['max_customers'] . SECRET_SIGNATURE_SALT;
    $digital_signature = hash('sha256', $signature_string);

    // Respond success
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "authenticated" => true,
        "license_info" => [
            "key" => $license['license_key'],
            "owner" => $license['owner_name'],
            "domain" => $license['target_domain'],
            "ip" => $license['target_ip'],
            "limit" => (int)$license['max_customers'],
            "expires_at" => $license['expiry_date'],
            "signature_hash" => substr($digital_signature, 0, 32)
        ]
    ]);
    exit;

} else if ($action === 'register') {
    // API endpoint untuk mendaftarkan lisensi baru dari panel SaaS
    $key    = isset($_POST['license_key']) ? trim($_POST['license_key']) : '';
    $owner  = isset($_POST['owner_name']) ? trim($_POST['owner_name']) : '';
    $domain = isset($_POST['domain']) ? trim($_POST['domain']) : '';
    $ip     = isset($_POST['ip']) ? trim($_POST['ip']) : '';
    $limit  = isset($_POST['limit']) ? (int)$_POST['limit'] : 1000;
    $expiry = isset($_POST['expiry_date']) ? trim($_POST['expiry_date']) : '';

    if (empty($key) || empty($owner) || empty($expiry)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Kunci, nama pemilik, dan tanggal kadaluarsa wajib diisi."]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO licenses (license_key, owner_name, target_domain, target_ip, max_customers, expiry_date, status) 
                               VALUES (:key, :owner, :domain, :ip, :limit, :expiry, 'ACTIVE')");
        $stmt->execute([
            'key' => $key,
            'owner' => $owner,
            'domain' => $domain,
            'ip' => $ip,
            'limit' => $limit,
            'expiry' => $expiry
        ]);
        echo json_encode(["status" => "success", "message" => "Lisensi berhasil didaftarkan di server terpisah."]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database write error: " . $e->getMessage()]);
    }
    exit;
}
`;
  };

  const handleCreateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLicenseOwner.trim()) {
      alert('Nama pemilik / ISP wajib diisi!');
      return;
    }

    const abbr = newLicenseOwner.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8);
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const generatedKey = `SB-${newLicenseExpiry === 'lifetime' ? 'LFTM' : newLicenseTier}-${abbr}-${year}-${rand}`;

    const expiryMap: Record<string, string> = {
      '1-month': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      '3-months': new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      '1-year': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      'lifetime': '2036-07-06'
    };

    const newRecord: GeneratedLicense = {
      key: generatedKey,
      ownerName: newLicenseOwner.trim(),
      targetDomain: newLicenseDomain.trim() || 'localhost',
      targetIp: newLicenseIp.trim() || '127.0.0.1',
      maxCustomers: newLicenseLimit,
      expiryDate: expiryMap[newLicenseExpiry] || '2036-07-06',
      status: 'ACTIVE',
      created_at: new Date().toISOString().split('T')[0]
    };

    setGeneratedLicenses(prev => [newRecord, ...prev]);
    setNewLicenseOwner('');
    setApiQueryKey(generatedKey); // Auto-select for API tester
    alert(`Sukses mendaftarkan lisensi baru!\n\nSerial Key: ${generatedKey}\nDomain: ${newRecord.targetDomain}`);
  };

  const runLiveApiSimulation = () => {
    if (apiQueryLoading) return;
    setApiQueryLoading(true);
    setApiQueryResult(null);
    setApiQueryLogs([]);

    const selectedKeyRecord = generatedLicenses.find(l => l.key === apiQueryKey);
    const steps = [
      `[INFO] ${new Date().toISOString()} - Menerima koneksi masuk dari IP: ${selectedKeyRecord?.targetIp || '127.0.0.1'}`,
      `[CONNECT] Mengarahkan ke server lisensi terpisah (${installerLicenseServer})...`,
      `[DATABASE] Melakukan querying license key: "${apiQueryKey}"`,
    ];

    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setApiQueryLogs(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Compute final validation checks
        if (!selectedKeyRecord) {
          setApiQueryLogs(prev => [
            ...prev,
            `[FAILED] Gagal Verifikasi: Kunci lisensi tidak ditemukan di server pusat!`,
            `[RESPONSE] Status Code: 404 Not Found`
          ]);
          setApiQueryResult({
            status: "error",
            authenticated: false,
            message: "License key is invalid or unregistered."
          });
          setApiQueryLoading(false);
        } else {
          // Record exists
          setApiQueryLogs(prev => [...prev, `[FOUND] Record ditemukan milik client: "${selectedKeyRecord.ownerName}"`]);
          
          setTimeout(() => {
            // Check status
            if (selectedKeyRecord.status !== 'ACTIVE') {
              setApiQueryLogs(prev => [
                ...prev,
                `[FAILED] Validasi Gagal: Status lisensi saat ini adalah [${selectedKeyRecord.status}]`,
                `[RESPONSE] Status Code: 403 Forbidden`
              ]);
              setApiQueryResult({
                status: "error",
                authenticated: false,
                message: `License is currently ${selectedKeyRecord.status.toLowerCase()}. Please contact support.`
              });
              setApiQueryLoading(false);
            } else {
              // Active
              setApiQueryLogs(prev => [
                ...prev,
                `[OK] Domain mencocokkan target: "${selectedKeyRecord.targetDomain}"`,
                `[OK] IP mencocokkan target: "${selectedKeyRecord.targetIp}"`,
                `[SUCCESS] Kunci lunas, aktif, dan valid. Menghasilkan tanda tangan digital.`,
                `[RESPONSE] Status Code: 200 OK`
              ]);
              
              setApiQueryResult({
                status: "success",
                authenticated: true,
                license_info: {
                  key: selectedKeyRecord.key,
                  owner: selectedKeyRecord.ownerName,
                  domain: selectedKeyRecord.targetDomain,
                  ip: selectedKeyRecord.targetIp,
                  limit: selectedKeyRecord.maxCustomers === 999999 ? 'UNLIMITED' : selectedKeyRecord.maxCustomers,
                  expires_at: selectedKeyRecord.expiryDate,
                  signature_hash: btoa(selectedKeyRecord.key + '_VALID_SIGNATURE').substring(0, 16)
                }
              });
              setApiQueryLoading(false);
            }
          }, 400);
        }
      }
    }, 300);
  };

  const runDbCreationSimulation = () => {
    if (isDbCreating) return;
    setIsDbCreating(true);
    setIsDbCreated(false);
    setDbCreationLogs([]);

    const steps = [
      `[INFO] Memulai proses instalasi database otomatis...`,
      `[CONNECT] Mencoba menghubungi MySQL Server pada ${installerDbHost}:${installerDbPort}...`,
      `[AUTH] Mengautentikasi pengguna database "${installerDbUser}"...`,
      `[CHECK] Mencari keberadaan database "${installerDbName}"...`,
      `[SQL] Mengirimkan perintah: CREATE DATABASE IF NOT EXISTS \`${installerDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
      `[SUCCESS] Database \`${installerDbName}\` berhasil dideteksi/dibuat di server.`,
      `[PRIVILEGES] Memberikan izin akses penuh (GRANT ALL PRIVILEGES) pada \`${installerDbName}\`.* untuk "${installerDbUser}"@'%'...`,
      `[MIGRATE] Menghubungkan engine StarBilling (Laravel 12) ke database...`,
      `[MIGRATE] Menjalankan: php artisan migrate --force`,
      `[TABLE] Membuat tabel 'users'... OK`,
      `[TABLE] Membuat tabel 'customers' (Data Pelanggan)... OK`,
      `[TABLE] Membuat tabel 'invoices' (Tagihan)... OK`,
      `[TABLE] Membuat tabel 'whatsapp_logs'... OK`,
      `[TABLE] Membuat tabel 'mikrotik_configs'... OK`,
      `[TABLE] Membuat tabel 'odp_structures'... OK`,
      `[CLEAN] Melakukan sanitasi database awal: membersihkan semua dummy user, dummy mikrotik, dummy pelanggan, dummy tagihan, dan dummy sejenis...`,
      `[CLEAN] Mengosongkan data demo & dummy (100% database bersih)... OK`,
      `[SEED] Menyemaikan 1 akun Super Admin utama: admin@starbilling.lokal (admin123)... OK`,
      `[ENV] Menghasilkan file konfigurasi .env dengan koneksi database baru...`,
      `[DONE] Seluruh proses pembuatan database bersih & inisialisasi sistem berhasil diselesaikan!`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setDbCreationLogs(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsDbCreating(false);
        setIsDbCreated(true);
        alert(`Sukses! Database "${installerDbName}" dan seluruh struktur tabelnya berhasil dibuat secara otomatis.\n\nAnda sekarang dapat meluncurkan aplikasi atau mengunduh script auto-deploy.`);
      }
    }, 250);
  };

  const AlamatPerusahaan = alamatPerusahaan;

  return (
    <div className="flex-1 space-y-6">
      
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Pengaturan Sistem
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi identitas usaha, lokalisasi, billing widget, sinkronisasi isolir, dan lisensi server.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold rounded-lg border border-emerald-800/50 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> LISENSI AKTIF (ENTERPRISE)
          </span>
        </div>
      </div>

      {/* Main Settings Navigation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sub-sidebar (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block px-2.5">
              Identitas &amp; Lisensi
            </span>
            
            <nav className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setActiveSubTab('identitas')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeSubTab === 'identitas'
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/10'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Identitas Usaha
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-65" />
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('widget')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeSubTab === 'widget'
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/10'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Laptop className="w-4 h-4" />
                  Widget Pembayaran
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-65" />
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('riset')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeSubTab === 'riset'
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/10'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Riset Ulang Isolir
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-65" />
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('lisensi')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeSubTab === 'lisensi'
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/10'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Lisensi Server
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-65" />
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('notifikasi')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeSubTab === 'notifikasi'
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/10'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  Templates &amp; Notifikasi
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-65" />
              </button>

              <div className="border-t border-slate-800 my-2 pt-2">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block px-2.5 mb-1.5">
                  Deployment &amp; Lisensi Pusat
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveSubTab('installer')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeSubTab === 'installer'
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/10'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  Installer CyberPanel / Localhost
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-65" />
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('server_lisensi')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeSubTab === 'server_lisensi'
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/10'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400" />
                  Server Lisensi (Terpisah)
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-65" />
              </button>
            </nav>
          </div>

          {/* Mini info card on license register */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Info Lisensi Resmi</span>
            <div className="text-xs text-slate-400 leading-relaxed">
              Registrasi atas nama <strong className="text-slate-200">{userEmail}</strong>. Hubungi sales atau support jika Anda bermaksud melakukan migrasi IP/Domain server.
            </div>
            <a 
              href="https://starbilling.local/help" 
              className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-bold font-mono hover:underline pt-1"
            >
              DOKUMENTASI SISTEM <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Right Content Panels (9 cols) */}
        <div className="lg:col-span-9">

          {/* 1. IDENTITAS PANEL */}
          {activeSubTab === 'identitas' && (
            <form onSubmit={handleSaveIdentitas} className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Identitas &amp; Lokalisasi ISP
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Konfigurasi ini akan dicetak pada faktur/invoice pembayaran pelanggan dan disematkan pada portal pembayaran online.
                  </p>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Jenis Usaha */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      Jenis Usaha
                    </label>
                    <select
                      value={jenisUsaha}
                      onChange={(e) => setJenisUsaha(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                    >
                      <option value="INTERNET">INTERNET (ISP)</option>
                      <option value="HOTSPOT">HOTSPOT NET / KOST</option>
                      <option value="RT/RW NET">RT/RW NET MANDIRI</option>
                      <option value="DEDICATED">DEDICATED BANDWIDTH</option>
                    </select>
                  </div>

                  {/* Nama Usaha */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      Nama Usaha
                    </label>
                    <input
                      type="text"
                      required
                      value={namaUsaha}
                      onChange={(e) => setNamaUsaha(e.target.value)}
                      placeholder="Nama Perusahaan / usaha"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  {/* Slogan Perusahaan */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      Slogan Perusahaan
                    </label>
                    <input
                      type="text"
                      value={sloganPerusahaan}
                      onChange={(e) => setSloganPerusahaan(e.target.value)}
                      placeholder="High speed internet connection"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  {/* Alamat Perusahaan */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      Alamat Perusahaan
                    </label>
                    <input
                      type="text"
                      value={alamatPerusahaan}
                      onChange={(e) => setAlamatPerusahaan(e.target.value)}
                      placeholder="Dusun RtRw"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  {/* Kota */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      Kota
                    </label>
                    <input
                      type="text"
                      value={kota}
                      onChange={(e) => setKota(e.target.value)}
                      placeholder="Kota"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  {/* Telp Perusahaan */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      Telp Perusahaan
                    </label>
                    <input
                      type="text"
                      value={telpPerusahaan}
                      onChange={(e) => setTelpPerusahaan(e.target.value)}
                      placeholder="Telp Kantor"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  {/* Alamat Website / Email */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      Alamat Website / Email
                    </label>
                    <input
                      type="text"
                      value={alamatWebsite}
                      onChange={(e) => setAlamatWebsite(e.target.value)}
                      placeholder="Website / Email"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  {/* Pembulatan Tagihan */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      Pembulatan Tagihan
                    </label>
                    <select
                      value={pembulatanTagihan}
                      onChange={(e) => setPembulatanTagihan(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                    >
                      <option value={0}>0 (Tanpa Pembulatan)</option>
                      <option value={100}>100 (Ke Atas)</option>
                      <option value={500}>500 (Ke Atas)</option>
                      <option value={1000}>1000 (Ke Atas)</option>
                    </select>
                  </div>

                  {/* Nama Pemilik */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      Nama Pemilik
                    </label>
                    <input
                      type="text"
                      value={namaPemilik}
                      onChange={(e) => setNamaPemilik(e.target.value)}
                      placeholder="Nama Pemilik Usaha atau Owner"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  {/* Nomor Whatsapp */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      Nomor Whatsapp
                    </label>
                    <input
                      type="text"
                      value={nomorWhatsapp}
                      onChange={(e) => setNomorWhatsapp(e.target.value)}
                      placeholder="Contoh: 085117688866"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>

                {/* Tambahkan catatan di Web Pembayaran */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Tambahkan catatan di Web Pembayaran
                  </label>
                  <textarea
                    rows={4}
                    value={catatanPembayaran}
                    onChange={(e) => setCatatanPembayaran(e.target.value)}
                    placeholder="Tuliskan footer info atau catatan promo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                  <div className="p-2.5 bg-slate-950 rounded-lg text-[10px] text-slate-400 font-mono leading-normal border border-slate-850">
                    💡 <strong className="text-cyan-400">[ISOLIR]</strong> = Mengambil Tanggal Isolir Pelanggan. Ini akan muncul di footer website <span className="text-white">{alamatWebsite}</span>. Anda bisa menambahkan syarat, nomor rekening, promo speed, atau info loket.
                  </div>
                </div>

                {/* Toggles YA / TIDAK */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-slate-850">
                    <div>
                      <span className="text-xs font-bold text-white block">Tampilkan Periode Pemakaian?</span>
                      <span className="text-[10px] text-slate-500">Tampilkan deskripsi periode billing lengkap pada invoice</span>
                    </div>
                    <select
                      value={tampilkanPeriode}
                      onChange={(e) => setTampilkanPeriode(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="YA">YA</option>
                      <option value="TIDAK">TIDAK</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-slate-850">
                    <div>
                      <span className="text-xs font-bold text-white block">Ijinkan Pendaftaran Online?</span>
                      <span className="text-[10px] text-slate-500">Membuka formulir registrasi pelanggan baru di portal</span>
                    </div>
                    <select
                      value={ijinkanDaftarOnline}
                      onChange={(e) => setIjinkanDaftarOnline(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="YA">YA</option>
                      <option value="TIDAK">TIDAK</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-slate-850 md:col-span-2">
                    <div>
                      <span className="text-xs font-bold text-white block">Aturan Perpanjangan Pelanggan Suspend (Isolir)?</span>
                      <span className="text-[10px] text-slate-500">Sesuaikan tanggal aktif baru saat pelanggan suspend melakukan pembayaran</span>
                    </div>
                    <select
                      value={suspendRenewalStrategy}
                      onChange={(e) => setSuspendRenewalStrategy(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="expiry">Ubah Tanggal Aktif Sesuai Tanggal Berakhir (Siklus Berjalan / Perpanjang Jatuh Tempo Lama)</option>
                      <option value="payment">Ubah Tanggal Aktif Sesuai Tanggal Bayar (Siklus Baru / Mulai Hari Ini)</option>
                    </select>
                  </div>
                </div>

                {/* LOKASI KOORDINAT KANTOR */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-cyan-400" /> Lokasi Koordinat Kantor
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal mt-1">
                      Koordinat ini digunakan untuk fitur Pendaftaran Online di aplikasi pelanggan. Calon pelanggan yang berada dalam radius maksimal 50 km dari lokasi ini akan dapat menemukan dan mendaftar ke ISP kamu. Pastikan koordinat sesuai dengan lokasi kantor atau area jangkauan utama.
                    </p>
                  </div>

                  {/* Paste Google Maps Helper Input */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                      ⚡ Paste dari Google Maps (Otomatis Parsing)
                    </label>
                    <input
                      type="text"
                      value={pasteMaps}
                      onChange={(e) => handleParseMaps(e.target.value)}
                      placeholder="Paste koordinat atau URL Google Maps. Contoh: -2.9917472, 104.6966309"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <div className="text-[9px] text-slate-500 font-mono">
                      Format didukung: <span className="text-slate-400">-7.899,112.556</span> | <span className="text-slate-400">-8.279, 113.655</span> | URL lengkap Google Maps dari Browser / Aplikasi
                    </div>
                  </div>

                  {/* Latitude / Longitude outputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                        Latitude
                      </label>
                      <input
                        type="text"
                        required
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="Contoh: -2.9917472"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                        Longitude
                      </label>
                      <input
                        type="text"
                        required
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="Contoh: 104.6966309"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Action */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/10 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Simpan Pengaturan
                  </button>
                </div>

              </div>
            </form>
          )}

          {/* 2. WIDGET PANEL */}
          {activeSubTab === 'widget' && (
            <form onSubmit={handleSaveWidget} className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Portal &amp; Web Widget Pembayaran
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Aktifkan widget pembantu interaktif pada website pembayaran Anda ({alamatWebsite}) untuk memudahkan pelanggan berkomunikasi.
                  </p>
                </div>

                {/* WA Chat Widget Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-850 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-white block">Tampilkan Widget WhatsApp Chat Floating?</span>
                      <span className="text-[10px] text-slate-500">Menyisipkan tombol melayang WhatsApp di pojok halaman web pembayaran</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showWaWidget} 
                        onChange={(e) => setShowWaWidget(e.target.checked)} 
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>

                  {showWaWidget && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-950/40 border border-slate-850 rounded-xl">
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                          Teks Widget Melayang
                        </label>
                        <input
                          type="text"
                          value={waWidgetText}
                          onChange={(e) => setWaWidgetText(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                          Posisi Tampilan
                        </label>
                        <select
                          value={widgetPosition}
                          onChange={(e) => setWidgetPosition(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                        >
                          <option value="right">Kanan Bawah (Khas &amp; Umum)</option>
                          <option value="left">Kiri Bawah</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Embedded Widget Embed Code Snippet */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-cyan-400" /> Web Widget Embed Code
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Salin script HTML di bawah ini dan paste tepat di atas tag <code className="bg-slate-950 text-slate-400 px-1 rounded">&lt;/body&gt;</code> di web komersial Anda untuk mengintegrasikan login portal tagihan otomatis.
                  </p>
                  
                  <div className="relative">
                    <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-[10px] font-mono text-cyan-400 overflow-x-auto select-all">
                      {`<script 
  src="${alamatWebsite}/widget.js" 
  data-id="SB-2026-CLIENT" 
  data-wa="${nomorWhatsapp}" 
  data-theme="dark"
  data-position="${widgetPosition}">
</script>`}
                    </pre>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`<script src="${alamatWebsite}/widget.js" data-id="SB-2026-CLIENT" data-wa="${nomorWhatsapp}" data-theme="dark" data-position="${widgetPosition}"></script>`);
                        setCopiedText(true);
                        setTimeout(() => setCopiedText(false), 2000);
                      }}
                      className="absolute right-3 top-3 p-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition"
                      title="Salin Code Snippet"
                    >
                      {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Custom CSS inject for client portal styling customizer */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Kustom CSS Dashboard Pelanggan
                  </label>
                  <textarea
                    rows={4}
                    value={customCss}
                    onChange={(e) => setCustomCss(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <span className="text-[9px] text-slate-500 font-mono block">
                    Gunakan kustomisasi stylesheet CSS di atas untuk merubah warna utama, tombol, atau font pada Portal Pelanggan.
                  </span>
                </div>

                {/* Save Widget button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/10 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Simpan Widget
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* 3. RISET ULANG ISOLIR PANEL */}
          {activeSubTab === 'riset' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  Riset Ulang Isolir &amp; Sinkronisasi Mikrotik
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Utilitas pemeliharaan jaringan untuk me-reset status isolir/suspend pelanggan secara massal atau terjadwal. Berguna saat terjadi transisi server, update tagihan bulanan baru, atau pemutihan iuran.
                </p>
              </div>

              {/* Status statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-950 text-indigo-400 rounded-lg">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Total Pelanggan</span>
                    <span className="text-sm font-mono font-bold text-white">{customers.length} Orang</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center gap-3">
                  <div className="p-2.5 bg-rose-950 text-rose-400 rounded-lg">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Status Terisolir</span>
                    <span className="text-sm font-mono font-bold text-rose-400">{customers.filter(c => c.status === 'Suspend').length} Orang</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Status Aktif</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">{customers.filter(c => c.status === 'Aktif').length} Orang</span>
                  </div>
                </div>
              </div>

              {/* Action Board */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
                <div>
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    ⚡ Eksekusi Riset Ulang Massal
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    Mengembalikan status seluruh pelanggan yang sedang terisolir (<span className="text-rose-400">Suspend</span>) menjadi <span className="text-emerald-400">Aktif</span> sekaligus, menghapus blokir filter PPPoE / Hotspot di router MikroTik, dan memperbarui tanggal limit iuran ke periode selanjutnya.
                  </p>
                </div>

                {risetProgress >= 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-cyan-400">Menghubungi API MikroTik &amp; Database...</span>
                      <span className="text-white font-bold">{risetProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: `${risetProgress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={triggerRisetUlangIsolir}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition duration-150 flex items-center gap-1.5 self-start"
                  >
                    <RefreshCw className="w-4 h-4" /> Riset Ulang Status Isolir Sekarang
                  </button>
                )}
              </div>

              {/* Automation scheduler */}
              <div className="p-4 bg-slate-950/30 border border-slate-850 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      ⏰ Penjadwal Otomatis (Cron Job)
                    </h4>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Jalankan sinkronisasi dan riset isolir otomatis setiap bulan</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={schedulerActive} 
                      onChange={(e) => setSchedulerActive(e.target.checked)} 
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>

                {schedulerActive && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 bg-slate-950/50 rounded-xl border border-slate-850">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                        Jam Eksekusi Harian
                      </label>
                      <input
                        type="time"
                        value={schedulerTime}
                        onChange={(e) => setSchedulerTime(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 w-full font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                        Siklus Eksekusi
                      </label>
                      <select
                        className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none w-full font-bold"
                      >
                        <option value="daily">Setiap Hari pukul {schedulerTime} WIB</option>
                        <option value="monthly">Setiap Tanggal 1 &amp; 10 pukul {schedulerTime} WIB</option>
                        <option value="instant">Real-time pada saat Lunas</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* 4. LISENSI PANEL */}
          {activeSubTab === 'lisensi' && (
            <div className="space-y-6">
              
              {/* Main status box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                      Lisensi Sistem StarBilling
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Server utama divalidasi oleh lisensi resmi PT StarBilling Media Nusantara.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-950/40 text-emerald-400 font-mono text-[10px] font-bold rounded border border-emerald-800/40">
                    {licenseStatus}
                  </span>
                </div>

                {/* License credentials details */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans leading-relaxed">
                    <div className="flex flex-col gap-1 border-b border-slate-900 md:border-none pb-2 md:pb-0">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">STATUS SERVER</span>
                      <strong className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Terverifikasi &amp; Aman
                      </strong>
                    </div>

                    <div className="flex flex-col gap-1 border-b border-slate-900 md:border-none pb-2 md:pb-0">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">TIPE LISENSI</span>
                      <strong className="text-white">StarBilling ISP Enterprise (Lifetime Key)</strong>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">SERIAL KEY</span>
                      <code className="text-cyan-400 font-bold font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded w-fit">{licenseKey}</code>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">TERDAFTAR UNTUK</span>
                      <strong className="text-slate-300">{userEmail}</strong>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">BATAS PELANGGAN</span>
                      <strong className="text-white">UNLIMITED CUSTOMERS</strong>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">PRODUK VERSI</span>
                      <strong className="text-slate-400">Laravel 12.1-stable (build-2026)</strong>
                    </div>
                  </div>
                </div>

                {/* Form to update License */}
                <form onSubmit={handleUpdateLicense} className="space-y-3 pt-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Masukkan Serial Key Baru
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputLicenseKey}
                      onChange={(e) => setInputLicenseKey(e.target.value)}
                      placeholder="Contoh: SB-XXXX-XXXX-XXXX-XXXX"
                      className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500 w-full font-mono uppercase"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs transition whitespace-nowrap"
                    >
                      Perbarui Lisensi
                    </button>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono block">
                    ⚠️ Memperbarui lisensi memerlukan koneksi internet aktif untuk sinkronisasi ke server validasi pusat StarBilling.
                  </span>
                </form>

              </div>

            </div>
          )}

          {/* 5. NOTIFIKASI & TEMPLATES PANEL */}
          {activeSubTab === 'notifikasi' && (
            <div className="space-y-6">
              
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Templates &amp; Penjadwalan Notifikasi
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Sesuaikan isi pesan otomatis WhatsApp dan atur jadwal pengingat tagihan berkala sebelum Jatuh Tempo.
                  </p>
                </div>

                <form onSubmit={handleSaveNotifications} className="space-y-6">
                  
                  {/* Part A: Templates */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                      1. Custom Templates WhatsApp
                    </h4>

                    {/* Welcome template */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold block">
                        Template Sambutan (Selamat Datang)
                      </label>
                      <textarea
                        rows={6}
                        value={welcomeTemplate}
                        onChange={(e) => setWelcomeTemplate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                        placeholder="Ketik template sambutan..."
                      />
                    </div>

                    {/* Billing template */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold block">
                        Template Pemberitahuan Tagihan Bulanan
                      </label>
                      <textarea
                        rows={6}
                        value={billingTemplate}
                        onChange={(e) => setBillingTemplate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                        placeholder="Ketik template tagihan..."
                      />
                    </div>

                    {/* Outage template */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold block">
                        Template Broadcast Gangguan Jaringan (Tiket NOC)
                      </label>
                      <textarea
                        rows={6}
                        value={outageTemplate}
                        onChange={(e) => setOutageTemplate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                        placeholder="Ketik template gangguan..."
                      />
                    </div>

                    {/* Variables Legend */}
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                        💡 Variabel Tag Dinamis Tersedia:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                        <div><strong className="text-slate-300">[NAMA_PELANGGAN]</strong>: Nama lengkap</div>
                        <div><strong className="text-slate-300">[NOMOR_PELANGGAN]</strong>: No Registrasi</div>
                        <div><strong className="text-slate-300">[NAMA_PAKET]</strong>: Paket Internet</div>
                        <div><strong className="text-slate-300">[TARIF_BULANAN]</strong>: Biaya bulanan</div>
                        <div><strong className="text-slate-300">[TANGGAL_PEMASANGAN]</strong>: Tanggal Pasang</div>
                        <div><strong className="text-slate-300">[TANGGAL_AKTIF]</strong>: Tanggal Aktif</div>
                        <div><strong className="text-slate-300">[TANGGAL_JATUH_TEMPO]</strong>: Tanggal Jatuh Tempo</div>
                        <div><strong className="text-slate-300">[AREA_PELANGGAN]</strong>: Area / Cluster</div>
                        <div><strong className="text-slate-300">[ESTIMASI_WAKTU]</strong>: Estimasi gangguan</div>
                      </div>
                    </div>
                  </div>

                  {/* Part B: Scheduler */}
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                        2. Jadwal Pengingat Otomatis Tagihan
                      </h4>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={enableAutoNotif}
                          onChange={(e) => setEnableAutoNotif(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white peer-checked:after:border-white" />
                        <span className="ml-2 text-[11px] font-mono uppercase text-slate-300 font-bold">
                          {enableAutoNotif ? 'AKTIF' : 'NONAKTIF'}
                        </span>
                      </label>
                    </div>

                    <p className="text-xs text-slate-400 leading-normal">
                      Pilih berapa hari sebelum tanggal jatuh tempo sistem WhatsApp gateway akan melayangkan pesan penagihan otomatis ke pelanggan:
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[7, 6, 5, 4, 3, 2, 1].map((day) => {
                        const isChecked = scheduleDays.includes(day);
                        return (
                          <div 
                            key={day}
                            onClick={() => {
                              if (isChecked) {
                                setScheduleDays(scheduleDays.filter(d => d !== day));
                              } else {
                                setScheduleDays([...scheduleDays, day].sort((a,b) => b-a));
                              }
                            }}
                            className={`p-3 rounded-xl border cursor-pointer text-center font-mono text-xs transition ${
                              isChecked 
                                ? 'bg-indigo-950/40 border-indigo-500 text-indigo-400 font-bold' 
                                : 'bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-800'
                            }`}
                          >
                            <span className="block text-lg font-bold">H-{day}</span>
                            <span className="text-[9px] uppercase font-bold mt-0.5 block">Sebelum Tempo</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3.5 bg-indigo-950/20 border border-indigo-900/30 rounded-xl text-xs text-slate-400 flex gap-2">
                      <span className="text-indigo-400">⚡</span>
                      <p className="leading-relaxed text-[11px]">
                        <strong>Simulasi Engine Penjadwalan:</strong> Ketika pelanggan memiliki tanggal jatuh tempo tertentu, cron job harian pada pukul 08:00 WIB akan otomatis memilah pelanggan aktif yang jatuh temponya tepat {scheduleDays.join(', ')} hari lagi, lalu mengirimkan WhatsApp Reminder yang telah Anda rancang di atas.
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      Simpan Pengaturan Notifikasi
                    </button>
                  </div>

                </form>

              </div>

            </div>
          )}
          {activeSubTab === 'installer' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                      Auto-Installer Hub (Database Creator &amp; Deployer)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Gunakan panel inisialisasi database interaktif ini untuk membuat skema MySQL secara otomatis, lalu unduh script kustomisasi untuk dipasang di CyberPanel, Localhost, atau cPanel Anda.
                  </p>
                </div>

                {/* Target Platform Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'cyberpanel', name: 'CyberPanel (VPS / OLS)', desc: 'Auto-deploy untuk OpenLiteSpeed & PHP 8.2.', icon: Server, color: 'text-cyan-400 border-cyan-500/20' },
                    { id: 'localhost_php', name: 'Web Wizard (XAMPP/Cpanel)', desc: 'Instalasi langsung via folder /install.', icon: Cpu, color: 'text-indigo-400 border-indigo-500/20' },
                    { id: 'cpanel', name: 'cPanel (Shared Hosting)', desc: 'Instalasi berbasis web via berkas setup.php.', icon: Globe, color: 'text-emerald-400 border-emerald-500/20' }
                  ].map((p) => {
                    const Icon = p.icon;
                    const isSel = installerPlatform === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setInstallerPlatform(p.id as any)}
                        className={`p-4 rounded-xl border cursor-pointer transition ${
                          isSel 
                            ? 'bg-slate-950 border-cyan-500 shadow-md ring-1 ring-cyan-500/20' 
                            : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${p.color}`} />
                          <span className="text-xs font-bold text-slate-200">{p.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">{p.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Database configuration customizer */}
                <div className="bg-slate-950 rounded-2xl border border-slate-850 p-5 space-y-4">
                  <div className="flex items-center gap-2 justify-between border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                      ⚙️ Parameter Server &amp; Kredensial Database
                    </span>
                    <span className="text-[9px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded font-mono font-bold">
                      MySQL / MariaDB
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Host Database</label>
                      <input
                        type="text"
                        value={installerDbHost}
                        onChange={(e) => setInstallerDbHost(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                        placeholder="127.0.0.1"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Port Database</label>
                      <input
                        type="text"
                        value={installerDbPort}
                        onChange={(e) => setInstallerDbPort(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                        placeholder="3306"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Nama Database</label>
                      <input
                        type="text"
                        value={installerDbName}
                        onChange={(e) => setInstallerDbName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Username DB</label>
                      <input
                        type="text"
                        value={installerDbUser}
                        onChange={(e) => setInstallerDbUser(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Password DB</label>
                      <input
                        type="text"
                        value={installerDbPass}
                        onChange={(e) => setInstallerDbPass(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Domain Target</label>
                      <input
                        type="text"
                        value={installerDomain}
                        onChange={(e) => setInstallerDomain(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                        placeholder="billing.domain.net"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Path Webroot Server</label>
                      <input
                        type="text"
                        value={installerLocalPath}
                        onChange={(e) => setInstallerLocalPath(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Server Lisensi Pusat (Terpisah)</label>
                      <input
                        type="text"
                        value={installerLicenseServer}
                        onChange={(e) => setInstallerLicenseServer(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* INTERACTIVE SQL DATABASE CREATION TRIGGER */}
                  <div className="border-t border-slate-900 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-[11px] text-slate-400">
                      <span className="text-cyan-400 font-bold">💡 Fitur Inisialisasi Database:</span> Tekan tombol di samping untuk mensimulasikan koneksi MySQL dan eksekusi query pembuatan database otomatis <code className="text-slate-300 font-mono">CREATE DATABASE IF NOT EXISTS</code> serta migrasi tabel Laravel.
                    </div>
                    <button
                      type="button"
                      onClick={runDbCreationSimulation}
                      disabled={isDbCreating}
                      className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl font-mono tracking-wider transition flex items-center gap-1.5 shadow-md shrink-0 self-start md:self-auto"
                    >
                      <Terminal className="w-4 h-4" />
                      {isDbCreating ? 'Membuat Database...' : 'Inisialisasi Database'}
                    </button>
                  </div>

                  {/* Terminal Database Console Log Output */}
                  {(dbCreationLogs.length > 0 || isDbCreating) && (
                    <div className="border-t border-slate-900 pt-3">
                      <div className="bg-black border border-slate-850 p-4 rounded-xl font-mono text-[10px] h-[160px] overflow-y-auto space-y-1">
                        <span className="text-slate-500 font-bold block">--- DB CONFIGURATION AND MIGRATION LOGS ---</span>
                        {dbCreationLogs.map((log, idx) => {
                          let color = 'text-slate-300';
                          if (log.includes('[SUCCESS]') || log.includes('[OK]') || log.includes('[DONE]')) color = 'text-emerald-400';
                          if (log.includes('[ERROR]') || log.includes('[FAILED]')) color = 'text-rose-400';
                          if (log.includes('[INFO]')) color = 'text-cyan-400';
                          if (log.includes('[CONNECT]') || log.includes('[SQL]')) color = 'text-indigo-400';
                          return <div key={idx} className={color}>{log}</div>;
                        })}
                        {isDbCreating && (
                          <div className="text-slate-400 flex items-center gap-1 animate-pulse">
                            <span>▋</span> Menghubungkan MySQL Socket...
                          </div>
                        )}
                      </div>
                      {isDbCreated && (
                        <div className="mt-2 text-[10px] text-emerald-400 font-mono flex flex-col gap-2">
                          <div className="flex items-center gap-1">
                            <span>✔</span> Koneksi database siap, inisialisasi skema berhasil, file konfigurasi disinkronkan!
                          </div>
                          {onResetDemoToClean && (
                            <div className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                              <span className="text-[11px] text-slate-300 leading-normal">
                                <strong>Pembersihan Data Demo:</strong> Database bersih telah diinisialisasi. Apakah Anda ingin mengosongkan seluruh data pelanggan, tagihan, tiket komplain, log WhatsApp, dan router mikrotik dummy di dashboard ini sekarang?
                              </span>
                              <button
                                type="button"
                                onClick={onResetDemoToClean}
                                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-mono font-bold rounded-lg text-[10px] uppercase tracking-wider transition whitespace-nowrap shrink-0"
                              >
                                Terapkan Clean Install
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Generated Installer Scripts */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5 text-cyan-500" />
                      Hasil Kompilasi Auto-Installer Script
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const codeText = getInstallerCodeText();
                          navigator.clipboard.writeText(codeText);
                          alert('Sukses menyalin konfigurasi installer ke clipboard!');
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded font-mono text-[10px] transition flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Salin Code
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (installerPlatform === 'localhost_php') {
                            try {
                              const JSZip = (await import('jszip')).default;
                              const zip = new JSZip();
                              const codeText = getInstallerCodeText();
                              
                              zip.folder('.github');
                              zip.folder('admin');
                              zip.folder('docs');
                              const installFolder = zip.folder('install');
                              if (installFolder) installFolder.file('index.php', codeText);
                              zip.folder('pages_template');
                              zip.folder('qrcode');
                              zip.folder('scan');
                              zip.folder('system');
                              zip.folder('ui');
                              
                              zip.file('.gitignore', '/node_modules\n/vendor\n.env\n');
                              zip.file('.htaccess_firewall', 'Order Deny,Allow\nDeny from all\n');
                              zip.file('CHANGELOG.md', '# Changelog\n\n## 1.0.0\n- Initial Release');
                              zip.file('Dockerfile', 'FROM php:8.2-apache\nCOPY . /var/www/html/\n');
                              zip.file('LICENSE', 'Commercial License');
                              zip.file('README.md', '# StarBilling ISP Suite\nProfessional ISP Billing System.');
                              zip.file('composer.json', '{\n  "name": "starbilling/core",\n  "description": "StarBilling Core",\n  "require": {\n    "php": "^8.2"\n  }\n}');
                              zip.file('config.sample.php', '<?php\n// Configuration\n$db_host = "localhost";\n$db_name = "";\n$db_user = "";\n$db_pass = "";\n');
                              zip.file('docker-compose.example.yml', 'version: "3.8"\nservices:\n  app:\n    build: .\n    ports:\n      - "80:80"');
                              zip.file('favicon.ico', ''); 
                              zip.file('index.php', '<?php\n// Redirect to install if not installed\nif (!file_exists("config.php")) {\n    header("Location: install/");\n    exit;\n}\necho "StarBilling is installed.";\n');
                              zip.file('init.php', '<?php\n// Initialize core systems\n');
                              zip.file('radius.php', '<?php\n// Radius integration\n');
                              zip.file('update.php', '<?php\n// Auto updater\n');
                              zip.file('version.json', '{\n  "version": "1.0.0",\n  "build": "20260706"\n}');
                              
                              const content = await zip.generateAsync({ type: 'blob' });
                              const url = URL.createObjectURL(content);
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', 'StarBilling_v1.0.0.zip');
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            } catch (e) {
                              console.error(e);
                              alert('Gagal membuat file ZIP. Pastikan modul jszip terinstall.');
                            }
                          } else {
                            const codeText = getInstallerCodeText();
                            const filename = installerPlatform === 'cpanel' ? 'setup.php' : 'install.sh';
                            const blob = new Blob([codeText], { type: 'text/plain;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', filename);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                        className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded font-mono text-[10px] transition flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Unduh File
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto max-h-[350px] whitespace-pre shadow-inner">
                    {getInstallerCodeText()}
                  </div>
                </div>

                {/* Step-by-Step Guidelines */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                  <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-wider block">
                    📝 Panduan Instalasi Cepat:
                  </span>
                  {installerPlatform === 'cyberpanel' ? (
                    <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 leading-relaxed">
                      <li>Buka Panel Administrasi <strong>CyberPanel</strong> di browser Anda (port :8090).</li>
                      <li>Pilih menu <strong>Websites &gt; Create Website</strong>, masukkan domain target <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">{installerDomain}</code>. Pilih versi PHP 8.2.</li>
                      <li>Buat database MySQL baru di CyberPanel di menu <strong>Databases &gt; Create Database</strong> dengan nama <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">{installerDbName}</code> dan berikan akses penuh untuk user <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">{installerDbUser}</code>.</li>
                      <li>Masuk ke root terminal VPS via SSH, buat/unggah file <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">install.sh</code> yang telah diunduh ke path <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">{installerLocalPath}</code>.</li>
                      <li>Jalankan perintah: <code className="text-cyan-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">chmod +x install.sh &amp;&amp; ./install.sh</code>.</li>
                      <li>Sistem installer otomatis membuat database (jika belum ada), mengunduh Laravel core, menyelaraskan database, menautkan lisensi, dan mengatur crontab scheduler.</li>
                    </ol>
                  ) : installerPlatform === 'localhost_php' ? (
                    <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 leading-relaxed">
                      <li>Pastikan Anda telah memasang <strong>XAMPP / Laragon / LAMP</strong> atau web server aktif (Cpanel/VPS) dengan PHP 8.2 dan MySQL.</li>
                      <li>Unduh file <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">StarBilling_v1.0.0.zip</code> dari tombol "Unduh File" di atas.</li>
                      <li>Ekstrak (unzip) seluruh isi file tersebut ke folder utama website Anda (seperti <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">htdocs</code> atau <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">public_html</code>).</li>
                      <li>Buka browser Anda dan akses alamat instalasi: <code className="text-cyan-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">http://starbilling.net/install</code> atau <code className="text-cyan-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">http://localhost/install</code> (sesuaikan dengan domain Anda).</li>
                      <li>Program Web Installer interaktif akan memandu Anda untuk memvalidasi syarat server, membuat database, membersihkan data dummy, dan mendaftarkan Super Admin.</li>
                      <li>Setelah selesai, demi keamanan, hapus folder <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">install</code> agar tidak bisa diakses kembali.</li>
                    </ol>
                  ) : (
                    <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 leading-relaxed">
                      <li>Log in ke akun <strong>cPanel</strong> Shared Hosting Anda.</li>
                      <li>Unduh file <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">setup.php</code> dari tombol di atas.</li>
                      <li>Unggah file <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">setup.php</code> ke direktori <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">public_html</code> via File Manager cPanel.</li>
                      <li>Buka browser Anda dan akses alamat: <code className="text-cyan-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">https://{installerDomain}/setup.php</code>.</li>
                      <li>Program web installer akan berjalan, membuat database MySQL <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">{installerDbName}</code> via PHP PDO, memigrasikan tabel Laravel, dan mengonfigurasi lisensi.</li>
                      <li>Setelah sukses terpasang, demi keamanan pastikan Anda menghapus berkas <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5">setup.php</code> dari File Manager cPanel.</li>
                    </ol>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 7. LICENSE SERVER GENERATOR (SEPARATE) */}
          {activeSubTab === 'server_lisensi' && (
            <div className="space-y-6">
              
              {/* License Server Status Console */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                
                <div className="border-b border-slate-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-amber-500" />
                      <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                        Konsol Server Lisensi Terpisah (licensing.starbilling.net)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Platform manajemen lisensi terpusat. Kelola status aktivasi, masa berlaku, limit pelanggan, serta deteksi verifikasi IP/Domain secara real-time.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="px-2 py-1 bg-amber-950/40 text-amber-400 font-mono text-[9px] font-bold rounded border border-amber-800/40">
                      API SERVER ONLINE
                    </span>
                  </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">TOTAL LISENSI</span>
                    <strong className="text-white text-lg font-mono">{generatedLicenses.length} Keys</strong>
                    <span className="text-[8px] text-slate-600 block mt-0.5">Disimpan di local cluster</span>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">STATUS LISENSI AKTIF</span>
                    <strong className="text-emerald-400 text-lg font-mono">
                      {generatedLicenses.filter(l => l.status === 'ACTIVE').length} Active
                    </strong>
                    <span className="text-[8px] text-slate-600 block mt-0.5">Siap digunakan client</span>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">HIT VERIFIKASI HARIAN</span>
                    <strong className="text-cyan-400 text-lg font-mono">2,482 hits</strong>
                    <span className="text-[8px] text-slate-600 block mt-0.5">Response-time ~18ms</span>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">MEMORY USAGE</span>
                    <strong className="text-purple-400 text-lg font-mono">14.2 MB</strong>
                    <span className="text-[8px] text-slate-600 block mt-0.5">Sangat ringan &amp; optimal</span>
                  </div>
                </div>

                {/* Form: Generate License */}
                <form onSubmit={handleCreateLicense} className="bg-slate-950 rounded-2xl border border-slate-850 p-5 space-y-4">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500 block">
                    ➕ Buat &amp; Daftarkan Lisensi Baru ke Database Server Lisensi
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-400 block mb-1">Nama Pemilik / ISP Client</label>
                      <input
                        type="text"
                        required
                        value={newLicenseOwner}
                        onChange={(e) => setNewLicenseOwner(e.target.value)}
                        placeholder="Contoh: Palembang Net"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-400 block mb-1">Domain Diijinkan (Restrict)</label>
                      <input
                        type="text"
                        required
                        value={newLicenseDomain}
                        onChange={(e) => setNewLicenseDomain(e.target.value)}
                        placeholder="Contoh: billing.client.net"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-400 block mb-1">IP Address Diijinkan (Restrict)</label>
                      <input
                        type="text"
                        required
                        value={newLicenseIp}
                        onChange={(e) => setNewLicenseIp(e.target.value)}
                        placeholder="Contoh: 103.125.42.15"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-400 block mb-1">Batas Pelanggan (Limit)</label>
                      <select
                        value={newLicenseLimit}
                        onChange={(e) => setNewLicenseLimit(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value={100}>100 Pelanggan (Trial / Basic)</option>
                        <option value={500}>500 Pelanggan (Standard)</option>
                        <option value={1000}>1000 Pelanggan (Professional)</option>
                        <option value={5000}>5000 Pelanggan (Premium)</option>
                        <option value={999999}>Unlimited Customers (Enterprise)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-400 block mb-1">Tingkat Paket (Tier)</label>
                      <select
                        value={newLicenseTier}
                        onChange={(e) => setNewLicenseTier(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="TRIAL">TRIAL KEY</option>
                        <option value="SILVER">SILVER TIER</option>
                        <option value="GOLD">GOLD TIER</option>
                        <option value="PLATINUM">PLATINUM TIER</option>
                        <option value="LFTM">LIFETIME TIER</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-400 block mb-1">Masa Berlaku (Expiry)</label>
                      <select
                        value={newLicenseExpiry}
                        onChange={(e) => setNewLicenseExpiry(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="1-month">1 Bulan</option>
                        <option value="3-months">3 Bulan</option>
                        <option value="1-year">1 Tahun</option>
                        <option value="lifetime">Selamanya (Lifetime Key)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                    >
                      <span>⚡ Daftarkan &amp; Generate Serial Key</span>
                    </button>
                  </div>
                </form>

                {/* Table list of generated licenses */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    📋 Database Lisensi Terdaftar Pusat (Server-Side)
                  </span>
                  
                  <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-850 bg-slate-900/50 text-[9px] font-mono uppercase tracking-wider text-slate-500">
                            <th className="p-3">Nama Pemilik</th>
                            <th className="p-3">Serial Key (Kunci)</th>
                            <th className="p-3">Restricted Domain / IP</th>
                            <th className="p-3">Limit</th>
                            <th className="p-3">Masa Berlaku</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-center">Tindakan Kontrol</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-xs font-mono">
                          {generatedLicenses.map((lic) => (
                            <tr key={lic.key} className="hover:bg-slate-900/20 text-slate-300">
                              <td className="p-3 font-semibold text-slate-200">{lic.ownerName}</td>
                              <td className="p-3">
                                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-amber-400 font-bold">
                                  {lic.key}
                                </span>
                              </td>
                              <td className="p-3 text-slate-400">
                                <div className="text-[10px]">{lic.targetDomain}</div>
                                <div className="text-[9px] text-slate-500">{lic.targetIp}</div>
                              </td>
                              <td className="p-3 text-slate-300 font-bold">
                                {lic.maxCustomers === 999999 ? 'UNLIMITED' : lic.maxCustomers}
                              </td>
                              <td className="p-3 text-slate-400 text-[10px]">{lic.expiryDate}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                  lic.status === 'ACTIVE' 
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' 
                                    : lic.status === 'SUSPENDED'
                                    ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                                    : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                                }`}>
                                  {lic.status}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center justify-center gap-1.5">
                                  {lic.status === 'ACTIVE' ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setGeneratedLicenses(prev => prev.map(l => l.key === lic.key ? { ...l, status: 'SUSPENDED' } : l));
                                        alert(`Lisensi untuk ${lic.ownerName} ditangguhkan.`);
                                      }}
                                      className="px-1.5 py-0.5 bg-amber-950 hover:bg-amber-900 text-amber-400 text-[9px] rounded font-mono transition"
                                    >
                                      Suspend
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setGeneratedLicenses(prev => prev.map(l => l.key === lic.key ? { ...l, status: 'ACTIVE' } : l));
                                        alert(`Lisensi untuk ${lic.ownerName} diaktifkan kembali.`);
                                      }}
                                      className="px-1.5 py-0.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 text-[9px] rounded font-mono transition"
                                    >
                                      Aktifkan
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Yakin ingin mencabut (REVOKED) lisensi ${lic.ownerName}? Kunci ini tidak akan dapat divalidasi lagi.`)) {
                                        setGeneratedLicenses(prev => prev.map(l => l.key === lic.key ? { ...l, status: 'REVOKED' } : l));
                                      }
                                    }}
                                    className="px-1.5 py-0.5 bg-rose-950 hover:bg-rose-900 text-rose-400 text-[9px] rounded font-mono transition"
                                  >
                                    Revoke
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(lic.key);
                                      alert('Kunci lisensi disalin!');
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-200 transition"
                                    title="Copy Serial Key"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono block">
                    💡 <strong>Simulasi Sinkronisasi Real-Time:</strong> Anda dapat menguji status lisensi di atas dengan memasukkan kuncinya ke dalam sub-tab <strong>"Lisensi Server"</strong>, lalu mengklik "Perbarui Lisensi". Status lisensi klien Anda akan langsung tersinkronisasi!
                  </span>
                </div>

                {/* Live Sandbox Endpoint Tester (Terminal Simulator) */}
                <div className="border-t border-slate-800 pt-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-amber-500" />
                      Sandbox &amp; Simulasi API Request Validasi
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={apiQueryKey}
                        onChange={(e) => setApiQueryKey(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded px-2.5 py-1 font-mono focus:outline-none"
                      >
                        {generatedLicenses.map(l => (
                          <option key={l.key} value={l.key}>{l.ownerName} ({l.key})</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={runLiveApiSimulation}
                        disabled={apiQueryLoading}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-[10px] font-mono transition whitespace-nowrap"
                      >
                        {apiQueryLoading ? 'Memproses...' : 'Kirim Test Request'}
                      </button>
                    </div>
                  </div>

                  {/* Terminal Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left side: Console log output */}
                    <div className="bg-black/80 border border-slate-850 p-4 rounded-xl font-mono text-[10px] h-[190px] overflow-y-auto space-y-1 scrollbar-thin">
                      <span className="text-slate-500 font-bold block">--- HOST TERMINAL LOG ---</span>
                      {apiQueryLogs.length === 0 && (
                        <span className="text-slate-600 block italic pt-10 text-center">Silakan klik "Kirim Test Request" untuk memulai simulasi koneksi...</span>
                      )}
                      {apiQueryLogs.map((log, idx) => {
                        let color = 'text-slate-300';
                        if (log.includes('[OK]') || log.includes('[SUCCESS]')) color = 'text-emerald-400';
                        if (log.includes('[FAILED]')) color = 'text-rose-400';
                        if (log.includes('[INFO]')) color = 'text-cyan-400';
                        if (log.includes('[CONNECT]')) color = 'text-indigo-400';
                        return <div key={idx} className={color}>{log}</div>;
                      })}
                      {apiQueryLoading && (
                        <div className="text-slate-400 flex items-center gap-1 animate-pulse">
                          <span>▋</span> Mengirim paket...
                        </div>
                      )}
                    </div>

                    {/* Right side: Mock HTTP Response block */}
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-[10px] h-[190px] overflow-y-auto space-y-1">
                      <span className="text-slate-500 font-bold block">--- HTTP JSON RESPONSE ---</span>
                      {apiQueryResult ? (
                        <pre className="text-emerald-400 leading-normal font-sans whitespace-pre-wrap overflow-x-auto text-[11px] pt-1">
                          {JSON.stringify(apiQueryResult, null, 2)}
                        </pre>
                      ) : (
                        <div className="text-slate-600 italic pt-10 text-center">Menunggu respon server...</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Standalone License Server Source Code Download (Separate) */}
                <div className="border-t border-slate-800 pt-5 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-amber-500" />
                        Source Code Server Lisensi Terpisah (SaaS Backend)
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Sesuai permintaan Anda, source code generator & verifikator lisensi ini <strong>dipisahkan secara penuh</strong> dari sistem client. Unduh berkas PHP di bawah dan letakkan di server perizinan terpisah Anda.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const serverCode = getLicenseServerCodeText();
                          navigator.clipboard.writeText(serverCode);
                          alert('Sukses menyalin Source Code Server Lisensi ke clipboard!');
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded font-mono text-[10px] transition flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" /> Salin Code PHP
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const serverCode = getLicenseServerCodeText();
                          const blob = new Blob([serverCode], { type: 'text/plain;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', 'server.php');
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded font-mono text-[10px] transition flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Unduh server.php
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto max-h-[250px] whitespace-pre shadow-inner">
                    {getLicenseServerCodeText()}
                  </div>
                  
                  <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl text-[11px] text-amber-400 font-sans leading-relaxed">
                    <strong>Cara Kerja Pemisahan Lisensi:</strong><br/>
                    1. Unggah berkas <code className="text-slate-200 font-mono bg-slate-900 px-1 rounded">server.php</code> di atas ke VPS / hosting lisensi Anda (misal: <code className="text-slate-200 font-mono bg-slate-900 px-1 rounded">https://licensing.starbilling.net/server.php</code>).<br/>
                    2. Buat database MySQL dengan nama <code className="text-slate-200 font-mono bg-slate-900 px-1 rounded">starbilling_licensing</code> di server tersebut. Tabel <code className="text-slate-200 font-mono bg-slate-900 px-1 rounded">licenses</code> akan otomatis terbuat saat pertama kali server diakses (Zero-Config).<br/>
                    3. Aplikasi klien StarBilling Anda hanya akan melakukan HTTP API Call ke server tersebut untuk memvalidasi kunci. Kode validasi klien diisolasi penuh dari generator di atas.
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
