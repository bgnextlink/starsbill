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
