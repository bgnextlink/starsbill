import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, FileText, Search, Printer, DollarSign, X } from 'lucide-react';
import { fetchWithMockFallback } from '../lib/apiClient';
import toast, { Toaster } from 'react-hot-toast';

interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  month: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  due_date: string;
  paid_at?: string;
}

export default function Billing() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await fetchWithMockFallback<Invoice[]>(
        '/invoices', 
        { method: 'GET' }, 
        'mock_invoices'
      );
      
      let data = response.data || [];
      if (!Array.isArray(data)) data = [data] as any;
      
      if (statusFilter !== 'all') {
        data = data.filter(inv => inv.status === statusFilter);
      }
      
      if (search) {
        data = data.filter(inv => 
          inv.customer_name.toLowerCase().includes(search.toLowerCase()) || 
          inv.invoice_number.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Seed mock data if empty
      if (data.length === 0 && !search && statusFilter === 'all') {
        data = [
          {
            id: 1, invoice_number: 'INV-202607-001', customer_name: 'Budi Santoso', 
            month: 'Juli 2026', amount: 150000, status: 'paid', due_date: '2026-07-05', paid_at: '2026-07-02'
          },
          {
            id: 2, invoice_number: 'INV-202607-002', customer_name: 'Andi Network', 
            month: 'Juli 2026', amount: 500000, status: 'unpaid', due_date: '2026-07-10'
          },
          {
            id: 3, invoice_number: 'INV-202606-115', customer_name: 'Siti Aminah', 
            month: 'Juni 2026', amount: 150000, status: 'overdue', due_date: '2026-06-05'
          }
        ];
        localStorage.setItem('mock_invoices', JSON.stringify(data));
      }

      setInvoices(data);
    } catch (error) {
      toast.error('Gagal memuat data tagihan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [search, statusFilter]);

  const handleGenerateInvoices = async () => {
    const loadingToast = toast.loading('Memproses tagihan massal bulan ini...');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Generate tagihan massal berhasil', { id: loadingToast });
      fetchInvoices();
    } catch (error) {
      toast.error('Gagal memproses tagihan massal', { id: loadingToast });
    }
  };

  const openPaymentModal = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setPaymentAmount(invoice.amount);
    setIsPaymentModalOpen(true);
  };

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInvoice) return;

    setIsProcessing(true);
    try {
      const payload = {
        ...currentInvoice,
        status: 'paid',
        paid_at: new Date().toISOString()
      };

      await fetchWithMockFallback(`/invoices/${currentInvoice.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }, 'mock_invoices');

      toast.success(`Pembayaran invoice ${currentInvoice.invoice_number} berhasil`);
      setIsPaymentModalOpen(false);
      fetchInvoices();
    } catch (error) {
      toast.error('Gagal memproses pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><CheckCircle size={12}/> Lunas</span>;
      case 'unpaid': return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><Clock size={12}/> Belum Bayar</span>;
      case 'overdue': return <span className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><Clock size={12}/> Jatuh Tempo</span>;
      default: return <span className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
      <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-white text-lg">Pembayaran & Transaksi</h3>
          <p className="text-slate-400 text-sm mt-1">Kelola tagihan, pembayaran, dan invoice pelanggan</p>
        </div>
        <button 
          onClick={handleGenerateInvoices}
          className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          <FileText size={16} /> Generate Tagihan Massal
        </button>
      </div>

      <div className="p-6 border-b border-slate-800 bg-slate-950/30 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Cari Invoice, Nama Pelanggan..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm" 
          />
          <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
        >
          <option value="all">Semua Status</option>
          <option value="paid">Lunas</option>
          <option value="unpaid">Belum Bayar</option>
          <option value="overdue">Jatuh Tempo</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Invoice</th>
              <th className="px-6 py-4">Pelanggan</th>
              <th className="px-6 py-4">Bulan Tagihan</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-300">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading data...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Tidak ada tagihan ditemukan.</td></tr>
            ) : (
              invoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-slate-800/20">
                  <td className="px-6 py-4 font-mono text-xs text-blue-400">{invoice.invoice_number}</td>
                  <td className="px-6 py-4 font-medium text-white">{invoice.customer_name}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-300">{invoice.month}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Jatuh Tempo: {new Date(invoice.due_date).toLocaleDateString('id-ID')}</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium">{formatCurrency(invoice.amount)}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(invoice.status)}
                    {invoice.status === 'paid' && invoice.paid_at && (
                       <div className="text-[10px] text-slate-500 mt-1">{new Date(invoice.paid_at).toLocaleDateString('id-ID')}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {invoice.status !== 'paid' && (
                        <button 
                          onClick={() => openPaymentModal(invoice)}
                          className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <DollarSign size={14} /> Bayar
                        </button>
                      )}
                      <button className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded transition-colors" title="Cetak Struk/Invoice">
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && currentInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><CreditCard size={20} className="text-emerald-400"/> Pembayaran Tagihan</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            
            <form onSubmit={processPayment}>
              <div className="p-6 space-y-4">
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">No. Invoice</span>
                    <span className="font-mono text-white">{currentInvoice.invoice_number}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Pelanggan</span>
                    <span className="font-medium text-white">{currentInvoice.customer_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Bulan Tagihan</span>
                    <span className="text-white">{currentInvoice.month}</span>
                  </div>
                  <div className="border-t border-slate-800 my-2 pt-2 flex justify-between text-base font-bold">
                    <span className="text-slate-300">Total Tagihan</span>
                    <span className="font-mono text-emerald-400">{formatCurrency(currentInvoice.amount)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Metode Pembayaran</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none">
                    <option value="cash">Tunai (Cash)</option>
                    <option value="transfer">Transfer Bank</option>
                    <option value="ewallet">E-Wallet (Dana, OVO, dll)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Jumlah Bayar</label>
                  <input 
                    type="number" 
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none font-mono text-lg" 
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">Batal</button>
                <button 
                  type="submit" 
                  disabled={isProcessing || paymentAmount < currentInvoice.amount} 
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {isProcessing ? 'Memproses...' : 'Proses Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
