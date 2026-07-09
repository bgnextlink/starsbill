import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Router, Activity, Plug } from 'lucide-react';
import { fetchWithMockFallback } from '../lib/apiClient';
import toast, { Toaster } from 'react-hot-toast';

interface MikrotikRouter {
  id: number;
  name: string;
  ip_address: string;
  api_port: number;
  api_username: string;
  api_password?: string;
  status: 'connected' | 'disconnected' | 'error';
  auto_isolate: boolean;
  isolation_action: 'disable' | 'address_list';
  default_profile: string;
  active_mode: 'api' | 'ssh';
}

export default function RouterMikrotik() {
  const [routers, setRouters] = useState<MikrotikRouter[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRouter, setCurrentRouter] = useState<Partial<MikrotikRouter> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState<number | null>(null);

  const fetchRouters = async () => {
    setLoading(true);
    try {
      const response = await fetchWithMockFallback<MikrotikRouter[]>(
        `/routers`, 
        { method: 'GET' }, 
        'mock_routers'
      );
      setRouters(response.data || []);
    } catch (error: any) {
      toast.error('Gagal memuat data router');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouters();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRouter?.name || !currentRouter?.ip_address || !currentRouter?.api_username) {
      toast.error('Lengkapi semua form wajib');
      return;
    }

    setIsSaving(true);
    
    const payload = {
      ...currentRouter,
      api_port: currentRouter.api_port || 8728,
      status: currentRouter.status || 'disconnected',
      auto_isolate: currentRouter.auto_isolate ?? true,
      isolation_action: currentRouter.isolation_action || 'disable',
      active_mode: currentRouter.active_mode || 'api',
      default_profile: currentRouter.default_profile || 'default'
    };

    try {
      const isEdit = !!currentRouter.id;
      const endpoint = isEdit ? `/routers/${currentRouter.id}` : `/routers`;
      const method = isEdit ? 'PUT' : 'POST';

      await fetchWithMockFallback(endpoint, {
        method,
        body: JSON.stringify(payload)
      }, 'mock_routers');

      toast.success(`Router berhasil di${isEdit ? 'perbarui' : 'simpan'}`);
      setIsModalOpen(false);
      fetchRouters();
    } catch (error) {
      toast.error('Gagal menyimpan router');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus router ini? Seluruh koneksi pelanggan ke router ini akan terputus.')) return;
    
    try {
      await fetchWithMockFallback(`/routers/${id}`, { method: 'DELETE' }, 'mock_routers');
      toast.success('Router berhasil dihapus');
      fetchRouters();
    } catch (error) {
      toast.error('Gagal menghapus router');
    }
  };

  const handleTestConnection = async (id: number) => {
    setIsTesting(id);
    try {
      // Simulate API call for testing connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update local status
      const updatedRouters = routers.map(r => r.id === id ? { ...r, status: 'connected' as const } : r);
      setRouters(updatedRouters);
      localStorage.setItem('mock_routers', JSON.stringify(updatedRouters));
      
      toast.success('Koneksi ke Router Mikrotik Berhasil');
    } catch (error) {
      toast.error('Gagal terhubung ke Router');
      const updatedRouters = routers.map(r => r.id === id ? { ...r, status: 'error' as const } : r);
      setRouters(updatedRouters);
      localStorage.setItem('mock_routers', JSON.stringify(updatedRouters));
    } finally {
      setIsTesting(null);
    }
  };

  const handleSync = async (_id: number, type: 'pppoe' | 'hotspot') => {
    const loadingToast = toast.loading(`Sinkronisasi ${type.toUpperCase()}...`);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Sinkronisasi ${type.toUpperCase()} Berhasil`, { id: loadingToast });
    } catch (error) {
      toast.error(`Gagal sinkronisasi ${type.toUpperCase()}`, { id: loadingToast });
    }
  };

  const openForm = (router?: MikrotikRouter) => {
    if (router) {
      setCurrentRouter(router);
    } else {
      setCurrentRouter({
        name: '',
        ip_address: '',
        api_port: 8728,
        api_username: 'admin',
        auto_isolate: true,
        isolation_action: 'disable',
        active_mode: 'api',
        default_profile: 'default'
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-white text-lg">Router Mikrotik</h3>
          <p className="text-slate-400 text-sm mt-1">Daftar koneksi NAS/Router Mikrotik yang terhubung</p>
        </div>
        <button 
          onClick={() => openForm()}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Tambah Router
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Nama & Host</th>
              <th className="px-6 py-4">Otomasi Isolir</th>
              <th className="px-6 py-4">Profile</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Sinkronisasi</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-300">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading data...</td></tr>
            ) : routers.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Belum ada Router Mikrotik yang ditambahkan.</td></tr>
            ) : (
              routers.map(router => (
                <tr key={router.id} className="hover:bg-slate-800/20">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white flex items-center gap-2">
                      <Router size={16} className="text-slate-400" /> {router.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-1">{router.ip_address}:{router.api_port}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs">
                      {router.auto_isolate ? (
                        <span className="text-emerald-400">Aktif ({router.isolation_action === 'disable' ? 'Disable Secret' : 'Address List'})</span>
                      ) : (
                        <span className="text-rose-400">Nonaktif</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs uppercase">{router.default_profile}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${
                      router.status === 'connected' ? 'bg-emerald-500/10 text-emerald-400' : 
                      router.status === 'error' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      <Activity size={12} /> {router.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleSync(router.id, 'pppoe')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs transition-colors" title="Sync PPPoE Secrets">PPPoE</button>
                      <button onClick={() => handleSync(router.id, 'hotspot')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs transition-colors" title="Sync Hotspot Users">Hotspot</button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleTestConnection(router.id)}
                        disabled={isTesting === router.id}
                        className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded transition-colors disabled:opacity-50" 
                        title="Test Connection"
                      ><Plug size={16} className={isTesting === router.id ? "animate-pulse" : ""} /></button>
                      <button onClick={() => openForm(router)} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded transition-colors" title="Edit"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(router.id)} className="p-1.5 text-rose-400 hover:bg-rose-400/10 rounded transition-colors" title="Hapus"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">{currentRouter?.id ? 'Edit Router' : 'Tambah Router Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                <div className="col-span-2">
                  <h4 className="text-sm font-semibold text-blue-400 border-b border-slate-800 pb-2 mb-4">Informasi NAS / Router</h4>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nama Identitas <span className="text-rose-500">*</span></label>
                  <input required type="text" placeholder="e.g. Core Utama" value={currentRouter?.name || ''} onChange={e => setCurrentRouter({...currentRouter, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">IP Address / Host <span className="text-rose-500">*</span></label>
                  <input required type="text" placeholder="192.168.x.x atau domain" value={currentRouter?.ip_address || ''} onChange={e => setCurrentRouter({...currentRouter, ip_address: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">API Port <span className="text-rose-500">*</span></label>
                  <input required type="number" value={currentRouter?.api_port || 8728} onChange={e => setCurrentRouter({...currentRouter, api_port: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">API Username <span className="text-rose-500">*</span></label>
                  <input required type="text" value={currentRouter?.api_username || ''} onChange={e => setCurrentRouter({...currentRouter, api_username: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">API Password</label>
                  <input type="password" placeholder={currentRouter?.id ? "Biarkan kosong jika tidak diubah" : "Password router"} onChange={e => setCurrentRouter({...currentRouter, api_password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none font-mono" />
                </div>

                <div className="col-span-2 mt-4">
                  <h4 className="text-sm font-semibold text-blue-400 border-b border-slate-800 pb-2 mb-4">Pengaturan Isolir & Sinkronisasi</h4>
                </div>
                
                <div className="col-span-2 flex items-center gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <input 
                    type="checkbox" 
                    id="auto_isolate" 
                    checked={currentRouter?.auto_isolate ?? true} 
                    onChange={e => setCurrentRouter({...currentRouter, auto_isolate: e.target.checked})} 
                    className="w-5 h-5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 bg-slate-900"
                  />
                  <div>
                    <label htmlFor="auto_isolate" className="font-medium text-white cursor-pointer block">Otomatis Isolir Pelanggan Menunggak</label>
                    <p className="text-xs text-slate-400">Sistem akan secara otomatis mengeksekusi isolasi di Mikrotik saat tagihan jatuh tempo.</p>
                  </div>
                </div>

                {currentRouter?.auto_isolate && (
                   <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Metode Isolir</label>
                    <select value={currentRouter?.isolation_action || 'disable'} onChange={e => setCurrentRouter({...currentRouter, isolation_action: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none">
                      <option value="disable">Disable Secret / User</option>
                      <option value="address_list">Pindahkan ke Address List (Isolir)</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Profile Default Mikrotik</label>
                  <input type="text" value={currentRouter?.default_profile || 'default'} onChange={e => setCurrentRouter({...currentRouter, default_profile: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" />
                </div>
              </div>
              <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">Batal</button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  {isSaving ? <span className="animate-pulse">Menyimpan...</span> : 'Simpan Konfigurasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
