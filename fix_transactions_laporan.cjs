const fs = require('fs');

// 1. Update src/App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const oldTransLaporanApp = `{
      id: 'transactions',
      label: 'Pembayaran & Transaksi Lainya',
      icon: CreditCard,
      subItems: [
        { id: 'transaksi-lain', label: 'Transaksi Lain-Lain', icon: ArrowRightLeft },
        { id: 'pembayaran', label: 'Pembayaran Tagihan', icon: Receipt },
        { id: 'biaya-diskon', label: 'Biaya & Diskon', icon: HandCoins },
      ]
    },
    { id: 'laporan', label: 'Laporan', icon: FileText },`;

const newTransLaporanApp = `{
      id: 'transactions',
      label: 'Transaksi',
      icon: CreditCard,
      subItems: [
        { id: 'transaksi-lain', label: 'Transaksi Lain-Lain', icon: ArrowRightLeft },
        { id: 'pembayaran', label: 'Pembayaran Tagihan', icon: Receipt },
        { id: 'biaya-diskon', label: 'Biaya & Diskon', icon: HandCoins },
      ]
    },
    {
      id: 'laporan',
      label: 'Laporan',
      icon: FileText,
      subItems: [
        { id: 'mutasi-keuangan', label: 'Mutasi Keuangan', icon: FileText },
        { id: 'reward-marketing', label: 'Reward Marketing', icon: FileText },
        { id: 'log-isolir', label: 'Log Isolir', icon: FileText },
        { id: 'ganti-paket', label: 'Ganti Paket', icon: FileText },
        { id: 'penjualan-voucher', label: 'Penjualan Voucher', icon: FileText },
        { id: 'pembayaran-online', label: 'Pembayaran Online', icon: FileText },
        { id: 'invoice-unpaid', label: 'Invoice Unpaid', icon: FileText },
        { id: 'log-open-isolir', label: 'Log Open Isolir', icon: FileText },
        { id: 'laporan-omset', label: 'Laporan Omset', icon: FileText },
        { id: 'laporan-laba-rugi', label: 'Laporan Laba Rugi', icon: FileText },
      ]
    },`;

if (appContent.includes(oldTransLaporanApp)) {
    appContent = appContent.replace(oldTransLaporanApp, newTransLaporanApp);
    fs.writeFileSync('src/App.tsx', appContent);
    console.log("App.tsx menus updated");
} else {
    console.log("Could not find old transactions and laporan menus in App.tsx");
}

// 2. Update generate_admin_php.cjs
let phpContent = fs.readFileSync('generate_admin_php.cjs', 'utf8');

const oldTransLaporanPHP = `'Pembayaran & Transaksi Lainya' => [
        'Transaksi Lain-Lain',
        'Pembayaran Tagihan',
        'Biaya & Diskon'
    ],
    'Laporan',`;

const newTransLaporanPHP = `'Transaksi' => [
        'Transaksi Lain-Lain',
        'Pembayaran Tagihan',
        'Biaya & Diskon'
    ],
    'Laporan' => [
        'Mutasi Keuangan',
        'Reward Marketing',
        'Log Isolir',
        'Ganti Paket',
        'Penjualan Voucher',
        'Pembayaran Online',
        'Invoice Unpaid',
        'Log Open Isolir',
        'Laporan Omset',
        'Laporan Laba Rugi'
    ],`;

if (phpContent.includes(oldTransLaporanPHP)) {
    phpContent = phpContent.replace(oldTransLaporanPHP, newTransLaporanPHP);
    fs.writeFileSync('generate_admin_php.cjs', phpContent);
    console.log("generate_admin_php.cjs menus updated");
} else {
    console.log("Could not find old transactions and laporan menus in generate_admin_php.cjs");
}
