const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const oldSettingsApp = `{
      id: 'settings',
      label: 'Setting',
      icon: Settings,
      subItems: [
        { id: 'identitas', label: 'Identitas & Lisensi', icon: Shield },
        { id: 'bank', label: 'Master Bank', icon: Building2 },
        { id: 'payment', label: 'Payment Gateway', icon: TerminalSquare },
        { id: 'addon', label: 'AddOn', icon: Puzzle },
        { id: 'karyawan', label: 'Karyawan', icon: UsersRound },
        { id: 'sistem', label: 'Sistem Setting', icon: Settings2 },
        { id: 'github-sync', label: 'Update & GitHub Sync', icon: Github },
      ]
    }`;

const newSettingsApp = `{ id: 'master-bank', label: 'Master Bank', icon: Building2 },
    {
      id: 'payment-gateway',
      label: 'Payment Gateway',
      icon: TerminalSquare,
      subItems: [
        { id: 'pg-xendit', label: 'Xendit', icon: TerminalSquare },
        { id: 'pg-tripay', label: 'Tripay', icon: TerminalSquare },
        { id: 'pg-duitku', label: 'Duitku', icon: TerminalSquare },
        { id: 'pg-flip', label: 'Flip', icon: TerminalSquare },
        { id: 'pg-doku', label: 'Doku', icon: TerminalSquare },
      ]
    },
    {
      id: 'addon',
      label: 'AddOn',
      icon: Puzzle,
      subItems: [
        { id: 'addon-vpn', label: 'VPN Client', icon: Puzzle },
        { id: 'addon-isolir', label: 'Halaman Isolir', icon: Puzzle },
        { id: 'addon-wa', label: 'Wa Gateway', icon: Puzzle },
        { id: 'addon-portal', label: 'Pengaturan Portal Pelanggan', icon: Puzzle },
      ]
    },
    {
      id: 'karyawan',
      label: 'Karyawan',
      icon: UsersRound,
      subItems: [
        { id: 'karyawan-jabatan', label: 'Jabatan & Hak Akses', icon: UsersRound },
        { id: 'karyawan-data', label: 'Data Karyawan', icon: UsersRound },
        { id: 'karyawan-histori', label: 'Histori Login', icon: UsersRound },
        { id: 'karyawan-log', label: 'Log Pelanggan', icon: UsersRound },
      ]
    },
    {
      id: 'sistem-setting',
      label: 'Sistem Setting',
      icon: Settings2,
      subItems: [
        { id: 'sistem-identitas', label: 'Identitas', icon: Settings2 },
        { id: 'sistem-widget', label: 'Widget', icon: Settings2 },
        { id: 'sistem-riset', label: 'Riset Ulang Isolir', icon: Settings2 },
        { id: 'sistem-lisensi', label: 'Lisensi', icon: Settings2 },
      ]
    },
    { id: 'github-sync', label: 'Update & GitHub Sync', icon: Github }`;

if (appContent.includes(oldSettingsApp)) {
    appContent = appContent.replace(oldSettingsApp, newSettingsApp);
    fs.writeFileSync('src/App.tsx', appContent);
    console.log("App.tsx settings menu updated");
} else {
    console.log("Could not find old settings menu in App.tsx");
}

let phpContent = fs.readFileSync('generate_admin_php.cjs', 'utf8');

const oldSettingsPHP = `'Setting' => [
        'Identitas & Lisensi',
        'Master Bank',
        'Payment Gateway',
        'AddOn',
        'Karyawan',
        'Sistem Setting'
    ],
    'Update & GitHub Sync'`;

const newSettingsPHP = `'Master Bank',
    'Payment Gateway' => [
        'Xendit',
        'Tripay',
        'Duitku',
        'Flip',
        'Doku'
    ],
    'AddOn' => [
        'VPN Client',
        'Halaman Isolir',
        'Wa Gateway',
        'Pengaturan Portal Pelanggan'
    ],
    'Karyawan' => [
        'Jabatan & Hak Akses',
        'Data Karyawan',
        'Histori Login',
        'Log Pelanggan'
    ],
    'Sistem Setting' => [
        'Identitas',
        'Widget',
        'Riset Ulang Isolir',
        'Lisensi'
    ],
    'Update & GitHub Sync'`;

if (phpContent.includes(oldSettingsPHP)) {
    phpContent = phpContent.replace(oldSettingsPHP, newSettingsPHP);
    fs.writeFileSync('generate_admin_php.cjs', phpContent);
    console.log("generate_admin_php.cjs settings menu updated");
} else {
    console.log("Could not find old settings menu in generate_admin_php.cjs");
}
