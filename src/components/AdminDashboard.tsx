/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  Server, 
  ServerCrash, 
  Boxes, 
  Radio, 
  AlertCircle, 
  FileText,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Customer, Invoice, Ticket } from '../types';

interface AdminDashboardProps {
  customers: Customer[];
  invoices: Invoice[];
  tickets: Ticket[];
}

export default function AdminDashboard({ customers, invoices, tickets }: AdminDashboardProps) {
  // Compute metrics from mock state
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'Aktif').length;
  const suspendCustomers = customers.filter(c => c.status === 'Suspend').length;
  
  // Monthly income computation
  const monthlyRevenue = invoices
    .filter(inv => inv.status === 'Lunas')
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Router, OLT, ONU metrics (simulated)
  const routersOnline = 4;
  const routersOffline = 0;
  const oltOnline = 2;
  const onuOffline = 1;

  // Ticket metrics
  const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'Assigned' || t.status === 'Progress').length;
  
  // Unpaid Invoices
  const unpaidInvoices = invoices.filter(inv => inv.status === 'Belum Bayar' || inv.status === 'Overdue').length;

  // Chart data
  const revenueChartData = [
    { name: 'Jan', revenue: 42000000, target: 40000000 },
    { name: 'Feb', revenue: 48000000, target: 45000000 },
    { name: 'Mar', revenue: 51000000, target: 50000000 },
    { name: 'Apr', revenue: 59000000, target: 55000000 },
    { name: 'May', revenue: 68000000, target: 60000000 },
    { name: 'Jun', revenue: 74000000, target: 70000000 },
    { name: 'Jul (Est)', revenue: 82000000, target: 80000000 }
  ];

  const clientPackageData = [
    { name: 'Basic 20M', value: 12 },
    { name: 'Family 50M', value: 24 },
    { name: 'Ultimate 100M', value: 8 },
    { name: 'Dedicated 50M', value: 3 },
    { name: 'Dedicated 100M', value: 2 }
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

  const statsList = [
    { id: 'stat-total', name: 'Total Pelanggan', value: totalCustomers + 40, icon: Users, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-900/30' },
    { id: 'stat-active', name: 'Pelanggan Aktif', value: activeCustomers + 35, icon: UserCheck, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30' },
    { id: 'stat-suspend', name: 'Pelanggan Suspend', value: suspendCustomers + 4, icon: UserX, color: 'text-amber-400 bg-amber-950/40 border-amber-900/30' },
    { id: 'stat-revenue', name: 'Pendapatan Bulanan', value: `Rp ${(monthlyRevenue + 12800000).toLocaleString('id-ID')}`, icon: TrendingUp, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-900/30' },
    { id: 'stat-router-on', name: 'Router Online', value: routersOnline, icon: Server, color: 'text-indigo-400 bg-slate-950/40 border-slate-800' },
    { id: 'stat-router-off', name: 'Router Offline', value: routersOffline, icon: ServerCrash, color: 'text-rose-400 bg-slate-950/40 border-slate-800' },
    { id: 'stat-olt', name: 'OLT Online', value: oltOnline, icon: Boxes, color: 'text-purple-400 bg-slate-950/40 border-slate-800' },
    { id: 'stat-onu', name: 'ONU Offline', value: onuOffline, icon: Radio, color: 'text-rose-400 bg-rose-950/40 border-rose-900/30' },
    { id: 'stat-tickets', name: 'Ticket Open', value: openTickets, icon: AlertCircle, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-900/30' },
    { id: 'stat-unpaid', name: 'Invoice Unpaid', value: unpaidInvoices, icon: FileText, color: 'text-red-400 bg-red-950/40 border-red-900/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Panel */}
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-xs font-mono text-indigo-400 tracking-wider uppercase">SISTEM AKTIF</span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-white tracking-tight">StarBilling ISP Control Center</h2>
          <p className="text-slate-400 text-sm mt-1">
            Memonitoring jaringan fiber optik, PPPoE MikroTik, penagihan otomatis, dan ticketing secara real-time.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Router Gateway</span>
          <span className="text-emerald-400 font-mono text-xs font-medium flex items-center gap-1 justify-end mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
            CONNECTED (4 ROUTERS)
          </span>
        </div>
      </div>

      {/* Stats KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statsList.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.id}
              className={`p-4 rounded-xl border flex flex-col justify-between hover:shadow-lg transition duration-200 ${stat.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 truncate">{stat.name}</span>
                <Icon className="w-4 h-4 opacity-75" />
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-bold font-serif tracking-tight text-white">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Tren Pendapatan & Target Bulanan</h3>
              <p className="text-xs text-slate-400">Statistik real-time keuangan ISP (dalam Rupiah)</p>
            </div>
            <button className="text-xs text-indigo-400 font-mono flex items-center gap-1 hover:underline">
              Selengkapnya <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(v) => `${(v/1000000)}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold', color: '#6366f1' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Pendapatan Aktual" />
                <Area type="monotone" dataKey="target" stroke="#10b981" strokeWidth={1.5} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorTarget)" name="Target Bisnis" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Client Package Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Segmentasi Paket Internet</h3>
            <p className="text-xs text-slate-400">Persentase sebaran paket aktif pelanggan</p>
          </div>
          
          <div className="h-48 my-4 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={clientPackageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {clientPackageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">TOTAL SHARE</span>
              <span className="text-3xl font-bold text-white font-serif">49</span>
              <span className="text-[10px] text-indigo-400 block font-mono">Active Nodes</span>
            </div>
          </div>

          <div className="space-y-2">
            {clientPackageData.map((pkg, idx) => (
              <div key={pkg.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-300 font-medium">{pkg.name}</span>
                </div>
                <span className="font-mono text-slate-400 font-semibold">{pkg.value} Node ({Math.round(pkg.value / 49 * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* bottom information banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active NOC Alerts */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl">
          <h4 className="text-xs font-mono text-slate-400 tracking-wider uppercase mb-3 block">NOTIFIKASI NOC & GANGGUAN TERBARU</h4>
          <div className="space-y-3">
            <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 animate-ping shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-300">ONU Offline Terdeteksi: TCK-202607-002</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Andi Wijaya - Kabel Dropcore terdeteksi redaman tinggi / putus di ODP-BDG-C02 port 14.</p>
              </div>
            </div>
            <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-lg flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-indigo-300">Sinkronisasi MikroTik Berhasil</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Scheduler sinkronisasi database PPPoE dengan Router-Gambir-01 sukses diselesaikan.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Automation Tool */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono text-slate-400 tracking-wider uppercase mb-1 block">AKSI OTOMATISASI BULANAN</h4>
            <p className="text-xs text-slate-400">Jalankan proses billing otomatis untuk seluruh pelanggan aktif StarBilling.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 block">TAGIHAN DIHASILKAN</span>
              <span className="text-base font-bold text-white font-mono mt-1 block">07 JULI 2026</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 block">JATUH TEMPO UTAMA</span>
              <span className="text-base font-bold text-white font-mono mt-1 block">10 JULI 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
