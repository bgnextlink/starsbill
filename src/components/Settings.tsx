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
}

export default function Settings({ customers, onUpdateCustomer, userEmail = 'betara@nextlink.co.id' }: SettingsProps) {
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
  const [installerPlatform, setInstallerPlatform] = useState<'cyberpanel' | 'localhost_php' | 'localhost_docker'>('cyberpanel');
  const [installerDomain, setInstallerDomain] = useState('billing.starbilling.net');
  const [installerDbName, setInstallerDbName] = useState('starbilling_db');
  const [installerDbUser, setInstallerDbUser] = useState('starbilling_user');
  const [installerDbPass, setInstallerDbPass] = useState('SB_SecureDBPass101!');
  const [installerLicenseServer, setInstallerLicenseServer] = useState('https://licensing.starbilling.net');
  const [installerLocalPath, setInstallerLocalPath] = useState('/home/starbilling/public_html');

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
# Date Generated: 2026-07-06
# =========================================================================

set -e

echo -e "\\e[1;36m[+] Memulai instalasi StarBilling ISP Suite di CyberPanel...\\e[0m"

# 1. Masuk ke direktori webroot
mkdir -p ${installerLocalPath}
cd ${installerLocalPath}

# 2. Update server dependencies
echo "[+] Memperbarui dependencies PHP 8.2..."
apt-get update -y && apt-get install -y git curl zip unzip php8.2-cli php8.2-mysql php8.2-xml php8.2-curl php8.2-mbstring php8.2-zip

# 3. Clone StarBilling core engine
echo "[+] Mengunduh StarBilling core Laravel 12..."
git clone https://github.com/starbilling/starbilling-core.git . || echo "Direktori sudah terisi, skip cloning."

# 4. Generate berkas .env
echo "[+] Menghasilkan konfigurasi lingkungan (.env)..."
cat <<EOF > .env
APP_NAME="StarBilling ISP"
APP_ENV=production
APP_KEY=base64:\$(openssl rand -base64 32)
APP_DEBUG=false
APP_URL=https://${installerDomain}

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=${installerDbName}
DB_USERNAME=${installerDbUser}
DB_PASSWORD="${installerDbPass}"

# Konfigurasi Server Lisensi Terpisah
LICENSE_SERVER_URL="${installerLicenseServer}"
LICENSE_KEY="${licenseKey}"
EOF

# 5. Install composer package dependencies
echo "[+] Memasang pustaka PHP via Composer..."
curl -sS https://getcomposer.org/installer | php
php composer.phar install --no-dev --optimize-autoloader

# 6. Menjalankan Database Migrasi & Seeds awal
echo "[+] Menjalankan migrasi database MySQL..."
php artisan migrate --force
php artisan db:seed --force

# 7. Memasang WhatsApp Gateway engine (Node.js)
echo "[+] Memasang WhatsApp gateway server (Baileys)..."
apt-get install -y nodejs npm
cd gateway && npm install && cd ..

# 8. Set up permissions untuk OpenLiteSpeed
echo "[+] Menyusun kepemilikan berkas (OLS)..."
chown -R externalapp:externalapp ${installerLocalPath}
chmod -R 775 storage bootstrap/cache

# 9. Daftarkan cron job berkala (Jatuh Tempo harian)
echo "[+] Memasang cron schedule harian pada system crontab..."
(crontab -l 2>/dev/null; echo "* * * * * cd ${installerLocalPath} && php artisan schedule:run >> /dev/null 2>&1") | crontab -

echo -e "\\e[1;32m[✔] Sukses! StarBilling berhasil dipasang di CyberPanel.\\e[0m"
echo -e "\\e[1;33mSilakan kunjungi: https://${installerDomain} untuk login awal (Admin: admin@starbilling.lokal / admin123)\\e[0m"
`;
    } else if (installerPlatform === 'localhost_php') {
      return `#!/bin/bash
# =========================================================================
# STARBILLING AUTOMATIC INSTALLER FOR LOCALHOST LAMP (XAMPP / LINUX)
# Target Server: http://localhost / https://${installerDomain}
# =========================================================================

set -e

echo "[+] Mempersiapkan instalasi StarBilling di Localhost (LAMP)..."

# Buat direktori dan persiapkan berkas .env lokal
mkdir -p ${installerLocalPath}
cd ${installerLocalPath}

cat <<EOF > .env
APP_NAME="StarBilling Localhost"
APP_ENV=local
APP_KEY=base64:\$(openssl rand -base64 32)
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=${installerDbName}
DB_USERNAME=${installerDbUser}
DB_PASSWORD="${installerDbPass}"

LICENSE_SERVER_URL="${installerLicenseServer}"
LICENSE_KEY="${licenseKey}"
EOF

echo "[+] Memasang pustaka PHP composer lokal..."
composer install --optimize-autoloader

echo "[+] Mempersiapkan migrasi database lokal..."
php artisan migrate:fresh --seed

echo "[✔] Setup selesai! Jalankan perintah: 'php artisan serve' untuk membuka aplikasi lokal.";
`;
    } else {
      // localhost_docker
      return `# =========================================================================
# STARBILLING DOCKER COMPOSE CONFIGURATION
# Platform     : Localhost (Containerized)
# Database     : PostgreSQL 15 & Redis
# =========================================================================

version: '3.8'

services:
  # App service (Laravel 12 + Node Gateway)
  app:
    image: starbilling/starbilling-app:latest
    container_name: starbilling_app
    restart: always
    ports:
      - "80:80"
      - "3000:3000"
    environment:
      - APP_NAME=StarBilling_Docker
      - APP_ENV=production
      - APP_KEY=base64:m9t5vK1pL6xZc8vB4nQ2wE4rT5yU6iO7pP=
      - APP_URL=http://${installerDomain}
      - DB_CONNECTION=pgsql
      - DB_HOST=db
      - DB_PORT=5432
      - DB_DATABASE=${installerDbName}
      - DB_USERNAME=${installerDbUser}
      - DB_PASSWORD=${installerDbPass}
      - LICENSE_SERVER_URL=${installerLicenseServer}
      - LICENSE_KEY=${licenseKey}
    volumes:
      - app_storage:/var/www/html/storage
    depends_on:
      - db
      - redis

  # Relational Database service (Postgres)
  db:
    image: postgres:15-alpine
    container_name: starbilling_db
    restart: always
    environment:
      - POSTGRES_DB=${installerDbName}
      - POSTGRES_USER=${installerDbUser}
      - POSTGRES_PASSWORD=${installerDbPass}
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Cache & Event Queue service
  redis:
    image: redis:alpine
    container_name: starbilling_redis
    restart: always
    ports:
      - "6379:6379"

volumes:
  app_storage:
  db_data:
`;
    }
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

          {/* 6. INSTALLER TAB */}
          {activeSubTab === 'installer' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                      Auto-Installer Hub (CyberPanel &amp; Localhost)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Gunakan panduan dan script kustomisasi di bawah ini untuk menginstal seluruh engine StarBilling (Laravel 12 + Node.js WhatsApp gateway + DB) di VPS CyberPanel atau Localhost Anda.
                  </p>
                </div>

                {/* Target Platform Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'cyberpanel', name: 'CyberPanel (VPS / OLS)', desc: 'Auto-deploy untuk OpenLiteSpeed & PHP 8.2.', icon: Server, color: 'text-cyan-400 border-cyan-500/20' },
                    { id: 'localhost_php', name: 'Localhost LAMP / XAMPP', desc: 'Setup manual Apache, PHP & MySQL lokal.', icon: Cpu, color: 'text-indigo-400 border-indigo-500/20' },
                    { id: 'localhost_docker', name: 'Docker Compose (Local)', desc: 'Koneksi instan terisolasi via Docker.', icon: Layers, color: 'text-emerald-400 border-emerald-500/20' }
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

                {/* Customizer form */}
                <div className="bg-slate-950 rounded-2xl border border-slate-850 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                      ⚙️ Sesuaikan Parameter Konfigurasi Installer
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Domain Target VPS</label>
                      <input
                        type="text"
                        value={installerDomain}
                        onChange={(e) => setInstallerDomain(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                        placeholder="billing.domain.net"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Nama Database MySQL</label>
                      <input
                        type="text"
                        value={installerDbName}
                        onChange={(e) => setInstallerDbName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1">DB Username</label>
                      <input
                        type="text"
                        value={installerDbUser}
                        onChange={(e) => setInstallerDbUser(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1">DB Password</label>
                      <input
                        type="text"
                        value={installerDbPass}
                        onChange={(e) => setInstallerDbPass(e.target.value)}
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
                    <div>
                      <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Path Webroot Server</label>
                      <input
                        type="text"
                        value={installerLocalPath}
                        onChange={(e) => setInstallerLocalPath(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
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
                        onClick={() => {
                          const codeText = getInstallerCodeText();
                          const filename = installerPlatform === 'localhost_docker' ? 'docker-compose.yml' : 'install.sh';
                          const blob = new Blob([codeText], { type: 'text/plain;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', filename);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
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
                      <li>Buat Database baru di CyberPanel di menu <strong>Databases &gt; Create Database</strong> dengan nama <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">{installerDbName}</code>.</li>
                      <li>Masuk ke root terminal VPS via SSH, buat/unggah file <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">install.sh</code> yang telah diunduh ke path <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">{installerLocalPath}</code>.</li>
                      <li>Jalankan perintah: <code className="text-cyan-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">chmod +x install.sh &amp;&amp; ./install.sh</code>.</li>
                      <li>Sistem installer otomatis mengunduh program, menyelaraskan database, menautkan lisensi, dan mengatur crontab scheduler.</li>
                    </ol>
                  ) : installerPlatform === 'localhost_php' ? (
                    <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 leading-relaxed">
                      <li>Pastikan Anda telah memasang <strong>XAMPP / Laragon</strong> dengan minimal PHP 8.2 dan MySQL aktif di komputer lokal Anda.</li>
                      <li>Buat direktori baru bernama <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">{installerLocalPath}</code> di folder webroot Anda (misal <code className="text-slate-200">htdocs</code> atau <code className="text-slate-200">www</code>).</li>
                      <li>Gunakan software PhpMyAdmin untuk membuat database bernama <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">{installerDbName}</code>.</li>
                      <li>Unduh script <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">install.sh</code> di atas, buka terminal Git Bash / WSL Anda di folder tersebut, lalu jalankan <code className="text-cyan-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">./install.sh</code>.</li>
                      <li>Setelah selesai, jalankan <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">php artisan serve</code> untuk mulai beroperasi di lokal!</li>
                    </ol>
                  ) : (
                    <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 leading-relaxed">
                      <li>Pastikan komputer/server Anda telah terpasang <strong>Docker</strong> dan <strong>Docker Compose</strong>.</li>
                      <li>Simpan isi file konfigurasi <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">docker-compose.yml</code> di atas dalam suatu direktori kerja baru.</li>
                      <li>Buka terminal, masuk ke direktori tersebut, dan ketikkan perintah: <code className="text-cyan-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">docker-compose up -d</code>.</li>
                      <li>Docker akan otomatis mengunduh image Laravel 12, PostgreSQL 15, Redis Alpine, mengonfigurasi port, serta menjalankan auto-migrations database.</li>
                      <li>Buka alamat <code className="text-slate-200 font-mono bg-slate-900 px-1 py-0.5 rounded">http://{installerDomain}</code> untuk mengakses StarBilling.</li>
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

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
