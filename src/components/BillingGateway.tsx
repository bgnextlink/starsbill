/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  QrCode, 
  CreditCard, 
  Coins, 
  Send, 
  FileText, 
  Check, 
  AlertCircle, 
  Download, 
  Bell,
  RefreshCw,
  X,
  Printer
} from 'lucide-react';
import { Invoice, Customer, InternetPackage } from '../types';

interface BillingGatewayProps {
  invoices: Invoice[];
  customers: Customer[];
  packages: InternetPackage[];
  onGenerateMassal: () => void;
  onPayInvoice: (id: string, method: string, reference: string) => void;
  onSendWhatsapp: (recipient: string, message: string, type: string) => void;
}

export default function BillingGateway({ 
  invoices, 
  customers, 
  packages, 
  onGenerateMassal, 
  onPayInvoice,
  onSendWhatsapp
}: BillingGatewayProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'paid' | 'overdue'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);

  // Callback Sim fields
  const [callbackInvoiceId, setCallbackInvoiceId] = useState('');
  const [callbackGateway, setCallbackGateway] = useState<'Midtrans' | 'Xendit' | 'Tripay' | 'Duitku'>('Midtrans');
  const [callbackChannel, setCallbackChannel] = useState<'QRIS' | 'Virtual Account (VA)' | 'E-Wallet'>('QRIS');

  const filteredInvoices = invoices.filter(inv => {
    if (activeTab === 'unpaid') return inv.status === 'Belum Bayar';
    if (activeTab === 'paid') return inv.status === 'Lunas';
    if (activeTab === 'overdue') return inv.status === 'Overdue' || inv.status === 'Suspend';
    return true;
  });

  const getCustomerName = (id: string) => {
    return customers.find(c => c.id === id)?.name || 'Pelanggan Umum';
  };

  const getCustomerObj = (id: string) => {
    return customers.find(c => c.id === id);
  };

  const getPackageObjByCustId = (custId: string) => {
    const cust = getCustomerObj(custId);
    if (!cust) return null;
    return packages.find(p => p.id === cust.package_id);
  };

  // Bulk Generator Simulation
  const handleTriggerBulk = () => {
    onGenerateMassal();
    alert('Sukses: 49 Tagihan Bulanan Baru berhasil di-generate secara massal.');
  };

  // WhatsApp reminder trigger
  const handleReminder = (inv: Invoice) => {
    const cust = getCustomerObj(inv.customer_id);
    if (!cust) return;
    
    const message = `Halo Bapak/Ibu *${cust.name}*,\n\nKami menginformasikan bahwa tagihan StarBilling ISP Anda sebesar *Rp ${inv.amount.toLocaleString('id-ID')}* untuk layanan internet nomor *${cust.customer_number}* akan jatuh tempo pada *${inv.due_date}*.\n\nMohon lakukan pembayaran tepat waktu melalui QRIS atau Virtual Account di Customer Portal Anda untuk menghindari isolir otomatis.\n\nTerima kasih.`;
    onSendWhatsapp(cust.phone, message, 'Billing Reminder');
    alert(`Notifikasi WhatsApp Reminder terkirim ke ${cust.name} (${cust.phone})`);
  };

  // Simulated Payment Callback handler
  const handleSimulateCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackInvoiceId) {
      alert('Pilih invoice terlebih dahulu!');
      return;
    }

    const inv = invoices.find(i => i.id === callbackInvoiceId);
    if (!inv) return;

    const refNo = `REF-${callbackGateway.toUpperCase()}-${Math.floor(Math.random() * 899999) + 100000}`;
    const pMethod = `${callbackChannel} - ${callbackGateway}`;
    
    onPayInvoice(inv.id, pMethod, refNo);

    // Also trigger automated WhatsApp notification
    const cust = getCustomerObj(inv.customer_id);
    if (cust) {
      const waMsg = `Terima kasih! Pembayaran tagihan *${inv.invoice_number}* sebesar *Rp ${inv.amount.toLocaleString('id-ID')}* telah sukses diterima via *${pMethod}*.\n\nKoneksi internet StarBilling Anda berstatus AKTIF. Selamat menikmati kembali layanan internet kecepatan tinggi.`;
      onSendWhatsapp(cust.phone, waMsg, 'Notification');
    }

    setIsCallbackOpen(false);
  };

  const handleOpenPdf = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsPdfOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Sistem Billing & Gateway</h2>
          <p className="text-xs text-slate-400">Generate invoice massal, monitoring payment gateway, dan trigger reminder otomatis.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsCallbackOpen(true)}
            className="px-3.5 py-2 bg-indigo-950/40 hover:bg-indigo-950 text-indigo-400 border border-indigo-800/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <QrCode className="w-4 h-4" />
            Simulator Callback Gateway
          </button>
          <button 
            onClick={handleTriggerBulk}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/10"
          >
            <Plus className="w-4 h-4" />
            Generate Tagihan Massal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Invoice Management Board */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col shadow-xl">
          <div className="flex border-b border-slate-800 mb-4 pb-2 text-xs">
            {[
              { id: 'all', label: 'Semua Tagihan' },
              { id: 'unpaid', label: 'Belum Bayar' },
              { id: 'paid', label: 'Lunas' },
              { id: 'overdue', label: 'Overdue / Suspend' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 font-medium ${activeTab === tab.id ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 font-mono text-[10px] text-slate-500 uppercase pb-2">
                  <th className="pb-2">No. Invoice</th>
                  <th className="pb-2">Nama Pelanggan</th>
                  <th className="pb-2">Jumlah Tagihan</th>
                  <th className="pb-2">Jatuh Tempo</th>
                  <th className="pb-2 text-center">Status</th>
                  <th className="pb-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-950/20">
                    <td className="py-3 font-mono text-slate-200 font-bold">{inv.invoice_number}</td>
                    <td className="py-3">
                      <span className="text-slate-300 font-medium block">{getCustomerName(inv.customer_id)}</span>
                      <span className="text-slate-500 text-[10px] font-mono">{getCustomerObj(inv.customer_id)?.customer_number}</span>
                    </td>
                    <td className="py-3 font-mono text-cyan-400 font-semibold">Rp {inv.amount.toLocaleString('id-ID')}</td>
                    <td className="py-3 font-mono text-slate-400">{inv.due_date}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase inline-block ${
                        inv.status === 'Lunas' 
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40' 
                          : inv.status === 'Belum Bayar'
                          ? 'bg-slate-950 text-slate-400 border border-slate-800'
                          : inv.status === 'Overdue'
                          ? 'bg-red-950 text-red-400 border border-red-800/40'
                          : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleOpenPdf(inv)}
                          className="p-1.5 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 rounded-lg transition"
                          title="Lihat Invoice PDF"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        {inv.status !== 'Lunas' && (
                          <button 
                            onClick={() => handleReminder(inv)}
                            className="p-1.5 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 rounded-lg transition"
                            title="Kirim WA Tagihan"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Gateways Config telemetry */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              ACTIVE INTEGRATIONS
            </h3>
            
            <div className="space-y-3">
              {[
                { name: 'Xendit Payment API', channel: 'QRIS & Virtual Account', status: 'ACTIVE', color: 'text-emerald-400 bg-emerald-950/20' },
                { name: 'Midtrans Snap', channel: 'E-Wallet & CC Proxy', status: 'ACTIVE', color: 'text-emerald-400 bg-emerald-950/20' },
                { name: 'TriPay Callback Service', channel: 'Alfamart / Indomaret', status: 'ACTIVE', color: 'text-emerald-400 bg-emerald-950/20' },
                { name: 'Duitku Gateway', channel: 'Local Bank Transfer', status: 'STANDBY', color: 'text-slate-400 bg-slate-950' }
              ].map(gate => (
                <div key={gate.name} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">{gate.name}</span>
                    <span className="text-[10px] text-slate-500 block font-mono">{gate.channel}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold ${gate.color}`}>{gate.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-1.5 text-slate-400">
            <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">AUTO SUSPEND RULES</h4>
            <p>1. Invoice terbit tgl <strong>01 setiap bulan</strong>.</p>
            <p>2. Jatuh tempo tgl <strong>10 setiap bulan</strong>.</p>
            <p>3. Jika lewat tgl 10, scheduler Laravel memicu suspend PPPoE otomatis di MikroTik pada pukul <strong>00:05 WIB</strong>.</p>
          </div>
        </div>
      </div>

      {/* Payment Gateway Callback Simulator Modal */}
      {isCallbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">WEBHOOK CALLBACK SIMULATOR</h3>
              <button onClick={() => setIsCallbackOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSimulateCallback} className="p-5 space-y-4 text-slate-200">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Pilih Tagihan Unpaid *</label>
                <select 
                  required
                  value={callbackInvoiceId}
                  onChange={(e) => setCallbackInvoiceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                >
                  <option value="">-- Pilih Invoice --</option>
                  {invoices.filter(i => i.status !== 'Lunas').map(i => (
                    <option key={i.id} value={i.id}>{i.invoice_number} - {getCustomerName(i.customer_id)} (Rp {i.amount.toLocaleString('id-ID')})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Payment Gateway</label>
                  <select 
                    value={callbackGateway}
                    onChange={(e) => setCallbackGateway(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                  >
                    <option value="Midtrans">Midtrans snap</option>
                    <option value="Xendit">Xendit API</option>
                    <option value="Tripay">TriPay Core</option>
                    <option value="Duitku">Duitku</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Saluran Pembayaran</label>
                  <select 
                    value={callbackChannel}
                    onChange={(e) => setCallbackChannel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono text-slate-200"
                  >
                    <option value="QRIS">QRIS Shopee/GOPAY</option>
                    <option value="Virtual Account (VA)">Virtual Account (VA)</option>
                    <option value="E-Wallet">ShopeePay / OVO</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-[11px] text-slate-400 leading-relaxed">
                <strong>Sistem Otomasi:</strong> Callback ini akan mensimulasikan status lunas di backend, memanggil <code>MikrotikService-&gt;unsuspendUser()</code> untuk mengaktifkan koneksi PPPoE, dan menjadwalkan notifikasi WhatsApp kuitansi.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsCallbackOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Kirim Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice PDF Modal */}
      {isPdfOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-slate-950 p-5 flex items-center justify-between text-white">
              <span className="font-mono text-xs font-bold uppercase tracking-wider">PRINTOUT PREVIEW</span>
              <button onClick={() => setIsPdfOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Area */}
            <div className="p-8 space-y-6 flex-1 text-slate-800 bg-white" id="printable-invoice">
              <div className="flex justify-between items-start border-b pb-6">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{localStorage.getItem('sb_nama_usaha') || 'StarBilling ISP'}</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {localStorage.getItem('sb_alamat') || 'Dusun RtRw'}, {localStorage.getItem('sb_kota') || 'Palembang'}
                  </p>
                  <p className="text-xs text-slate-500">Telp: {localStorage.getItem('sb_telp') || '0851176888xx'} | {localStorage.getItem('sb_slogan') || 'High speed internet connection'}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-bold text-cyan-600 font-mono">INVOICE TAGIHAN</h2>
                  <p className="text-sm font-bold text-slate-700 font-mono mt-1">{selectedInvoice.invoice_number}</p>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase inline-block mt-2 ${
                    selectedInvoice.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              {/* Subscriber info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">TAGIHAN KEPADA</span>
                  <p className="font-bold text-slate-800 mt-1 text-sm">{getCustomerName(selectedInvoice.customer_id)}</p>
                  <p className="text-slate-600 mt-0.5">{getCustomerObj(selectedInvoice.customer_id)?.address}</p>
                  <p className="text-slate-500 mt-0.5">ID Pelanggan: {getCustomerObj(selectedInvoice.customer_id)?.customer_number}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">METODE / TANGGAL</span>
                  <p className="text-slate-700 mt-1">Due Date: <strong>{selectedInvoice.due_date}</strong></p>
                  {selectedInvoice.paid_date && <p className="text-slate-500">Paid Date: {selectedInvoice.paid_date.split('T')[0]}</p>}
                  {selectedInvoice.payment_method && <p className="text-slate-500">Method: {selectedInvoice.payment_method}</p>}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs text-left border-collapse mt-4">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase text-[9px]">
                    <th className="py-2.5 px-2">Deskripsi Layanan</th>
                    <th className="py-2.5 px-2 text-right">Harga Satuan</th>
                    <th className="py-2.5 px-2 text-right">Pajak (11%)</th>
                    <th className="py-2.5 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-2 font-medium">
                      Layanan Internet {getPackageObjByCustId(selectedInvoice.customer_id)?.name || 'StarHome family'} 
                    </td>
                    <td className="py-3 px-2 text-right font-mono">
                      Rp {(selectedInvoice.amount / 1.11).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-2 text-right font-mono">
                      Rp {(selectedInvoice.amount - (selectedInvoice.amount / 1.11)).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">
                      Rp {selectedInvoice.amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="border-t-2 border-slate-100 pt-6 flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-500 leading-relaxed max-w-sm">
                    Kuitansi ini dihasilkan secara otomatis oleh sistem tagihan StarBilling ISP dan sah tanpa tanda tangan basah.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px] uppercase block font-bold">TOTAL BAYAR (IDR)</p>
                  <p className="text-xl font-bold font-mono text-cyan-700 mt-1">Rp {selectedInvoice.amount.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2 text-white">
              <button 
                onClick={() => setIsPdfOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition"
              >
                Tutup PDF
              </button>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" /> Cetak Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
