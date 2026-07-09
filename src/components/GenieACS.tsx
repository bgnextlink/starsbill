import React, { useState, useEffect } from 'react';
import { Settings2, Search, Activity, RefreshCw, Power, RotateCcw, X, Plus, Edit, Trash2 } from 'lucide-react';
import { fetchWithMockFallback } from '../lib/apiClient';
import toast, { Toaster } from 'react-hot-toast';

interface ACSDevice {
  _id: string;
  _lastPing: string;
  _lastInform: string;
  InternetGatewayDevice: {
    DeviceInfo: {
      Manufacturer: string;
      ProductClass: string;
      SerialNumber: string;
      HardwareVersion: string;
      SoftwareVersion: string;
    };
  };
  status: 'online' | 'offline';
}

interface ACSServer {
  id: number;
  name: string;
  url: string;
  username: string;
  password?: string;
  is_active: boolean;
}

export default function GenieACS() {
  const [devices, setDevices] = useState<ACSDevice[]>([]);
  const [servers, setServers] = useState<ACSServer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isServerFormOpen, setIsServerFormOpen] = useState(false);
  const [currentServer, setCurrentServer] = useState<Partial<ACSServer> | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await fetchWithMockFallback<ACSDevice[]>(
        '/acs/devices', 
        { method: 'GET' }, 
        'mock_acs_devices'
      );
      
      let data = response.data || [];
      if (!Array.isArray(data)) data = [data] as any;
      
      if (statusFilter !== 'all') {
        data = data.filter(d => d.status === statusFilter);
      }
      
      if (search) {
        data = data.filter(d => {
          const serial = d.InternetGatewayDevice?.DeviceInfo?.SerialNumber?.toLowerCase() || '';
          return serial.includes(search.toLowerCase());
        });
      }

      // Mock Data if empty
      if (data.length === 0 && !search && statusFilter === 'all') {
         data = [
           {
             _id: 'ZTE-1234567890',
             _lastPing: new Date().toISOString(),
             _lastInform: new Date().toISOString(),
             status: 'online',
             InternetGatewayDevice: {
               DeviceInfo: {
                 Manufacturer: 'ZTE',
                 ProductClass: 'F609',
                 SerialNumber: 'ZTE-1234567890',
                 HardwareVersion: 'V5.3',
                 SoftwareVersion: 'V6.0'
               }
             }
           }
         ];
         localStorage.setItem('mock_acs_devices', JSON.stringify(data));
      }

      setDevices(data);
    } catch (error) {
      toast.error('Gagal memuat perangkat ACS');
    } finally {
      setLoading(false);
    }
  };

  const fetchServers = async () => {
    try {
      const response = await fetchWithMockFallback<ACSServer[]>(
        '/acs/servers', 
        { method: 'GET' }, 
        'mock_acs_servers'
      );
      let data = response.data || [];
      if (!Array.isArray(data)) data = [data] as any;
      setServers(data);
    } catch (error) {
      // ignore
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [search, searchType, statusFilter]);

  useEffect(() => {
    if (isConfigOpen) fetchServers();
  }, [isConfigOpen]);

  const handleServerSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentServer?.name || !currentServer?.url) {
      toast.error('Nama dan URL wajib diisi');
      return;
    }

    try {
      const isEdit = !!currentServer.id;
      const endpoint = isEdit ? `/acs/servers/${currentServer.id}` : `/acs/servers`;
      const method = isEdit ? 'PUT' : 'POST';

      await fetchWithMockFallback(endpoint, {
        method,
        body: JSON.stringify(currentServer)
      }, 'mock_acs_servers');

      toast.success(`Server ACS berhasil di${isEdit ? 'perbarui' : 'simpan'}`);
      setIsServerFormOpen(false);
      fetchServers();
    } catch (error) {
      toast.error('Gagal menyimpan server ACS');
    }
  };

  const handleDeleteServer = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus server ACS ini?')) return;
    try {
      await fetchWithMockFallback(`/acs/servers/${id}`, { method: 'DELETE' }, 'mock_acs_servers');
      toast.success('Server berhasil dihapus');
      fetchServers();
    } catch (error) {
      toast.error('Gagal menghapus server');
    }
  };

  const handleDeviceAction = async (deviceId: string, action: 'refresh' | 'reboot' | 'reset') => {
    setIsActionLoading(`${deviceId}-${action}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate task
      toast.success(`Perintah ${action.toUpperCase()} berhasil dikirim ke perangkat`);
      if (action === 'refresh') fetchDevices();
    } catch (error) {
      toast.error(`Gagal mengirim perintah ${action.toUpperCase()}`);
    } finally {
      setIsActionLoading(null);
    }
  };

  const openServerForm = (server?: ACSServer) => {
    if (server) {
      setCurrentServer(server);
    } else {
      setCurrentServer({
        name: '',
        url: 'http://',
        username: '',
        is_active: true
      });
    }
    setIsServerFormOpen(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
      
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-white text-lg">Devices List (GenieACS)</h3>
          <p className="text-slate-400 text-sm mt-1">Daftar perangkat CPE/ONT yang terhubung</p>
        </div>
        <button 
          onClick={() => setIsConfigOpen(true)}
          className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          <Settings2 size={16} /> Konfigurasi ACS Server
        </button>
      </div>
      
      <div className="p-6 border-b border-slate-800 bg-slate-950/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Cari Berdasarkan</label>
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
              <option value="all">SEMUA</option>
              <option value="mac">MAC Address</option>
              <option value="serial">Serial Number</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Pencarian</label>
            <div className="relative">
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Masukkan Kata Kunci Pencarian" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500" 
              />
              <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Device Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
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
              <th className="px-6 py-4">Device Status</th>
              <th className="px-6 py-4">ID / Serial</th>
              <th className="px-6 py-4">Product Info</th>
              <th className="px-6 py-4">Last Update</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-300">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading data...</td></tr>
            ) : devices.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Tidak ada data perangkat ditemukan</td></tr>
            ) : (
              devices.map((device, idx) => {
                const info = device.InternetGatewayDevice?.DeviceInfo;
                return (
                  <tr key={device._id || idx} className="hover:bg-slate-800/20">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${
                        device.status === 'online' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        <Activity size={12} /> {device.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-blue-400">{info?.SerialNumber || device._id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{info?.Manufacturer} {info?.ProductClass}</div>
                      <div className="text-xs text-slate-500 mt-1">HW: {info?.HardwareVersion} | SW: {info?.SoftwareVersion}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">{new Date(device._lastInform).toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">Ping: {new Date(device._lastPing).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleDeviceAction(device._id, 'refresh')}
                          disabled={isActionLoading === `${device._id}-refresh`}
                          className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded transition-colors disabled:opacity-50" 
                          title="Refresh Data"
                        ><RefreshCw size={16} className={isActionLoading === `${device._id}-refresh` ? 'animate-spin' : ''} /></button>
                        <button 
                          onClick={() => handleDeviceAction(device._id, 'reboot')}
                          disabled={isActionLoading === `${device._id}-reboot`}
                          className="p-1.5 text-orange-400 hover:bg-orange-400/10 rounded transition-colors disabled:opacity-50" 
                          title="Reboot Device"
                        ><Power size={16} /></button>
                        <button 
                          onClick={() => handleDeviceAction(device._id, 'reset')}
                          disabled={isActionLoading === `${device._id}-reset`}
                          className="p-1.5 text-rose-400 hover:bg-rose-400/10 rounded transition-colors disabled:opacity-50" 
                          title="Factory Reset"
                        ><RotateCcw size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Config Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Konfigurasi Server ACS</h3>
              <button onClick={() => setIsConfigOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-white">Daftar Server GenieACS</h4>
                <button onClick={() => openServerForm()} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 transition-colors">
                  <Plus size={14} /> Tambah Server
                </button>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 bg-slate-950/50 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Nama</th>
                      <th className="px-4 py-3">URL API</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {servers.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">Belum ada server ACS dikonfigurasi.</td></tr>
                    ) : (
                      servers.map(server => (
                        <tr key={server.id}>
                          <td className="px-4 py-3 font-medium text-white">{server.name}</td>
                          <td className="px-4 py-3 text-slate-400 font-mono text-xs">{server.url}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-[10px] uppercase ${server.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                              {server.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => openServerForm(server)} className="p-1 text-blue-400 hover:bg-blue-400/10 rounded mr-1"><Edit size={14} /></button>
                            <button onClick={() => handleDeleteServer(server.id)} className="p-1 text-rose-400 hover:bg-rose-400/10 rounded"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end bg-slate-900/50">
               <button onClick={() => setIsConfigOpen(false)} className="px-6 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Server Form Modal */}
      {isServerFormOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">{currentServer?.id ? 'Edit Server ACS' : 'Tambah Server ACS'}</h3>
              <button onClick={() => setIsServerFormOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleServerSave}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nama Server</label>
                  <input required type="text" value={currentServer?.name || ''} onChange={e => setCurrentServer({...currentServer, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" placeholder="e.g. ACS Utama" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">URL API (NBI)</label>
                  <input required type="url" value={currentServer?.url || ''} onChange={e => setCurrentServer({...currentServer, url: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none font-mono" placeholder="http://ip-acs:7557" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Username API</label>
                  <input type="text" value={currentServer?.username || ''} onChange={e => setCurrentServer({...currentServer, username: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Password API</label>
                  <input type="password" value={currentServer?.password || ''} onChange={e => setCurrentServer({...currentServer, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" placeholder="Biarkan kosong jika tidak diubah" />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" id="acs_active" checked={currentServer?.is_active ?? true} onChange={e => setCurrentServer({...currentServer, is_active: e.target.checked})} className="rounded border-slate-700 bg-slate-900" />
                  <label htmlFor="acs_active" className="text-sm text-white">Server Aktif</label>
                </div>
              </div>
              <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
                <button type="button" onClick={() => setIsServerFormOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">Batal</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
