/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  Wifi, 
  ArrowUp, 
  ArrowDown, 
  Zap,
  Info,
  DollarSign,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { InternetPackage, Area } from '../types';

interface PackageManagementProps {
  packages: InternetPackage[];
  onAddPackage: (pkg: InternetPackage) => void;
  onUpdatePackage: (pkg: InternetPackage) => void;
  onDeletePackage: (id: string) => void;
  customersCountMap: Record<string, number>; // Maps package_id to customer count for safety checking
  areas?: Area[];
}

export default function PackageManagement({ 
  packages, 
  onAddPackage, 
  onUpdatePackage, 
  onDeletePackage,
  customersCountMap = {},
  areas = []
}: PackageManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<InternetPackage | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    download_speed: '0 Mbps',
    upload_speed: '0 Mbps',
    price: 0,
    description: '',
    fup_limit: 'Unlimited',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
    speed_mbps: 0,
    allow_upgrade: true,
    allow_register: true,
    base_price: 0,
    ppn_percent: 0,
    commission: 0,
    router_id: '',
    mikrotik_profile: '',
    allowed_areas: [] as string[]
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Stats Counters
  const activePackagesCount = packages.filter(p => p.status === 'Aktif').length;
  const inactivePackagesCount = packages.filter(p => p.status === 'Nonaktif').length;
  const avgPrice = packages.length > 0 ? Math.round(packages.reduce((sum, p) => sum + p.price, 0) / packages.length) : 0;

  // Filter packages
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pkg.download_speed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pkg.upload_speed.toLowerCase().includes(searchTerm.toLowerCase());
    
    const pkgStatus = pkg.status || 'Aktif'; // default to Aktif if undefined
    const matchesStatus = statusFilter === 'Semua' || pkgStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingPackage(null);
    setFormData({
      name: '',
      download_speed: '0 Mbps',
      upload_speed: '0 Mbps',
      price: 0,
      description: '',
      fup_limit: 'Unlimited',
      status: 'Aktif',
      speed_mbps: 0,
      allow_upgrade: true,
      allow_register: true,
      base_price: 0,
      ppn_percent: 0,
      commission: 0,
      router_id: '',
      mikrotik_profile: '',
      allowed_areas: []
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (pkg: InternetPackage) => {
    setEditingPackage(pkg);
    const speedNum = pkg.speed_mbps !== undefined ? pkg.speed_mbps : (parseInt(pkg.download_speed) || 0);
    setFormData({
      name: pkg.name,
      download_speed: pkg.download_speed,
      upload_speed: pkg.upload_speed,
      price: pkg.price,
      description: pkg.description || '',
      fup_limit: pkg.fup_limit || 'Unlimited',
      status: pkg.status || 'Aktif',
      speed_mbps: speedNum,
      allow_upgrade: pkg.allow_upgrade !== undefined ? pkg.allow_upgrade : true,
      allow_register: pkg.allow_register !== undefined ? pkg.allow_register : true,
      base_price: pkg.base_price !== undefined ? pkg.base_price : pkg.price,
      ppn_percent: pkg.ppn_percent !== undefined ? pkg.ppn_percent : 0,
      commission: pkg.commission !== undefined ? pkg.commission : 0,
      router_id: pkg.router_id || '',
      mikrotik_profile: pkg.mikrotik_profile || '',
      allowed_areas: pkg.allowed_areas || []
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Nama paket wajib diisi';
    if (formData.speed_mbps < 0) errors.speed_mbps = 'Kecepatan tidak boleh negatif';
    if (formData.base_price < 0) errors.base_price = 'Harga dasar tidak boleh negatif';
    if (formData.ppn_percent < 0 || formData.ppn_percent > 100) errors.ppn_percent = 'PPN harus di antara 0-100%';
    if (formData.commission < 0) errors.commission = 'Komisi tidak boleh negatif';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const calculatedPrice = Number(formData.base_price) + Math.round(Number(formData.base_price) * Number(formData.ppn_percent) / 100);

    const packageData = {
      name: formData.name,
      download_speed: `${formData.speed_mbps} Mbps`,
      upload_speed: `${formData.speed_mbps} Mbps`,
      price: calculatedPrice,
      description: formData.description,
      fup_limit: formData.fup_limit,
      status: formData.status,
      speed_mbps: Number(formData.speed_mbps),
      allow_upgrade: formData.allow_upgrade,
      allow_register: formData.allow_register,
      base_price: Number(formData.base_price),
      ppn_percent: Number(formData.ppn_percent),
      commission: Number(formData.commission),
      router_id: formData.router_id,
      mikrotik_profile: formData.mikrotik_profile,
      allowed_areas: formData.allowed_areas
    };

    if (editingPackage) {
      // Update existing
      onUpdatePackage({
        ...editingPackage,
        ...packageData
      });
    } else {
      // Create new
      onAddPackage({
        id: `pkg-custom-${Date.now()}`,
        ...packageData
      });
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    const activeSubs = customersCountMap[id] || 0;
    if (activeSubs > 0) {
      alert(`⚠️ Tidak dapat menghapus paket "${name}". Terdapat ${activeSubs} pelanggan yang masih terdaftar aktif menggunakan paket ini. Pindahkan pelanggan tersebut ke paket lain terlebih dahulu.`);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus Paket Internet "${name}"?`)) {
      onDeletePackage(id);
    }
  };

  return (
    <div className="space-y-6" id="package-management-root">
      {/* Upper Info / Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-950/80 rounded-xl border border-indigo-800/40">
            <Wifi className="w-6 h-6 text-indigo-400 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Manajemen Paket Internet</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
              Konfigurasi master paket layanan internet ISP StarBilling. Anda dapat mengontrol bandwidth (download/upload speed), FUP limit, nominal tarif iuran bulanan, serta memantau status keaktifan paket yang disinkronkan langsung ke routing MikroTik.
            </p>
          </div>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/20 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Paket
        </button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Paket</span>
            <span className="text-2xl font-serif font-bold text-white mt-1 block">{packages.length}</span>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <Wifi className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Paket Aktif</span>
            <span className="text-2xl font-serif font-bold text-emerald-400 mt-1 block">{activePackagesCount}</span>
          </div>
          <div className="p-2.5 bg-emerald-950/20 rounded-lg border border-emerald-900/30">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Paket Nonaktif</span>
            <span className="text-2xl font-serif font-bold text-rose-400 mt-1 block">{inactivePackagesCount}</span>
          </div>
          <div className="p-2.5 bg-rose-950/20 rounded-lg border border-rose-900/30">
            <AlertCircle className="w-5 h-5 text-rose-400" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Rata-Rata Tarif</span>
            <span className="text-2xl font-serif font-bold text-cyan-400 mt-1 block">Rp{avgPrice.toLocaleString('id-ID')}</span>
          </div>
          <div className="p-2.5 bg-cyan-950/20 rounded-lg border border-cyan-900/30">
            <DollarSign className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {/* Controls Section */}
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Cari nama paket, deskripsi, atau kecepatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Status:</span>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
              {['Semua', 'Aktif', 'Nonaktif'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md text-[10px] font-mono font-semibold transition ${
                    statusFilter === st 
                      ? 'bg-slate-800 text-indigo-400 border border-slate-700/60 font-bold' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {st.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">NAMA & DESKRIPSI LAYANAN</th>
                <th className="px-6 py-4 font-bold">TARIF BULANAN</th>
                <th className="px-6 py-4 font-bold text-center">SPEED (DL / UL)</th>
                <th className="px-6 py-4 font-bold text-center">FUP LIMIT</th>
                <th className="px-6 py-4 font-bold text-center">PELANGGAN AKTIF</th>
                <th className="px-6 py-4 font-bold text-center">STATUS</th>
                <th className="px-6 py-4 font-bold text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs text-slate-300">
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-500 font-mono">
                    📭 Tidak ada paket internet yang ditemukan atau cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg) => {
                  const activeSubs = customersCountMap[pkg.id] || 0;
                  const isAktif = (pkg.status || 'Aktif') === 'Aktif';
                  return (
                    <tr key={pkg.id} className="hover:bg-slate-900/40 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                          {pkg.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 max-w-sm font-sans line-clamp-2">
                          {pkg.description || 'Tidak ada deskripsi layanan.'}
                        </div>
                        <div className="text-[10px] flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                            ID: {pkg.id}
                          </span>
                          {pkg.router_id && (
                            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-900/30">
                              Router: {pkg.router_id}
                            </span>
                          )}
                          {pkg.mikrotik_profile && (
                            <span className="text-[9px] font-mono text-indigo-400 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-900/30">
                              Profile: {pkg.mikrotik_profile}
                            </span>
                          )}
                          {pkg.allow_upgrade !== undefined && (
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                              pkg.allow_upgrade 
                                ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30' 
                                : 'text-slate-500 bg-slate-950 border-slate-800'
                            }`}>
                              Upgrade: {pkg.allow_upgrade ? 'YA' : 'TIDAK'}
                            </span>
                          )}
                          {pkg.allow_register !== undefined && (
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                              pkg.allow_register 
                                ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30' 
                                : 'text-slate-500 bg-slate-950 border-slate-800'
                            }`}>
                              Daftar Online: {pkg.allow_register ? 'YA' : 'TIDAK'}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-slate-200">
                        Rp{pkg.price.toLocaleString('id-ID')}
                        <span className="text-[10px] text-slate-500 font-normal"> / bln</span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="flex items-center gap-0.5 text-indigo-400 font-mono font-semibold">
                            <ArrowDown className="w-3 h-3 text-emerald-400 stroke-[2.5]" />
                            {pkg.download_speed}
                          </span>
                          <span className="text-slate-600">|</span>
                          <span className="flex items-center gap-0.5 text-indigo-400 font-mono font-semibold">
                            <ArrowUp className="w-3 h-3 text-cyan-400 stroke-[2.5]" />
                            {pkg.upload_speed}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block mt-1">Symmetrical</span>
                      </td>

                      <td className="px-6 py-4 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          pkg.fup_limit === 'Unlimited' 
                            ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-900/30' 
                            : 'bg-amber-950/80 text-amber-400 border border-amber-900/30'
                        }`}>
                          {pkg.fup_limit || 'Unlimited'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center font-mono font-semibold">
                        <span className={`px-2.5 py-1 rounded-full text-xs ${
                          activeSubs > 0 ? 'bg-slate-950 text-slate-300 border border-slate-800' : 'text-slate-500'
                        }`}>
                          👥 {activeSubs} Pelanggan
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase inline-block ${
                          isAktif 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          ● {isAktif ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenEdit(pkg)}
                            className="px-2.5 py-1.5 bg-slate-950 hover:bg-indigo-500/10 hover:text-indigo-400 border border-slate-800 rounded-lg text-[10px] font-semibold transition"
                            title="Edit Paket"
                          >
                            <Edit className="w-3.5 h-3.5 inline mr-1" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(pkg.id, pkg.name)}
                            className="px-2.5 py-1.5 bg-slate-950 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-800 rounded-lg text-[10px] font-semibold transition"
                            title="Hapus Paket"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Package Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                  {editingPackage ? 'Edit Paket Internet' : 'Tambah Paket Internet Baru'}
                </h3>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Calculate dynamic Tarif/Bulan based on Harga Dasar and PPN */}
              {(() => {
                const calculatedTarif = Math.round(Number(formData.base_price) + (Number(formData.base_price) * Number(formData.ppn_percent) / 100));
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Nama Paket <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        placeholder="Masukkan nama paket"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition ${
                          formErrors.name ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800'
                        }`}
                      />
                      {formErrors.name && <p className="text-rose-500 text-[10px] mt-1 font-mono">⚠️ {formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Kecepatan <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="0"
                          value={formData.speed_mbps || ''}
                          onChange={(e) => setFormData({...formData, speed_mbps: Number(e.target.value)})}
                          className={`w-full bg-slate-950 border rounded-xl pr-12 pl-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition font-mono ${
                            formErrors.speed_mbps ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800'
                          }`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 font-bold">Mbps</span>
                      </div>
                      {formErrors.speed_mbps && <p className="text-rose-500 text-[10px] mt-1 font-mono">⚠️ {formErrors.speed_mbps}</p>}
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">FUP Limit</label>
                      <input 
                        type="text" 
                        placeholder="Unlimited atau e.g. 1500 GB"
                        value={formData.fup_limit}
                        onChange={(e) => setFormData({...formData, fup_limit: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Ijinkan Upgrade / Downgrade di App ?</label>
                      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button 
                          type="button" 
                          onClick={() => setFormData({...formData, allow_upgrade: true})} 
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition ${formData.allow_upgrade ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          YA
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setFormData({...formData, allow_upgrade: false})} 
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition ${!formData.allow_upgrade ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          TIDAK
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Ijinkan Pendaftaran Online ?</label>
                      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button 
                          type="button" 
                          onClick={() => setFormData({...formData, allow_register: true})} 
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition ${formData.allow_register ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          YA
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setFormData({...formData, allow_register: false})} 
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition ${!formData.allow_register ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          TIDAK
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Harga Dasar</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 font-bold">Rp</span>
                        <input 
                          type="text" 
                          placeholder="0"
                          value={formData.base_price ? formData.base_price.toLocaleString('id-ID') : ''}
                          onChange={(e) => {
                            const cleanVal = e.target.value.replace(/\D/g, '');
                            setFormData({...formData, base_price: cleanVal ? Number(cleanVal) : 0});
                          }}
                          className={`w-full bg-slate-950 border rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition font-mono ${
                            formErrors.base_price ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800'
                          }`}
                        />
                      </div>
                      {formErrors.base_price && <p className="text-rose-500 text-[10px] mt-1 font-mono">⚠️ {formErrors.base_price}</p>}
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">PPN</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="0"
                          value={formData.ppn_percent || ''}
                          onChange={(e) => setFormData({...formData, ppn_percent: Number(e.target.value)})}
                          className={`w-full bg-slate-950 border rounded-xl pr-8 pl-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition font-mono ${
                            formErrors.ppn_percent ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800'
                          }`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 font-bold">%</span>
                      </div>
                      {formErrors.ppn_percent && <p className="text-rose-500 text-[10px] mt-1 font-mono">⚠️ {formErrors.ppn_percent}</p>}
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Tarif / Bulan</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 font-bold">Rp</span>
                        <input 
                          type="text" 
                          value={calculatedTarif.toLocaleString('id-ID')}
                          disabled
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-400 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Komisi Agen</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 font-bold">Rp</span>
                        <input 
                          type="text" 
                          placeholder="0"
                          value={formData.commission ? formData.commission.toLocaleString('id-ID') : ''}
                          onChange={(e) => {
                            const cleanVal = e.target.value.replace(/\D/g, '');
                            setFormData({...formData, commission: cleanVal ? Number(cleanVal) : 0});
                          }}
                          className={`w-full bg-slate-950 border rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition font-mono ${
                            formErrors.commission ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800'
                          }`}
                        />
                      </div>
                      {formErrors.commission && <p className="text-rose-500 text-[10px] mt-1 font-mono">⚠️ {formErrors.commission}</p>}
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Router</label>
                      <select 
                        value={formData.router_id}
                        onChange={(e) => setFormData({...formData, router_id: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                      >
                        <option value="">PILIH ROUTER</option>
                        <option value="Router-Gambir-01">Router-Gambir-01 (Active)</option>
                        <option value="Router-Dedicated-Core">Router-Dedicated-Core</option>
                        <option value="Router-BDG-01">Router-BDG-01</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Default Profile</label>
                      <select 
                        value={formData.mikrotik_profile}
                        onChange={(e) => setFormData({...formData, mikrotik_profile: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                      >
                        <option value="">PILIH PROFILE</option>
                        <option value="Profile-20M">Profile-20M</option>
                        <option value="Profile-50M">Profile-50M</option>
                        <option value="Profile-100M">Profile-100M</option>
                        <option value="Profile-Dedicated">Profile-Dedicated</option>
                      </select>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Status Paket</label>
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                      >
                        <option value="Aktif">🟢 Aktif (Tersedia bagi pelanggan baru & sinkron MikroTik)</option>
                        <option value="Nonaktif">🔴 Nonaktif (Sembunyikan dari pilihan registrasi baru)</option>
                      </select>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Deskripsi Singkat Layanan</label>
                      <textarea 
                        rows={2}
                        placeholder="Gambarkan keunggulan paket ini atau peruntukan idealnya..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition resize-none font-sans"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Batasi Area / Cluster Layanan</label>
                      <p className="text-[10px] text-slate-500 mb-2">Jika dipilih, paket ini hanya akan muncul di area/cluster yang dicentang. Kosongkan untuk menampilkan di seluruh area.</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl max-h-36 overflow-y-auto">
                        {areas.map(area => {
                          const isChecked = formData.allowed_areas.includes(area.id);
                          return (
                            <label key={area.id} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-900 transition text-xs text-slate-300">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      allowed_areas: [...formData.allowed_areas, area.id]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      allowed_areas: formData.allowed_areas.filter(id => id !== area.id)
                                    });
                                  }
                                }}
                                className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                              />
                              <span>{area.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 text-slate-400 text-[10px] bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl leading-normal">
                      <span className="font-bold text-slate-200 block mb-1">ℹ️ Informasi:</span>
                      Jika profile tidak muncul pada daftar di atas, silakan lakukan test koneksi dan simpan ulang router Anda melalui menu <span className="font-semibold text-slate-300">Setting Server → Router Mikrotik</span>. Pilih router yang ingin digunakan, klik Edit, lalu Test Koneksi dan Simpan kembali.
                    </div>

                    <div className="col-span-1 md:col-span-2 text-center text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/40">
                      Copyright 2024 © PT
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editingPackage ? 'Simpan Perubahan' : 'Buat Paket Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
