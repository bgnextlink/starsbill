const fs = require('fs');

// 1. Update src/App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const oldMembersApp = `{
      id: 'members',
      label: 'Members & Billing',
      icon: Users,
      subItems: [
        { id: 'kelola-pelanggan', label: 'Kelola Data Pelanggan', icon: Users2 },
        { id: 'wilayah', label: 'Setting Wilayah', icon: MapPin },
        { id: 'odp', label: 'Setting ODP', icon: Router },
        { id: 'paket', label: 'Setting Paket', icon: Package },
        { id: 'data-pelanggan', label: 'Data Pelanggan', icon: UserCheck },
        { id: 'pendaftaran', label: 'Pendaftaran Online', icon: UserPlus },
        { id: 'kolektor', label: 'Kolektor', icon: WalletCards },
        { id: 'komplain', label: 'Ticket Komplain', icon: Ticket },
        { id: 'pesan', label: 'Pesan Otomatis', icon: MessageSquare },
        { id: 'transaksi', label: 'Transaksi', icon: ArrowRightLeft },
      ]
    },`;

const newMembersApp = `{
      id: 'members',
      label: 'Members & Billing',
      icon: Users,
      subItems: [
        { id: 'wilayah', label: 'Setting Wilayah', icon: MapPin },
        { id: 'odp', label: 'Setting ODP', icon: Router },
        { id: 'paket', label: 'Setting Paket', icon: Package },
        { id: 'data-pelanggan', label: 'Data Pelanggan', icon: UserCheck },
        { id: 'pendaftaran', label: 'Pendaftaran Online', icon: UserPlus },
        { id: 'kolektor', label: 'Kolektor', icon: WalletCards },
        { id: 'komplain', label: 'Ticket Komplain', icon: Ticket },
        { id: 'pesan', label: 'Pesan Otomatis', icon: MessageSquare },
      ]
    },`;

if (appContent.includes(oldMembersApp)) {
    appContent = appContent.replace(oldMembersApp, newMembersApp);
    fs.writeFileSync('src/App.tsx', appContent);
    console.log("App.tsx members menu updated");
} else {
    console.log("Could not find old members menu in App.tsx");
}

// 2. Update generate_admin_php.cjs
let phpContent = fs.readFileSync('generate_admin_php.cjs', 'utf8');

const oldMembersPHP = `'Members & Billing' => [
        'Kelola Data Pelanggan',
        'Setting Wilayah',
        'Setting ODP',
        'Setting Paket',
        'Data Pelanggan',
        'Pendaftaran Online',
        'Kolektor',
        'Ticket Komplain',
        'Pesan Otomatis',
        'Transaksi'
    ],`;

const newMembersPHP = `'Members & Billing' => [
        'Setting Wilayah',
        'Setting ODP',
        'Setting Paket',
        'Data Pelanggan',
        'Pendaftaran Online',
        'Kolektor',
        'Ticket Komplain',
        'Pesan Otomatis'
    ],`;

if (phpContent.includes(oldMembersPHP)) {
    phpContent = phpContent.replace(oldMembersPHP, newMembersPHP);
    fs.writeFileSync('generate_admin_php.cjs', phpContent);
    console.log("generate_admin_php.cjs members menu updated");
} else {
    console.log("Could not find old members menu in generate_admin_php.cjs");
}
