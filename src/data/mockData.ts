/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Customer, Odp, InternetPackage, Invoice, Ticket, Transaction, InventoryItem, Area, WaDevice, WaMessage } from '../types';

export const INITIAL_PACKAGES: InternetPackage[] = [
  {
    id: 'pkg-1',
    name: 'StarHome Basic 20 Mbps',
    download_speed: '20 Mbps',
    upload_speed: '20 Mbps',
    price: 185000,
    description: 'Cocok untuk kebutuhan rumah tangga kecil, browsing, dan streaming 2-3 device.',
    fup_limit: '500 GB',
    status: 'Aktif',
    speed_mbps: 20,
    allow_upgrade: true,
    allow_register: true,
    base_price: 185000,
    ppn_percent: 0,
    commission: 15000,
    router_id: 'Router-Gambir-01',
    mikrotik_profile: 'Profile-20M'
  },
  {
    id: 'pkg-2',
    name: 'StarHome Family 50 Mbps',
    download_speed: '50 Mbps',
    upload_speed: '50 Mbps',
    price: 299000,
    description: 'Pilihan terbaik untuk keluarga, support streaming 4K, WFH, dan gaming lancar.',
    fup_limit: '1200 GB',
    status: 'Aktif',
    speed_mbps: 50,
    allow_upgrade: true,
    allow_register: true,
    base_price: 299000,
    ppn_percent: 0,
    commission: 25000,
    router_id: 'Router-Gambir-01',
    mikrotik_profile: 'Profile-50M'
  },
  {
    id: 'pkg-3',
    name: 'StarHome Ultimate 100 Mbps',
    download_speed: '100 Mbps',
    upload_speed: '100 Mbps',
    price: 499000,
    description: 'Kecepatan tinggi tanpa hambatan untuk smart home, content creator, dan heavy downloader.',
    fup_limit: '2500 GB',
    status: 'Aktif',
    speed_mbps: 100,
    allow_upgrade: true,
    allow_register: true,
    base_price: 499000,
    ppn_percent: 0,
    commission: 40000,
    router_id: 'Router-Dedicated-Core',
    mikrotik_profile: 'Profile-100M'
  },
  {
    id: 'pkg-4',
    name: 'StarDedicated Enterprise 50 Mbps',
    download_speed: '50 Mbps',
    upload_speed: '50 Mbps',
    price: 2500000,
    description: 'Koneksi dedicated 1:1, SLA 99.9%, IP Public Static, free monitoring console.',
    fup_limit: 'Unlimited',
    status: 'Aktif',
    speed_mbps: 50,
    allow_upgrade: false,
    allow_register: false,
    base_price: 2500000,
    ppn_percent: 0,
    commission: 150000,
    router_id: 'Router-Dedicated-Core',
    mikrotik_profile: 'Profile-Dedicated'
  },
  {
    id: 'pkg-5',
    name: 'StarDedicated Enterprise 100 Mbps',
    download_speed: '100 Mbps',
    upload_speed: '100 Mbps',
    price: 4500000,
    description: 'Koneksi dedicated enterprise 1:1 dengan bandwidth simetris dan prioritas NOC utama.',
    fup_limit: 'Unlimited',
    status: 'Nonaktif',
    speed_mbps: 100,
    allow_upgrade: false,
    allow_register: false,
    base_price: 4500000,
    ppn_percent: 0,
    commission: 250000,
    router_id: 'Router-Dedicated-Core',
    mikrotik_profile: 'Profile-Dedicated'
  }
];

export const INITIAL_ODPS: Odp[] = [
  { id: 'odp-0', name: 'FAT 3 Pon 1', latitude: -2.9923256234536, longitude: 104.69665106864, capacity: 8, used_port: 0, available_port: 8, router_name: 'Router-Gambir-01', remarks: 'Suryakbar' },
  { id: 'odp-1', name: 'ODP-JKT-A01', latitude: -6.1824, longitude: 106.8294, capacity: 16, used_port: 12, available_port: 4, router_name: 'Router-Gambir-01', remarks: 'Gedung Kencana' },
  { id: 'odp-2', name: 'ODP-JKT-A02', latitude: -6.1835, longitude: 106.8315, capacity: 16, used_port: 8, available_port: 8, router_name: 'Router-Gambir-01', remarks: 'Simpang Lima' },
  { id: 'odp-3', name: 'ODP-JKT-B01', latitude: -6.1802, longitude: 106.8265, capacity: 8, used_port: 8, available_port: 0, router_name: 'Router-Dedicated-Core', remarks: 'Menara Batavia' },
  { id: 'odp-4', name: 'ODP-BDG-C01', latitude: -6.9175, longitude: 107.6191, capacity: 16, used_port: 5, available_port: 11, router_name: 'Router-BDG-01', remarks: 'Surapati Core' },
  { id: 'odp-5', name: 'ODP-BDG-C02', latitude: -6.9192, longitude: 107.6210, capacity: 16, used_port: 14, available_port: 2, router_name: 'Router-BDG-01', remarks: 'Cicadas Hub' }
];

export const INITIAL_AREAS: Area[] = [
  { id: 'area-1', name: 'DKI Jakarta', type: 'City' },
  { id: 'area-2', name: 'Bandung', type: 'City' },
  { id: 'area-3', name: 'Gambir', type: 'District', parent_id: 'area-1' },
  { id: 'area-4', name: 'Menteng', type: 'District', parent_id: 'area-1' },
  { id: 'area-5', name: 'Cibeunying Kidul', type: 'District', parent_id: 'area-2' },
  { id: 'area-6', name: 'Petojo Selatan', type: 'Village', parent_id: 'area-3' },
  { id: 'area-7', name: 'Kebon Sirih', type: 'Village', parent_id: 'area-4' },
  { id: 'area-8', name: 'Cicadas', type: 'Village', parent_id: 'area-5' }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    customer_number: 'SB-2026-0001',
    name: 'Budi Santoso',
    nik: '3273012345670001',
    phone: '081234567890',
    email: 'budi.santoso@gmail.com',
    address: 'Jl. Menteng Raya No. 42, Kebon Sirih, Menteng',
    latitude: -6.1834,
    longitude: 106.8302,
    package_id: 'pkg-2',
    router_id: 'Router-Gambir-01',
    odp_id: 'odp-2',
    marketing_id: 'Asep Marketing',
    status: 'Aktif',
    ktp_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    home_photo_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=300',
    created_at: '2026-01-15'
  },
  {
    id: 'cust-2',
    customer_number: 'SB-2026-0002',
    name: 'Siti Rahmawati',
    nik: '3273012345670002',
    phone: '081398765432',
    email: 'siti.rahma@yahoo.com',
    address: 'Jl. Petojo Barat No. 15, Petojo Selatan, Gambir',
    latitude: -6.1818,
    longitude: 106.8281,
    package_id: 'pkg-1',
    router_id: 'Router-Gambir-01',
    odp_id: 'odp-1',
    marketing_id: 'Asep Marketing',
    status: 'Aktif',
    ktp_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=300',
    home_photo_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=300',
    created_at: '2026-02-10'
  },
  {
    id: 'cust-3',
    customer_number: 'SB-2026-0003',
    name: 'PT Maju Jaya Abadi',
    nik: '3273012345670003',
    phone: '0215556789',
    email: 'info@majujaya.co.id',
    address: 'Menara Batavia Lt. 12, Sudirman',
    latitude: -6.1802,
    longitude: 106.8265,
    package_id: 'pkg-4',
    router_id: 'Router-Dedicated-Core',
    odp_id: 'odp-3',
    marketing_id: 'Direct Sales',
    status: 'Aktif',
    created_at: '2026-01-05'
  },
  {
    id: 'cust-4',
    customer_number: 'SB-2026-0004',
    name: 'Andi Wijaya',
    nik: '3273012345670004',
    phone: '085722334455',
    email: 'andi.wijaya@outlook.com',
    address: 'Jl. Cicadas Baru No. 110, Cicadas, Bandung',
    latitude: -6.9185,
    longitude: 107.6202,
    package_id: 'pkg-3',
    router_id: 'Router-BDG-01',
    odp_id: 'odp-5',
    marketing_id: 'Dewi Marketing',
    status: 'Suspend',
    ktp_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
    home_photo_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=300',
    created_at: '2026-03-01'
  },
  {
    id: 'cust-5',
    customer_number: 'SB-2026-0005',
    name: 'Dewi Lestari',
    nik: '3273012345670005',
    phone: '089876543210',
    email: 'dewi.lestari@gmail.com',
    address: 'Jl. Surapati No. 89, Cibeunying Kidul, Bandung',
    latitude: -6.9170,
    longitude: 107.6185,
    package_id: 'pkg-2',
    router_id: 'Router-BDG-01',
    odp_id: 'odp-4',
    marketing_id: 'Dewi Marketing',
    status: 'Nonaktif',
    created_at: '2026-04-12'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  { id: 'inv-1', invoice_number: 'INV/202607/0001', customer_id: 'cust-1', amount: 185000, due_date: '2026-07-10', status: 'Belum Bayar' },
  { id: 'inv-2', invoice_number: 'INV/202607/0002', customer_id: 'cust-2', amount: 299000, due_date: '2026-07-10', status: 'Lunas', paid_date: '2026-07-02', payment_method: 'QRIS - Xendit' },
  { id: 'inv-3', invoice_number: 'INV/202607/0003', customer_id: 'cust-3', amount: 2500000, due_date: '2026-07-10', status: 'Belum Bayar' },
  { id: 'inv-4', invoice_number: 'INV/202607/0004', customer_id: 'cust-4', amount: 499000, due_date: '2026-07-01', status: 'Overdue' },
  { id: 'inv-5', invoice_number: 'INV/202606/0001', customer_id: 'cust-1', amount: 185000, due_date: '2026-06-10', status: 'Lunas', paid_date: '2026-06-08', payment_method: 'Virtual Account - Midtrans' },
  { id: 'inv-6', invoice_number: 'INV/202606/0002', customer_id: 'cust-4', amount: 499000, due_date: '2026-06-10', status: 'Suspend' }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'tic-1',
    ticket_number: 'TCK-202607-001',
    customer_id: 'cust-1',
    title: 'Koneksi Lambat di Sore Hari',
    category: 'Internet Lambat',
    priority: 'Medium',
    status: 'Open',
    description: 'Sering mengalami drop bandwidth dari pukul 18:00 hingga 21:00. Download hanya dapat 2-3 Mbps.',
    created_at: '2026-07-03'
  },
  {
    id: 'tic-2',
    ticket_number: 'TCK-202607-002',
    customer_id: 'cust-4',
    title: 'Indikator LOS Merah Menyala',
    category: 'LOS / Kabel Putus',
    priority: 'High',
    status: 'Assigned',
    assignee: 'Farhan (Teknisi Lapangan)',
    description: 'Lampu PON mati, LOS berkedip merah. Diduga kabel dropcore putus tersangkut dahan pohon mangga.',
    created_at: '2026-07-02'
  },
  {
    id: 'tic-3',
    ticket_number: 'TCK-202606-015',
    customer_id: 'cust-2',
    title: 'Bantuan Ubah Sandi Wi-Fi ZTE',
    category: 'Ganti Password Wi-Fi',
    priority: 'Low',
    status: 'Solved',
    assignee: 'Susi (Customer Service)',
    description: 'Pelanggan meminta bantuan panduan untuk mengganti sandi nirkabel demi keamanan keluarga.',
    created_at: '2026-06-28'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tr-1', date: '2026-07-02', description: 'Pembayaran Tagihan INV/202607/0002', type: 'Pemasukan', category: 'Iuran Bulanan', amount: 299000, payment_method: 'QRIS - Xendit', reference_no: 'TRX-98310023' },
  { id: 'tr-2', date: '2026-07-01', description: 'Gaji Bulanan Staff NOC & Admin', type: 'Pengeluaran', category: 'Gaji Karyawan', amount: 15400000, payment_method: 'Transfer Bank - BCA', reference_no: 'TRX-31049210' },
  { id: 'tr-3', date: '2026-06-29', description: 'Sewa Bandwidth Transit Indosat 1 Gbps', type: 'Pengeluaran', category: 'Sewa Bandwidth', amount: 45000000, payment_method: 'Transfer Bank - Mandiri', reference_no: 'TRX-2041920' },
  { id: 'tr-4', date: '2026-06-28', description: 'Pembelian Dropcore Kabel 5 Roll @150m', type: 'Pengeluaran', category: 'Beli Alat / Fiber Optic', amount: 1850000, payment_method: 'Kas Kecil', reference_no: 'TRX-821903' },
  { id: 'tr-5', date: '2026-06-25', description: 'Biaya Pasang Baru Pelanggan SB-2026-0009', type: 'Pemasukan', category: 'Biaya Instalasi', amount: 350000, payment_method: 'Virtual Account - Midtrans', reference_no: 'TRX-310291' }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv-item-1', name: 'ONT ZTE F609 V8 GPON', sku: 'ONT-ZTE-F609-V8', stock: 45, min_stock: 10, supplier: 'PT ZTE Indonesia', category: 'ONT', price: 285000, created_at: '2026-01-10' },
  { id: 'inv-item-2', name: 'ONT Fiberhome HG6145D AC Dual Band', sku: 'ONT-FH-HG6145D', stock: 32, min_stock: 10, supplier: 'PT Fiberhome Technologies', category: 'ONT', price: 345000, created_at: '2026-02-14' },
  { id: 'inv-item-3', name: 'OLT HiOSO 4 Port EPON HA7304C', sku: 'OLT-HIOSO-4P', stock: 3, min_stock: 1, supplier: 'importir SFP Raya', category: 'OLT', price: 3800000, created_at: '2026-03-01' },
  { id: 'inv-item-4', name: 'Kabel Dropcore 1 Core 3 Ring 1000m', sku: 'KAB-DC-1C-1000M', stock: 12, min_stock: 3, supplier: 'Kabelindo Perkasa', category: 'Kabel Dropcore', price: 980000, created_at: '2026-01-20' },
  { id: 'inv-item-5', name: 'Patchcord SC-UPC to SC-APC 3M', sku: 'PTC-SC-3M', stock: 154, min_stock: 20, supplier: 'Kabelindo Perkasa', category: 'Patchcord', price: 8500, created_at: '2026-05-02' }
];

export const INITIAL_WA_DEVICES: WaDevice[] = [
  { id: 'dev-1', name: 'NOC-WA-GATEWAY-1', number: '081234567890', status: 'Connected', session_name: 'session_noc_primary', platform: 'Go WhatsApp' },
  { id: 'dev-2', name: 'BILLING-ALERTS-LINE', number: '081298765432', status: 'Connected', session_name: 'session_billing_alerts', platform: 'WAHA' }
];

export const INITIAL_WA_MESSAGES: WaMessage[] = [
  { id: 'msg-1', device_id: 'dev-1', recipient: '081234567890', message: 'Halo Budi, tagihan Anda sebesar Rp 299.000 telah lunas via QRIS.', type: 'Billing Reminder', status: 'Sent', created_at: '2026-07-02T10:00:00' },
  { id: 'msg-2', device_id: 'dev-1', recipient: '085722334455', message: '🎁 PROMO UPGRADE SPEED STARBILLING\n\nYth. Andi Wijaya, nikmati kuota tanpa batasan (Unlimited) dengan kecepatan 2x lebih cepat hanya dengan tambah Rp 30.000/bulan!\n\nBalas pesan ini untuk aktivasi sekarang juga.', type: 'Broadcast', status: 'Sent', created_at: '2026-07-03T09:15:00' },
  { id: 'msg-3', device_id: 'dev-1', recipient: '081398765432', message: '⚠️ INFO GANGGUAN NETWORK NOC\n\nYth. Pelanggan StarBilling, diinformasikan bahwa saat ini sedang terjadi gangguan massal di area GAMBIR disebabkan oleh kabel FO backbone putus. Estimasi perbaikan 2-3 jam.\n\nKami memohon maaf atas ketidaknyamanan ini.', type: 'Notification', status: 'Failed', created_at: '2026-07-03T14:20:00' },
  { id: 'msg-4', device_id: 'dev-2', recipient: '089876543210', message: '🔐 KODE VERIFIKASI (OTP)\n\nKode OTP StarBilling Anda adalah: 492019\n\nRahasiakan kode ini dari siapa pun termasuk petugas kami. Kode ini valid selama 5 menit.', type: 'OTP', status: 'Sent', created_at: '2026-07-04T08:05:00' },
  { id: 'msg-5', device_id: 'dev-2', recipient: '0215556789', message: '🔔 REMINDER TAGIHAN INTERNET STARBILLING\n\nYth. PT Maju Jaya Abadi (SB-2026-0003),\nTagihan internet paket StarDedicated Enterprise 50 Mbps Anda untuk Periode Juli 2026 sebesar Rp 2.500.000 akan jatuh tempo pada 10 Juli 2026. Mohon lakukan pembayaran ke Rekening Bank BCA sebelum dinonaktifkan.\n\nTerima Kasih.', type: 'Billing Reminder', status: 'Pending', created_at: '2026-07-04T08:10:00' },
  { id: 'msg-6', device_id: 'dev-1', recipient: '081223344556', message: '🎁 PROMO UPGRADE SPEED STARBILLING\n\nYth. Pelanggan, nikmati kuota tanpa batasan (Unlimited) dengan kecepatan 2x lebih cepat...', type: 'Broadcast', status: 'Sent', created_at: '2026-07-01T11:00:00' },
  { id: 'msg-7', device_id: 'dev-2', recipient: '085298123456', message: '🚨 PERINGATAN ISOLIR LAYANAN\n\nYth. Budi Santoso (SB-2026-0001), layanan internet StarHome Family 50 Mbps Anda sebesar Rp 299.000 akan terisolir otomatis besok karena belum ada pembayaran.', type: 'Billing Reminder', status: 'Sent', created_at: '2026-07-02T16:45:00' },
  { id: 'msg-8', device_id: 'dev-2', recipient: '081912345678', message: '🔐 KODE VERIFIKASI (OTP)\n\nKode OTP StarBilling Anda adalah: 882019', type: 'OTP', status: 'Sent', created_at: '2026-07-03T10:30:00' },
  { id: 'msg-9', device_id: 'dev-1', recipient: '081198765432', message: '⚠️ INFO GANGGUAN NETWORK NOC\n\nYth. Pelanggan StarBilling, diinformasikan bahwa saat ini sedang terjadi gangguan massal...', type: 'Notification', status: 'Sent', created_at: '2026-07-03T11:00:00' },
  { id: 'msg-10', device_id: 'dev-1', recipient: '085722334455', message: '🔔 REMINDER TAGIHAN INTERNET STARBILLING\n\nYth. Andi Wijaya (SB-2026-0004),\nTagihan internet paket StarHome Ultimate 100 Mbps Anda sebesar Rp 499.000...', type: 'Billing Reminder', status: 'Sent', created_at: '2026-07-02T09:00:00' }
];
