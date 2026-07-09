import React, { useState, useEffect } from 'react';
import { Plus, Edit, Search, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { fetchWithMockFallback } from '../lib/apiClient';
import toast, { Toaster } from 'react-hot-toast';

interface Ticket {
  id: number;
  ticket_number: string;
  customer_name: string;
  issue: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  created_at: string;
}

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<Partial<Ticket> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await fetchWithMockFallback<Ticket[]>(
        '/tickets', 
        { method: 'GET' }, 
        'mock_tickets'
      );
      
      let data = response.data || [];
      if (!Array.isArray(data)) data = [data] as any;
      
      if (search) {
        data = data.filter(t => 
          t.customer_name.toLowerCase().includes(search.toLowerCase()) || 
          t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
          t.issue.toLowerCase().includes(search.toLowerCase())
        );
      }

      setTickets(data);
    } catch (error) {
      toast.error('Gagal memuat data tiket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [search]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTicket?.customer_name || !currentTicket?.issue) {
      toast.error('Nama pelanggan dan keluhan wajib diisi');
      return;
    }

    setIsSaving(true);
    
    const payload = {
      ...currentTicket,
      ticket_number: currentTicket.ticket_number || `TK-${Date.now().toString().slice(-4)}`,
      status: currentTicket.status || 'open',
      priority: currentTicket.priority || 'medium',
      created_at: currentTicket.created_at || new Date().toISOString()
    };

    try {
      const isEdit = !!currentTicket.id;
      const endpoint = isEdit ? `/tickets/${currentTicket.id}` : `/tickets`;
      const method = isEdit ? 'PUT' : 'POST';

      await fetchWithMockFallback(endpoint, {
        method,
        body: JSON.stringify(payload)
      }, 'mock_tickets');

      toast.success(`Tiket berhasil di${isEdit ? 'perbarui' : 'buat'}`);
      setIsModalOpen(false);
      fetchTickets();
    } catch (error) {
      toast.error('Gagal menyimpan tiket');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: Ticket['status']) => {
    const loadingToast = toast.loading('Memperbarui status tiket...');
    try {
      const ticket = tickets.find(t => t.id === id);
      if (!ticket) throw new Error();
      
      await fetchWithMockFallback(`/tickets/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...ticket, status })
      }, 'mock_tickets');
      
      toast.success('Status tiket diperbarui', { id: loadingToast });
      fetchTickets();
    } catch (error) {
      toast.error('Gagal memperbarui status', { id: loadingToast });
    }
  };

  const openForm = (ticket?: Ticket) => {
    if (ticket) {
      setCurrentTicket(ticket);
    } else {
      setCurrentTicket({
        customer_name: '',
        issue: '',
        status: 'open',
        priority: 'medium'
      });
    }
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-[10px] uppercase font-medium flex items-center gap-1 w-fit"><AlertCircle size={10}/> Open</span>;
      case 'in_progress': return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] uppercase font-medium flex items-center gap-1 w-fit"><Clock size={10}/> In Progress</span>;
      case 'resolved': return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] uppercase font-medium flex items-center gap-1 w-fit"><CheckCircle size={10}/> Resolved</span>;
      case 'closed': return <span className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded-full text-[10px] uppercase font-medium flex items-center gap-1 w-fit"><CheckCircle size={10}/> Closed</span>;
      default: return <span className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded-full text-[10px] uppercase font-medium">{status}</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-white text-lg">Ticket Komplain</h3>
          <p className="text-slate-400 text-sm mt-1">Manajemen keluhan dan bantuan pelanggan</p>
        </div>
        <button 
          onClick={() => openForm()}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Buat Tiket
        </button>
      </div>

      <div className="p-6 border-b border-slate-800 bg-slate-950/30">
        <div className="relative max-w-md">
          <input 
            type="text" 
            placeholder="Cari ID tiket, nama pelanggan, keluhan..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500" 
          />
          <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">ID Tiket</th>
              <th className="px-6 py-4">Pelanggan</th>
              <th className="px-6 py-4">Keluhan</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-300">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading data...</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Tidak ada tiket ditemukan.</td></tr>
            ) : (
              tickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-slate-800/20">
                  <td className="px-6 py-4 font-mono text-xs text-blue-400">{ticket.ticket_number}</td>
                  <td className="px-6 py-4 font-medium text-white">{ticket.customer_name}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-300 truncate max-w-xs">{ticket.issue}</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase">Priority: {ticket.priority}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(ticket.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {ticket.status === 'open' && <button onClick={() => handleUpdateStatus(ticket.id, 'in_progress')} className="px-2 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded text-xs transition-colors">Tindak Lanjuti</button>}
                      {ticket.status === 'in_progress' && <button onClick={() => handleUpdateStatus(ticket.id, 'resolved')} className="px-2 py-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded text-xs transition-colors">Resolve</button>}
                      <button onClick={() => openForm(ticket)} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded transition-colors"><Edit size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">{currentTicket?.id ? 'Edit Tiket' : 'Buat Tiket Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nama Pelanggan <span className="text-rose-500">*</span></label>
                  <input required type="text" value={currentTicket?.customer_name || ''} onChange={e => setCurrentTicket({...currentTicket, customer_name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Prioritas</label>
                  <select value={currentTicket?.priority || 'medium'} onChange={e => setCurrentTicket({...currentTicket, priority: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none">
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Deskripsi Keluhan <span className="text-rose-500">*</span></label>
                  <textarea required rows={4} value={currentTicket?.issue || ''} onChange={e => setCurrentTicket({...currentTicket, issue: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" placeholder="Jelaskan detail keluhan pelanggan..."></textarea>
                </div>
                {currentTicket?.id && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Status Tiket</label>
                    <select value={currentTicket?.status || 'open'} onChange={e => setCurrentTicket({...currentTicket, status: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none">
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Tugaskan Teknisi (Opsional)</label>
                  <input type="text" value={currentTicket?.assigned_to || ''} onChange={e => setCurrentTicket({...currentTicket, assigned_to: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" placeholder="Nama teknisi..." />
                </div>
              </div>
              <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">Batal</button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  {isSaving ? 'Menyimpan...' : 'Simpan Tiket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
