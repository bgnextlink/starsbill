import { useState } from 'react';
import {
  LayoutDashboard, Server, Users, MapPin, Router, Package, UserCheck, UserPlus,
  WalletCards, Ticket, MessageSquare, ArrowRightLeft, CreditCard, Receipt, HandCoins,
  FileText, Building2, TerminalSquare, Puzzle, UsersRound, Settings2,
  LogOut, ChevronDown, ChevronRight, Menu, X, Download, Github, RefreshCw,
   
Plus, Edit, Trash2, Search } from 'lucide-react';

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'server': false,
    'members': true,
    'transactions': false,
    'laporan': false,
    'payment-gateway': false,
    'addon': false,
    'karyawan': false,
    'sistem-setting': false
  });

  const toggleSubmenu = (menu: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'server',
      label: 'Setting Server',
      icon: Server,
      subItems: [
        { id: 'router-mikrotik', label: 'Router Mikrotik', icon: Router },
        { id: 'genieacs', label: 'GenieACS', icon: Server },
        { id: 'import-data', label: 'Import Data', icon: ArrowRightLeft },
      ]
    },
    {
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
    },
    {
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
    },
    { id: 'master-bank', label: 'Master Bank', icon: Building2 },
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
        { id: 'github-sync', label: 'Update', icon: Github },
      ]
    }
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                <div className="text-sm text-slate-400 mb-2">PPP Screets</div>
                <div className="text-4xl font-bold text-white">0</div>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                <div className="text-sm text-slate-400 mb-2">PPP Online</div>
                <div className="text-4xl font-bold text-emerald-400">0</div>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                <div className="text-sm text-slate-400 mb-2">PPP Offline</div>
                <div className="text-4xl font-bold text-rose-400">0</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">Pendapatan vs Pengeluaran</h3>
                <div className="h-48 flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg">
                  [Grafik Pendapatan vs Pengeluaran]
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-white">Metode Pembayaran</h3>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Periode</div>
                    <div className="text-sm font-medium text-blue-400">01-07-2026 s/d 09-07-2026</div>
                    <div className="text-xs text-slate-400 mt-1">25 Transaksi</div>
                  </div>
                </div>
                <div className="h-36 flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg">
                  [Grafik Metode Pembayaran]
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
              <div className="p-6 border-b border-slate-800">
                <h3 className="font-bold text-white text-lg">Status Pelanggan</h3>
                <p className="text-slate-400 text-sm mt-1">Daftar Pelanggan Layanan Belum Terpasang atau belum aktif</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">No</th>
                      <th className="px-6 py-4">Nama</th>
                      <th className="px-6 py-4">Telp / Wa</th>
                      <th className="px-6 py-4">Alamat</th>
                      <th className="px-6 py-4">Area</th>
                      <th className="px-6 py-4">Paket</th>
                      <th className="px-6 py-4">Tarif</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    <tr className="hover:bg-slate-800/20">
                      <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                        Tidak ada data pelanggan yang belum terpasang/aktif
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );


        
      case 'router-mikrotik':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-lg">Router Mikrotik</h3>
                <p className="text-slate-400 text-sm mt-1">Daftar koneksi Router Mikrotik yang terhubung dengan sistem</p>
              </div>
              <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                <Plus size={18} /> Tambah Router
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">No</th>
                    <th className="px-6 py-4">Koneksi</th>
                    <th className="px-6 py-4">Auto Isolir</th>
                    <th className="px-6 py-4">Aksi Isolir</th>
                    <th className="px-6 py-4">Profile</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Mode Aktif</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20">
                    <td className="px-6 py-4">1</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">Mikrotik Utama</div>
                      <div className="text-xs text-slate-500">192.168.1.1:8728</div>
                    </td>
                    <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs">Aktif</span></td>
                    <td className="px-6 py-4">Disable Secret</td>
                    <td className="px-6 py-4">PPPoE</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs">Connected</span></td>
                    <td className="px-6 py-4">API</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded transition-colors" title="Edit"><Edit size={16} /></button>
                        <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="p-2 text-rose-400 hover:bg-rose-400/10 rounded transition-colors" title="Hapus"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'genieacs':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-lg">Devices List</h3>
                <p className="text-slate-400 text-sm mt-1">Daftar perangkat GenieACS yang terhubung</p>
              </div>
              <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm">
                <Settings2 size={16} /> Konfigurasi
              </button>
            </div>
            
            <div className="p-6 border-b border-slate-800 bg-slate-950/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Cari Berdasarkan</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="all">SEMUA</option>
                    <option value="mac">MAC Address</option>
                    <option value="serial">Serial Number</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Pencarian</label>
                  <div className="relative">
                    <input type="text" placeholder="Masukkan Kata Kunci Pencarian" className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Device Status</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="all">SEMUA</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">No</th>
                    <th className="px-6 py-4">Device Status</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Last Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20">
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Tidak ada data perangkat ditemukan
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'import-data':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-3xl">
            <h3 className="text-lg font-bold text-white mb-6">Import Data Pelanggan / Sistem</h3>
            <div className="space-y-6">
              <div className="p-4 border border-dashed border-slate-700 rounded-lg bg-slate-950 text-center">
                <ArrowRightLeft className="mx-auto text-slate-500 mb-2" size={32} />
                <p className="text-sm text-slate-400 mb-4">Upload file Excel (.xlsx, .csv) untuk mengimpor data pelanggan secara massal.</p>
                <input type="file" className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="bg-slate-800 hover:bg-slate-700 cursor-pointer text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  Pilih File Data
                </label>
              </div>
              <div>
                <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors">
                  Mulai Import Data
                </button>
              </div>
            </div>
          </div>
        );


      case 'kelola-pelanggan':
      case 'data-pelanggan':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Data Pelanggan</h3>
              <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Tambah Pelanggan</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Nama</th><th className="px-6 py-4">Paket</th><th className="px-6 py-4">IP Address</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 font-mono text-xs">CST-001</td><td className="px-6 py-4 text-white">Budi Santoso</td><td className="px-6 py-4">Home 20 Mbps</td><td className="px-6 py-4 font-mono">10.10.1.5</td><td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Aktif</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 font-mono text-xs">CST-002</td><td className="px-6 py-4 text-white">Siti Aminah</td><td className="px-6 py-4">Home 50 Mbps</td><td className="px-6 py-4 font-mono">10.10.1.6</td><td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Aktif</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 font-mono text-xs">CST-003</td><td className="px-6 py-4 text-white">Andi Network</td><td className="px-6 py-4">Bisnis 100 Mbps</td><td className="px-6 py-4 font-mono">10.10.2.2</td><td className="px-6 py-4"><span className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded-full text-xs">Isolir</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'wilayah':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Setting Wilayah</h3>
              <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Tambah Wilayah</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">Kode Wilayah</th><th className="px-6 py-4">Nama Wilayah</th><th className="px-6 py-4">Keterangan</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4">WL-01</td><td className="px-6 py-4 text-white">Kecamatan Utara</td><td className="px-6 py-4">Area Coverage Utara</td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4">WL-02</td><td className="px-6 py-4 text-white">Kecamatan Selatan</td><td className="px-6 py-4">Area Coverage Selatan</td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'odp':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Setting ODP</h3>
              <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Tambah ODP</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">Nama ODP</th><th className="px-6 py-4">Wilayah</th><th className="px-6 py-4">Kapasitas</th><th className="px-6 py-4">Terpakai</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 font-mono">ODP-UTR-01</td><td className="px-6 py-4">Kecamatan Utara</td><td className="px-6 py-4">16 Port</td><td className="px-6 py-4">12 Port</td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 font-mono">ODP-SEL-05</td><td className="px-6 py-4">Kecamatan Selatan</td><td className="px-6 py-4">8 Port</td><td className="px-6 py-4">8 Port <span className="text-rose-400 text-xs ml-2">(Penuh)</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'paket':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Setting Paket</h3>
              <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Tambah Paket</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">Nama Paket</th><th className="px-6 py-4">Kecepatan</th><th className="px-6 py-4">Harga (Rp)</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 text-white">Home Basic</td><td className="px-6 py-4 font-mono">20 Mbps</td><td className="px-6 py-4">150.000</td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 text-white">Home Pro</td><td className="px-6 py-4 font-mono">50 Mbps</td><td className="px-6 py-4">250.000</td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 text-white">Bisnis Ultimate</td><td className="px-6 py-4 font-mono">100 Mbps</td><td className="px-6 py-4">500.000</td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'pendaftaran':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Pendaftaran Online</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">Tanggal</th><th className="px-6 py-4">Nama Calon</th><th className="px-6 py-4">Alamat</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4">2026-07-05</td><td className="px-6 py-4 text-white">Rudi Hermawan</td><td className="px-6 py-4">Jl. Merdeka No 10</td><td className="px-6 py-4"><span className="text-yellow-400">Menunggu Survey</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Proses</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4">2026-07-06</td><td className="px-6 py-4 text-white">CV. Maju Terus</td><td className="px-6 py-4">Ruko Sentra Bisnis</td><td className="px-6 py-4"><span className="text-blue-400">Proses Instalasi</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Proses</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'kolektor':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Kolektor Lapangan</h3>
              <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Tambah Kolektor</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">Nama Kolektor</th><th className="px-6 py-4">Wilayah</th><th className="px-6 py-4">Total Tagihan Dikutip</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 text-white">Agus Lapangan</td><td className="px-6 py-4">Kecamatan Utara</td><td className="px-6 py-4 font-mono">Rp 4.500.000</td><td className="px-6 py-4"><span className="text-emerald-400">Aktif</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Detail</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 text-white">Bagas Sentosa</td><td className="px-6 py-4">Kecamatan Selatan</td><td className="px-6 py-4 font-mono">Rp 2.100.000</td><td className="px-6 py-4"><span className="text-emerald-400">Aktif</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Detail</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'komplain':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Ticket Komplain</h3>
              <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Buat Tiket</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">ID Tiket</th><th className="px-6 py-4">Pelanggan</th><th className="px-6 py-4">Keluhan</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 font-mono">TK-9921</td><td className="px-6 py-4 text-white">Budi Santoso</td><td className="px-6 py-4">Internet Putus-putus</td><td className="px-6 py-4"><span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Open</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Tindak Lanjuti</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 font-mono">TK-9922</td><td className="px-6 py-4 text-white">Siti Aminah</td><td className="px-6 py-4">Modem Merah (LOS)</td><td className="px-6 py-4"><span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">In Progress</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Tindak Lanjuti</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'pesan':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-3xl">
            <h3 className="text-lg font-bold text-white mb-6">Setting WhatsApp Gateway & Pesan Otomatis</h3>
            <form className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-400 mb-1">WhatsApp API Endpoint</label><input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="http://localhost:8000/send-message"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Template Tagihan Baru</label><textarea rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="Yth. *{nama}*, tagihan internet Anda sebesar *{jumlah}* sudah terbit. Harap bayar sebelum tanggal *{jatuh_tempo}*."/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Template Peringatan Isolir</label><textarea rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="Yth. *{nama}*, internet Anda telah di-isolir karena melewati batas pembayaran."/></div>
              <div className="pt-4"><button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} type="button" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">Simpan Perubahan</button></div>
            </form>
          </div>
        );

      case 'transaksi':
      case 'transaksi-lain':
      case 'pembayaran':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Pembayaran & Transaksi</h3>
              <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Proses Pembayaran</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">Invoice</th><th className="px-6 py-4">Pelanggan</th><th className="px-6 py-4">Bulan</th><th className="px-6 py-4">Total</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 font-mono text-xs">INV-202607-001</td><td className="px-6 py-4 text-white">Budi Santoso</td><td className="px-6 py-4">Juli 2026</td><td className="px-6 py-4">Rp 150.000</td><td className="px-6 py-4"><span className="text-emerald-400">Lunas</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Cetak Struk</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 font-mono text-xs">INV-202607-002</td><td className="px-6 py-4 text-white">Andi Network</td><td className="px-6 py-4">Juli 2026</td><td className="px-6 py-4">Rp 500.000</td><td className="px-6 py-4"><span className="text-rose-400">Belum Bayar</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Bayar</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'biaya-diskon':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-3xl">
            <h3 className="text-lg font-bold text-white mb-6">Konfigurasi Biaya Global & Diskon</h3>
            <form className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Pajak PPN (%)</label><input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="11"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Biaya Keterlambatan</label><input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="10000"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Biaya Pemasangan Standar</label><input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="250000"/></div>
              <div className="pt-4"><button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} type="button" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">Simpan Perubahan</button></div>
            </form>
          </div>
        );

      case 'laporan':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">Ringkasan Laporan Pemasukan</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-slate-950 rounded-lg text-sm text-slate-300"><span>Total Tagihan:</span> <span className="font-mono text-emerald-400">Rp 45.200.000</span></div>
                <div className="flex justify-between p-3 bg-slate-950 rounded-lg text-sm text-slate-300"><span>Lunas:</span> <span className="font-mono text-emerald-400">Rp 35.000.000</span></div>
                <div className="flex justify-between p-3 bg-slate-950 rounded-lg text-sm text-slate-300 border border-rose-900/50"><span>Tunggakan:</span> <span className="font-mono text-rose-400">Rp 10.200.000</span></div>
              </div>
              <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-sm text-white font-medium">Export Laporan Pemasukan (Excel)</button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">Laporan Pelanggan</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-slate-950 rounded-lg text-sm text-slate-300"><span>Total Aktif:</span> <span className="font-mono text-blue-400">1,248</span></div>
                <div className="flex justify-between p-3 bg-slate-950 rounded-lg text-sm text-slate-300"><span>Terisolir:</span> <span className="font-mono text-rose-400">42</span></div>
                <div className="flex justify-between p-3 bg-slate-950 rounded-lg text-sm text-slate-300"><span>Berhenti / Terminate:</span> <span className="font-mono text-slate-400">18</span></div>
              </div>
              <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-sm text-white font-medium">Export Laporan Pelanggan (Excel)</button>
            </div>
          </div>
        );

      case 'identitas':
      case 'sistem':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-3xl">
            <h3 className="text-lg font-bold text-white mb-6">Identitas Perusahaan & Sistem</h3>
            <form className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Nama Perusahaan (ISP)</label><input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="PT. StarBilling Network"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Alamat</label><textarea rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="Jl. Teknologi No. 42, Cyber City"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Telepon</label><input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="081234567890"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Email Bantuan</label><input type="email" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="support@starbilling.net"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Kunci Lisensi (License Key)</label><input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono" defaultValue="SB-LIFETIME-DEMO-2026"/></div>
              <div className="pt-4"><button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} type="button" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">Simpan Perubahan</button></div>
            </form>
          </div>
        );

      case 'bank':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Master Bank</h3>
              <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Tambah Rekening</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">Bank</th><th className="px-6 py-4">Nama Rekening</th><th className="px-6 py-4">Nomor Rekening</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 text-white">BCA</td><td className="px-6 py-4">PT. StarBilling Network</td><td className="px-6 py-4 font-mono">0123456789</td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 text-white">Mandiri</td><td className="px-6 py-4">PT. StarBilling Network</td><td className="px-6 py-4 font-mono">1370000123456</td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-3xl">
            <h3 className="text-lg font-bold text-white mb-6">Payment Gateway Configuration</h3>
            <form className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Tripay Merchant Code</label><input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="T12345"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Tripay API Key</label><input type="password" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="DEV-****************"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Tripay Private Key</label><input type="password" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="****************"/></div>
              <div className="pt-4"><button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} type="button" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">Simpan Perubahan</button></div>
            </form>
          </div>
        );

      case 'addon':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg"><CreditCard size={24} /></div>
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">Installed</span>
              </div>
              <h3 className="font-bold text-white mb-2">QRIS Generator</h3>
              <p className="text-sm text-slate-400 mb-4">Generate QRIS dinamis untuk pembayaran tagihan otomatis tanpa PG.</p>
              <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="w-full bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-sm transition-colors text-white">Pengaturan</button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg"><Receipt size={24} /></div>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Installed</span>
              </div>
              <h3 className="font-bold text-white mb-2">Thermal Printer</h3>
              <p className="text-sm text-slate-400 mb-4">Cetak struk tagihan langsung ke printer thermal bluetooth/USB.</p>
              <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="w-full bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-sm transition-colors text-white">Pengaturan</button>
            </div>
          </div>
        );

      case 'karyawan':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Data Karyawan</h3>
              <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Tambah Karyawan</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">Nama Karyawan</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Role (Jabatan)</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 text-white">Super Admin</td><td className="px-6 py-4">admin@starbilling.lokal</td><td className="px-6 py-4 font-bold text-blue-400">Administrator</td><td className="px-6 py-4"><span className="text-emerald-400">Aktif</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 text-white">Teknisi 1</td><td className="px-6 py-4">teknisi@starbilling.lokal</td><td className="px-6 py-4">Teknisi / Lapangan</td><td className="px-6 py-4"><span className="text-emerald-400">Aktif</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'github-sync':
        return (
          <div className="max-w-3xl">
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-slate-900 rounded-lg text-slate-300">
                    <Github size={32} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">GitHub Synchronization</h2>
                    <p className="text-slate-400 text-sm">Sinkronisasi source code dari repositori GitHub secara real-time</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-900 space-y-6">
                <div>
                  <h3 className="text-slate-300 font-medium mb-1">Repository Target</h3>
                  <div className="flex items-center gap-2 text-blue-400 font-mono text-sm bg-slate-950 p-3 rounded border border-slate-800">
                    https://github.com/bgnextlink/starsbill/
                  </div>
                </div>
                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      const btn = document.getElementById('sync-btn-1');
                      if (btn) btn.innerHTML = '<span class="animate-spin mr-2">↻</span> Sedang Sinkronisasi...';
                      setTimeout(() => {
                        if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg> Check for Updates';
                        alert('Simulasi: Berhasil terhubung ke repositori GitHub. Pada mode localhost/PHP, sistem akan menjalankan perintah git pull origin main.');
                      }, 2000);
                    }}
                    id="sync-btn-1"
                    className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    <RefreshCw size={20} />
                    Check for Updates
                  </button>
                  
                  <button 
                    onClick={() => {
                      const btn = document.getElementById('sync-btn-2');
                      if (btn) btn.innerHTML = '<span class="animate-spin mr-2">↻</span> Force Syncing...';
                      setTimeout(() => {
                        if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg> Force Sync & Replace System';
                        alert('Simulasi: Source Code Core telah di-replace secara paksa dari branch main GitHub. Pada localhost/cPanel, sistem akan menjalankan git fetch --all && git reset --hard origin/main.');
                      }, 2500);
                    }}
                    id="sync-btn-2"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    <Github size={20} />
                    Force Sync & Replace System
                  </button>
                </div>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-200/80 text-sm">
                    <strong>Peringatan:</strong> Melakukan Force Sync akan menimpa file core sistem. Pastikan Anda telah melakukan backup database dan custom module sebelum melanjutkan proses update.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white capitalize">{activeMenu.split('-').join(' ')}</h2>
              <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                + Tambah Data
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Keterangan</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20">
                    <td className="px-6 py-4 font-mono text-xs">#001</td>
                    <td className="px-6 py-4 text-white">Data dummy untuk {activeMenu.split('-').join(' ')}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Aktif</span>
                    </td>
                    <td className="px-6 py-4 text-right text-blue-400 cursor-pointer hover:text-blue-300">Edit</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20">
                    <td className="px-6 py-4 font-mono text-xs">#002</td>
                    <td className="px-6 py-4 text-white">Contoh konfigurasi 2</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Aktif</span>
                    </td>
                    <td className="px-6 py-4 text-right text-blue-400 cursor-pointer hover:text-blue-300">Edit</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-slate-950 border-r border-slate-800
        transition-transform duration-300 ease-in-out
        \${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}
        flex flex-col
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className={`flex items-center gap-3 font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 \${!isSidebarOpen && 'lg:hidden'}`}>
            <Server className="text-blue-500" />
            starbilling.net
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <div className="text-xs font-semibold text-slate-500 mb-4 px-3 uppercase tracking-wider">
            {(!isSidebarOpen) ? 'Menu' : 'Billing System'}
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.subItems) {
                      toggleSubmenu(item.id);
                    } else {
                      setActiveMenu(item.id);
                    }
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                    transition-colors duration-200
                    \${activeMenu === item.id ? 'bg-blue-600/10 text-blue-400' : 'text-slate-300 hover:bg-slate-800/50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={activeMenu === item.id ? 'text-blue-400' : 'text-slate-400'} />
                    <span className={`\${!isSidebarOpen && 'lg:hidden'}`}>{item.label}</span>
                  </div>
                  {item.subItems && (
                    <div className={`\${!isSidebarOpen && 'lg:hidden'}`}>
                      {expandedMenus[item.id] ? (
                        <ChevronDown size={16} className="text-slate-500" />
                      ) : (
                        <ChevronRight size={16} className="text-slate-500" />
                      )}
                    </div>
                  )}
                </button>

                {/* Submenu */}
                {item.subItems && expandedMenus[item.id] && (
                  <div className={`mt-1 ml-4 pl-4 border-l border-slate-800 space-y-1 \${!isSidebarOpen && 'lg:hidden'}`}>
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => setActiveMenu(subItem.id)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                          transition-colors duration-200
                          \${activeMenu === subItem.id ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                        `}
                      >
                        <subItem.icon size={16} />
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors">
            <LogOut size={20} />
            <span className={`\${!isSidebarOpen && 'lg:hidden'}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur border-b border-slate-800 z-40">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4">
            <button 
              className="hidden sm:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              onClick={() => alert('Gunakan menu titik tiga (Options) -> "Export to ZIP" di atas layar AI Studio untuk mendownload source code PHP.')}
            >
              <Download size={16} />
              Download PHP Source
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-slate-200">Super Admin</div>
                <div className="text-xs text-slate-500">admin@starbilling.net</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                SA
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
      </main>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
