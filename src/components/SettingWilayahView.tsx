import React, { useState } from 'react';
import { 
  MapPin, 
  Layers, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter
} from 'lucide-react';
import { Area } from '../types';

interface SettingWilayahViewProps {
  areas: Area[];
  onAddArea: (area: Area) => void;
  onUpdateArea: (area: Area) => void;
  onDeleteArea: (id: string) => void;
}

export default function SettingWilayahView({ 
  areas, 
  onAddArea, 
  onUpdateArea, 
  onDeleteArea 
}: SettingWilayahViewProps) {
  // Dropdown filter selection state
  const [selectedFilterAreaId, setSelectedFilterAreaId] = useState<string>('all');
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state ("Lihat 10 baris")
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // New Area form states
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'City' | 'District' | 'Village'>('Village');
  const [newParentId, setNewParentId] = useState('');
  const [newAllowUpgradeDowngrade, setNewAllowUpgradeDowngrade] = useState(true);
  const [newPaymentGateway, setNewPaymentGateway] = useState('');

  // Edit inline states
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<'City' | 'District' | 'Village'>('Village');
  const [editParentId, setEditParentId] = useState('');
  const [editPaymentGateway, setEditPaymentGateway] = useState('');

  // Helper to get parent breadcrumbs
  const getAreaHierarchy = (area: Area): string => {
    const parts: string[] = [area.name];
    let current = area;
    let limit = 0; // prevent infinite loops
    while (current.parent_id && limit < 5) {
      const parent = areas.find(a => a.id === current.parent_id);
      if (parent) {
        parts.unshift(parent.name);
        current = parent;
      } else {
        break;
      }
      limit++;
    }
    return parts.join(' ➔ ');
  };

  // Filtered areas based on selected dropdown area and search query
  const filteredAreas = areas.filter(area => {
    // Dropdown selection filter
    let matchesDropdown = true;
    if (selectedFilterAreaId !== 'all') {
      // Show if it is the selected area, or is a child/sub-child of the selected area
      const isSelf = area.id === selectedFilterAreaId;
      const isChild = area.parent_id === selectedFilterAreaId;
      
      // Check sub-children as well
      let isSubChild = false;
      if (area.parent_id) {
        const parent = areas.find(a => a.id === area.parent_id);
        if (parent && parent.parent_id === selectedFilterAreaId) {
          isSubChild = true;
        }
      }
      matchesDropdown = isSelf || isChild || isSubChild;
    }

    // Text search query matching
    const matchesSearch = 
      area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.type.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDropdown && matchesSearch;
  });

  // Pagination calculations
  const totalRows = filteredAreas.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedAreas = filteredAreas.slice(startIndex, startIndex + rowsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Submit new area
  const handleAddAreaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert('Nama wilayah wajib diisi!');
      return;
    }

    const newArea: Area = {
      id: `area-${Date.now()}`,
      name: newName.trim(),
      type: newType,
      parent_id: newType !== 'City' && newParentId ? newParentId : undefined,
      allow_upgrade_downgrade: newAllowUpgradeDowngrade,
      payment_gateway: newPaymentGateway || undefined
    };

    onAddArea(newArea);
    
    // Reset Form
    setNewName('');
    setNewParentId('');
    setNewAllowUpgradeDowngrade(true);
    setNewPaymentGateway('');
    alert('Sukses: Wilayah baru berhasil ditambahkan ke database!');
  };

  // Handle toggle upgrade/downgrade di App
  const handleToggleUpgradeDowngrade = (area: Area) => {
    const updated = {
      ...area,
      allow_upgrade_downgrade: area.allow_upgrade_downgrade === undefined ? false : !area.allow_upgrade_downgrade
    };
    onUpdateArea(updated);
  };

  // Start edit
  const startEdit = (area: Area) => {
    setEditingAreaId(area.id);
    setEditName(area.name);
    setEditType(area.type);
    setEditParentId(area.parent_id || '');
    setEditPaymentGateway(area.payment_gateway || '');
  };

  // Save edit
  const saveEdit = (area: Area) => {
    if (!editName.trim()) {
      alert('Nama wilayah tidak boleh kosong!');
      return;
    }
    const updated: Area = {
      ...area,
      name: editName.trim(),
      type: editType,
      parent_id: editType !== 'City' && editParentId ? editParentId : undefined,
      payment_gateway: editPaymentGateway || undefined
    };
    onUpdateArea(updated);
    setEditingAreaId(null);
    alert('Sukses: Informasi wilayah berhasil diperbarui!');
  };

  // Delete area
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus wilayah "${name}"? Menghapus wilayah utama dapat mempengaruhi pemetaan ODP dan Pelanggan.`)) {
      onDeleteArea(id);
      alert('Sukses: Wilayah berhasil dihapus.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP SELECTOR & SEARCH PANEL */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-auto">
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" /> Pengolahan &amp; Setting Wilayah
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasikan wilayah jangkauan FTTH dan tentukan izin modifikasi paket pelanggan mandiri di aplikasi.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Dropdown wilayah filter */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 min-w-[200px]">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedFilterAreaId}
              onChange={(e) => {
                setSelectedFilterAreaId(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 outline-none w-full cursor-pointer font-mono font-semibold"
            >
              <option value="all">🌍 Tampilkan Semua Wilayah</option>
              {areas.map(a => (
                <option key={a.id} value={a.id}>
                  {a.type === 'City' ? '🏙️' : a.type === 'District' ? '🏡' : '📍'} {a.name} ({a.type})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search */}
          <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
            <input 
              type="text"
              placeholder="Cari wilayah..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-32 focus:w-44 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. FORM TAMBAH WILAYAH */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 h-fit shadow-xl">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-2.5 border-b border-slate-800">
            <Plus className="w-4 h-4 text-cyan-400" /> Tambah Wilayah Baru
          </h4>

          <form onSubmit={handleAddAreaSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Nama Wilayah / Area *</label>
              <input 
                type="text"
                required
                placeholder="Contoh: Palembang, Menteng, dsb."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Tingkatan / Tipe Wilayah</label>
              <select
                value={newType}
                onChange={e => {
                  setNewType(e.target.value as any);
                  setNewParentId('');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="City">Kota / Kabupaten (City)</option>
                <option value="District">Kecamatan (District)</option>
                <option value="Village">Kelurahan / Desa (Village)</option>
              </select>
            </div>

            {newType !== 'City' && (
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Wilayah Atasan (Parent Area)</label>
                <select
                  value={newParentId}
                  onChange={e => setNewParentId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Pilih Wilayah Atasan --</option>
                  {areas
                    .filter(a => {
                      if (newType === 'District') return a.type === 'City';
                      if (newType === 'Village') return a.type === 'District';
                      return false;
                    })
                    .map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name} ({parent.type})
                      </option>
                    ))
                  }
                </select>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-850 rounded-xl">
              <div>
                <span className="text-[11px] font-bold text-white block">Izin Upgrade / Downgrade?</span>
                <span className="text-[9px] text-slate-500">Izinkan pelanggan di wilayah ini ubah paket mandiri</span>
              </div>
              <button
                type="button"
                onClick={() => setNewAllowUpgradeDowngrade(!newAllowUpgradeDowngrade)}
                className="text-slate-300 hover:text-white transition"
              >
                {newAllowUpgradeDowngrade ? (
                  <ToggleRight className="w-8 h-8 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
              </button>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Payment Gateway Wilayah</label>
              <select
                value={newPaymentGateway}
                onChange={e => setNewPaymentGateway(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="">-- Gunakan Default Sistem --</option>
                <option value="Midtrans Gateway (QRIS & VA)">Midtrans Gateway (QRIS & VA)</option>
                <option value="Xendit Multi-Payment">Xendit Multi-Payment</option>
                <option value="Duitku Instant Pay">Duitku Instant Pay</option>
                <option value="BCA / Mandiri Manual Verifikasi">BCA / Mandiri Manual Verifikasi</option>
                <option value="Faspay Gateway">Faspay Gateway</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-cyan-500/10"
            >
              <Plus className="w-4 h-4" /> Simpan Wilayah
            </button>
          </form>
        </div>

        {/* 3. LIST TABLE PENGOLAHAN DATA WILAYAH */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:col-span-2 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-400" /> Pengolahan Data Wilayah
            </h4>
            <span className="text-[10px] font-mono text-slate-500">
              Total: {totalRows} baris
            </span>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-850 bg-slate-950 text-[10px] font-mono text-slate-500 uppercase">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Area / Wilayah</th>
                  <th className="py-3 px-4 text-center">Ijinkan Upgrade / Downgrade di App ?</th>
                  <th className="py-3 px-4 text-right">Act</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-sans text-slate-300">
                {paginatedAreas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500 font-mono">
                      No matching areas found.
                    </td>
                  </tr>
                ) : (
                  paginatedAreas.map((area, index) => {
                    const rowNumber = startIndex + index + 1;
                    const isEditing = editingAreaId === area.id;

                    return (
                      <tr key={area.id} className="hover:bg-slate-900/30 transition group">
                        <td className="py-3 px-4 text-center font-mono text-slate-500">{rowNumber}</td>
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <div className="space-y-2 max-w-xs">
                              <input
                                type="text"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1 text-xs text-white"
                              />
                              <div className="flex gap-1.5">
                                <select
                                  value={editType}
                                  onChange={e => setEditType(e.target.value as any)}
                                  className="bg-slate-900 border border-slate-850 rounded px-1.5 py-0.5 text-[10px] text-slate-300"
                                >
                                  <option value="City">City</option>
                                  <option value="District">District</option>
                                  <option value="Village">Village</option>
                                </select>
                                {editType !== 'City' && (
                                  <select
                                    value={editParentId}
                                    onChange={e => setEditParentId(e.target.value)}
                                    className="bg-slate-900 border border-slate-850 rounded px-1.5 py-0.5 text-[10px] text-slate-300 max-w-[120px] truncate"
                                  >
                                    <option value="">Parent</option>
                                    {areas
                                      .filter(a => {
                                        if (editType === 'District') return a.type === 'City';
                                        if (editType === 'Village') return a.type === 'District';
                                        return false;
                                      })
                                      .map(parent => (
                                        <option key={parent.id} value={parent.id}>{parent.name}</option>
                                      ))
                                    }
                                  </select>
                                )}
                              </div>
                              <select
                                value={editPaymentGateway}
                                onChange={e => setEditPaymentGateway(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1 text-[10px] text-slate-300 font-mono mt-1"
                              >
                                <option value="">-- Default Sistem --</option>
                                <option value="Midtrans Gateway (QRIS & VA)">Midtrans Gateway (QRIS & VA)</option>
                                <option value="Xendit Multi-Payment">Xendit Multi-Payment</option>
                                <option value="Duitku Instant Pay">Duitku Instant Pay</option>
                                <option value="BCA / Mandiri Manual Verifikasi">BCA / Mandiri Manual Verifikasi</option>
                                <option value="Faspay Gateway">Faspay Gateway</option>
                              </select>
                            </div>
                          ) : (
                            <div>
                              <div className="font-semibold text-white flex items-center gap-2">
                                <span>{area.name}</span>
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                                  area.type === 'City' ? 'bg-cyan-950 text-cyan-400' :
                                  area.type === 'District' ? 'bg-indigo-950 text-indigo-400' :
                                  'bg-emerald-950 text-emerald-400'
                                }`}>
                                  {area.type}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {getAreaHierarchy(area)}
                              </div>
                              <div className="text-[10px] text-cyan-400 font-mono mt-0.5 flex items-center gap-1 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-900 w-fit">
                                <span className="text-slate-500 font-bold uppercase text-[8px]">Gateway:</span>
                                <span>{area.payment_gateway || 'Default Sistem (All Gateways)'}</span>
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleUpgradeDowngrade(area)}
                            className="inline-flex focus:outline-none transition-all duration-200"
                            title="Klik untuk mengubah status izin"
                          >
                            {area.allow_upgrade_downgrade !== false ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold font-mono border border-emerald-900/40">
                                <Check className="w-3 h-3" /> YA (DIIZINKAN)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950 text-rose-400 text-[10px] font-bold font-mono border border-rose-900/40 animate-pulse">
                                <X className="w-3 h-3" /> TIDAK (DIBLOKIR)
                              </span>
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveEdit(area)}
                                  className="p-1.5 bg-emerald-600/25 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition"
                                  title="Simpan"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingAreaId(null)}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
                                  title="Batal"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(area)}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition opacity-60 group-hover:opacity-100"
                                  title="Edit Wilayah"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(area.id, area.name)}
                                  className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white rounded-lg transition opacity-60 group-hover:opacity-100"
                                  title="Hapus Wilayah"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-slate-400 font-mono">
              Menampilkan {startIndex + 1} s/d {Math.min(startIndex + rowsPerPage, totalRows)} dari {totalRows} wilayah ("Lihat 10 baris")
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 bg-slate-800 hover:bg-slate-750 disabled:bg-slate-900 border border-slate-700 disabled:border-transparent text-slate-300 disabled:text-slate-600 rounded-xl transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-white px-3 bg-slate-950 py-1.5 rounded-xl border border-slate-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 bg-slate-800 hover:bg-slate-750 disabled:bg-slate-900 border border-slate-700 disabled:border-transparent text-slate-300 disabled:text-slate-600 rounded-xl transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
