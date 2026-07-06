# StarBilling ISP Suite - Dokumentasi Instalasi & Server Lisensi

Selamat datang di repositori resmi **StarBilling ISP Suite**. Aplikasi ini dirancang khusus untuk manajemen penagihan (billing), pendataan pelanggan, pemantauan wilayah/ODP, tiket komplain, diagnosa jaringan, dan notifikasi otomatis WhatsApp terintegrasi bagi penyedia layanan internet (ISP).

Dokumentasi ini menjelaskan langkah-langkah lengkap untuk melakukan instalasi StarBilling dengan fitur **Auto-Database Creator Wizard** pada tiga lingkungan server utama:
1. **Localhost (XAMPP / Laragon / LAMP)** - Menggunakan installer script bash otomatis.
2. **CyberPanel (VPS dengan OpenLiteSpeed)** - Menggunakan installer script shell otomatis.
3. **cPanel (Shared Hosting / VPS)** - Menggunakan web-based wizard `setup.php` otomatis.

---

## 📋 Prasyarat Umum Sistem

Sebelum memulai proses instalasi, pastikan server Anda telah memenuhi spesifikasi minimum berikut:

*   **Bahasa Pemrogram & Core**: PHP `>= 8.2` (Sangat direkomendasikan PHP 8.2 atau PHP 8.3)
*   **Database**: MySQL `>= 5.7` atau MariaDB `>= 10.4`
*   **Paket Pengelola**: Composer `>= 2.2`
*   **WhatsApp Gateway Node**: Node.js `>= 18.x` & NPM `>= 9.x`
*   **Ekstensi PHP Wajib**: `bcmath`, `ctype`, `fileinfo`, `json`, `mbstring`, `openssl`, `pdo_mysql`, `tokenizer`, `xml`, `curl`, `zip`

---

## 💻 1. Panduan Instalasi di Localhost (XAMPP / Laragon)
### *Fitur: Auto-Database Creation via install-local.sh*

Metode ini cocok untuk lingkungan lokal Anda menggunakan bash shell otomatis yang akan membuat database, konfigurasi `.env`, dan menginisialisasi skema secara mandiri tanpa harus menyusun manual di phpMyAdmin.

### Langkah 1: Persiapan Server Lokal
1. Jalankan layanan **Apache** dan **MySQL** pada control panel XAMPP atau Laragon Anda.
2. Buat folder baru untuk instalasi aplikasi Anda di dalam folder root web (misal: `htdocs/starbilling` atau `www/starbilling`).

### Langkah 2: Eksekusi Script Auto-Installer Lokal
1. Unduh file `install-local.sh` yang telah dihasilkan dari tab **Hub Installer (Lokal)** di panel pengaturan aplikasi StarBilling Anda.
2. Letakkan file `install-local.sh` tersebut di dalam folder instalasi Anda (misal: `C:\xampp\htdocs\starbilling\`).
3. Jalankan Git Bash atau Terminal di folder tersebut, kemudian eksekusi:
   ```bash
   chmod +x install-local.sh
   ./install-local.sh
   ```
4. **Alur Otomatisasi Script**:
   * Script akan mendeteksi kredensial MySQL lokal Anda (Default host: `127.0.0.1`, port: `3306`, user: `root`).
   * Menghubungi MySQL engine dan membuat database baru secara otomatis dengan nama `starbilling_db`.
   * Menghasilkan file `.env` kustom dengan isian database lokal yang tepat.
   * Menjalankan `composer install` dan `php artisan migrate --seed` untuk melengkapi seluruh struktur tabel dan mengisi administrator default.

### Langkah 3: Menjalankan Aplikasi
1. Setelah instalasi selesai, jalankan perintah server lokal:
   ```bash
   php artisan serve
   ```
2. Buka browser Anda dan akses `http://127.0.0.1:8000`. Login menggunakan:
   * **Email**: `admin@starbilling.lokal`
   * **Password**: `admin123`

---

## 🚀 2. Panduan Instalasi di CyberPanel (VPS / OpenLiteSpeed)
### *Fitur: Auto-Database Creation via install.sh*

CyberPanel menggunakan OpenLiteSpeed (OLS) sebagai web server berkinerja tinggi. Deployment menggunakan script shell kustom ini mengotomatiskan pembuatan database lewat MySQL CLI, konfigurasi virtual host, dan penyelarasan hak akses file.

### Langkah 1: Buat Website di CyberPanel
1. Masuk ke halaman dasbor **CyberPanel Admin** Anda (`https://ip-vps-anda:8090`).
2. Pilih menu **Websites** > **Create Website**:
   * Masukkan domain target, misal: `billing.starbilling.net`.
   * Pilih versi **PHP 8.2**.
   * Centang **SSL** dan **open_basedir Protection**. Klik **Create Website**.

### Langkah 2: Eksekusi Script Auto-Installer VPS via SSH
1. Hubungkan koneksi VPS Anda menggunakan client SSH (seperti PuTTY atau Terminal):
   ```bash
   ssh root@ip-vps-anda
   ```
2. Masuk ke folder webroot website yang baru saja dibuat:
   ```bash
   cd /home/billing.starbilling.net/public_html
   ```
3. Unduh berkas `install.sh` yang dihasilkan oleh panel **Installer** aplikasi StarBilling Anda, lalu unggah atau buat filenya di folder tersebut:
   ```bash
   nano install.sh
   ```
   *Tempelkan isi script `install.sh` dari panel aplikasi, lalu simpan.*
4. Jalankan script installer dengan perintah:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```
5. **Alur Kerja Script**:
   * Script mengidentifikasi parameter koneksi database yang Anda tentukan di panel pengaturan.
   * Menggunakan akses MySQL root lokal VPS untuk membuat database baru (`starbilling_db`) dan menetapkan user database baru (`starbilling_user`) dengan hak istimewa penuh.
   * Menarik codebase Laravel, mengunduh pustaka PHP pendukung, mengonfigurasi `.env`, dan menginstalasi skema migrasi tabel Laravel secara otomatis.
   * Memulihkan izin akses file (chown) untuk kecocokan dengan user grup OpenLiteSpeed (`nobody:nogroup`).

### Langkah 3: Konfigurasi Virtual Host Document Root
1. Di CyberPanel, masuk ke menu **Websites** > **List Websites** > Pilih Domain Anda > **Manage**.
2. Klik tombol **vHost Conf** (Virtual Host Configuration).
3. Cari baris `docRoot $VH_ROOT/public_html` dan ubah menjadi:
   ```conf
   docRoot $VH_ROOT/public_html/public
   ```
4. Simpan konfigurasi vHost. OpenLiteSpeed akan memuat ulang secara otomatis.

### Langkah 4: Daftarkan Cron Job Scheduler
1. Masuk ke CyberPanel > **Cron Jobs**.
2. Tambahkan perintah berikut untuk berjalan setiap menit (`* * * * *`):
   ```bash
   cd /home/billing.starbilling.net/public_html && php artisan schedule:run >> /dev/null 2>&1
   ```

---

## 📦 3. Panduan Instalasi di cPanel (Shared Hosting)
### *Fitur: Web-Based Interactive Database Creator (setup.php)*

Jika Anda menggunakan hosting cPanel dan tidak memiliki akses SSH Terminal, StarBilling menyediakan berkas web installer cerdas bernama `setup.php` yang berjalan langsung pada browser Anda untuk membuat database via PHP PDO, menulis file `.env`, dan mengeksekusi migrasi tabel.

### Langkah 1: Persiapan Unggah Berkas Core
1. Kompres seluruh file proyek StarBilling Anda (Kecuali folder `node_modules`, `vendor`, dan `.git`) ke dalam satu berkas format `.zip`.
2. Buka **File Manager** cPanel Anda dan masuk ke direktori `/home/username_cpanel/`.
3. Buat folder baru bernama `starbilling_core` di luar folder `public_html` demi keamanan maksimum berkas sensitif `.env`.
4. Unggah berkas `.zip` tadi ke dalam folder `/home/username_cpanel/starbilling_core/` lalu ekstrak isinya di sana.

### Langkah 2: Pemasangan Web Installer `setup.php`
1. Buka tab **Installer (cPanel)** pada panel pengaturan aplikasi StarBilling, lalu unduh berkas bernama `setup.php`.
2. Unggah berkas `setup.php` tersebut langsung ke dalam folder `/home/username_cpanel/public_html/` (atau folder subdomain publik Anda).

### Langkah 3: Jalankan Web Installer Cerdas
1. Buka browser Anda dan kunjungi alamat:
   ```
   https://billing-anda.com/setup.php
   ```
2. Anda akan disambut oleh **StarBilling Web Installer Wizard** yang modern.
3. Isi parameter koneksi database cPanel Anda pada form interaktif yang tersedia:
   * **Host**: `127.0.0.1`
   * **Database Name**: Masukkan nama database target Anda.
   * **Username**: User database MySQL cPanel Anda.
   * **Password**: Password user database MySQL Anda.
4. Klik tombol **Inisialisasi & Install Aplikasi**.
5. **Proses yang Dijalankan oleh setup.php**:
   * Menghubungkan ke MySQL Engine dan membuat database target baru (jika belum ada) menggunakan PHP PDO.
   * Menghasilkan berkas konfigurasi `.env` secara real-time di folder core.
   * Menghubungkan autoload PHP dan menjalankan struktur tabel migrasi database Laravel serta menyuntikkan administrator awal.
6. Setelah status menunjukkan **✔ STARBILLING BERHASIL DIKONFIGURASI & AKTIF!**, segera **HAPUS** file `setup.php` dari folder `public_html` Anda demi keamanan web dari eksploitasi pihak luar.

---

## 🔑 4. Sistem Server Generate Lisensi (Terpisah / SaaS Backend)
### *Prinsip: "sourcode lisensi jangan di gabung dalam aplikasi ini"*

Sesuai dengan instruksi keamanan industri, **Source Code Server Lisensi (Generator & Verifikator Pusat) dipisahkan secara penuh** dari sistem client StarBilling. Aplikasi klien StarBilling hanya akan melakukan REST API Request ke server perizinan pusat ini secara eksternal.

### Struktur Pemisahan Repositori / File
*   **Aplikasi Klien (StarBilling)**: Berisi modul validasi ringan (Middleware) yang mengirimkan parameter request verifikasi ke API eksternal dan memverifikasi tanda tangan digital (SHA-256 digital signature) untuk mencegah pemalsuan lokal.
*   **Server Lisensi (Separate Backend)**: Berkas backend mandiri `server.php` berbasis PHP PDO yang dihosting pada VPS/Server perizinan khusus Anda sendiri (misal: `https://licensing.starbilling.net/server.php`).

### Fitur Kode Server Lisensi Terpisah (`server.php`):
1.  **Database Independen**: Beroperasi pada database MySQL terpisah (`starbilling_licensing`) dan memiliki tabel `licenses` untuk mengelola serial key, nama pemilik, batas maksimal pelanggan, status aktivasi, dan masa berlaku.
2.  **Auto-Schema Creator (Zero-Config)**: Tabel database perizinan akan dibuat otomatis pada eksekusi pertama saat berkas ditempatkan di server lisensi Anda.
3.  **Digital Cryptographic Sign**: Menghasilkan hash tanda tangan SHA-256 unik berdasarkan kombinasi kunci lisensi, limit pelanggan, masa berlaku, dan Salt rahasia untuk menangkal upaya bypass lokal dari sisi klien.
4.  **Sandbox REST API Tester**: Diintegrasikan di dalam dasbor pengaturan agar administrator dapat melakukan pengujian simulasi permintaan verifikasi secara interaktif, lengkap dengan visualisasi log transaksi dan respon JSON HTTP.

### Cara Memasang Server Lisensi Terpisah:
1. Buka sub-tab **Server Lisensi (Terpisah)** di panel pengaturan aplikasi.
2. Klik tombol **Unduh server.php** untuk mengunduh kode backend lisensi yang berdiri sendiri.
3. Unggah berkas `server.php` tersebut ke server VPS/Hosting khusus lisensi Anda.
4. Sesuaikan konstanta konfigurasi database di baris atas kode `server.php`:
   ```php
   define('DB_HOST', '127.0.0.1');
   define('DB_NAME', 'starbilling_licensing');
   define('DB_USER', 'licensing_user');
   define('DB_PASS', 'PasswordDatabaseLisensiAnda');
   ```
5. Server Lisensi terpisah Anda kini aktif dan siap melayani permintaan otorisasi dari seluruh klien StarBilling secara terpusat!

---
*Dokumentasi ini disusun dengan standar operasional telekomunikasi berkualitas tinggi untuk mempermudah pemasangan oleh tim deployment StarBilling ISP.*
