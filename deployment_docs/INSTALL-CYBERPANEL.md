# Deployment Guide: CyberPanel (OpenLiteSpeed)

Panduan ini menjelaskan cara melakukan deployment StarBilling ISP pada server yang menggunakan CyberPanel dan OpenLiteSpeed.

## 1. Persiapan CyberPanel
1. Login ke CyberPanel (https://<IP>:8090).
2. Buat Website baru untuk domain Anda (misal: `starbilling.net`).
3. Pastikan PHP 8.3 atau 8.4 dipilih.

## 2. Upload Source Code
1. Masuk ke menu **File Manager** untuk website yang baru dibuat.
2. Navigasi ke direktori `/home/domainanda.com/public_html`.
3. Hapus file `index.html` bawaan.
4. Upload source code StarBilling ke direktori ini.

## 3. Konfigurasi Environment (.env)
1. Copy file `.env.production` menjadi `.env`.
2. Sesuaikan konfigurasi database yang telah Anda buat di CyberPanel:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=nama_database
   DB_USERNAME=user_database
   DB_PASSWORD=password_database
   ```
3. Konfigurasi Redis (jika tersedia):
   ```env
   CACHE_DRIVER=redis
   QUEUE_CONNECTION=redis
   SESSION_DRIVER=redis
   REDIS_HOST=127.0.0.1
   REDIS_PASSWORD=null
   REDIS_PORT=6379
   ```

## 4. Install Dependencies
Buka terminal/SSH, masuk ke direktori web:
```bash
cd /home/domainanda.com/public_html
composer install --optimize-autoloader --no-dev
npm install
npm run build
```

## 5. Konfigurasi OpenLiteSpeed (Rewrite Rules)
1. Buka konfigurasi vHost di CyberPanel (Websites > List Websites > Manage > vHost Conf).
2. Tambahkan Rewrite Rules berikut:
```apache
rewrite  {
  enable  1
  autoLoadHtaccess  1
}

context / {
  location          $DOC_ROOT/public/
  allowBrowse       1
  rewrite  {
    RewriteFile .htaccess
  }
}
```
3. Restart OpenLiteSpeed.

## 6. Setup Worker & Cron (Supervisor)
1. Install Supervisor: `apt install supervisor`
2. Buat konfigurasi worker `/etc/supervisor/conf.d/starbilling-worker.conf` (Gunakan file dari folder `deploy/supervisor/`).
3. Update dan mulai supervisor:
   ```bash
   supervisorctl reread
   supervisorctl update
   supervisorctl start starbilling-worker:*
   ```
4. Tambahkan Cron Job di CyberPanel (Websites > List Websites > Manage > Cron Jobs):
   ```bash
   * * * * * /usr/local/lsws/lsphp83/bin/php /home/domainanda.com/public_html/artisan schedule:run >> /dev/null 2>&1
   ```

## 7. Migrasi & Optimasi
```bash
php artisan key:generate
php artisan migrate --seed
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Status: **READY FOR CYBERPANEL PRODUCTION**
