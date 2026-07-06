/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wifi, 
  Network, 
  Receipt, 
  Coins,
  MessageSquare, 
  Cpu, 
  Terminal, 
  User, 
  Layers, 
  Settings,
  HardDrive,
  MapPin,
  Box,
  UserPlus,
  Wallet,
  Smartphone,
  DollarSign,
  Percent,
  BarChart3,
  Award,
  Landmark,
  Key,
  Puzzle,
  UserCheck,
  Settings2,
  Monitor,
  LogOut,
  ChevronRight,
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: 'admin' | 'customer' | 'developer';
  setActiveRole: (role: 'admin' | 'customer' | 'developer') => void;
  onLogout?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, activeRole, setActiveRole, onLogout }: SidebarProps) {
  // Top flat items for admin
  const adminTopItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'setting-server', name: 'Setting Server', icon: HardDrive },
    { id: 'members-billing', name: 'Members & Billing', icon: Receipt },
  ];

  // Grouped menus for admin
  const adminGroups = [
    {
      title: 'Kelola Data Pelanggan',
      items: [
        { id: 'setting-wilayah', name: 'Setting Wilayah', icon: MapPin },
        { id: 'setting-odp', name: 'Setting ODP', icon: Box },
        { id: 'setting-paket', name: 'Setting Paket', icon: Wifi },
        { id: 'data-pelanggan', name: 'Data Pelanggan', icon: Users },
        { id: 'pendaftaran-online', name: 'Pendaftaran Online', icon: UserPlus },
        { id: 'kolektor', name: 'Kolektor', icon: Wallet },
        { id: 'ticket-komplain', name: 'Ticket Komplain', icon: MessageSquare },
        { id: 'pesan-otomatis', name: 'Pesan Otomatis', icon: Smartphone },
        { id: 'quick-pay', name: 'Direct QuickPay Link', icon: Zap },
      ]
    },
    {
      title: 'Transaksi',
      items: [
        { id: 'transaksi-lainya', name: 'Pembayaran & Transaksi Lainya', icon: DollarSign },
        { id: 'transaksi-lain-lain', name: 'Transaksi Lain-Lain', icon: Coins },
        { id: 'pembayaran-tagihan', name: 'Pembayaran Tagihan', icon: Receipt },
        { id: 'biaya-diskon', name: 'Biaya & Diskon', icon: Percent },
        { id: 'laporan', name: 'Laporan', icon: BarChart3 },
      ]
    },
    {
      title: 'Setting',
      items: [
        { id: 'identitas-lisensi', name: 'Identitas & Lisensi', icon: Award },
        { id: 'master-bank', name: 'Master Bank', icon: Landmark },
        { id: 'payment-gateway', name: 'Payment Gateway', icon: Key },
        { id: 'addon', name: 'AddOn', icon: Puzzle },
        { id: 'karyawan', name: 'Karyawan', icon: UserCheck },
        { id: 'sistem-setting', name: 'Sistem Setting', icon: Settings2 },
        { id: 'diagnostic-center', name: 'Pusat Diagnostik & API', icon: Cpu },
      ]
    },
    {
      title: 'StarBilling',
      items: [
        { id: 'billing-system', name: 'Billing System', icon: Monitor },
      ]
    }
  ];

  const customerMenuItems = [
    { id: 'portal-dash', name: 'My Dashboard', icon: LayoutDashboard },
    { id: 'portal-billing', name: 'Tagihan & Bayar', icon: Receipt },
    { id: 'portal-ticket', name: 'Buat Pengaduan', icon: MessageSquare },
  ];

  const devMenuItems = [
    { id: 'code-explorer', name: 'Source Code & SQL', icon: Terminal },
  ];

  const renderRoleBadge = () => {
    switch (activeRole) {
      case 'admin':
        return <span className="bg-cyan-950 text-cyan-400 border border-cyan-800/60 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase">Super Admin</span>;
      case 'customer':
        return <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase">Customer Portal</span>;
      case 'developer':
        return <span className="bg-indigo-950 text-indigo-400 border border-indigo-800/60 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase">Dev Architect</span>;
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      if (confirm('Apakah Anda yakin ingin logout dari sesi ini?')) {
        setActiveRole('customer');
        setActiveTab('portal-dash');
      }
    }
  };

  return (
    <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 text-slate-100 shrink-0">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header Branding */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-serif font-bold text-xl text-white shadow-md shadow-indigo-600/10 shrink-0">S</div>
            <div className="overflow-hidden">
              <h1 className="font-serif font-bold text-base tracking-tight text-white leading-none truncate">STARBILLING<span className="text-indigo-400">ISP</span></h1>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block mt-1 truncate">Billing System</span>
            </div>
          </div>
        </div>

        {/* Workspace Role Switcher */}
        <div className="p-3 mx-4 my-3 bg-slate-900/40 rounded-xl border border-slate-800/80 shrink-0">
          <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block mb-1.5 font-bold">PILIH PERSPEKTIF</label>
          <div className="grid grid-cols-3 gap-1">
            <button 
              onClick={() => { setActiveRole('admin'); setActiveTab('dashboard'); }}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[9px] font-bold transition ${
                activeRole === 'admin' 
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-600/15' 
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
              title="Admin Console"
            >
              <Layers className="w-3.5 h-3.5 mb-0.5" />
              Admin
            </button>
            <button 
              onClick={() => { setActiveRole('customer'); setActiveTab('portal-dash'); }}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[9px] font-bold transition ${
                activeRole === 'customer' 
                  ? 'bg-emerald-600 text-white shadow shadow-emerald-600/15' 
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
              title="Customer Portal"
            >
              <User className="w-3.5 h-3.5 mb-0.5" />
              Customer
            </button>
            <button 
              onClick={() => { setActiveRole('developer'); setActiveTab('code-explorer'); }}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[9px] font-bold transition ${
                activeRole === 'developer' 
                  ? 'bg-slate-800 text-slate-200' 
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
              title="Source Code / DB"
            >
              <Terminal className="w-3.5 h-3.5 mb-0.5" />
              Source
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
          
          {/* Admin Navigation */}
          {activeRole === 'admin' && (
            <div className="space-y-4">
              
              {/* Flat Top Items */}
              <div className="space-y-0.5">
                {adminTopItems.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-btn-${item.id}`}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isSelected 
                          ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/10' 
                          : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                      {item.name}
                    </button>
                  );
                })}
              </div>

              {/* Grouped Lists */}
              {adminGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
                    {group.title}
                  </div>
                  
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isSelected = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          id={`sidebar-btn-${item.id}`}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                            isSelected 
                              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/10' 
                              : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                          <span className="truncate">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Static Logout Button for Admin */}
              <div className="pt-2 border-t border-slate-900">
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition"
                >
                  <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                  Logout
                </button>
              </div>

            </div>
          )}

          {/* Customer Navigation */}
          {activeRole === 'customer' && (
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
                Portal Pelanggan
              </div>
              {customerMenuItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-btn-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isSelected 
                        ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10' 
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                    {item.name}
                  </button>
                );
              })}
              
              <div className="pt-2 border-t border-slate-900">
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition"
                >
                  <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* Developer Navigation */}
          {activeRole === 'developer' && (
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
                Developer Area
              </div>
              {devMenuItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-btn-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isSelected 
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/10' 
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                    {item.name}
                  </button>
                );
              })}

              <div className="pt-2 border-t border-slate-900">
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition"
                >
                  <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                  Logout
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-mono text-sm font-bold border border-slate-700 text-slate-200 shrink-0">
            {activeRole === 'admin' ? 'SB' : activeRole === 'customer' ? 'PL' : 'DE'}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-xs font-semibold text-white truncate">
              {activeRole === 'admin' ? 'Superadmin StarBilling' : activeRole === 'customer' ? 'Budi Santoso (SB-001)' : 'Laravel Architect'}
            </h4>
            <div className="flex items-center mt-0.5">
              {renderRoleBadge()}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
