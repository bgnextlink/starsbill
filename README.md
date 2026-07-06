# StarBilling ISP Suite - Dokumentasi Instalasi & Server Lisensi

Selamat datang di repositori resmi **StarBilling ISP Suite**. Aplikasi ini dirancang khusus untuk manajemen penagihan (billing), pendataan pelanggan, pemantauan wilayah/ODP, tiket komplain, diagnosa jaringan, dan notifikasi otomatis WhatsApp terintegrasi bagi penyedia layanan internet (ISP).

Dokumentasi ini menjelaskan langkah-langkah lengkap untuk melakukan instalasi StarBilling pada tiga lingkungan server utama:
1. **Localhost (XAMPP / Laragon)**
2. **CyberPanel (VPS dengan OpenLiteSpeed)**
3. **cPanel (Shared Hosting / VPS)**

---

## 📋 Prasyarat Umum Sistem

Sebelum memulai proses instalasi, pastikan server Anda telah memenuhi spesifikasi minimum berikut:

*   **Bahasa Pemrogram & Core**: PHP `>= 8.2` (Sangat direkomendasikan PHP 8.2 atau PHP 8.3)
*   **Database**: MySQL `>= 5.7` atau MariaDB `>= 10.4` (PostgreSQL 15 juga didukung untuk mode Docker)
*   **Paket Pengelola**: Composer `>= 2.2`
*   **WhatsApp Gateway Node**: Node.js `>= 18.x` & NPM `>= 9.x`
*   **Ekstensi PHP Wajib**:
    *   `bcmath`, `ctype`, `fileinfo`, `json`, `mbstring`, `openssl`, `pdo_mysql`, `tokenizer`, `xml`, `curl`, `zip`

---

## 💻 1. Panduan Instalasi di Localhost (XAMPP / Laragon)

Metode ini cocok untuk lingkungan pengembangan atau uji coba lokal pada komputer bersistem operasi Windows, macOS, atau Linux menggunakan XAMPP/Laragon.

### Langkah 1: Persiapan Database
1. Buka control panel XAMPP atau Laragon Anda, lalu jalankan layanan **Apache** dan **MySQL**.
2. Buka web browser Anda dan akses **phpMyAdmin** (`http://localhost/phpmyadmin`).
3. Buat database baru bernama: `starbilling_db` dengan kolasi `utf8mb4_unicode_ci`.

### Langkah 2: Mengunduh Source Code & Ekstraksi
1. Clone atau unduh repositori ini ke folder root server lokal Anda:
   * **XAMPP**: `C:\xampp\htdocs\starbilling`
   * **Laragon**: `C:\laragon\www\starbilling`
2. Masuk ke dalam direktori tersebut menggunakan Command Prompt / Terminal.

### Langkah 3: Konfigurasi File Lingkungan (`.env`)
1. Salin berkas konfigurasi default:
   ```bash
   cp .env.example .env
   ```
2. Buka file `.env` menggunakan teks editor (VS Code, Notepad++, dll.) lalu sesuaikan parameter database Anda:
   ```env
   APP_NAME="StarBilling Local"
   APP_ENV=local
   APP_KEY= # Akan di-generate otomatis nanti
   APP_DEBUG=true
   APP_URL=http://localhost:8000

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=starbilling_db
   DB_USERNAME=root
   DB_PASSWORD=""

   # Konfigurasi Server Lisensi Pusat
   LICENSE_SERVER_URL="https://licensing.starbilling.net"
   LICENSE_KEY="SB-LFTM-PALEMBANG-2026-9917"
   ```

### Langkah 4: Install Dependencies & Jalankan Migrasi
1. Buka terminal pada folder proyek Anda, lalu jalankan perintah berikut secara berurutan:
   ```bash
   # Pasang pustaka PHP Laravel 12
   composer install

   # Hasilkan Kunci Enkripsi Aplikasi
   php artisan key:generate

   # Jalankan Migrasi Struktur Tabel & Data Awal (Seeder)
   php artisan migrate --seed
   ```

### Langkah 5: Setup WhatsApp Gateway (Server Node.js Terpisah)
WhatsApp gateway menggunakan library Baileys yang berjalan di platform Node.js secara terpisah di port 3000.
1. Masuk ke folder gateway WhatsApp:
   ```bash
   cd gateway
   ```
2. Pasang modul Node.js yang diperlukan:
   ```bash
   npm install
   ```
3. Jalankan server gateway lokal:
   ```bash
   npm start
   ```

### Langkah 6: Menjalankan Aplikasi
Kembali ke folder utama proyek Anda, lalu jalankan perintah server bawaan Laravel:
```bash
php artisan serve
```
Buka browser Anda dan navigasikan ke `http://127.0.0.1:8000`. Login dengan akun administrator default:
*   **Email**: `admin@starbilling.lokal`
*   **Password**: `admin123`

---

## 🚀 2. Panduan Instalasi di CyberPanel (VPS / OpenLiteSpeed)

CyberPanel menggunakan OpenLiteSpeed (OLS) sebagai web server yang sangat optimal untuk performa tinggi. Ikuti langkah-langkah deployment berikut:

### Langkah 1: Buat Website & Database di CyberPanel
1. Masuk ke halaman dasbor **CyberPanel Admin** (`https://ip-vps-anda:8090`).
2. Klik menu **Websites** > **Create Website**:
   * **Select Package**: Default / Paket Anda
   * **Owner**: admin
   * **Domain Name**: `billing.starbilling.net` (sesuaikan dengan domain Anda)
   * **Email**: email Anda
   * **Select PHP**: `PHP 8.2`
   * **Additional Features**: Centang *SSL* dan *open_basedir Protection*. Klik **Create Website**.
3. Buat Database MySQL melalui menu **Databases** > **Create Database**:
   * **Select Website**: `billing.starbilling.net`
   * **Database Name**: `starbilling_db`
   * **Database User**: `starbilling_user`
   * **Password**: Tentukan password yang kuat (contoh: `SB_SecureDBPass101!`)

### Langkah 2: Jalankan Script Auto-Installer via SSH SSH Terminal
Gunakan script shell terpadu yang telah disediakan di panel pengaturan aplikasi untuk mengotomatisasi seluruh proses cloning, penataan izin akses OLS, pengisian database, dan pemasangan dependensi.

1. Hubungkan koneksi VPS Anda menggunakan client SSH (PuTTY, Terminal, dll):
   ```bash
   ssh root@ip-vps-anda
   ```
2. Masuk ke folder webroot website yang baru dibuat:
   ```bash
   cd /home/billing.starbilling.net/public_html
   ```
3. Unduh dan jalankan script installer dengan perintah kustom berikut:
   ```bash
   # Buat file baru install.sh
   nano install.sh
   ```
4. Tempelkan script installer kustom (dapat diperoleh dari tab **Installer** di aplikasi Anda) lalu eksekusi:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```
5. Installer ini akan menangani penarikan git repositori, penulisan berkas `.env`, instalasi `composer install --no-dev`, migrasi skema tabel, dan pengaturan kepemilikan file agar kompatibel dengan modul OpenLiteSpeed.

### Langkah 3: Konfigurasi Rewrite Rules (vHost OpenLiteSpeed)
Secara bawaan, Laravel mengarahkan entry point URL ke folder `/public`. Kita harus memberi tahu OpenLiteSpeed untuk melakukan rewrite atau mengarahkan DocRoot ke folder `/public`.
1. Di CyberPanel, masuk ke menu **Websites** > **List Websites** > Pilih Domain Anda > **Manage**.
2. Klik tombol **vHost Conf** (Virtual Host Configuration).
3. Cari baris `docRoot $VH_ROOT/public_html` dan ubah menjadi:
   ```conf
   docRoot $VH_ROOT/public_html/public
   ```
4. Simpan konfigurasi vHost. OpenLiteSpeed akan melakukan restart otomatis secara aman.

### Langkah 4: Daftarkan Cron Job Scheduler Harian
StarBilling membutuhkan sistem pemicu cron job setiap menit untuk memproses tagihan jatuh tempo secara real-time dan mengirim notifikasi isolir otomatis.
1. Masuk ke CyberPanel > **Cron Jobs**.
2. Pilih website Anda, lalu tambahkan cron job baru:
   * **Timing**: Setiap Menit (`* * * * *`)
   * **Command**:
     ```bash
     cd /home/billing.starbilling.net/public_html && php artisan schedule:run >> /dev/null 2>&1
     ```

---

## 📦 3. Panduan Instalasi di cPanel (Shared Hosting / VPS)

Jika Anda menyewa shared hosting berbasis cPanel, Anda dapat melakukan instalasi dengan langkah-langkah berikut:

### Langkah 1: Konfigurasi Database MySQL
1. Log in ke dasbor **cPanel** Anda.
2. Cari dan klik menu **MySQL® Database Wizard**.
3. **Step 1**: Masukkan nama database, contoh: `usercpanel_starbilling`. Klik *Next Step*.
4. **Step 2**: Buat user baru, contoh: `usercpanel_billinguser` dan masukkan password yang kuat. Klik *Create User*.
5. **Step 3**: Centang **ALL PRIVILEGES** untuk memberikan izin akses penuh kepada user tersebut. Klik *Make Changes*.

### Langkah 2: Mengunggah Berkas StarBilling
Karena sebagian besar shared hosting tidak memperbolehkan akses SSH `git clone`, Anda perlu mengunggah berkas zip secara manual:
1. Kompres seluruh file proyek StarBilling Anda (kecuali folder `node_modules`, `vendor`, dan `.git`) ke dalam satu file berkas `.zip`.
2. Di dasbor cPanel, buka **File Manager** dan masuk ke direktori `/home/username_cpanel/`.
3. Buat folder baru di luar folder `public_html` bernama `starbilling_core` (ini demi keamanan agar file konfigurasi `.env` sensitif tidak dapat diakses langsung oleh publik dari web).
4. Masuk ke dalam folder `/home/username_cpanel/starbilling_core` lalu unggah berkas `.zip` tadi dan ekstrak semua isinya di sini.

### Langkah 3: Konfigurasi Entry Point Webroot
1. Pindahkan isi dari folder `/home/username_cpanel/starbilling_core/public` ke folder `/home/username_cpanel/public_html/` (atau folder subdomain Anda).
2. Di dalam folder `public_html/`, cari file bernama `index.php`. Buka editor teks cPanel dan sesuaikan path autoloading ke folder core Anda:
   * Cari baris:
     ```php
     require __DIR__.'/../vendor/autoload.php';
     ```
     Ubah menjadi:
     ```php
     require __DIR__.'/../starbilling_core/vendor/autoload.php';
     ```
   * Cari baris:
     ```php
     $app = require_once __DIR__.'/../bootstrap/app.php';
     ```
     Ubah menjadi:
     ```php
     $app = require_once __DIR__.'/../starbilling_core/bootstrap/app.php';
     ```
3. Simpan perubahan file `index.php`.

### Langkah 4: Pengaturan Berkas `.env` di cPanel
1. Masuk ke `/home/username_cpanel/starbilling_core/` menggunakan File Manager.
2. Edit file `.env` (Jika tidak terlihat, centang *Show Hidden Files* pada pengaturan kanan atas File Manager).
3. Masukkan kredensial database cPanel yang telah Anda buat pada Langkah 1:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=usercpanel_starbilling
   DB_USERNAME=usercpanel_billinguser
   DB_PASSWORD="Password_MySQL_cPanel_Anda"
   ```

### Langkah 5: Menjalankan Perintah Composer & Migrasi Tanpa SSH Terminal
Jika cPanel Anda tidak menyediakan fitur Terminal SSH, Anda bisa menjalankan migrasi menggunakan fitur **Cron Jobs** sekali jalan, lalu menghapusnya setelah sukses:
1. Masuk ke menu **Cron Jobs** di cPanel.
2. Tambahkan cron job sekali jalan dengan perintah:
   ```bash
   cd /home/username_cpanel/starbilling_core && composer install --no-dev && php artisan migrate --force --seed
   ```
3. Atur interval waktu ke **Once Per Minute** (setiap menit).
4. Tunggu 1-2 menit hingga sistem mengeksekusi script tersebut di latar belakang, lalu segera **HAPUS** cron job tersebut agar tidak berulang.

### Langkah 6: Pasang Cron Job Harian Scheduler Laravel
Setelah database berhasil bermigrasi, buat satu cron job permanen untuk pemicu sistem otomatis:
1. Buka kembali halaman **Cron Jobs** cPanel.
2. Tambahkan cron job baru dengan pengaturan waktu: **Once Per Minute** (`* * * * *`).
3. Tulis perintah cron berikut:
   ```bash
   /usr/local/bin/php /home/username_cpanel/starbilling_core/artisan schedule:run >> /dev/null 2>&1
   ```
   *(Catatan: Sesuaikan path `/usr/local/bin/php` dengan lokasi binary PHP di hosting Anda).*

---

## 🔑 4. Sistem Server Generate Lisensi (Terpisah)

StarBilling mengimplementasikan arsitektur proteksi lisensi klien berbasis API terpisah (*Separate Licensing Server*). Hal ini memisahkan logika validasi sistem billing yang terpasang di sisi klien dengan dasbor otorisasi pusat.

### Konsep Validasi Keamanan
Setiap kali aplikasi klien di-instal atau dijalankan, middleware lisensi di sisi klien mengirimkan request HTTP aman ke server pusat (`licensing.starbilling.net`) untuk mencocokkan parameter berikut:
1. **Serial Key (`LICENSE_KEY`)**: Harus diawali kode paket (`SB-GOLD-`, `SB-LFTM-`, dll.).
2. **Domain Restriksi (`targetDomain`)**: Kunci hanya valid untuk nama host yang didaftarkan.
3. **IP Address Restriksi (`targetIp`)**: Menghindari pemalsuan DNS Spoofing.
4. **Masa Berlaku (`expiryDate`)**: Memutus otorisasi otomatis jika lisensi kedaluwarsa.

### Cara Melakukan Generate Serial Key Baru di Server Pusat:
Di dalam dasbor pengaturan StarBilling Anda, masuk ke sub-tab **Server Lisensi (Terpisah)** untuk mengoperasikan instans server lisensi pusat (Simulasi Real-time Sandbox):
1. **Nama Pemilik**: Masukkan nama ISP/Klien Anda (misal: *Borneo Connect*).
2. **Domain Diijinkan**: Masukkan nama domain instalasi klien (misal: *borneo.net*).
3. **IP Address**: Masukkan IP Server VPS CyberPanel / cPanel klien (misal: *103.84.110.15*).
4. **Batas Pelanggan**: Pilih jumlah pelanggan yang diijinkan (100 s/d Unlimited).
5. **Tingkat Paket**: Pilih kasta lisensi (`TRIAL`, `SILVER`, `GOLD`, `PLATINUM`, `LIFETIME`).
6. **Masa Berlaku**: Pilih durasi (1 bulan s/d Selamanya).
7. Klik **Generate Serial Key**. Kunci baru dengan format hash digital unik akan dimasukkan ke database server lisensi pusat.

### Menguji Integrasi / Simulasi REST API
Tersedia konsol simulator API request dan terminal log secara langsung di dasbor pengaturan. 
* Pilih salah satu kunci lisensi yang dihasilkan, klik **Kirim Test Request**.
* Anda akan melihat log interaksi handshake HTTP API, verifikasi database, pencocokan restriksi IP/Domain, hingga pengembalian payload JSON response dengan status code `200 OK` (jika aktif) atau `403 Forbidden` / `404 Not Found` (jika ditangguhkan/tidak terdaftar).

---
*Dokumentasi ini ditulis dengan standar operasional industri telekomunikasi untuk menjamin kelancaran penyiapan aplikasi bagi tim teknis StarBilling.*
