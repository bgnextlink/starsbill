import React, { useState, useEffect } from 'react';
import { Send, Smartphone, Save, ShieldAlert } from 'lucide-react';
import { fetchWithMockFallback } from '../lib/apiClient';
import toast, { Toaster } from 'react-hot-toast';

interface WAGatewaySettings {
  id: number;
  api_endpoint: string;
  api_key: string;
  template_new_invoice: string;
  template_payment_success: string;
  template_isolation_warning: string;
  template_isolated: string;
  is_active: boolean;
}

export default function WhatsAppGateway() {
  const [settings, setSettings] = useState<WAGatewaySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testPhone, setTestPhone] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetchWithMockFallback<WAGatewaySettings[]>(
        '/settings/wa-gateway', 
        { method: 'GET' }, 
        'mock_wa_settings'
      );
      
      let data = response.data || [];
      if (!Array.isArray(data)) data = [data] as any;
      
      if (data.length > 0) {
        setSettings(data[0]);
      } else {
        const defaultSettings: WAGatewaySettings = {
          id: 1,
          api_endpoint: 'http://localhost:8000/send-message',
          api_key: '',
          template_new_invoice: 'Yth. *{nama}*, tagihan internet Anda sebesar *{jumlah}* sudah terbit. Harap bayar sebelum tanggal *{jatuh_tempo}*.',
          template_payment_success: 'Terima kasih *{nama}*. Pembayaran sebesar *{jumlah}* untuk tagihan bulan *{bulan}* telah kami terima.',
          template_isolation_warning: 'Peringatan! Tagihan internet Anda sebesar *{jumlah}* akan jatuh tempo besok. Harap segera lakukan pembayaran.',
          template_isolated: 'Yth. *{nama}*, internet Anda telah di-isolir karena melewati batas pembayaran. Segera lakukan pembayaran untuk mengaktifkan kembali layanan Anda.',
          is_active: false
        };
        setSettings(defaultSettings);
        localStorage.setItem('mock_wa_settings', JSON.stringify([defaultSettings]));
      }
    } catch (error) {
      toast.error('Gagal memuat pengaturan WhatsApp Gateway');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      await fetchWithMockFallback(`/settings/wa-gateway/1`, {
        method: 'PUT',
        body: JSON.stringify(settings)
      }, 'mock_wa_settings');

      toast.success('Pengaturan WhatsApp Gateway berhasil disimpan');
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) {
      toast.error('Masukkan nomor WhatsApp tujuan test');
      return;
    }

    setIsTesting(true);
    const loadingToast = toast.loading('Mengirim pesan test...');
    try {
      // Simulate API call to send test message
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Pesan test berhasil dikirim!', { id: loadingToast });
      setTestPhone('');
    } catch (error) {
      toast.error('Gagal mengirim pesan test. Periksa koneksi endpoint API.', { id: loadingToast });
    } finally {
      setIsTesting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading configuration...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
      
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h3 className="font-bold text-white text-lg">WhatsApp Gateway</h3>
            <p className="text-slate-400 text-sm mt-1">Konfigurasi endpoint dan template pesan notifikasi otomatis.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Status Layanan:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${settings?.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
              {settings?.is_active ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-blue-400 border-b border-slate-800 pb-2">Koneksi API</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">WhatsApp API Endpoint</label>
                <input type="url" value={settings?.api_endpoint || ''} onChange={e => setSettings({...settings!, api_endpoint: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none font-mono text-sm" placeholder="http://localhost:3000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">API Key / Token</label>
                <input type="password" value={settings?.api_key || ''} onChange={e => setSettings({...settings!, api_key: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none font-mono text-sm" placeholder="********" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="is_active" checked={settings?.is_active || false} onChange={e => setSettings({...settings!, is_active: e.target.checked})} className="rounded border-slate-700 bg-slate-900" />
              <label htmlFor="is_active" className="text-sm text-slate-300">Aktifkan Pengiriman Pesan Otomatis</label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-slate-800 pb-2">
              <h4 className="text-sm font-semibold text-blue-400">Template Pesan Otomatis</h4>
              <span className="text-xs text-slate-500">Variabel tersedia: <code className="text-emerald-400 bg-slate-950 px-1 rounded">{'{nama}'}</code>, <code className="text-emerald-400 bg-slate-950 px-1 rounded">{'{jumlah}'}</code>, <code className="text-emerald-400 bg-slate-950 px-1 rounded">{'{jatuh_tempo}'}</code>, <code className="text-emerald-400 bg-slate-950 px-1 rounded">{'{bulan}'}</code></span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Tagihan Baru Terbit</label>
                <textarea rows={4} value={settings?.template_new_invoice || ''} onChange={e => setSettings({...settings!, template_new_invoice: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none text-sm"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Pembayaran Berhasil</label>
                <textarea rows={4} value={settings?.template_payment_success || ''} onChange={e => setSettings({...settings!, template_payment_success: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none text-sm"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Reminder (H-1 Jatuh Tempo)</label>
                <textarea rows={4} value={settings?.template_isolation_warning || ''} onChange={e => setSettings({...settings!, template_isolation_warning: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none text-sm"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Pemberitahuan Isolir</label>
                <textarea rows={4} value={settings?.template_isolated || ''} onChange={e => setSettings({...settings!, template_isolated: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none text-sm"></textarea>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              {isSaving ? 'Menyimpan...' : <><Save size={16} /> Simpan Konfigurasi</>}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
            <h4 className="font-semibold text-white flex items-center gap-2 text-sm"><Smartphone size={16} className="text-emerald-400"/> Test Pengiriman Pesan</h4>
          </div>
          <form onSubmit={handleTestConnection} className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nomor WhatsApp Tujuan</label>
              <input required type="text" value={testPhone} onChange={e => setTestPhone(e.target.value)} placeholder="081234567890" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none text-sm" />
            </div>
            <button type="submit" disabled={isTesting || !settings?.api_endpoint} className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              {isTesting ? 'Mengirim...' : <><Send size={14} /> Kirim Pesan Test</>}
            </button>
            {!settings?.api_endpoint && <p className="text-[10px] text-rose-400 text-center">Harap isi dan simpan API Endpoint terlebih dahulu.</p>}
          </form>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
             <h4 className="font-semibold text-white flex items-center gap-2 text-sm"><ShieldAlert size={16} className="text-rose-400"/> Broadcast Peringatan Massal</h4>
          </div>
          <div className="p-4">
             <p className="text-xs text-slate-400 mb-4">Kirim pengingat massal ke seluruh pelanggan yang memiliki tagihan belum lunas bulan ini.</p>
             <button type="button" className="w-full bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/50 text-rose-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
               <Send size={14} /> Eksekusi Broadcast
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
