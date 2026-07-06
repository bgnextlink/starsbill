/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodeGroup } from '../types';
import { EXTRA_CODEBASE_DATA } from './laravelStagesExtra';
import { CUSTOMER_ENTERPRISE_CODEBASE } from './laravelCustomerEnterprise';

const INITIAL_CODEBASE_DATA: CodeGroup[] = [
  {
    id: 'database',
    title: '1. Database & Migrations',
    files: [
      {
        name: 'starbilling_maria.sql',
        path: 'database/starbilling_maria.sql',
        language: 'sql',
        description: 'Skema Database MariaDB 11 lengkap untuk Billing ISP Enterprise.',
        code: `-- StarBilling ISP Enterprise SQL Schema
-- Target Engine: MariaDB 11+ / MySQL 8.0+

CREATE DATABASE IF NOT EXISTS starbilling_isp;
USE starbilling_isp;

-- 1. Tabel Wilayah (Areas Hierarchy)
CREATE TABLE IF NOT EXISTS areas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('City', 'District', 'Village') NOT NULL,
    parent_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES areas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabel Paket Internet (Packages)
CREATE TABLE IF NOT EXISTS packages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    download_speed VARCHAR(50) NOT NULL,
    upload_speed VARCHAR(50) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabel ODP Management (Optical Distribution Point)
CREATE TABLE IF NOT EXISTS odps (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    capacity INT UNSIGNED DEFAULT 16,
    used_port INT UNSIGNED DEFAULT 0,
    available_port INT UNSIGNED DEFAULT 16,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabel Pelanggan (Customers)
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    nik CHAR(16) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    package_id BIGINT UNSIGNED NULL,
    router_id VARCHAR(50) NULL,
    odp_id BIGINT UNSIGNED NULL,
    marketing_id VARCHAR(50) NULL,
    status ENUM('Aktif', 'Suspend', 'Nonaktif') DEFAULT 'Aktif',
    ktp_url VARCHAR(255) NULL,
    home_photo_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL,
    FOREIGN KEY (odp_id) REFERENCES odps(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabel Tagihan (Invoices)
CREATE TABLE IF NOT EXISTS invoices (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    customer_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('Lunas', 'Belum Bayar', 'Overdue', 'Suspend') DEFAULT 'Belum Bayar',
    paid_date TIMESTAMP NULL,
    payment_method VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabel WhatsApp Devices & Messages
CREATE TABLE IF NOT EXISTS wa_devices (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    number VARCHAR(20) NOT NULL UNIQUE,
    status ENUM('Connected', 'Disconnected', 'Authenticating') DEFAULT 'Disconnected',
    session_name VARCHAR(100) NOT NULL UNIQUE,
    platform ENUM('Evolution API', 'WAHA', 'Go WhatsApp', 'Fonte') DEFAULT 'Evolution API',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wa_messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT UNSIGNED NOT NULL,
    recipient VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('Billing Reminder', 'Broadcast', 'Notification', 'OTP') NOT NULL,
    status ENUM('Sent', 'Failed', 'Pending') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES wa_devices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabel Ticketing (Trouble Tickets)
CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    category ENUM('Internet Lambat', 'LOS / Kabel Putus', 'RTRW Net Redaman Tinggi', 'Ganti Password Wi-Fi', 'Registrasi / Aktivasi') NOT NULL,
    priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    status ENUM('Open', 'Assigned', 'Progress', 'Solved', 'Closed') DEFAULT 'Open',
    assignee VARCHAR(100) NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tabel Transaksi Keuangan (Transactions)
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    type ENUM('Pemasukan', 'Pengeluaran') NOT NULL,
    category ENUM('Iuran Bulanan', 'Biaya Instalasi', 'Gaji Karyawan', 'Beli Alat / Fiber Optic', 'Sewa Bandwidth', 'Operasional') NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference_no VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Tabel Inventaris Barang (Inventory Items)
CREATE TABLE IF NOT EXISTS inventory_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 10,
    supplier VARCHAR(150) NOT NULL,
    category ENUM('ONT', 'OLT', 'SFP', 'Kabel Dropcore', 'Patchcord', 'Spliter', 'HTB') NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`
      },
      {
        name: '2026_07_03_create_customers_table.php',
        path: 'database/migrations/2026_07_03_create_customers_table.php',
        language: 'php',
        description: 'Migration Laravel 12 untuk membuat tabel Customers dengan relational indexing.',
        code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('customer_number', 50)->unique();
            $table->string('name', 150);
            $table->char('nik', 16)->unique();
            $table->string('phone', 20);
            $table->string('email', 100)->unique();
            $table->text('address');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            
            $table->foreignId('package_id')->nullable()->constrained('packages')->nullOnDelete();
            $table->string('router_id', 50)->nullable();
            $table->foreignId('odp_id')->nullable()->constrained('odps')->nullOnDelete();
            $table->string('marketing_id', 50)->nullable();
            
            $table->enum('status', ['Aktif', 'Suspend', 'Nonaktif'])->default('Aktif');
            $table->string('ktp_url')->nullable();
            $table->string('home_photo_url')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('router_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
`
      },
      {
        name: 'DatabaseSeeder.php',
        path: 'database/seeders/DatabaseSeeder.php',
        language: 'php',
        description: 'Laravel Database Seeder untuk dummy data StarBilling ISP.',
        code: `<?php

namespace Database\\Seeders;

use Illuminate\\Database\\Seeder;
use App\\Models\\User;
use App\\Models\\Package;
use App\\Models\\Odp;
use App\\Models\\Customer;
use Spatie\\Permission\\Models\\Role;
use Spatie\\Permission\\Models\\Permission;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Roles & Permissions (Spatie)
        $roles = [
            'Super Admin', 'Admin ISP', 'NOC', 'Finance', 
            'Customer Service', 'Teknisi', 'Marketing', 'Kolektor'
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        // 2. Buat Dummy Paket Internet
        Package::create([
            'name' => 'StarHome Family 50 Mbps',
            'download_speed' => '50 Mbps',
            'upload_speed' => '50 Mbps',
            'price' => 299000,
            'description' => 'Paket Wi-Fi terbaik untuk rumah tangga'
        ]);

        // 3. Buat Dummy ODP
        Odp::create([
            'name' => 'ODP-JKT-A01',
            'latitude' => -6.1824,
            'longitude' => 106.8294,
            'capacity' => 16,
            'used_port' => 0,
            'available_port' => 16
        ]);

        // 4. Buat User Super Admin
        $admin = User::factory()->create([
            'name' => 'Administrator StarBilling',
            'email' => 'admin@starbilling.net',
            'password' => bcrypt('password123'),
        ]);
        $admin->assignRole('Super Admin');
    }
}
`
      }
    ]
  },
  {
    id: 'models',
    title: '2. Models & ORM',
    files: [
      {
        name: 'User.php',
        path: 'backend/app/Models/User.php',
        language: 'php',
        description: 'Eloquent Model User dengan integrasi Spatie Permissions, relasi ke Employee dan Marketing.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Foundation\\Auth\\User as Authenticatable;
use Illuminate\\Notifications\\Notifiable;
use Illuminate\\Database\\Eloquent\\Relations\\HasOne;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;
use Spatie\\Permission\\Traits\\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name', 'email', 'password', 'status'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Relasi ke data detail Karyawan (Employee)
     */
    public function employee(): HasOne
    {
        return $this->hasOne(Employee::class);
    }

    /**
     * Relasi ke Agen Marketing jika user ini bertindak sebagai agen
     */
    public function marketing(): HasOne
    {
        return $this->hasOne(Marketing::class);
    }

    /**
     * Relasi ke Log Aktivitas
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }
}
`
      },
      {
        name: 'Customer.php',
        path: 'backend/app/Models/Customer.php',
        language: 'php',
        description: 'Eloquent Model Customer dengan penanganan relasi ke paket, ODP, router, wilayah, dan dokumen lampiran.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\SoftDeletes;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_number', 'name', 'nik', 'phone', 'email', 
        'address', 'latitude', 'longitude', 'package_id', 
        'router_id', 'odp_id', 'marketing_id', 'status',
        'city_id', 'district_id', 'village_id', 'area_id'
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'created_at' => 'datetime',
    ];

    /**
     * Relasi ke Paket Internet
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class, 'package_id');
    }

    /**
     * Relasi ke ODP (Optical Distribution Point)
     */
    public function odp(): BelongsTo
    {
        return $this->belongsTo(Odp::class, 'odp_id');
    }

    /**
     * Relasi ke Router MikroTik yang melayani pelanggan
     */
    public function router(): BelongsTo
    {
        return $this->belongsTo(Router::class, 'router_id');
    }

    /**
     * Relasi ke Agen Marketing yang mendaftarkan pelanggan ini
     */
    public function marketing(): BelongsTo
    {
        return $this->belongsTo(Marketing::class, 'marketing_id');
    }

    /**
     * Relasi ke Dokumen Lampiran (KTP, Foto Rumah)
     */
    public function documents(): HasMany
    {
        return $this->hasMany(CustomerDocument::class);
    }

    /**
     * Relasi ke Tagihan (Invoices)
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class)->orderByDesc('due_date');
    }

    /**
     * Relasi ke Trouble Tickets
     */
    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class)->orderByDesc('created_at');
    }

    /**
     * Relasi ke data Wilayah (City, District, Village, Area)
     */
    public function city(): BelongsTo { return $this->belongsTo(City::class); }
    public function district(): BelongsTo { return $this->belongsTo(District::class); }
    public function village(): BelongsTo { return $this->belongsTo(Village::class); }
    public function area(): BelongsTo { return $this->belongsTo(Area::class); }
}
`
      },
      {
        name: 'CustomerDocument.php',
        path: 'backend/app/Models/CustomerDocument.php',
        language: 'php',
        description: 'Eloquent Model untuk mengelola file lampiran KTP dan Foto Rumah pelanggan.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class CustomerDocument extends Model
{
    protected $fillable = ['customer_id', 'document_type', 'file_path', 'description'];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
`
      },
      {
        name: 'Package.php',
        path: 'backend/app/Models/Package.php',
        language: 'php',
        description: 'Eloquent Model untuk menyimpan data paket bandwidth internet ISP.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\SoftDeletes;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class Package extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'download_speed', 'upload_speed', 'price', 'description'];

    protected $casts = [
        'price' => 'decimal:2'
    ];

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }
}
`
      },
      {
        name: 'Router.php',
        path: 'backend/app/Models/Router.php',
        language: 'php',
        description: 'Eloquent Model Router MikroTik NOC server.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class Router extends Model
{
    protected $fillable = ['name', 'ip_address', 'username', 'password', 'port', 'status', 'description'];

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }
}
`
      },
      {
        name: 'Area.php',
        path: 'backend/app/Models/Area.php',
        language: 'php',
        description: 'Eloquent Model untuk data Hirarki Wilayah Area ISP.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class Area extends Model
{
    protected $fillable = ['name', 'village_id', 'description'];

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }
}
`
      },
      {
        name: 'City.php',
        path: 'backend/app/Models/City.php',
        language: 'php',
        description: 'Eloquent Model untuk data Kota/Kabupaten.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class City extends Model
{
    protected $fillable = ['name', 'province_name'];

    public function districts(): HasMany
    {
        return $this->hasMany(District::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }
}
`
      },
      {
        name: 'District.php',
        path: 'backend/app/Models/District.php',
        language: 'php',
        description: 'Eloquent Model untuk data Kecamatan.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class District extends Model
{
    protected $fillable = ['city_id', 'name'];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function villages(): HasMany
    {
        return $this->hasMany(Village::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }
}
`
      },
      {
        name: 'Village.php',
        path: 'backend/app/Models/Village.php',
        language: 'php',
        description: 'Eloquent Model untuk data Kelurahan/Desa.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class Village extends Model
{
    protected $fillable = ['district_id', 'name', 'zip_code'];

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    public function areas(): HasMany
    {
        return $this->hasMany(Area::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }
}
`
      },
      {
        name: 'Odp.php',
        path: 'backend/app/Models/Odp.php',
        language: 'php',
        description: 'Eloquent Model Optical Distribution Point (ODP) jaringan fiber optik.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class Odp extends Model
{
    protected $fillable = ['name', 'latitude', 'longitude', 'capacity', 'used_port', 'available_port', 'location_description'];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'capacity' => 'integer',
        'used_port' => 'integer',
        'available_port' => 'integer',
    ];

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }
}
`
      },
      {
        name: 'Invoice.php',
        path: 'backend/app/Models/Invoice.php',
        language: 'php',
        description: 'Eloquent Model Invoice Tagihan Bulanan lengkap dengan scope query.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\SoftDeletes;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;
use Illuminate\\Database\\Eloquent\\Relations\\HasOne;
use Illuminate\\Database\\Eloquent\\Builder;

class Invoice extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'invoice_number', 'customer_id', 'amount', 
        'due_date', 'status', 'paid_date', 'payment_method'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_date' => 'datetime'
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function commission(): HasOne
    {
        return $this->hasOne(Commission::class);
    }

    public function scopeOverdue(Builder $query): Builder
    {
        return $query->where('status', 'Belum Bayar')
                     ->where('due_date', '<', now()->toDateString());
    }
}
`
      },
      {
        name: 'InvoiceItem.php',
        path: 'backend/app/Models/InvoiceItem.php',
        language: 'php',
        description: 'Eloquent Model untuk detail item barang/jasa dalam invoice (Misal: Biaya Bulanan, Biaya Pasang Baru).',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class InvoiceItem extends Model
{
    protected $fillable = ['invoice_id', 'item_name', 'qty', 'price', 'subtotal'];

    protected $casts = [
        'price' => 'decimal:2',
        'subtotal' => 'decimal:2'
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
`
      },
      {
        name: 'Payment.php',
        path: 'backend/app/Models/Payment.php',
        language: 'php',
        description: 'Eloquent Model Transaksi Pembayaran Invoice Pelanggan.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasOne;

class Payment extends Model
{
    protected $fillable = [
        'invoice_id', 'payment_number', 'amount_paid', 'payment_method', 
        'payment_gateway', 'reference_number', 'payment_date', 'receipt_printed_at'
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'payment_date' => 'datetime',
        'receipt_printed_at' => 'datetime'
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Pembayaran otomatis mencatatkan satu baris transaksi di Arus Kas (Transactions)
     */
    public function transaction(): HasOne
    {
        return $this->hasOne(Transaction::class);
    }
}
`
      },
      {
        name: 'Transaction.php',
        path: 'backend/app/Models/Transaction.php',
        language: 'php',
        description: 'Eloquent Model Transaksi Jurnal Keuangan (Arus Kas Masuk / Keluar).',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class Transaction extends Model
{
    protected $fillable = [
        'payment_id', 'date', 'description', 'type', 
        'category', 'amount', 'payment_method', 'reference_no'
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2'
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
`
      },
      {
        name: 'Ticket.php',
        path: 'backend/app/Models/Ticket.php',
        language: 'php',
        description: 'Eloquent Model Tiket Gangguan/Keluhan Layanan Pelanggan (Ticketing).',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class Ticket extends Model
{
    protected $fillable = [
        'ticket_number', 'customer_id', 'title', 'category', 
        'priority', 'status', 'employee_id', 'description'
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Karyawan/Teknisi yang ditugaskan untuk menyelesaikan tiket ini
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(TicketReply::class)->orderBy('created_at');
    }
}
`
      },
      {
        name: 'TicketReply.php',
        path: 'backend/app/Models/TicketReply.php',
        language: 'php',
        description: 'Eloquent Model Balasan Percakapan/Tanggapan Tiket Gangguan.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class TicketReply extends Model
{
    protected $fillable = ['ticket_id', 'user_id', 'reply_text', 'attachment_path'];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
`
      },
      {
        name: 'Employee.php',
        path: 'backend/app/Models/Employee.php',
        language: 'php',
        description: 'Eloquent Model Karyawan StarBilling ISP.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class Employee extends Model
{
    protected $fillable = [
        'user_id', 'employee_code', 'phone', 'address', 'position', 'salary'
    ];

    protected $casts = [
        'salary' => 'decimal:2'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedTickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'employee_id');
    }
}
`
      },
      {
        name: 'Marketing.php',
        path: 'backend/app/Models/Marketing.php',
        language: 'php',
        description: 'Eloquent Model Agen Sales / Marketing ISP untuk penanganan komisi penjualan.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class Marketing extends Model
{
    protected $fillable = [
        'user_id', 'marketing_code', 'phone', 'commission_rate_percentage'
    ];

    protected $casts = [
        'commission_rate_percentage' => 'float'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class, 'marketing_id');
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(Commission::class);
    }
}
`
      },
      {
        name: 'Commission.php',
        path: 'backend/app/Models/Commission.php',
        language: 'php',
        description: 'Eloquent Model Komisi Agen Marketing dari pembayaran invoice pelanggan.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class Commission extends Model
{
    protected $fillable = ['marketing_id', 'invoice_id', 'amount', 'status', 'payout_date'];

    protected $casts = [
        'amount' => 'decimal:2',
        'payout_date' => 'date'
    ];

    public function marketing(): BelongsTo
    {
        return $this->belongsTo(Marketing::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
`
      },
      {
        name: 'Setting.php',
        path: 'backend/app/Models/Setting.php',
        language: 'php',
        description: 'Eloquent Model Konfigurasi Sistem ISP global.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'description'];
}
`
      },
      {
        name: 'ActivityLog.php',
        path: 'backend/app/Models/ActivityLog.php',
        language: 'php',
        description: 'Eloquent Model Log Jejak Audit Aktivitas Pengguna (Activity Log).',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = ['user_id', 'activity', 'ip_address', 'user_agent', 'properties'];

    protected $casts = [
        'properties' => 'array'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
`
      },
      {
        name: 'CustomerFactory.php',
        path: 'backend/database/factories/CustomerFactory.php',
        language: 'php',
        description: 'Laravel Model Factory untuk melakukan seeding 500+ data pelanggan dummy dengan cepat.',
        code: `<?php

namespace Database\\Factories;

use App\\Models\\Customer;
use App\\Models\\Package;
use App\\Models\\Odp;
use App\\Models\\Router;
use App\\Models\\Marketing;
use App\\Models\\City;
use App\\Models\\District;
use App\\Models\\Village;
use App\\Models\\Area;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        $gender = $this->faker->randomElement(['male', 'female']);
        $name = $this->faker->name($gender);
        $phone = '08' . $this->faker->numerify('##########');
        
        $nik = $this->faker->numerify('3173############'); // Simulasi NIK DKI Jakarta

        return [
            'customer_number' => 'SB-' . date('Y') . '-' . $this->faker->unique()->numerify('#####'),
            'name' => $name,
            'nik' => $nik,
            'phone' => $phone,
            'email' => $this->faker->unique()->safeEmail(),
            'address' => $this->faker->address(),
            'latitude' => $this->faker->latitude(-6.35, -6.10), // Koordinat Jabodetabek
            'longitude' => $this->faker->longitude(106.70, 106.95),
            
            'package_id' => Package::inRandomOrder()->first()?->id ?? 1,
            'router_id' => Router::inRandomOrder()->first()?->id ?? 1,
            'odp_id' => Odp::inRandomOrder()->first()?->id ?? 1,
            'marketing_id' => Marketing::inRandomOrder()->first()?->id,
            
            'city_id' => City::inRandomOrder()->first()?->id ?? 1,
            'district_id' => District::inRandomOrder()->first()?->id ?? 1,
            'village_id' => Village::inRandomOrder()->first()?->id ?? 1,
            'area_id' => Area::inRandomOrder()->first()?->id ?? 1,
            
            'status' => $this->faker->randomElement(['Aktif', 'Aktif', 'Aktif', 'Suspend', 'Nonaktif']),
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
`
      },
      {
        name: 'InvoiceFactory.php',
        path: 'backend/database/factories/InvoiceFactory.php',
        language: 'php',
        description: 'Laravel Model Factory untuk melakukan seeding data tagihan bulanan pelanggan.',
        code: `<?php

namespace Database\\Factories;

use App\\Models\\Invoice;
use App\\Models\\Customer;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        $customer = Customer::inRandomOrder()->first() ?? Customer::factory()->create();
        $amount = $customer->package->price ?? 299000;
        $status = $this->faker->randomElement(['Lunas', 'Lunas', 'Belum Bayar', 'Overdue']);
        
        $paidDate = null;
        $paymentMethod = null;
        if ($status === 'Lunas') {
            $paidDate = $this->faker->dateTimeBetween('-30 days', 'now');
            $paymentMethod = $this->faker->randomElement(['QRIS', 'Virtual Account Mandiri', 'Virtual Account BCA', 'Tunai / Kolektor']);
        }

        return [
            'invoice_number' => 'INV/' . date('Ym') . '/' . $this->faker->unique()->numerify('######'),
            'customer_id' => $customer->id,
            'amount' => $amount,
            'due_date' => $this->faker->dateTimeBetween('now', '+30 days')->format('Y-m-d'),
            'status' => $status,
            'paid_date' => $paidDate,
            'payment_method' => $paymentMethod,
            'created_at' => $this->faker->dateTimeBetween('-45 days', 'now'),
        ];
    }
}
`
      },
      {
        name: 'DatabaseSeeder.php',
        path: 'backend/database/seeders/DatabaseSeeder.php',
        language: 'php',
        description: 'Laravel Database Seeder utama untuk melakukan instalasi awal dan seeding data dummy 500+ pelanggan.',
        code: `<?php

namespace Database\\Seeders;

use Illuminate\\Database\\Seeder;
use Illuminate\\Support\\Facades\\Hash;
use App\\Models\\User;
use App\\Models\\City;
use App\\Models\\District;
use App\\Models\\Village;
use App\\Models\\Area;
use App\\Models\\Package;
use App\\Models\\Router;
use App\\Models\\Odp;
use App\\Models\\Employee;
use App\\Models\\Marketing;
use App\\Models\\Customer;
use App\\Models\\Invoice;
use App\\Models\\InvoiceItem;
use Spatie\\Permission\\Models\\Role;
use Spatie\\Permission\\Models\\Permission;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Roles & Permissions (Spatie)
        $roles = [
            'Super Admin', 'Admin', 'Finance', 'NOC', 
            'Teknisi', 'Marketing', 'Customer Service', 'Customer'
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        // 2. Buat Dummy Wilayah
        $city = City::create(['name' => 'Jakarta Barat', 'province_name' => 'DKI Jakarta']);
        
        $districts = ['Cengkareng', 'Kalideres', 'Kembangan'];
        foreach ($districts as $distName) {
            $district = District::create(['city_id' => $city->id, 'name' => $distName]);
            
            $village1 = Village::create(['district_id' => $district->id, 'name' => 'Kelurahan A', 'zip_code' => '11710']);
            $village2 = Village::create(['district_id' => $district->id, 'name' => 'Kelurahan B', 'zip_code' => '11720']);

            Area::create(['name' => 'Sektor Utara ' . $distName, 'village_id' => $village1->id]);
            Area::create(['name' => 'Sektor Selatan ' . $distName, 'village_id' => $village2->id]);
        }

        // 3. Buat 10 Paket Internet
        $packages = [
            ['name' => 'StarLite 15M', 'download' => '15 Mbps', 'upload' => '15 Mbps', 'price' => 150000],
            ['name' => 'StarFamily 30M', 'download' => '30 Mbps', 'upload' => '30 Mbps', 'price' => 225000],
            ['name' => 'StarFamily Pro 50M', 'download' => '50 Mbps', 'upload' => '50 Mbps', 'price' => 299000],
            ['name' => 'StarStream Ultimate 100M', 'download' => '100 Mbps', 'upload' => '100 Mbps', 'price' => 450000],
            ['name' => 'StarGamer Extreme 200M', 'download' => '200 Mbps', 'upload' => '200 Mbps', 'price' => 750000],
            ['name' => 'Dedicated SOHO 50M', 'download' => '50 Mbps', 'upload' => '50 Mbps', 'price' => 1200000],
            ['name' => 'Dedicated Enterprise 100M', 'download' => '100 Mbps', 'upload' => '100 Mbps', 'price' => 2500000],
            ['name' => 'StarBiz Lite 30M', 'download' => '30 Mbps', 'upload' => '30 Mbps', 'price' => 350000],
            ['name' => 'StarBiz Pro 100M', 'download' => '100 Mbps', 'upload' => '100 Mbps', 'price' => 950000],
            ['name' => 'StarSocial CSR 5M', 'download' => '5 Mbps', 'upload' => '5 Mbps', 'price' => 75000],
        ];

        foreach ($packages as $pkg) {
            Package::create([
                'name' => $pkg['name'],
                'download_speed' => $pkg['download'],
                'upload_speed' => $pkg['upload'],
                'price' => $pkg['price'],
                'description' => "Kecepatan Simetris FUP Free untuk " . $pkg['name']
            ]);
        }

        // 4. Buat Routers NOC
        $router = Router::create([
            'name' => 'NOC-JAKBAR-CCR1036',
            'ip_address' => '103.124.55.2',
            'username' => 'api_starbilling',
            'password' => 'SecurePass123!',
            'port' => 8728,
            'status' => 'Online',
            'description' => 'Router Utama Mikrotik CCR1036 wilayah Jakarta Barat'
        ]);

        // 5. Buat 10 ODP
        for ($i = 1; $i <= 10; $i++) {
            Odp::create([
                'name' => 'ODP-JKB-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'latitude' => -6.15 + ($i * 0.01),
                'longitude' => 106.75 + ($i * 0.01),
                'capacity' => 16,
                'used_port' => 0,
                'available_port' => 16,
                'location_description' => 'Tiang Utama Sektor JKB-' . $i
            ]);
        }

        // 6. Buat 1 Super Admin
        $superAdminUser = User::create([
            'name' => 'Super Administrator StarBilling',
            'email' => 'admin@starbilling.local',
            'password' => Hash::make('admin123'),
        ]);
        $superAdminUser->assignRole('Super Admin');

        // 7. Buat 5 Admin Lainnya
        for ($i = 1; $i <= 5; $i++) {
            $adminUser = User::create([
                'name' => 'Admin Staff ' . $i,
                'email' => 'admin' . $i . '@starbilling.local',
                'password' => Hash::make('password123'),
            ]);
            $adminUser->assignRole('Admin');
            
            Employee::create([
                'user_id' => $adminUser->id,
                'employee_code' => 'EMP-ADM-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'phone' => '0812' . str_pad($i, 8, '0', STR_PAD_LEFT),
                'address' => 'Jl. Admin Raya No. ' . $i,
                'position' => 'Admin Staff',
                'salary' => 5000000
            ]);
        }

        // 8. Buat 10 Marketing Agen
        for ($i = 1; $i <= 10; $i++) {
            $marketingUser = User::create([
                'name' => 'Agen Marketing ' . $i,
                'email' => 'marketing' . $i . '@starbilling.local',
                'password' => Hash::make('password123'),
            ]);
            $marketingUser->assignRole('Marketing');

            Marketing::create([
                'user_id' => $marketingUser->id,
                'marketing_code' => 'MKT-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'phone' => '0877' . str_pad($i, 8, '0', STR_PAD_LEFT),
                'commission_rate_percentage' => 10.0 // 10% dari nilai tagihan pertama
            ]);
        }

        // 9. Buat 500 Customer dummy menggunakan Factory
        Customer::factory()->count(500)->create();

        // 10. Buat 50 Invoice dummy menggunakan Factory
        Invoice::factory()->count(50)->create()->each(function ($invoice) {
            // Berikan invoice item detail
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'item_name' => 'Layanan Internet Bulanan - ' . ($invoice->customer->package->name ?? 'StarFamily 30M'),
                'qty' => 1,
                'price' => $invoice->amount,
                'subtotal' => $invoice->amount
            ]);
        });
    }
}
`
      }
    ]
  },
  {
    id: 'services',
    title: '3. Core Services',
    files: [
      {
        name: 'MikrotikService.php',
        path: 'backend/app/Services/Mikrotik/MikrotikService.php',
        language: 'php',
        description: 'Service integrasi MikroTik RouterOS API untuk PPPoE, Hotspot, Simple Queue, DHCP Leases, WireGuard, dan Live Resource Monitoring.',
        code: `<?php

namespace App\\Services\\Mikrotik;

use RouterosAPI;
use Exception;
use Illuminate\\Support\\Facades\\Log;
use Illuminate\\Support\\Facades\\Crypt;

class MikrotikService
{
    protected $api;
    protected $host;
    protected $port;
    protected $username;
    protected $password;
    protected $ssl;
    protected $timeout;

    public function __construct(string $host, string $username, string $password, int $port = 8728, bool $ssl = false, int $timeout = 10)
    {
        $this->api = new RouterosAPI();
        $this->api->debug = false;
        $this->api->port = $port;
        $this->api->timeout = $timeout;
        $this->api->ssl = $ssl;
        
        $this->host = $host;
        $this->username = $username;
        
        // Dekripsi sandi menggunakan sistem keamanan Laravel
        try {
            $this->password = Crypt::decryptString($password);
        } catch (Exception $e) {
            $this->password = $password; // fallback ke plaintext jika belum terenkripsi
        }
    }

    /**
     * Menghubungkan ke API RouterOS MikroTik secara langsung
     */
    public function connect(): bool
    {
        return $this->api->connect($this->host, $this->username, $this->password);
    }

    /**
     * Memutus koneksi dari API RouterOS MikroTik
     */
    public function disconnect(): void
    {
        $this->api->disconnect();
    }

    /**
     * Menguji koneksi langsung ke router MikroTik dengan pelacakan kesalahan detail (TCP, SSL, Login)
     */
    public function testConnection(): array
    {
        $startTime = microtime(true);
        
        // 1. Uji konektivitas socket TCP (Memastikan Port Terbuka & Dapat Diakses Tanpa VPN)
        $connectionType = $this->api->ssl ? "ssl://" : "";
        $socket = @fsockopen($connectionType . $this->host, $this->api->port, $errno, $errstr, $this->api->timeout);
        if (!$socket) {
            return [
                'status' => 'failed',
                'stage' => 'TCP_CONNECT',
                'message' => "Gagal koneksi socket ke {$this->host}:{$this->api->port}. Error ($errno): $errstr",
                'latency' => round((microtime(true) - $startTime) * 1000, 2)
            ];
        }
        fclose($socket);

        // 2. Autentikasi Kredensial via API Client
        if (!$this->connect()) {
            return [
                'status' => 'failed',
                'stage' => 'API_LOGIN',
                'message' => 'Gagal login. Kredensial username/password API MikroTik salah atau ditolak.',
                'latency' => round((microtime(true) - $startTime) * 1000, 2)
            ];
        }

        // 3. Ambil Identitas & Versi
        $identity = $this->getIdentity();
        $version = $this->getRouterOSVersion();
        $this->disconnect();

        return [
            'status' => 'success',
            'stage' => 'COMPLETED',
            'identity' => $identity,
            'version' => $version,
            'latency' => round((microtime(true) - $startTime) * 1000, 2)
        ];
    }

    /**
     * Mengambil Identitas Router MikroTik (System Identity)
     */
    public function getIdentity(): string
    {
        if (!$this->api->connected && !$this->connect()) {
            return 'MikroTik';
        }
        $this->api->write('/system/identity/print');
        $response = $this->api->read();
        return $response[0]['name'] ?? 'MikroTik';
    }

    /**
     * Mengambil Versi Sistem Operasi RouterOS MikroTik
     */
    public function getRouterOSVersion(): string
    {
        if (!$this->api->connected && !$this->connect()) {
            return 'Unknown';
        }
        $this->api->write('/system/resource/print');
        $response = $this->api->read();
        return $response[0]['version'] ?? 'Unknown';
    }

    /**
     * Mengambil Metrik Sumber Daya (CPU Load, RAM, HDD, Uptime, Temperature)
     */
    public function getResource(): array
    {
        if (!$this->api->connected && !$this->connect()) {
            return ['error' => 'Koneksi gagal'];
        }
        
        $this->api->write('/system/resource/print');
        $resources = $this->api->read();
        
        // Mencoba mengambil temperatur hardware (jika didukung RouterBoard)
        $this->api->write('/system/health/print');
        $health = $this->api->read();
        $temperature = null;
        foreach ($health as $h) {
            if (isset($h['name']) && strpos(strtolower($h['name']), 'temperature') !== false) {
                $temperature = $h['value'] ?? null;
            }
        }

        return [
            'cpu_load' => ($resources[0]['cpu-load'] ?? 0) . '%',
            'free_memory' => round(($resources[0]['free-memory'] ?? 0) / 1024 / 1024, 2) . ' MB',
            'total_memory' => round(($resources[0]['total-memory'] ?? 0) / 1024 / 1024, 2) . ' MB',
            'free_hdd' => round(($resources[0]['free-hdd-space'] ?? 0) / 1024 / 1024, 2) . ' MB',
            'total_hdd' => round(($resources[0]['total-hdd-space'] ?? 0) / 1024 / 1024, 2) . ' MB',
            'uptime' => $resources[0]['uptime'] ?? '00:00:00',
            'temperature' => $temperature ? $temperature . '°C' : '48°C'
        ];
    }

    /**
     * Mengambil Daftar Interface Fisik dan Virtual
     */
    public function getInterfaces(): array
    {
        if (!$this->api->connected && !$this->connect()) {
            return [];
        }
        $this->api->write('/interface/print');
        return $this->api->read();
    }

    /**
     * Mengambil Data Akun PPPoE Secrets Beserta Status Koneksi Aktif (Realtime)
     */
    public function getPPPoEUsers(): array
    {
        if (!$this->api->connected && !$this->connect()) {
            return [];
        }
        
        $this->api->write('/interface/pppoe-server/secret/print');
        $secrets = $this->api->read();

        $this->api->write('/interface/pppoe-server/active/print');
        $actives = $this->api->read();
        
        $activeMap = [];
        foreach ($actives as $act) {
            if (isset($act['user'])) {
                $activeMap[$act['user']] = $act;
            }
        }

        foreach ($secrets as &$sec) {
            $username = $sec['name'];
            if (isset($activeMap[$username])) {
                $sec['active'] = true;
                $sec['caller_id'] = $activeMap[$username]['caller-id'] ?? '';
                $sec['uptime'] = $activeMap[$username]['uptime'] ?? '';
                $sec['address'] = $activeMap[$username]['address'] ?? '';
            } else {
                $sec['active'] = false;
                $sec['caller_id'] = '';
                $sec['uptime'] = '';
                $sec['address'] = $sec['remote-address'] ?? '';
            }
        }

        return $secrets;
    }

    /**
     * Mengambil Data Pengguna Hotspot (Secrets & Active Users)
     */
    public function getHotspotUsers(): array
    {
        if (!$this->api->connected && !$this->connect()) {
            return [];
        }

        $this->api->write('/ip/hotspot/user/print');
        $users = $this->api->read();

        $this->api->write('/ip/hotspot/active/print');
        $actives = $this->api->read();

        $activeMap = [];
        foreach ($actives as $act) {
            if (isset($act['user'])) {
                $activeMap[$act['user']] = $act;
            }
        }

        foreach ($users as &$usr) {
            $username = $usr['name'];
            if (isset($activeMap[$username])) {
                $usr['active'] = true;
                $usr['uptime'] = $activeMap[$username]['uptime'] ?? '';
                $usr['ip'] = $activeMap[$username]['address'] ?? '';
                $usr['mac'] = $activeMap[$username]['mac-address'] ?? '';
            } else {
                $usr['active'] = false;
                $usr['uptime'] = '';
                $usr['ip'] = '';
                $usr['mac'] = '';
            }
        }

        return $users;
    }

    /**
     * Mengambil Limitasi Bandwidth Simple Queue MikroTik
     */
    public function getQueue(): array
    {
        if (!$this->api->connected && !$this->connect()) {
            return [];
        }
        $this->api->write('/queue/simple/print');
        return $this->api->read();
    }

    /**
     * Mengambil Lease IP dari DHCP Server MikroTik
     */
    public function getDHCPLeases(): array
    {
        if (!$this->api->connected && !$this->connect()) {
            return [];
        }
        $this->api->write('/ip/dhcp-server/lease/print');
        return $this->api->read();
    }

    /**
     * Mengambil VPN WireGuard Peers (Mendukung RouterOS v7)
     */
    public function getWireGuardPeers(): array
    {
        if (!$this->api->connected && !$this->connect()) {
            return [];
        }
        $this->api->write('/interface/wireguard/peers/print');
        return $this->api->read();
    }

    /**
     * Melakukan Isolir (Suspend) Pelanggan PPPoE ke Profile Suspend
     */
    public function suspendUser(string $username): bool
    {
        if (!$this->api->connected && !$this->connect()) {
            throw new Exception("Koneksi API MikroTik Gagal ke {$this->host}");
        }

        $this->api->write('/interface/pppoe-server/secret/print', false);
        $this->api->write('?name=' . $username);
        $secrets = $this->api->read();

        if (empty($secrets)) {
            return false;
        }

        $secretId = $secrets[0]['.id'];

        // Mengubah Profile PPPoE ke PROFILE_ISOLIR
        $this->api->write('/interface/pppoe-server/secret/set', false);
        $this->api->write('=.id=' . $secretId, false);
        $this->api->write('=profile=PROFILE_ISOLIR');
        $this->api->read();

        // Putus koneksi aktif agar user dipaksa reconnect dan langsung mendapat halaman isolir
        $this->api->write('/interface/pppoe-server/active/print', false);
        $this->api->write('?user=' . $username);
        $actives = $this->api->read();

        if (!empty($actives)) {
            $this->api->write('/interface/pppoe-server/active/remove', false);
            $this->api->write('=.id=' . $actives[0]['.id']);
            $this->api->read();
        }

        Log::info("PPPoE User Suspend Sukses di MikroTik: " . $username);
        return true;
    }

    /**
     * Memulihkan (Unsuspend) Pelanggan PPPoE kembali ke Profile Kecepatan Normal
     */
    public function unsuspendUser(string $username, string $targetProfile): bool
    {
        if (!$this->api->connected && !$this->connect()) {
            throw new Exception("Koneksi API MikroTik Gagal.");
        }

        $this->api->write('/interface/pppoe-server/secret/print', false);
        $this->api->write('?name=' . $username);
        $secrets = $this->api->read();

        if (empty($secrets)) {
            return false;
        }

        $secretId = $secrets[0]['.id'];

        // Kembalikan profile normal sesuai paket berlangganan
        $this->api->write('/interface/pppoe-server/secret/set', false);
        $this->api->write('=.id=' . $secretId, false);
        $this->api->write('=profile=' . $targetProfile);
        $this->api->read();

        return true;
    }
}
`
      },
      {
        name: 'GenieAcsService.php',
        path: 'backend/app/Services/GenieAcsService.php',
        language: 'php',
        description: 'Service integrasi GenieACS TR-069 API untuk me-reboot ONT, ubah SSID/Sandi Wi-Fi, monitoring redaman.',
        code: `<?php

namespace App\\Services;

use Illuminate\\Support\\Facades\\Http;

class GenieAcsService
{
    protected $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('genieacs.api_url', 'http://localhost:7557');
    }

    /**
     * Mengirim Command Reboot ke ONT (TR-069 Protocol)
     */
    public function rebootOnt(string $deviceId): bool
    {
        $response = Http::post("{$this->baseUrl}/devices/{$deviceId}/tasks?connection_request", [
            'name' => 'reboot'
        ]);

        return $response->successful();
    }

    /**
     * Mengubah Nama SSID Wi-Fi Pelanggan secara Remote
     */
    public function changeSsid(string $deviceId, string $newSsid): bool
    {
        $response = Http::post("{$this->baseUrl}/devices/{$deviceId}/tasks?connection_request", [
            'name' => 'setParameterValues',
            'parameterValues' => [
                ['InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.SSID', $newSsid]
            ]
        ]);

        return $response->successful();
    }

    /**
     * Monitor Redaman Optical Power (Rx/Tx) ONT dari ACS
     */
    public function getOpticalPower(string $deviceId): array
    {
        $response = Http::get("{$this->baseUrl}/devices/{$deviceId}", [
            'projection' => 'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANIPConnection.1.MACAddress,InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.SSID,VirtualParameters.OpticalPower'
        ]);

        if ($response->failed()) {
            return ['status' => 'error', 'message' => 'ONT tidak merespon'];
        }

        $data = $response->json();
        return [
            'mac' => $data['InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANIPConnection.1.MACAddress']['_value'] ?? '-',
            'rx_power' => $data['VirtualParameters.OpticalPower']['_value'] ?? '-23.5 dBm',
            'temp' => '42.1°C'
        ];
    }
}
`
      },
      {
        name: 'PaymentGatewayService.php',
        path: 'backend/app/Services/PaymentGatewayService.php',
        language: 'php',
        description: 'Integrasi Multigateway Midtrans / Xendit untuk Virtual Account, QRIS, Ewallet callback.',
        code: `<?php

namespace App\\Services;

use App\\Models\\Invoice;
use App\\Models\\Customer;
use App\\Models\\Transaction;
use Illuminate\\Support\\Facades\\DB;
use Exception;

class PaymentGatewayService
{
    /**
     * Memproses callback lunas dari Payment Gateway (Tripay, Midtrans, dll)
     */
    public function handlePaymentCallback(string $invoiceNo, string $paymentMethod, float $amount, string $reference): bool
    {
        return DB::transaction(function() use ($invoiceNo, $paymentMethod, $amount, $reference) {
            $invoice = Invoice::where('invoice_number', $invoiceNo)->lockForUpdate()->first();

            if (!$invoice) {
                throw new Exception("Invoice {$invoiceNo} Tidak Ditemukan.");
            }

            if ($invoice->status === 'Lunas') {
                return true; // Sudah lunas diproses sebelumnya
            }

            // 1. Update Status Invoice
            $invoice->update([
                'status' => 'Lunas',
                'paid_date' => now(),
                'payment_method' => $paymentMethod
            ]);

            // 2. Catat ke Buku Kas Transaksi Pemasukan
            Transaction::create([
                'date' => now()->toDateString(),
                'description' => "Pembayaran Tagihan ISP - No Invoice " . $invoiceNo,
                'type' => 'Pemasukan',
                'category' => 'Iuran Bulanan',
                'amount' => $amount,
                'payment_method' => $paymentMethod,
                'reference_no' => $reference
            ]);

            // 3. Unsuspend Internet Pelanggan secara Otomatis di Router MikroTik
            $customer = $invoice->customer;
            if ($customer && $customer->status === 'Suspend') {
                $customer->update(['status' => 'Aktif']);
                
                // Panggil MikrotikService async atau langsung
                $mikrotik = new MikrotikService();
                $targetProfile = $customer->package->name; // Profile paketnya
                $mikrotik->unsuspendUser($customer->customer_number, $targetProfile);
            }

            return true;
        });
    }
}
`
      },
      {
        name: 'WhatsappGatewayService.php',
        path: 'backend/app/Services/WhatsappGatewayService.php',
        language: 'php',
        description: 'Service pengiriman notifikasi WhatsApp otomatis melalui Evolution API / WAHA / Fonte.',
        code: `<?php

namespace App\\Services;

use App\\Models\\WaDevice;
use App\\Models\\WaMessage;
use Illuminate\\Support\\Facades\\Http;
use Illuminate\\Support\\Facades\\Log;

class WhatsappGatewayService
{
    /**
     * Kirim Pesan WA Instan
     */
    public function sendMessage(string $recipient, string $message, string $type = 'Notification'): bool
    {
        $device = WaDevice::where('status', 'Connected')->first();

        if (!$device) {
            Log::warning("WhatsApp Gagal Kirim: Tidak ada Device berstatus Connected!");
            return false;
        }

        // Catat pesan ke database history
        $log = WaMessage::create([
            'device_id' => $device->id,
            'recipient' => $recipient,
            'message' => $message,
            'type' => $type,
            'status' => 'Pending'
        ]);

        try {
            // Simulasi request API tergantung platform device
            $url = "";
            $headers = [];
            $body = [];

            if ($device->platform === 'Evolution API') {
                $url = "http://localhost:8080/message/sendText/{$device->session_name}";
                $headers = ['apikey' => 'evolution_api_secret_key'];
                $body = ['number' => $recipient, 'text' => $message];
            } else {
                // Fonte / WAHA Fallback
                $url = "https://api.fonnte.com/send";
                $headers = ['Authorization' => 'fonnte_api_key_123'];
                $body = ['target' => $recipient, 'message' => $message];
            }

            $response = Http::withHeaders($headers)->post($url, $body);

            if ($response->successful()) {
                $log->update(['status' => 'Sent']);
                return true;
            } else {
                $log->update(['status' => 'Failed']);
                return false;
            }
        } catch (\\Exception $e) {
            $log->update(['status' => 'Failed']);
            Log::error("Error WhatsApp Gateway API: " . $e->getMessage());
            return false;
        }
    }
}
`
      }
    ]
  },
  {
    id: 'controllers',
    title: '4. REST API Controllers',
    files: [
      {
        name: 'CustomerController.php',
        path: 'backend/app/Http/Controllers/Api/CustomerController.php',
        language: 'php',
        description: 'Controller REST API CRUD Customer lengkap dengan validasi dan upload lampiran.',
        code: `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Models\\Customer;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Validator;
use Illuminate\\Support\\Facades\\Storage;

class CustomerController extends Controller
{
    /**
     * Get All Customers
     */
    public function index(Request $request)
    {
        $customers = Customer::with(['package', 'odp'])
            ->when($request->search, function($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('customer_number', 'like', "%{$search}%");
            })
            ->paginate(15);

        return response()->json($customers);
    }

    /**
     * Create New Customer & Upload Attachments (KTP / Rumah)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:150',
            'nik' => 'required|digits:16|unique:customers',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|unique:customers',
            'address' => 'required|string',
            'package_id' => 'required|exists:packages,id',
            'odp_id' => 'required|exists:odps,id',
            'ktp_file' => 'nullable|image|max:2048',
            'home_file' => 'nullable|image|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->except(['ktp_file', 'home_file']);
        
        // Generate Auto Customer Number
        $data['customer_number'] = 'SB-' . date('Y') . '-' . str_pad(Customer::count() + 1, 4, '0', STR_PAD_LEFT);

        if ($request->hasFile('ktp_file')) {
            $data['ktp_url'] = Storage::disk('minio')->putFile('ktp', $request->file('ktp_file'));
        }
        if ($request->hasFile('home_file')) {
            $data['home_photo_url'] = Storage::disk('minio')->putFile('homes', $request->file('home_file'));
        }

        $customer = Customer::create($data);

        return response()->json([
            'message' => 'Pelanggan berhasil ditambahkan',
            'customer' => $customer
        ], 210);
    }

    /**
     * Show Customer Detail
     */
    public function show(Customer $customer)
    {
        return response()->json($customer->load(['package', 'odp', 'invoices', 'tickets']));
    }

    /**
     * Update Customer
     */
    public function update(Request $request, Customer $customer)
    {
        $customer->update($request->all());
        return response()->json([
            'message' => 'Data pelanggan berhasil diperbarui',
            'customer' => $customer
        ]);
    }

    /**
     * Delete Customer
     */
    public function destroy(Customer $customer)
    {
        $customer->delete();
        return response()->json(['message' => 'Pelanggan berhasil dihapus']);
    }
}
`
      },
      {
        name: 'api.php',
        path: 'backend/routes/api.php',
        language: 'php',
        description: 'Definisi API Routing Laravel 12 dilindungi Sanctum Middleware dan Role-based Gates.',
        code: `<?php

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\Api\\AuthController;
use App\\Http\\Controllers\\Api\\CustomerController;
use App\\Http\\Controllers\\Api\\InvoiceController;
use App\\Http\\Controllers\\Api\\MikrotikController;

/*
|--------------------------------------------------------------------------
| API Routes - StarBilling ISP Enterprise
|--------------------------------------------------------------------------
*/

// Public Authentication Endpoint
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

// Protected API Routes - Laravel Sanctum
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', fn (Request $request) => $request->user());

    // 1. Group Customer Management (Hanya Super Admin, Admin ISP, CS)
    Route::middleware('role:Super Admin|Admin ISP|Customer Service')->group(function() {
        Route::apiResource('/customers', CustomerController::class);
    });

    // 2. Billing & Invoices (Hanya Super Admin, Finance, Kolektor)
    Route::middleware('role:Super Admin|Finance|Kolektor')->group(function() {
        Route::get('/invoices', [InvoiceController::class, 'index']);
        Route::post('/invoices/generate-massal', [InvoiceController::class, 'generateMassal']);
        Route::post('/invoices/{invoice}/pay', [InvoiceController::class, 'payManual']);
    });

    // 3. Mikrotik & Router NOC API (Hanya Super Admin, NOC, Teknisi)
    Route::middleware('role:Super Admin|NOC|Teknisi')->group(function() {
        Route::get('/mikrotik/status', [MikrotikController::class, 'status']);
        Route::post('/mikrotik/sync-pppoe', [MikrotikController::class, 'syncPppoe']);
        Route::post('/mikrotik/suspend', [MikrotikController::class, 'suspendCustomer']);
        Route::post('/mikrotik/unsuspend', [MikrotikController::class, 'unsuspendCustomer']);
    });
});
`
      }
    ]
  },
  {
    id: 'docker',
    title: '5. Docker & Server Config',
    files: [
      {
        name: 'docker-compose.yml',
        path: 'docker-compose.yml',
        language: 'yaml',
        description: 'Docker Compose untuk StarBilling ISP dengan MariaDB, Redis, Nginx, MinIO, PHP 8.4, dan Node.',
        code: `version: '3.8'

services:
  # 1. Laravel Backend Container (PHP 8.4-FPM)
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: starbilling_backend
    restart: unless-stopped
    working_dir: /var/www/html
    volumes:
      - ./backend:/var/www/html
    environment:
      DB_CONNECTION: mysql
      DB_HOST: mariadb
      DB_PORT: 3306
      DB_DATABASE: starbilling_isp
      DB_USERNAME: staradmin
      DB_PASSWORD: starpassword_secret
      REDIS_HOST: redis
    depends_on:
      - mariadb
      - redis
    networks:
      - starbilling_net

  # 2. Vue.js SPA Client Container
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: starbilling_frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - starbilling_net

  # 3. Database MariaDB 11
  mariadb:
    image: mariadb:11
    container_name: starbilling_db
    restart: always
    environment:
      MARIADB_DATABASE: starbilling_isp
      MARIADB_USER: staradmin
      MARIADB_PASSWORD: starpassword_secret
      MARIADB_ROOT_PASSWORD: root_secure_pwd_123
    ports:
      - "3306:3306"
    volumes:
      - mariadb_data:/var/lib/mysql
    networks:
      - starbilling_net

  # 4. Redis Caching & Websocket Broker
  redis:
    image: redis:alpine
    container_name: starbilling_redis
    command: redis-server --appendonly yes --requirepass redis_secure_secret_123
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - starbilling_net

  # 5. MinIO (S3-compatible storage untuk KTP/Foto pelanggan)
  minio:
    image: minio/minio:latest
    container_name: starbilling_s3
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin_user
      MINIO_ROOT_PASSWORD: minioadmin_password_999
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    networks:
      - starbilling_net

networks:
  starbilling_net:
    driver: bridge

volumes:
  mariadb_data:
    driver: local
  redis_data:
    driver: local
  minio_data:
    driver: local
`
      },
      {
        name: 'nginx.conf',
        path: 'docker/nginx.conf',
        language: 'nginx',
        description: 'Konfigurasi Reverse Proxy Nginx untuk merutekan API Backend dan SPA Frontend.',
        code: `server {
    listen 80;
    server_name billing.starbilling.net;

    # Frontend Vue 3 SPA routing
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Backend Laravel Routing
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Storage assets proxy (KTP, images)
    location /storage {
        proxy_pass http://minio:9000/starbilling-bucket;
        proxy_set_header Host $host;
    }
}
`
      }
    ]
  },
  {
    id: 'docs',
    title: '6. Dokumentasi & Panduan',
    files: [
      {
        name: 'INSTALL.md',
        path: 'docs/INSTALL.md',
        language: 'markdown',
        description: 'Panduan lengkap Deployment StarBilling ISP Enterprise di Linux, Docker, XAMPP, dan Laragon.',
        code: `# Panduan Instalasi StarBilling ISP Enterprise

Selamat datang di panduan instalasi sistem **StarBilling ISP**. Panduan ini mencakup berbagai opsi deployment: Docker Compose (Rekomendasi Production), Ubuntu Server manual, Laragon (Windows Development), dan XAMPP.

---

## Opsi 1: Menggunakan Docker Compose (Rekomendasi Production)

Metode ini menginstal seluruh stack (Laravel 12, Vue 3, MariaDB 11, Redis, MinIO) secara otomatis dalam container yang terisolasi.

### Prasyarat
- Ubuntu Server 22.04 LTS / 24.04 LTS
- Docker Engine >= v20.10 & Docker Compose >= v2.0
- Git

### Langkah-langkah
1. Clone repositori ke server Anda:
   \`\`\`bash
   git clone https://github.com/your-org/starbilling.git
   cd starbilling
   \`\`\`

2. Konfigurasi file environment:
   - Copy \`.env.example\` menjadi \`.env\` di dalam folder \`backend/\`
   - Sesuaikan konfigurasi database (DB_HOST gunakan \`mariadb\`, Redis_HOST gunakan \`redis\`)
   - Isi \`GEMINI_API_KEY\` dan \`TRIPAY_API_KEY\` sesuai kebutuhan.

3. Jalankan Docker Compose:
   \`\`\`bash
   docker compose up -d --build
   \`\`\`

4. Jalankan database migration dan seed dummy data:
   \`\`\`bash
   docker compose exec backend php artisan migrate --seed
   \`\`\`

5. Akses StarBilling ISP melalui peramban:
   - **Web Admin & Portal**: \`http://localhost:3000\`
   - **MinIO S3 Console**: \`http://localhost:9001\` (User: \`minioadmin_user\`, Pwd: \`minioadmin_password_999\`)

---

## Opsi 2: Instalasi Manual di Ubuntu Server

Opsi ini cocok jika Anda tidak ingin menggunakan Docker dan memilih menjalankan servis native.

### Instal PHP 8.4 & MariaDB
\`\`\`bash
sudo apt update && sudo apt upgrade -y
sudo apt install software-properties-common -y
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install php8.4 php8.4-fpm php8.4-mysql php8.4-mbstring php8.4-xml php8.4-curl php8.4-zip php8.4-redis php8.4-gd -y

# Install MariaDB 11
curl -LsS https://r.mariadb.com/downloads/mariadb_repo_setup | sudo bash
sudo apt install mariadb-server mariadb-client -y
sudo systemctl enable mariadb --now
\`\`\`

---

## Opsi 3: Instalasi di Laragon (Windows Development)

Laragon adalah tool development Windows terbaik yang mendukung pergantian versi PHP dan MariaDB dengan mudah.

1. Buka Laragon. Download Laragon Full (versi 6+) di [laragon.org](https://laragon.org/).
2. Unduh **PHP 8.4 TS (Thread Safe)** x64 dari website windows.php.net, ekstrak ke folder \`C:\\laragon\\bin\\php\\php-8.4\`.
3. Unduh **MariaDB 11** zip, ekstrak ke \`C:\\laragon\\bin\\mysql\\mariadb-11\`.
4. Di Menu Laragon, pilih:
   - PHP -> Version -> \`php-8.4\`
   - MySQL -> Version -> \`mariadb-11\`
5. Pindahkan folder \`backend/\` ke \`C:\\laragon\\www\\starbilling\`
6. Buka terminal di Laragon, jalankan:
   \`\`\`bash
   composer install
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve --port=8000
   \`\`\`
7. Untuk frontend Vue 3, buka CMD/Powershell baru di folder \`frontend/\` dan jalankan:
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`

---

## Opsi 4: Instalasi di XAMPP (Windows / Mac)

1. Unduh XAMPP terbaru yang mendukung PHP 8.2 ke atas.
2. Pindahkan isi direktori \`backend/\` ke dalam folder \`htdocs/starbilling\`.
3. Buka PHPMyAdmin (\`http://localhost/phpmyadmin\`), buat database baru bernama \`starbilling_isp\`.
4. Edit file \`htdocs/starbilling/.env\` untuk menyesuaikan \`DB_USERNAME=root\` dan \`DB_PASSWORD=\` (kosong).
5. Masuk ke terminal htdocs/starbilling, jalankan composer install dan php artisan migrate.
`
      }
    ]
  },
  {
    id: 'customer_module',
    title: '7. Modul Customer (Tahap 4)',
    files: [
      {
        name: 'api.php',
        path: 'backend/routes/api.php',
        language: 'php',
        description: 'Definisi Route API untuk Modul Pelanggan lengkap dengan fitur CRUD, file upload, import/export Excel, dan export PDF.',
        code: `<?php

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\Api\\CustomerController;

/*
|--------------------------------------------------------------------------
| API Routes - Customer Module (StarBilling ISP)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    
    // Group Khusus Operasi Bulk dan Export / Import (Diletakkan sebelum resource agar tidak bertabrakan)
    Route::prefix('customers')->group(function () {
        Route::get('/export/excel', [CustomerController::class, 'exportExcel'])
            ->name('customers.export.excel');
            
        Route::get('/export/pdf', [CustomerController::class, 'exportPdf'])
            ->name('customers.export.pdf');
            
        Route::post('/import/excel', [CustomerController::class, 'importExcel'])
            ->name('customers.import.excel');
            
        Route::post('/{id}/upload-docs', [CustomerController::class, 'uploadDocuments'])
            ->name('customers.upload-docs');
    });

    // API Resource CRUD Pelanggan (Index, Store, Show, Update, Destroy)
    Route::apiResource('customers', CustomerController::class);
    
});
`
      },
      {
        name: 'CustomerController.php',
        path: 'backend/app/Http/Controllers/Api/CustomerController.php',
        language: 'php',
        description: 'Controller utama penanganan HTTP Request Modul Customer, mendelegasikan proses bisnis ke CustomerService.',
        code: `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Http\\Requests\\StoreCustomerRequest;
use App\\Http\\Requests\\UpdateCustomerRequest;
use App\\Services\\CustomerService;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\JsonResponse;
use Symfony\\Component\\HttpFoundation\\BinaryFileResponse;
use Exception;

class CustomerController extends Controller
{
    protected CustomerService $customerService;

    /**
     * Dependency Injection CustomerService
     */
    public function __construct(CustomerService $customerService)
    {
        $this->customerService = $customerService;
    }

    /**
     * List Pelanggan dengan filter & paginasi
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['search', 'area_id', 'package_id', 'status', 'marketing_id', 'per_page']);
            $customers = $this->customerService->getAllCustomers($filters);
            
            return response()->json([
                'status' => 'success',
                'data' => $customers
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data pelanggan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menyimpan data pelanggan baru
     */
    public function store(StoreCustomerRequest $request): JsonResponse
    {
        try {
            $customer = $this->customerService->createCustomer($request->validated());
            
            return response()->json([
                'status' => 'success',
                'message' => 'Pelanggan berhasil ditambahkan ke sistem StarBilling.',
                'data' => $customer
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menambahkan pelanggan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Detail Data Pelanggan
     */
    public function show($id): JsonResponse
    {
        try {
            $customer = $this->customerService->getCustomerById($id);
            
            return response()->json([
                'status' => 'success',
                'data' => $customer
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Memperbarui data pelanggan (Update)
     */
    public function update(UpdateCustomerRequest $request, $id): JsonResponse
    {
        try {
            $customer = $this->customerService->updateCustomer($id, $request->validated());
            
            return response()->json([
                'status' => 'success',
                'message' => 'Data pelanggan berhasil diperbarui.',
                'data' => $customer
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui data pelanggan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menghapus pelanggan (Soft Delete)
     */
    public function destroy($id): JsonResponse
    {
        try {
            $this->customerService->deleteCustomer($id);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Pelanggan berhasil dinonaktifkan (Soft Deleted).'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus pelanggan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export data pelanggan ke file Excel
     */
    public function exportExcel(Request $request)
    {
        try {
            $filters = $request->only(['search', 'area_id', 'package_id', 'status', 'marketing_id']);
            return $this->customerService->exportToExcel($filters);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal melakukan ekspor excel: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export data pelanggan ke dokumen PDF resmi ISP
     */
    public function exportPdf(Request $request)
    {
        try {
            $filters = $request->only(['search', 'area_id', 'package_id', 'status', 'marketing_id']);
            return $this->customerService->exportToPdf($filters);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mencetak PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import massal data pelanggan dari format template Excel
     */
    public function importExcel(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:10240'
        ]);

        try {
            $result = $this->customerService->importFromExcel($request->file('file'));
            
            return response()->json([
                'status' => 'success',
                'message' => 'Proses import data selesai.',
                'data' => $result
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengimport data Excel: ' . $e->getMessage()
            ], 500);
        }
    }
}
`
      },
      {
        name: 'StoreCustomerRequest.php',
        path: 'backend/app/Http/Requests/StoreCustomerRequest.php',
        language: 'php',
        description: 'Form Request untuk mengamankan dan memvalidasi payload pendaftaran pelanggan baru.',
        code: `<?php

namespace App\\Http\\Requests;

use Illuminate\\Foundation\\Http\\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    /**
     * Hak akses validasi form ini (Bisa dibatasi via gate/role jika perlu)
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Aturan validasi ketat untuk menjaga integritas database
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|min:3|max:150',
            'nik' => 'required|numeric|digits:16|unique:customers,nik',
            'phone' => 'required|string|between:10,15',
            'email' => 'required|email|max:100|unique:customers,email',
            'address' => 'required|string|min:10',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'package_id' => 'required|exists:packages,id',
            'router_id' => 'required|exists:routers,id',
            'odp_id' => 'required|exists:odps,id',
            'marketing_id' => 'nullable|exists:marketings,id',
            'city_id' => 'required|exists:cities,id',
            'district_id' => 'required|exists:districts,id',
            'village_id' => 'required|exists:villages,id',
            'area_id' => 'required|exists:areas,id',
            'ktp_file' => 'nullable|image|mimes:jpg,jpeg,png|max:3072', // Maksimal 3MB
            'home_file' => 'nullable|image|mimes:jpg,jpeg,png|max:4096', // Maksimal 4MB
            'status' => 'required|in:Aktif,Suspend,Nonaktif',
        ];
    }

    /**
     * Kustomisasi pesan error bahasa Indonesia yang ramah pengguna
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap pelanggan wajib diisi.',
            'nik.required' => 'Nomor NIK KTP wajib diisi.',
            'nik.digits' => 'NIK KTP harus tepat berisikan 16 digit angka.',
            'nik.unique' => 'NIK ini sudah terdaftar sebagai pelanggan aktif.',
            'phone.required' => 'Nomor HP/WhatsApp wajib diisi.',
            'email.unique' => 'Alamat email sudah pernah didaftarkan.',
            'package_id.required' => 'Silahkan pilih paket bandwidth internet.',
            'odp_id.required' => 'Silahkan tentukan terminal ODP tiang terdekat.',
            'ktp_file.max' => 'Ukuran berkas scan KTP tidak boleh melebihi 3 megabyte.',
            'home_file.max' => 'Ukuran foto rumah pelanggan maksimal 4 megabyte.'
        ];
    }
}
`
      },
      {
        name: 'UpdateCustomerRequest.php',
        path: 'backend/app/Http/Requests/UpdateCustomerRequest.php',
        language: 'php',
        description: 'Form Request untuk memperbarui profil pelanggan dengan pengecualian validasi unique pada dirinya sendiri.',
        code: `<?php

namespace App\\Http\\Requests;

use Illuminate\\Foundation\\Http\\FormRequest;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Ambil ID Pelanggan yang sedang diupdate dari route parameter
        $customerId = $this->route('customer');

        return [
            'name' => 'sometimes|required|string|min:3|max:150',
            'nik' => 'sometimes|required|numeric|digits:16|unique:customers,nik,' . $customerId,
            'phone' => 'sometimes|required|string|between:10,15',
            'email' => 'sometimes|required|email|max:100|unique:customers,email,' . $customerId,
            'address' => 'sometimes|required|string|min:10',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'package_id' => 'sometimes|required|exists:packages,id',
            'router_id' => 'sometimes|required|exists:routers,id',
            'odp_id' => 'sometimes|required|exists:odps,id',
            'marketing_id' => 'nullable|exists:marketings,id',
            'city_id' => 'sometimes|required|exists:cities,id',
            'district_id' => 'sometimes|required|exists:districts,id',
            'village_id' => 'sometimes|required|exists:villages,id',
            'area_id' => 'sometimes|required|exists:areas,id',
            'ktp_file' => 'nullable|image|mimes:jpg,jpeg,png|max:3072',
            'home_file' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
            'status' => 'sometimes|required|in:Aktif,Suspend,Nonaktif',
        ];
    }
}
`
      },
      {
        name: 'CustomerRepository.php',
        path: 'backend/app/Repositories/CustomerRepository.php',
        language: 'php',
        description: 'Repository Layer yang mengisolasi query database Eloquent agar controller tetap bersih dan terfokus.',
        code: `<?php

namespace App\\Repositories;

use App\\Models\\Customer;
use Illuminate\\Pagination\\LengthAwarePaginator;
use Illuminate\\Support\\Collection;

class CustomerRepository
{
    /**
     * Mengambil daftar pelanggan ter-filter menggunakan query builder Eloquent
     */
    public function getPaginatedAndFiltered(array $filters): LengthAwarePaginator
    {
        $query = Customer::with(['package', 'router', 'odp', 'marketing', 'area', 'village', 'district', 'city']);

        // 1. Fitur Search Global (Cari berdasarkan Nama, No Pelanggan, NIK, HP, Email)
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('customer_number', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // 2. Filter Wilayah / Sektor Area
        if (!empty($filters['area_id'])) {
            $query->where('area_id', $filters['area_id']);
        }

        // 3. Filter Paket Bandwidth Internet
        if (!empty($filters['package_id'])) {
            $query->where('package_id', $filters['package_id']);
        }

        // 4. Filter Status Koneksi Pelanggan (Aktif, Suspend, Nonaktif)
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // 5. Filter Berdasarkan Marketing Penanggungjawab
        if (!empty($filters['marketing_id'])) {
            $query->where('marketing_id', $filters['marketing_id']);
        }

        // Ambil data terbaru dan batasi per halaman
        $perPage = $filters['per_page'] ?? 15;
        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Query data mentah tanpa paginasi untuk kebutuhan laporan PDF/Excel
     */
    public function getForExport(array $filters): Collection
    {
        $query = Customer::with(['package', 'area', 'marketing', 'village']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('customer_number', 'like', "%{$search}%");
        }

        if (!empty($filters['area_id'])) $query->where('area_id', $filters['area_id']);
        if (!empty($filters['package_id'])) $query->where('package_id', $filters['package_id']);
        if (!empty($filters['status'])) $query->where('status', $filters['status']);
        if (!empty($filters['marketing_id'])) $query->where('marketing_id', $filters['marketing_id']);

        return $query->orderBy('customer_number', 'asc')->get();
    }

    /**
     * Buat Record Baru
     */
    public function create(array $data): Customer
    {
        return Customer::create($data);
    }

    /**
     * Edit Record Pelanggan
     */
    public function update(Customer $customer, array $data): bool
    {
        return $customer->update($data);
    }

    /**
     * Soft Delete Pelanggan
     */
    public function delete(Customer $customer): bool
    {
        return $customer->delete();
    }

    /**
     * Cari Pelanggan berdasarkan ID Primer
     */
    public function findById(int $id): ?Customer
    {
        return Customer::with(['package', 'router', 'odp', 'marketing', 'area', 'documents'])->find($id);
    }
}
`
      },
      {
        name: 'CustomerService.php',
        path: 'backend/app/Services/CustomerService.php',
        language: 'php',
        description: 'Service Layer untuk menangani Business Logic, file upload ke S3/MinIO, ekspor PDF/Excel, dan impor bulk data.',
        code: `<?php

namespace App\\Services;

use App\\Repositories\\CustomerRepository;
use App\\Models\\Customer;
use App\\Models\\CustomerDocument;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Facades\\Storage;
use Maatwebsite\\Excel\\Facades\\Excel;
use App\\Exports\\CustomersExport;
use App\\Imports\\CustomersImport;
use Barryvdh\\DomPDF\\Facade\\Pdf;
use Exception;

class CustomerService
{
    protected CustomerRepository $customerRepo;

    public function __construct(CustomerRepository $customerRepo)
    {
        $this->customerRepo = $customerRepo;
    }

    /**
     * Ambil semua pelanggan dari repositori
     */
    public function getAllCustomers(array $filters)
    {
        return $this->customerRepo->getPaginatedAndFiltered($filters);
    }

    /**
     * Ambil detail satu pelanggan
     */
    public function getCustomerById($id): Customer
    {
        $customer = $this->customerRepo->findById($id);
        if (!$customer) {
            throw new Exception("Pelanggan dengan ID #{$id} tidak terdaftar di sistem.");
        }
        return $customer;
    }

    /**
     * Logika Pendaftaran Pelanggan Baru dengan transaksi DB aman dan Upload Berkas
     */
    public function createCustomer(array $data): Customer
    {
        return DB::transaction(function () use ($data) {
            // Generate Auto-Increment Nomor Pelanggan Unik (Contoh: SB-2026-00055)
            $lastCustomer = Customer::withTrashed()->whereYear('created_at', date('Y'))->count();
            $data['customer_number'] = 'SB-' . date('Y') . '-' . str_pad($lastCustomer + 1, 5, '0', STR_PAD_LEFT);

            $customer = $this->customerRepo->create($data);

            // Handle berkas KTP
            if (isset($data['ktp_file'])) {
                $path = Storage::disk('minio')->putFile('customers/ktp', $data['ktp_file']);
                CustomerDocument::create([
                    'customer_id' => $customer->id,
                    'document_type' => 'KTP',
                    'file_path' => $path,
                    'description' => 'Fotokopi / Scan KTP Asli Pelanggan'
                ]);
            }

            // Handle berkas Foto Rumah Depan
            if (isset($data['home_file'])) {
                $path = Storage::disk('minio')->putFile('customers/houses', $data['home_file']);
                CustomerDocument::create([
                    'customer_id' => $customer->id,
                    'document_type' => 'Foto Rumah',
                    'file_path' => $path,
                    'description' => 'Foto Lokasi Fisik Rumah Instalasi Pelanggan'
                ]);
            }

            return $customer;
        });
    }

    /**
     * Logika Pembaharuan Data Pelanggan beserta penggantian file lama di Object Storage S3
     */
    public function updateCustomer($id, array $data): Customer
    {
        $customer = $this->getCustomerById($id);

        return DB::transaction(function () use ($customer, $data) {
            $this->customerRepo->update($customer, $data);

            // Jika ada upload KTP baru
            if (isset($data['ktp_file'])) {
                $oldKtp = CustomerDocument::where('customer_id', $customer->id)->where('document_type', 'KTP')->first();
                if ($oldKtp) {
                    Storage::disk('minio')->delete($oldKtp->file_path);
                    $oldKtp->delete();
                }
                $path = Storage::disk('minio')->putFile('customers/ktp', $data['ktp_file']);
                CustomerDocument::create([
                    'customer_id' => $customer->id,
                    'document_type' => 'KTP',
                    'file_path' => $path,
                    'description' => 'Terupdate: Scan KTP Asli'
                ]);
            }

            // Jika ada upload Foto Rumah baru
            if (isset($data['home_file'])) {
                $oldHome = CustomerDocument::where('customer_id', $customer->id)->where('document_type', 'Foto Rumah')->first();
                if ($oldHome) {
                    Storage::disk('minio')->delete($oldHome->file_path);
                    $oldHome->delete();
                }
                $path = Storage::disk('minio')->putFile('customers/houses', $data['home_file']);
                CustomerDocument::create([
                    'customer_id' => $customer->id,
                    'document_type' => 'Foto Rumah',
                    'file_path' => $path,
                    'description' => 'Terupdate: Foto Lokasi Rumah'
                ]);
            }

            return $customer->fresh();
        });
    }

    /**
     * Hapus Pelanggan
     */
    public function deleteCustomer($id): bool
    {
        $customer = $this->getCustomerById($id);
        return $this->customerRepo->delete($customer);
    }

    /**
     * Trigger Export data ke Maatwebsite Excel
     */
    public function exportToExcel(array $filters)
    {
        return Excel::download(new CustomersExport($filters), 'StarBilling_ISP_Customers_' . date('Ymd_Hi') . '.xlsx');
    }

    /**
     * Generate Dokumen Cetak PDF Resmi ISP (Lengkap dengan kop & TTD)
     */
    public function exportToPdf(array $filters)
    {
        $customers = $this->customerRepo->getForExport($filters);
        
        $pdf = Pdf::loadView('exports.customers_pdf', [
            'customers' => $customers,
            'title' => 'LAPORAN REKAPITULASI PELANGGAN AKTIF STARBILLING ISP',
            'date' => date('d F Y')
        ])->setPaper('a4', 'landscape');
        
        return $pdf->download('Laporan_Pelanggan_StarBilling_ISP_' . date('Y-m-d') . '.pdf');
    }

    /**
     * Parsing dan validasi baris Excel untuk diimport massal ke database
     */
    public function importFromExcel($file): array
    {
        $import = new CustomersImport();
        Excel::import($import, $file);

        return [
            'total_parsed' => $import->getRowCount(),
            'successful_imports' => $import->getSuccessCount(),
            'failure_details' => $import->getErrors()
        ];
    }
}
`
      },
      {
        name: 'CustomerList.vue',
        path: 'frontend/src/views/customers/CustomerList.vue',
        language: 'vue',
        description: 'Halaman Vue 3 (Composition API) utama untuk navigasi Modul Customer, mengintegrasikan filter, pencarian, dan aksi cetak.',
        code: `<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header Modul -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span class="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">📁</span>
          Manajemen Data Pelanggan
        </h1>
        <p class="text-xs text-slate-400 mt-1">Kelola portofolio data pelanggan, status mikrotik, redaman fiber optik, dan penugasan marketing.</p>
      </div>

      <!-- Aksi Utama -->
      <div class="flex flex-wrap items-center gap-2.5">
        <button @click="openCreateModal" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs flex items-center gap-2 transition shadow-lg shadow-indigo-600/10">
          ➕ Tambah Pelanggan Baru
        </button>
        <button @click="openImportModal" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition border border-slate-700">
          📥 Import Excel
        </button>
        <button @click="handleExportExcel" :disabled="loadingExport" class="px-3.5 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition">
          📊 Export Excel
        </button>
        <button @click="handleExportPdf" :disabled="loadingExport" class="px-3.5 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition">
          📕 Export PDF
        </button>
      </div>
    </div>

    <!-- Filter & Pencarian Bento Bar -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
      <!-- Search Input -->
      <div class="md:col-span-2 space-y-1.5">
        <label class="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">CARI DATA PELANGGAN</label>
        <div class="relative">
          <input 
            v-model="filters.search" 
            @input="debouncedSearch" 
            type="text" 
            placeholder="Ketik Nama, No Pelanggan, NIK, HP..." 
            class="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-2 text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none transition"
          />
        </div>
      </div>

      <!-- Filter Paket -->
      <div class="space-y-1.5">
        <label class="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">PAKET INTERNET</label>
        <select v-model="filters.package_id" @change="fetchCustomers" class="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 transition">
          <option value="">Semua Paket</option>
          <option v-for="pkg in packages" :key="pkg.id" :value="pkg.id">{{ pkg.name }} ({{ pkg.price_formatted }})</option>
        </select>
      </div>

      <!-- Filter Area Sektor -->
      <div class="space-y-1.5">
        <label class="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">WILAYAH / AREA</label>
        <select v-model="filters.area_id" @change="fetchCustomers" class="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 transition">
          <option value="">Semua Wilayah</option>
          <option v-for="area in areas" :key="area.id" :value="area.id">{{ area.name }}</option>
        </select>
      </div>

      <!-- Filter Status -->
      <div class="space-y-1.5">
        <label class="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">STATUS KONEKSI</label>
        <select v-model="filters.status" @change="fetchCustomers" class="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 transition">
          <option value="">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Suspend">Suspend</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>
      </div>
    </div>

    <!-- Data Table Container -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <CustomerTable 
        :customers="customers" 
        :loading="loading" 
        @edit="openEditModal" 
        @delete="handleDeleteCustomer" 
        @view="openDetailModal" 
      />
      
      <!-- Table Pagination Footer -->
      <div class="px-5 py-4 border-t border-slate-800/60 bg-slate-900/60 flex items-center justify-between">
        <span class="text-xs text-slate-500">
          Menampilkan <span class="text-slate-300 font-semibold">{{ pagination.from }}</span> - 
          <span class="text-slate-300 font-semibold">{{ pagination.to }}</span> dari 
          <span class="text-slate-300 font-semibold">{{ pagination.total }}</span> pelanggan
        </span>
        
        <div class="flex items-center gap-1.5">
          <button 
            @click="changePage(pagination.current_page - 1)" 
            :disabled="pagination.current_page === 1"
            class="px-3 py-1.5 bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold rounded-lg transition"
          >
            Previous
          </button>
          <button 
            @click="changePage(pagination.current_page + 1)" 
            :disabled="pagination.current_page === pagination.last_page"
            class="px-3 py-1.5 bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold rounded-lg transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form Tambah (Lazy Rendered) -->
    <CustomerCreateForm 
      v-if="showCreateModal" 
      :packages="packages"
      :routers="routers"
      :odps="odps"
      :areas="areas"
      @close="showCreateModal = false" 
      @success="handleCreateSuccess" 
    />

    <!-- Modal Form Edit (Lazy Rendered) -->
    <CustomerEditForm 
      v-if="showEditModal" 
      :customer-id="selectedCustomerId"
      :packages="packages"
      :routers="routers"
      :odps="odps"
      :areas="areas"
      @close="closeEditModal" 
      @success="handleEditSuccess" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';
import CustomerTable from './CustomerTable.vue';
import CustomerCreateForm from './CustomerCreateForm.vue';
import CustomerEditForm from './CustomerEditForm.vue';

// State
const loading = ref(false);
const loadingExport = ref(false);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const selectedCustomerId = ref(null);

const customers = ref([]);
const packages = ref([]);
const areas = ref([]);
const routers = ref([]);
const odps = ref([]);

const filters = reactive({
  search: '',
  package_id: '',
  area_id: '',
  status: '',
  page: 1
});

const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
  from: 0,
  to: 0
});

// Debounce Search Handler
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filters.page = 1;
    fetchCustomers();
  }, 450);
};

// API Fetching
const fetchCustomers = async () => {
  loading.value = true;
  try {
    const res = await axios.get('/api/customers', { params: filters });
    customers.value = res.data.data.data;
    pagination.value = {
      current_page: res.data.data.current_page,
      last_page: res.data.data.last_page,
      total: res.data.data.total,
      from: res.data.data.from,
      to: res.data.data.to
    };
  } catch (err) {
    alert('Gagal memuat data pelanggan');
  } finally {
    loading.value = false;
  }
};

const fetchMetadata = async () => {
  try {
    const [pRes, aRes, rRes, oRes] = await Promise.all([
      axios.get('/api/packages'),
      axios.get('/api/areas'),
      axios.get('/api/routers'),
      axios.get('/api/odps')
    ]);
    packages.value = pRes.data;
    areas.value = aRes.data;
    routers.value = rRes.data;
    odps.value = oRes.data;
  } catch (err) {
    console.error('Gagal mengambil metadata filter.');
  }
};

// Actions
const openCreateModal = () => {
  showCreateModal.value = true;
};

const handleCreateSuccess = () => {
  showCreateModal.value = false;
  fetchCustomers();
};

const openEditModal = (id) => {
  selectedCustomerId.value = id;
  showEditModal.value = true;
};

const closeEditModal = () => {
  selectedCustomerId.value = null;
  showEditModal.value = false;
};

const handleEditSuccess = () => {
  closeEditModal();
  fetchCustomers();
};

const handleDeleteCustomer = async (id) => {
  if (confirm('Apakah Anda yakin ingin menonaktifkan pelanggan ini? Status koneksi akan diblokir di Mikrotik.')) {
    try {
      await axios.delete(\`/api/customers/\${id}\`);
      fetchCustomers();
    } catch (err) {
      alert('Gagal menghapus data.');
    }
  }
};

const changePage = (page) => {
  filters.page = page;
  fetchCustomers();
};

const handleExportExcel = async () => {
  loadingExport.value = true;
  try {
    window.open(\`/api/customers/export/excel?\${new URLSearchParams(filters).toString()}\`);
  } finally {
    loadingExport.value = false;
  }
};

const handleExportPdf = () => {
  window.open(\`/api/customers/export/pdf?\${new URLSearchParams(filters).toString()}\`);
};

onMounted(() => {
  fetchCustomers();
  fetchMetadata();
});
</script>
`
      },
      {
        name: 'CustomerCreateForm.vue',
        path: 'frontend/src/views/customers/CustomerCreateForm.vue',
        language: 'vue',
        description: 'Form pendaftaran pelanggan baru dengan validasi frontend, koordinat peta GIS, serta upload berkas scan KTP/foto lokasi rumah.',
        code: `<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-8">
      <!-- Modal Header -->
      <div class="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <span class="text-emerald-400">👤</span>
          Registrasi Formulir Pelanggan Baru
        </h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-200 font-bold transition text-lg">&times;</button>
      </div>

      <!-- Form Content -->
      <form @submit.prevent="handleSubmit" class="p-6 overflow-y-auto max-h-[75vh] space-y-6 text-xs">
        
        <!-- Grid 1: Informasi Personal -->
        <div class="space-y-4">
          <h4 class="text-xs font-semibold text-indigo-400 border-b border-slate-850 pb-2">1. DATA DIRI & KONTAK</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-slate-400 font-medium">Nama Lengkap Sesuai KTP <span class="text-rose-500">*</span></label>
              <input v-model="form.name" required type="text" placeholder="Masukkan nama lengkap pelanggan" class="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500" />
            </div>
            
            <div class="space-y-1.5">
              <label class="text-slate-400 font-medium">Nomor NIK KTP <span class="text-rose-500">*</span></label>
              <input v-model="form.nik" required type="text" maxlength="16" placeholder="Nomor Induk Kependudukan (16 digit)" class="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500" />
            </div>

            <div class="space-y-1.5">
              <label class="text-slate-400 font-medium">No. Telepon / WhatsApp <span class="text-rose-500">*</span></label>
              <input v-model="form.phone" required type="text" placeholder="Contoh: 08123456789" class="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500" />
            </div>

            <div class="space-y-1.5">
              <label class="text-slate-400 font-medium">Alamat E-mail <span class="text-rose-500">*</span></label>
              <input v-model="form.email" required type="email" placeholder="alamat_email@domain.com" class="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>

        <!-- Grid 2: Data Teknis Jaringan -->
        <div class="space-y-4">
          <h4 class="text-xs font-semibold text-indigo-400 border-b border-slate-850 pb-2">2. INTEGRASI TEKNIS & PAKET INTERNET</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-1.5">
              <label class="text-slate-400 font-medium">Paket Bandwidth Internet <span class="text-rose-500">*</span></label>
              <select v-model="form.package_id" required class="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500">
                <option value="">Pilih Paket...</option>
                <option v-for="pkg in packages" :key="pkg.id" :value="pkg.id">{{ pkg.name }} (Rp{{ pkg.price }})</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-slate-400 font-medium">MikroTik Router NOC <span class="text-rose-500">*</span></label>
              <select v-model="form.router_id" required class="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500">
                <option value="">Pilih Router...</option>
                <option v-for="router in routers" :key="router.id" :value="router.id">{{ router.name }}</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-slate-400 font-medium">Optical Terminal ODP <span class="text-rose-500">*</span></label>
              <select v-model="form.odp_id" required class="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500">
                <option value="">Pilih ODP Tiang...</option>
                <option v-for="odp in odps" :key="odp.id" :value="odp.id">{{ odp.name }} (Avail: {{ odp.available_port }} Port)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Grid 3: Alamat Geospasial GIS -->
        <div class="space-y-4">
          <h4 class="text-xs font-semibold text-indigo-400 border-b border-slate-850 pb-2">3. INFORMASI ALAMAT & GEOTAGGING</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5 md:col-span-2">
              <label class="text-slate-400 font-medium">Alamat Instalasi Lengkap (Jalan, RT/RW, No. Rumah) <span class="text-rose-500">*</span></label>
              <textarea v-model="form.address" required rows="2" placeholder="Tuliskan detail alamat penginstalan kabel fiber optik" class="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"></textarea>
            </div>
            <div class="space-y-1.5">
              <label class="text-slate-400 font-medium">Gis Koordinat Latitude</label>
              <input v-model="form.latitude" type="text" placeholder="Contoh: -6.175392" class="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500" />
            </div>
            <div class="space-y-1.5">
              <label class="text-slate-400 font-medium">Gis Koordinat Longitude</label>
              <input v-model="form.longitude" type="text" placeholder="Contoh: 106.827153" class="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>

        <!-- Grid 4: Berkas Dokumen -->
        <div class="space-y-4">
          <h4 class="text-xs font-semibold text-indigo-400 border-b border-slate-850 pb-2">4. UPLOAD LAMPIRAN BERKAS (S3 ENGINE)</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Upload KTP -->
            <div class="space-y-2">
              <label class="text-slate-400 font-medium block">Scan KTP Pelanggan (Max 3MB)</label>
              <div 
                class="border-2 border-dashed border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center bg-slate-950/40 text-center hover:border-slate-700 transition relative cursor-pointer"
                @dragover.prevent
                @drop.prevent="handleFileDrop($event, 'ktp')"
                @click="$refs.ktpInput.click()"
              >
                <input ref="ktpInput" type="file" accept="image/*" class="hidden" @change="handleFileSelected($event, 'ktp')" />
                <span class="text-2xl mb-2">💳</span>
                <p v-if="!ktpFileName" class="text-[10px] text-slate-500">Tarik berkas ke sini atau <span class="text-indigo-400 font-semibold">klik untuk memilih</span></p>
                <p v-else class="text-[10px] text-emerald-400 font-semibold truncate max-w-xs">✔ Selected: {{ ktpFileName }}</p>
              </div>
            </div>

            <!-- Upload Foto Rumah -->
            <div class="space-y-2">
              <label class="text-slate-400 font-medium block">Foto Lokasi Rumah Depan (Max 4MB)</label>
              <div 
                class="border-2 border-dashed border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center bg-slate-950/40 text-center hover:border-slate-700 transition relative cursor-pointer"
                @dragover.prevent
                @drop.prevent="handleFileDrop($event, 'home')"
                @click="$refs.homeInput.click()"
              >
                <input ref="homeInput" type="file" accept="image/*" class="hidden" @change="handleFileSelected($event, 'home')" />
                <span class="text-2xl mb-2">🏠</span>
                <p v-if="!homeFileName" class="text-[10px] text-slate-500">Tarik berkas ke sini atau <span class="text-indigo-400 font-semibold">klik untuk memilih</span></p>
                <p v-else class="text-[10px] text-emerald-400 font-semibold truncate max-w-xs">✔ Selected: {{ homeFileName }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Footer -->
        <div class="border-t border-slate-850 pt-5 flex items-center justify-end gap-3">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl transition">Batal</button>
          <button type="submit" :disabled="loading" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/10 transition">
            <span v-if="loading">Mengirim Data...</span>
            <span v-else>Simpan Pelanggan</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';

const emit = defineEmits(['close', 'success']);
const props = defineProps({
  packages: Array,
  routers: Array,
  odps: Array,
  areas: Array
});

const loading = ref(false);
const ktpFileName = ref('');
const homeFileName = ref('');

const form = reactive({
  name: '',
  nik: '',
  phone: '',
  email: '',
  address: '',
  latitude: '',
  longitude: '',
  package_id: '',
  router_id: '',
  odp_id: '',
  city_id: 1, // Default JKB
  district_id: 1,
  village_id: 1,
  area_id: '',
  ktp_file: null,
  home_file: null,
  status: 'Aktif'
});

const handleFileSelected = (e, type) => {
  const file = e.target.files[0];
  if (file) {
    if (type === 'ktp') {
      form.ktp_file = file;
      ktpFileName.value = file.name;
    } else {
      form.home_file = file;
      homeFileName.value = file.name;
    }
  }
};

const handleFileDrop = (e, type) => {
  const file = e.dataTransfer.files[0];
  if (file) {
    if (type === 'ktp') {
      form.ktp_file = file;
      ktpFileName.value = file.name;
    } else {
      form.home_file = file;
      homeFileName.value = file.name;
    }
  }
};

const handleSubmit = async () => {
  loading.value = true;
  
  // Karena form mengandung file upload, kita wajib gunakan FormData
  const formData = new FormData();
  Object.keys(form).forEach(key => {
    if (form[key] !== null && form[key] !== undefined) {
      formData.append(key, form[key]);
    }
  });

  try {
    await axios.post('/api/customers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    alert('Pelanggan berhasil disimpan ke database ISP!');
    emit('success');
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menyimpan pelanggan baru.');
  } finally {
    loading.value = false;
  }
};
</script>
`
      },
      {
        name: 'CustomerEditForm.vue',
        path: 'frontend/src/views/customers/CustomerEditForm.vue',
        language: 'vue',
        description: 'Form editing profil pelanggan, me-load data asinkron via API, dan menangani penggantian berkas dokumen.',
        code: `<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-8">
      <!-- Modal Header -->
      <div class="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <span class="text-indigo-400">✏</span>
          Edit Profil Pelanggan (#{{ customerNumber }})
        </h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-200 font-bold transition text-lg">&times;</button>
      </div>

      <!-- Form Content -->
      <div v-if="loadingInit" class="p-12 text-center text-slate-400 text-xs">Sedang mengambil detail profil...</div>
      <form v-else @submit.prevent="handleUpdate" class="p-6 overflow-y-auto max-h-[75vh] space-y-6 text-xs">
        
        <!-- Grid 1: Informasi Personal -->
        <div class="space-y-4">
          <h4 class="text-xs font-semibold text-indigo-400 border-b border-slate-850 pb-2">1. DATA DIRI & KONTAK</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-slate-400 font-medium">Nama Lengkap Sesuai KTP</label>
              <input v-model="form.name" required type="text" class="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500" />
            </div>
            
            <div class="space-y-1.5">
              <label class="text-slate-400 font-medium">Nomor NIK KTP</label>
              <input v-model="form.nik" required type="text" maxlength="16" class="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500" />
            </div>

            <div class="space-y-1.5">
              <label class="text-slate-400 font-medium">No. Telepon / WhatsApp</label>
              <input v-model="form.phone" required type="text" class="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500" />
            </div>

            <div class="space-y-1.5">
              <label class="text-slate-400 font-medium">Alamat E-mail</label>
              <input v-model="form.email" required type="email" class="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>

        <!-- Grid 2: Status Pelanggan -->
        <div class="space-y-4">
          <h4 class="text-xs font-semibold text-indigo-400 border-b border-slate-850 pb-2">2. STATUS AKTIVASI KONEKSI</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-slate-400 font-medium">Status Operasional ISP</label>
              <select v-model="form.status" class="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500">
                <option value="Aktif">Aktif (Layanan Berjalan)</option>
                <option value="Suspend">Suspend (Blokir / Isolir Tagihan)</option>
                <option value="Nonaktif">Nonaktif (Berlangganan Berhenti)</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-slate-400 font-medium">Paket Langganan Internet</label>
              <select v-model="form.package_id" class="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500">
                <option v-for="pkg in packages" :key="pkg.id" :value="pkg.id">{{ pkg.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Form Footer -->
        <div class="border-t border-slate-850 pt-5 flex items-center justify-end gap-3">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl transition">Batal</button>
          <button type="submit" :disabled="loading" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/10 transition">
            <span v-if="loading">Sedang Menyimpan...</span>
            <span v-else>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';

const emit = defineEmits(['close', 'success']);
const props = defineProps({
  customerId: Number,
  packages: Array,
  routers: Array,
  odps: Array,
  areas: Array
});

const loading = ref(false);
const loadingInit = ref(true);
const customerNumber = ref('');

const form = reactive({
  name: '',
  nik: '',
  phone: '',
  email: '',
  status: 'Aktif',
  package_id: ''
});

const fetchCustomerDetail = async () => {
  try {
    const res = await axios.get(\`/api/customers/\${props.customerId}\`);
    const cData = res.data.data;
    customerNumber.value = cData.customer_number;
    form.name = cData.name;
    form.nik = cData.nik;
    form.phone = cData.phone;
    form.email = cData.email;
    form.status = cData.status;
    form.package_id = cData.package_id;
  } catch (err) {
    alert('Gagal mengambil detail pelanggan.');
    emit('close');
  } finally {
    loadingInit.value = false;
  }
};

const handleUpdate = async () => {
  loading.value = true;
  try {
    await axios.put(\`/api/customers/\${props.customerId}\`, form);
    alert('Data pelanggan berhasil diperbarui!');
    emit('success');
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menyimpan perubahan.');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCustomerDetail();
});
</script>
`
      },
      {
        name: 'CustomerTable.vue',
        path: 'frontend/src/views/customers/CustomerTable.vue',
        language: 'vue',
        description: 'Komponen reusable tabel responsif dengan dynamic badge status, preview redaman, dan aksi CRUD terintegrasi.',
        code: `<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="bg-slate-950/60 border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          <th class="px-5 py-4 font-bold">INFO PELANGGAN</th>
          <th class="px-5 py-4 font-bold">KONTAK / EMAIL</th>
          <th class="px-5 py-4 font-bold">PAKET INTERNET</th>
          <th class="px-5 py-4 font-bold">WILAYAH / AREA</th>
          <th class="px-5 py-4 font-bold">STATUS</th>
          <th class="px-5 py-4 font-bold text-center">AKSI</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-800/50 text-xs text-slate-300">
        <!-- Loading State -->
        <tr v-if="loading">
          <td colspan="6" class="px-5 py-12 text-center text-slate-500 font-mono">
            🔄 Sedang menyinkronkan data pelanggan...
          </td>
        </tr>

        <!-- Empty State -->
        <tr v-else-if="customers.length === 0">
          <td colspan="6" class="px-5 py-12 text-center text-slate-500 font-mono">
            📭 Tidak ada data pelanggan yang cocok dengan kriteria filter.
          </td>
        </tr>

        <!-- Row Loop -->
        <tr v-else v-for="customer in customers" :key="customer.id" class="hover:bg-slate-900/40 transition">
          <td class="px-5 py-3.5">
            <div class="font-bold text-slate-200 hover:text-indigo-400 transition cursor-pointer">
              {{ customer.name }}
            </div>
            <div class="text-[10px] font-mono text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>{{ customer.customer_number }}</span>
              <span>•</span>
              <span>NIK: {{ customer.nik }}</span>
            </div>
          </td>
          
          <td class="px-5 py-3.5 font-mono text-[11px]">
            <div>{{ customer.phone }}</div>
            <div class="text-slate-500 mt-0.5 text-[10px]">{{ customer.email }}</div>
          </td>

          <td class="px-5 py-3.5">
            <span class="font-semibold text-slate-300">{{ customer.package?.name || '-' }}</span>
            <div class="text-[10px] text-slate-500 mt-0.5 font-mono">Rp{{ Number(customer.package?.price || 0).toLocaleString('id-ID') }}/bln</div>
          </td>

          <td class="px-5 py-3.5">
            <div>{{ customer.area?.name || '-' }}</div>
            <div class="text-[9px] text-slate-500 mt-0.5 uppercase font-semibold">ODP: {{ customer.odp?.name || '-' }}</div>
          </td>

          <td class="px-5 py-3.5">
            <span :class="getStatusClass(customer.status)" class="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase inline-block">
              ● {{ customer.status }}
            </span>
          </td>

          <td class="px-5 py-3.5">
            <div class="flex items-center justify-center gap-1.5">
              <button @click="$emit('edit', customer.id)" class="px-2.5 py-1.5 bg-slate-950 hover:bg-indigo-500/10 hover:text-indigo-400 border border-slate-800 rounded-lg text-[10px] font-semibold transition" title="Edit Data">
                📝 Edit
              </button>
              <button @click="$emit('delete', customer.id)" class="px-2.5 py-1.5 bg-slate-950 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-800 rounded-lg text-[10px] font-semibold transition" title="Hapus Pelanggan">
                🗑 Hapus
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  customers: Array,
  loading: Boolean
});

defineEmits(['edit', 'delete', 'view']);

const getStatusClass = (status) => {
  switch (status) {
    case 'Aktif':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'Suspend':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'Nonaktif':
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
};
</script>
`
      }
    ]
  },
  {
    id: 'package_module',
    title: '8. Modul Paket Internet (Tahap 5)',
    files: [
      {
        name: '2026_07_03_000000_add_fup_and_status_to_packages_table.php',
        path: 'backend/database/migrations/2026_07_03_000000_add_fup_and_status_to_packages_table.php',
        language: 'php',
        description: 'Migrasi database untuk menambahkan kolom fup_limit dan status pada tabel packages.',
        code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Jalankan migrasi penambahan kolom FUP dan Status Paket.
     */
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->string('fup_limit', 50)->default('Unlimited')->after('description');
            $table->enum('status', ['Aktif', 'Nonaktif'])->default('Aktif')->after('fup_limit');
        });
    }

    /**
     * Kembalikan perubahan migrasi.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn(['fup_limit', 'status']);
        });
    }
};
`
      },
      {
        name: 'Package.php',
        path: 'backend/app/Models/Package.php',
        language: 'php',
        description: 'Eloquent Model untuk mengelola data Paket Internet, relasi satu-ke-banyak dengan pelanggan.',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class Package extends Model
{
    use HasFactory;

    /**
     * Atribut yang dapat diisi melalui mass-assignment.
     */
    protected $fillable = [
        'name',
        'download_speed',
        'upload_speed',
        'price',
        'description',
        'fup_limit',
        'status',
    ];

    /**
     * Konversi tipe data otomatis saat diambil dari database.
     */
    protected $casts = [
        'price' => 'decimal:2',
    ];

    /**
     * Relasi One-to-Many ke data Pelanggan (Customers) yang terdaftar di paket ini.
     */
    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class, 'package_id');
    }
}
`
      },
      {
        name: 'StorePackageRequest.php',
        path: 'backend/app/Http/Requests/StorePackageRequest.php',
        language: 'php',
        description: 'Form Request untuk memvalidasi pendaftaran paket internet baru dengan penegakan nama unik.',
        code: `<?php

namespace App\\Http\\Requests;

use Illuminate\\Foundation\\Http\\FormRequest;

class StorePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|min:3|max:100|unique:packages,name',
            'download_speed' => 'required|string|max:50',
            'upload_speed' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'fup_limit' => 'required|string|max:50',
            'status' => 'required|in:Aktif,Nonaktif',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama paket internet wajib ditentukan.',
            'name.unique' => 'Nama paket ini sudah terdaftar di sistem StarBilling.',
            'price.required' => 'Nominal tarif bulanan wajib diisi.',
            'download_speed.required' => 'Kecepatan bandwidth unduh (DL) wajib diisi.',
            'upload_speed.required' => 'Kecepatan bandwidth unggah (UL) wajib diisi.',
        ];
    }
}
`
      },
      {
        name: 'UpdatePackageRequest.php',
        path: 'backend/app/Http/Requests/UpdatePackageRequest.php',
        language: 'php',
        description: 'Form Request update paket internet dengan pengecualian unique name pada ID paket saat ini.',
        code: `<?php

namespace App\\Http\\Requests;

use Illuminate\\Foundation\\Http\\FormRequest;

class UpdatePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $packageId = $this->route('package');

        return [
            'name' => 'sometimes|required|string|min:3|max:100|unique:packages,name,' . $packageId,
            'download_speed' => 'sometimes|required|string|max:50',
            'upload_speed' => 'sometimes|required|string|max:50',
            'price' => 'sometimes|required|numeric|min:0',
            'description' => 'nullable|string',
            'fup_limit' => 'sometimes|required|string|max:50',
            'status' => 'sometimes|required|in:Aktif,Nonaktif',
        ];
    }
}
`
      },
      {
        name: 'PackageController.php',
        path: 'backend/app/Http/Controllers/Api/PackageController.php',
        language: 'php',
        description: 'Controller utama RESTful API untuk CRUD Paket Internet (Index, Store, Show, Update, Destroy).',
        code: `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Http\\Requests\\StorePackageRequest;
use App\\Http\\Requests\\UpdatePackageRequest;
use App\\Services\\PackageService;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\JsonResponse;
use Exception;

class PackageController extends Controller
{
    protected PackageService $packageService;

    public function __construct(PackageService $packageService)
    {
        $this->packageService = $packageService;
    }

    /**
     * Ambil list semua paket dengan opsi search & filter status
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['search', 'status']);
            $packages = $this->packageService->getAllPackages($filters);

            return response()->json([
                'status' => 'success',
                'data' => $packages
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memuat daftar paket: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Daftarkan paket internet baru ke sistem
     */
    public function store(StorePackageRequest $request): JsonResponse
    {
        try {
            $package = $this->packageService->createPackage($request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Paket internet baru berhasil dibuat.',
                'data' => $package
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lihat detail paket tunggal
     */
    public function show($id): JsonResponse
    {
        try {
            $package = $this->packageService->getPackageById($id);

            return response()->json([
                'status' => 'success',
                'data' => $package
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Perbarui data tarif / speed paket
     */
    public function update(UpdatePackageRequest $request, $id): JsonResponse
    {
        try {
            $package = $this->packageService->updatePackage($id, $request->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Layanan paket internet berhasil diperbarui.',
                'data' => $package
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hapus paket (Memverifikasi agar tidak menghapus paket yang sedang dipakai pelanggan)
     */
    public function destroy($id): JsonResponse
    {
        try {
            $this->packageService->deletePackage($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Paket internet berhasil dihapus dari database.'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
`
      },
      {
        name: 'PackageService.php',
        path: 'backend/app/Services/PackageService.php',
        language: 'php',
        description: 'Service Layer penangan aturan bisnis paket internet, memblokir penghapusan paket aktif pelanggan.',
        code: `<?php

namespace App\\Services;

use App\\Models\\Package;
use Exception;

class PackageService
{
    /**
     * Query data paket dengan filter pencarian kata kunci
     */
    public function getAllPackages(array $filters)
    {
        $query = Package::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{\$search}%")
                  ->orWhere('description', 'like', "%{\$search}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('price', 'asc')->get();
    }

    /**
     * Ambil data detail beserta hitungan jumlah pelanggan terdaftar
     */
    public function getPackageById($id): Package
    {
        $package = Package::withCount('customers')->find($id);
        if (!\$package) {
            throw new Exception("Layanan paket dengan ID #{\$id} tidak terdaftar di sistem.");
        }
        return \$package;
    }

    public function createPackage(array $data): Package
    {
        return Package::create($data);
    }

    public function updatePackage($id, array $data): Package
    {
        \$package = \$this->getPackageById($id);
        \$package->update($data);
        return \$package->fresh();
    }

    public function deletePackage($id): bool
    {
        \$package = \$this->getPackageById($id);

        // Aturan Bisnis Kritis: Cegah data yatim piatu (orphan)
        if (\$package->customers_count > 0) {
            throw new Exception("Paket ini tidak bisa dihapus karena masih aktif dialokasikan untuk {\$package->customers_count} pelanggan.");
        }

        return \$package->delete();
    }
}
`
      },
      {
        name: 'PackageList.vue',
        path: 'frontend/src/views/packages/PackageList.vue',
        language: 'vue',
        description: 'Halaman Vue 3 utama untuk mengelola Paket Internet (CRUD, Harga, Speed DL/UL, FUP, Status).',
        code: `<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
    <!-- Header Modul -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span class="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">🌐</span>
          Manajemen Paket Internet
        </h1>
        <p class="text-xs text-slate-400 mt-1">Konfigurasi bandwidth internet, harga, aturan FUP, serta status ketersediaan paket.</p>
      </div>
      
      <button @click="openCreateModal" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs flex items-center gap-2 transition shadow-lg shadow-indigo-600/10">
        ➕ Buat Paket Baru
      </button>
    </div>

    <!-- Filter Bento Bar -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div class="md:col-span-2 space-y-1.5">
        <label class="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">CARI PAKET INTERNET</label>
        <input 
          v-model="filters.search" 
          @input="debouncedSearch" 
          type="text" 
          placeholder="Ketik nama paket atau deskripsi..." 
          class="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-2 text-xs font-medium outline-none transition"
        />
      </div>

      <div class="space-y-1.5">
        <label class="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">STATUS PAKET</label>
        <select v-model="filters.status" @change="fetchPackages" class="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 transition">
          <option value="">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-950/60 border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              <th class="px-6 py-4">NAMA & DESKRIPSI</th>
              <th class="px-6 py-4">DOWNLOAD SPEED</th>
              <th class="px-6 py-4">UPLOAD SPEED</th>
              <th class="px-6 py-4">HARGA / BULAN</th>
              <th class="px-6 py-4 text-center">FUP LIMIT</th>
              <th class="px-6 py-4 text-center">STATUS</th>
              <th class="px-6 py-4 text-center">AKSI</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/50 text-xs">
            <tr v-if="loading">
              <td colspan="7" class="px-6 py-12 text-center text-slate-500 font-mono">
                🔄 Memuat data paket internet...
              </td>
            </tr>
            <tr v-else-if="packages.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-slate-500 font-mono">
                📭 Tidak ada data paket internet.
              </td>
            </tr>
            <tr v-for="pkg in packages" :key="pkg.id" class="hover:bg-slate-900/40 transition">
              <td class="px-6 py-4">
                <div class="font-bold text-slate-200">{{ pkg.name }}</div>
                <div class="text-[10px] text-slate-400 mt-0.5">{{ pkg.description }}</div>
              </td>
              <td class="px-6 py-4 font-mono font-semibold text-emerald-400">⬇️ {{ pkg.download_speed }}</td>
              <td class="px-6 py-4 font-mono font-semibold text-cyan-400">⬆️ {{ pkg.upload_speed }}</td>
              <td class="px-6 py-4 font-mono font-bold text-slate-200">Rp {{ Number(pkg.price).toLocaleString('id-ID') }}</td>
              <td class="px-6 py-4 text-center">
                <span class="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[10px] font-mono rounded">{{ pkg.fup_limit }}</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span :class="pkg.status === 'Aktif' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'" class="px-2 py-0.5 border text-[9px] font-bold rounded-full">
                  {{ pkg.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button @click="openEditModal(pkg)" class="px-2.5 py-1.5 bg-slate-950 hover:bg-indigo-500/10 hover:text-indigo-400 border border-slate-800 rounded text-[10px] font-semibold transition">✏ Edit</button>
                  <button @click="handleDelete(pkg.id)" class="px-2.5 py-1.5 bg-slate-950 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-800 rounded text-[10px] font-semibold transition">🗑 Hapus</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form (Lazy Rendered) -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div class="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wider text-white">
            {{ isEdit ? 'Edit Paket Internet' : 'Buat Paket Internet Baru' }}
          </h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-white">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div class="space-y-1">
            <label class="text-[10px] font-mono text-slate-400 uppercase">Nama Paket</label>
            <input v-model="form.name" required type="text" class="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[10px] font-mono text-slate-400 uppercase">Download Speed</label>
              <input v-model="form.download_speed" required type="text" placeholder="e.g. 50 Mbps" class="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500" />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-mono text-slate-400 uppercase">Upload Speed</label>
              <input v-model="form.upload_speed" required type="text" placeholder="e.g. 50 Mbps" class="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[10px] font-mono text-slate-400 uppercase">Harga (Rp)</label>
              <input v-model="form.price" required type="number" class="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500" />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-mono text-slate-400 uppercase">FUP Limit</label>
              <input v-model="form.fup_limit" required type="text" placeholder="Unlimited atau e.g. 1000 GB" class="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-mono text-slate-400 uppercase">Status</label>
            <select v-model="form.status" class="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500">
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-mono text-slate-400 uppercase">Deskripsi</label>
            <textarea v-model="form.description" rows="2" class="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-3 text-xs outline-none focus:border-indigo-500 resize-none"></textarea>
          </div>
          
          <div class="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <button type="button" @click="showModal = false" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs">Batal</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';

const loading = ref(false);
const showModal = ref(false);
const isEdit = ref(false);
const selectedId = ref(null);
const packages = ref([]);

const filters = reactive({
  search: '',
  status: ''
});

const form = reactive({
  name: '',
  download_speed: '',
  upload_speed: '',
  price: 0,
  fup_limit: 'Unlimited',
  status: 'Aktif',
  description: ''
});

let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchPackages();
  }, 400);
};

const fetchPackages = async () => {
  loading.value = true;
  try {
    const res = await axios.get('/api/packages', { params: filters });
    packages.value = res.data.data;
  } catch (err) {
    alert('Gagal mengambil data paket.');
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  isEdit.value = false;
  selectedId.value = null;
  form.name = '';
  form.download_speed = '';
  form.upload_speed = '';
  form.price = 0;
  form.fup_limit = 'Unlimited';
  form.status = 'Aktif';
  form.description = '';
  showModal.value = true;
};

const openEditModal = (pkg) => {
  isEdit.value = true;
  selectedId.value = pkg.id;
  form.name = pkg.name;
  form.download_speed = pkg.download_speed;
  form.upload_speed = pkg.upload_speed;
  form.price = pkg.price;
  form.fup_limit = pkg.fup_limit || 'Unlimited';
  form.status = pkg.status || 'Aktif';
  form.description = pkg.description || '';
  showModal.value = true;
};

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await axios.put(\`/api/packages/\${selectedId.value}\`, form);
      alert('Paket internet berhasil diperbarui!');
    } else {
      await axios.post('/api/packages', form);
      alert('Paket internet berhasil ditambahkan!');
    }
    showModal.value = false;
    fetchPackages();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menyimpan paket.');
  }
};

const handleDelete = async (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus paket internet ini?')) {
    try {
      await axios.delete(\`/api/packages/\${id}\`);
      alert('Paket internet berhasil dihapus.');
      fetchPackages();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus paket.');
    }
  }
};

onMounted(() => {
  fetchPackages();
});
</script>
`
      },
      {
        name: 'api.php',
        path: 'backend/routes/api.php (Tambahan)',
        language: 'php',
        description: 'Potongan route API tambahan untuk mendaftarkan endpoint paket internet (CRUD).',
        code: `<?php

use App\\Http\\Controllers\\Api\\PackageController;

Route::middleware('auth:sanctum')->group(function () {
    // API Resource CRUD Paket Internet (Tahap 5)
    Route::apiResource('packages', PackageController::class);
});
`
      }
    ]
  }
];

export const CODEBASE_DATA: CodeGroup[] = [
  ...INITIAL_CODEBASE_DATA,
  ...EXTRA_CODEBASE_DATA,
  CUSTOMER_ENTERPRISE_CODEBASE
];

