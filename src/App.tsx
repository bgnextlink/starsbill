import { useState } from 'react';
import { 
  LayoutDashboard, Server, Users, Users2, MapPin, Router, Package, UserCheck, UserPlus, 
  WalletCards, Ticket, MessageSquare, ArrowRightLeft, CreditCard, Receipt, HandCoins, 
  FileText, Settings, Shield, Building2, TerminalSquare, Puzzle, UsersRound, Settings2,
  LogOut, ChevronDown, ChevronRight, Menu, X, Activity, DollarSign, Download, Github, RefreshCw
} from 'lucide-react';

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'members': true,
    'transactions': false,
    'settings': false
  });

  const toggleSubmenu = (menu: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'server', label: 'Setting Server', icon: Server },
    {
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
    },
    {
      id: 'transactions',
      label: 'Pembayaran & Transaksi Lainya',
      icon: CreditCard,
      subItems: [
        { id: 'transaksi-lain', label: 'Transaksi Lain-Lain', icon: ArrowRightLeft },
        { id: 'pembayaran', label: 'Pembayaran Tagihan', icon: Receipt },
        { id: 'biaya-diskon', label: 'Biaya & Diskon', icon: HandCoins },
      ]
    },
    { id: 'laporan', label: 'Laporan', icon: FileText },
    {
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
    }
  ];

  const renderContent = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-100 capitalize">
          {activeMenu.replace('-', ' ')}
        </h1>
        
        {activeMenu === 'dashboard' ? (
          <>
            <div className="bg-blue-900/40 border border-blue-500/50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-blue-200 mb-2 flex items-center gap-2">
                <Server size={20} />
                Status Mode Preview
              </h3>
              <p className="text-blue-100/80 mb-4">
                StarBilling ISP Suite saat ini ditampilkan dalam mode preview frontend (React) karena lingkungan ini (AI Studio) tidak dapat mengeksekusi PHP secara langsung.
              </p>
              <p className="text-blue-100/80">
                Namun, <strong className="text-white">source code murni PHP untuk localhost / cPanel sudah berhasil dibuat</strong> dan tersimpan di dalam workspace ini. Anda dapat mengunduhnya dengan menekan tombol Export di atas, atau melalui menu pengaturan AI Studio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Pelanggan', value: '1,248', icon: Users, color: 'text-blue-400' },
                { label: 'Pendapatan Bulan Ini', value: 'Rp 45.2M', icon: DollarSign, color: 'text-emerald-400' },
                { label: 'Tiket Aktif', value: '12', icon: Ticket, color: 'text-rose-400' },
                { label: 'Router Aktif', value: '8', icon: Activity, color: 'text-indigo-400' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center gap-4">
                  <div className={`p-4 rounded-lg bg-slate-900/50 \${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                    <div className="text-2xl font-bold text-slate-100">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <LayoutDashboard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h2 className="text-xl font-medium text-slate-300">Welcome to StarBilling ISP Suite</h2>
                <p className="text-slate-500 mt-2">Pilih menu di samping untuk memulai manajemen ISP Anda.</p>
              </div>
            </div>
          </>
        ) : activeMenu === 'github-sync' ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex items-center justify-center min-h-[600px]">
            <div className="max-w-2xl w-full">
              <div className="text-center mb-8">
                <Github className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-200 mb-2">Update & GitHub Sync</h2>
                <p className="text-slate-400">
                  Sinkronisasi langsung dengan repositori GitHub resmi StarBilling.
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700 space-y-6">
                <div>
                  <h3 className="text-slate-300 font-medium mb-1">Repository Target</h3>
                  <div className="flex items-center gap-2 text-blue-400 font-mono text-sm bg-slate-950 p-3 rounded border border-slate-800">
                    https://github.com/bgnextlink/starsbill/
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => alert('Fitur sinkronisasi GitHub akan mengambil source terbaru dari branch main...')}
                    className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    <RefreshCw size={20} />
                    Check for Updates
                  </button>
                  
                  <button 
                    onClick={() => alert('Fitur ini akan me-replace seluruh core PHP system dengan versi terbaru dari GitHub.')}
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
        ) : (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 min-h-[600px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <Settings className="w-16 h-16 text-slate-600 mx-auto animate-spin-slow" />
              <h2 className="text-xl font-medium text-slate-300 capitalize">{activeMenu.replace('-', ' ')} Module</h2>
              <p className="text-slate-500">Modul ini sedang dalam tahap pengembangan.</p>
            </div>
          </div>
        )}
      </div>
    );
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
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors">
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
