import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Eye, Phone, Upload } from 'lucide-react';
import { fetchWithMockFallback } from '../lib/apiClient';
import toast, { Toaster } from 'react-hot-toast';

interface Customer {
  id: number;
  customer_number: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  status: string;
  connection_type: string;
  username_ppp: string | null;
  password_ppp: string | null;
  ip_address: string | null;
  mac_address: string | null;
  package_id: number | null;
  router_id: number | null;
  odp_id: number | null;
  billing_cycle: number;
  ktp_image?: string | null;
  house_image?: string | null;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const formatWhatsApp = (phone: string) => {
    let formatted = phone.replace(/\D/g, '');
    if (formatted.startsWith('0')) {
      formatted = '62' + formatted.substring(1);
    }
    return formatted;
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
      
      const response = await fetchWithMockFallback<Customer[]>(
        `/customers?${queryParams}`, 
        { method: 'GET' }, 
        'mock_customers'
      );
      
      // Implement simple client-side search/filter for the mock scenario
      let data = response.data || [];
      if (!Array.isArray(data)) data = [data] as any; // Ensure array
      
      if (search) {
        data = data.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.customer_number?.toLowerCase().includes(search.toLowerCase()));
      }
      if (statusFilter) {
        data = data.filter(c => c.status === statusFilter);
      }

      setCustomers(data);
      setTotalPages(response.last_page || 1);
    } catch (error: any) {
      toast.error('Gagal memuat data pelanggan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search, statusFilter]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;
    if (!currentCustomer.name || !currentCustomer.phone) {
      toast.error('Nama dan Nomor WhatsApp wajib diisi');
      return;
    }

    setIsSaving(true);
    const formattedPhone = formatWhatsApp(currentCustomer.phone || '');
    
    const payload = {
      ...currentCustomer,
      phone: formattedPhone,
      customer_number: currentCustomer.customer_number || `CST-${Date.now().toString().slice(-6)}`,
      billing_cycle: currentCustomer.billing_cycle || 1,
      status: currentCustomer.status || 'active',
      connection_type: currentCustomer.connection_type || 'pppoe',
    };

    try {
      const isEdit = !!currentCustomer.id;
      const endpoint = isEdit ? `/customers/${currentCustomer.id}` : `/customers`;
      const method = isEdit ? 'PUT' : 'POST';

      await fetchWithMockFallback(endpoint, {
        method,
        body: JSON.stringify(payload)
      }, 'mock_customers');

      toast.success(`Data pelanggan berhasil di${isEdit ? 'perbarui' : 'simpan'}`);
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error) {
      toast.error('Gagal menyimpan data pelanggan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) return;
    
    try {
      await fetchWithMockFallback(`/customers/${id}`, { method: 'DELETE' }, 'mock_customers');
      toast.success('Pelanggan berhasil dihapus');
      fetchCustomers();
    } catch (error) {
      toast.error('Gagal menghapus pelanggan');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'ktp_image' | 'house_image') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentCustomer(prev => ({ ...prev, [field]: reader.result as string }));
        toast.success(`File ${field === 'ktp_image' ? 'KTP' : 'Foto Rumah'} berhasil dipilih`);
      };
      reader.readAsDataURL(file);
    }
  };

  const openForm = (customer?: Customer) => {
    if (customer) {
      setCurrentCustomer(customer);
    } else {
      setCurrentCustomer({
        name: '',
        phone: '',
        connection_type: 'pppoe',
        status: 'active',
        billing_cycle: 1,
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Data Pelanggan</h3>
          <p className="text-sm text-slate-400">Manajemen Pelanggan & Koneksi</p>
        </div>
        <button 
          onClick={() => openForm()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Tambah Pelanggan
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama, no wa, ID..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
        >
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="suspended">Isolir</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">No. Pelanggan</th>
              <th className="px-6 py-4">Nama</th>
              <th className="px-6 py-4">Koneksi</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-300">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading data...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Tidak ada data pelanggan yang sesuai filter.</td></tr>
            ) : (
              customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-blue-400">{c.customer_number || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{c.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Phone size={10} /> {c.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 uppercase text-xs font-medium text-slate-400">
                    {c.connection_type}
                    <div className="text-slate-500 lowercase mt-1">{c.username_ppp || c.ip_address || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 
                      c.status === 'suspended' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setCurrentCustomer(c); setIsDetailOpen(true); }}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors" 
                        title="Detail"
                      ><Eye size={16} /></button>
                      <button 
                        onClick={() => openForm(c)}
                        className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded transition-colors" 
                        title="Edit"
                      ><Edit size={16} /></button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-400/10 rounded transition-colors" 
                        title="Hapus"
                      ><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-slate-400">Halaman {page} dari {totalPages}</span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
          >
            Selanjutnya
          </button>
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">{currentCustomer?.id ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                {/* Kolom Kiri - Data Pribadi */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-blue-400 border-b border-slate-800 pb-2">Data Pribadi</h4>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Nama Lengkap <span className="text-rose-500">*</span></label>
                    <input required type="text" value={currentCustomer?.name || ''} onChange={e => setCurrentCustomer({...currentCustomer, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Nomor WhatsApp <span className="text-rose-500">*</span></label>
                    <input required type="text" placeholder="08116685557" value={currentCustomer?.phone || ''} onChange={e => setCurrentCustomer({...currentCustomer, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" />
                    <p className="text-xs text-slate-500 mt-1">Otomatis konversi ke 62: <span className="text-emerald-400 font-mono">{currentCustomer?.phone ? formatWhatsApp(currentCustomer.phone) : ''}</span></p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                    <input type="email" value={currentCustomer?.email || ''} onChange={e => setCurrentCustomer({...currentCustomer, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Alamat Pemasangan</label>
                    <textarea rows={3} value={currentCustomer?.address || ''} onChange={e => setCurrentCustomer({...currentCustomer, address: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" />
                  </div>
                </div>

                {/* Kolom Kanan - Koneksi & Layanan */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-blue-400 border-b border-slate-800 pb-2">Koneksi & Layanan</h4>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Tipe Koneksi</label>
                    <select value={currentCustomer?.connection_type || 'pppoe'} onChange={e => setCurrentCustomer({...currentCustomer, connection_type: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none">
                      <option value="pppoe">PPPoE</option>
                      <option value="hotspot">Hotspot</option>
                      <option value="static">IP Static</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                    <select value={currentCustomer?.status || 'active'} onChange={e => setCurrentCustomer({...currentCustomer, status: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none">
                      <option value="active">Aktif</option>
                      <option value="suspended">Isolir</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>

                  {currentCustomer?.connection_type === 'pppoe' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Username PPPoE</label>
                        <input type="text" value={currentCustomer?.username_ppp || ''} onChange={e => setCurrentCustomer({...currentCustomer, username_ppp: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Password PPPoE</label>
                        <input type="text" value={currentCustomer?.password_ppp || ''} onChange={e => setCurrentCustomer({...currentCustomer, password_ppp: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" />
                      </div>
                    </>
                  )}

                  {currentCustomer?.connection_type === 'static' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">IP Address</label>
                      <input type="text" value={currentCustomer?.ip_address || ''} onChange={e => setCurrentCustomer({...currentCustomer, ip_address: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Siklus Tagihan (Tanggal)</label>
                    <input required type="number" min="1" max="31" value={currentCustomer?.billing_cycle || 1} onChange={e => setCurrentCustomer({...currentCustomer, billing_cycle: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" />
                  </div>
                </div>

                {/* Upload Dokumen */}
                <div className="col-span-1 md:col-span-2 mt-2">
                  <h4 className="text-sm font-semibold text-blue-400 border-b border-slate-800 pb-2 mb-4">Dokumen & Lampiran</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-dashed border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center text-center relative hover:bg-slate-800/50 transition-colors">
                      <Upload className="text-slate-500 mb-2" size={24} />
                      <p className="text-sm text-slate-300 font-medium">Upload KTP</p>
                      <p className="text-xs text-slate-500 mt-1">{currentCustomer?.ktp_image ? 'File KTP tersimpan' : 'Maksimal 2MB (JPG/PNG)'}</p>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'ktp_image')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                    <div className="border border-dashed border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center text-center relative hover:bg-slate-800/50 transition-colors">
                      <Upload className="text-slate-500 mb-2" size={24} />
                      <p className="text-sm text-slate-300 font-medium">Upload Foto Rumah</p>
                      <p className="text-xs text-slate-500 mt-1">{currentCustomer?.house_image ? 'File Foto Rumah tersimpan' : 'Maksimal 2MB (JPG/PNG)'}</p>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'house_image')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>

              </div>
              <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">Batal</button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  {isSaving ? <span className="animate-pulse">Menyimpan...</span> : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && currentCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Detail Pelanggan</h3>
              <button type="button" onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-slate-500 mb-1">Nama / ID</div>
                  <div className="text-white font-medium text-base">{currentCustomer.name} <span className="text-blue-400 font-mono ml-2 text-xs bg-blue-500/10 px-2 py-0.5 rounded">{currentCustomer.customer_number || '-'}</span></div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">WhatsApp</div>
                  <div className="text-white font-mono">{currentCustomer.phone}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Email</div>
                  <div className="text-white">{currentCustomer.email || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Alamat</div>
                  <div className="text-white">{currentCustomer.address || '-'}</div>
                </div>
              </div>
              <div className="space-y-4 text-sm">
                 <div>
                    <div className="text-slate-500 mb-1">Tipe Koneksi</div>
                    <div className="text-white uppercase font-medium">{currentCustomer.connection_type}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-1">Status Layanan</div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        currentCustomer.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 
                        currentCustomer.status === 'suspended' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {currentCustomer.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-1">Siklus Tagihan</div>
                    <div className="text-white">Tanggal {currentCustomer.billing_cycle || 1} setiap bulan</div>
                  </div>
                  <div className="border-t border-slate-800 pt-4 mt-2">
                    {currentCustomer.connection_type === 'pppoe' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-slate-500 mb-1">Username PPP</div>
                          <div className="text-white font-mono bg-slate-950 p-2 rounded">{currentCustomer.username_ppp || '-'}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">Password PPP</div>
                          <div className="text-white font-mono bg-slate-950 p-2 rounded">{currentCustomer.password_ppp || '-'}</div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-slate-500 mb-1">IP Address</div>
                        <div className="text-white font-mono bg-slate-950 p-2 rounded inline-block">{currentCustomer.ip_address || '-'}</div>
                      </div>
                    )}
                  </div>
              </div>
              
              {/* Dokumen Section in Detail */}
              {(currentCustomer.ktp_image || currentCustomer.house_image) && (
                 <div className="col-span-1 md:col-span-2 border-t border-slate-800 pt-4 mt-2">
                    <h4 className="text-sm font-semibold text-slate-400 mb-3">Dokumen Lampiran</h4>
                    <div className="flex gap-4">
                      {currentCustomer.ktp_image && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Foto KTP</div>
                          <img src={currentCustomer.ktp_image} alt="KTP" className="h-24 w-32 object-cover rounded border border-slate-700" />
                        </div>
                      )}
                      {currentCustomer.house_image && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Foto Rumah</div>
                          <img src={currentCustomer.house_image} alt="Rumah" className="h-24 w-32 object-cover rounded border border-slate-700" />
                        </div>
                      )}
                    </div>
                 </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-800 flex justify-end bg-slate-900/50">
               <button type="button" onClick={() => setIsDetailOpen(false)} className="px-6 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">Tutup Detail</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
