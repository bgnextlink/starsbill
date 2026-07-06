/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle,
  Clock,
  CreditCard,
  QrCode,
  DollarSign,
  Phone,
  Copy,
  ExternalLink,
  ChevronRight,
  User,
  Shield,
  Send,
  Zap,
  Check,
  AlertTriangle,
  ArrowLeft,
  Wifi,
  Ticket,
  HelpCircle
} from 'lucide-react';
import { Customer, Invoice, InternetPackage, Area } from '../types';
import { normalizePhoneNumber } from '../App';

interface DirectBillingPayProps {
  customers: Customer[];
  invoices: Invoice[];
  packages: InternetPackage[];
  areas?: Area[];
  onPayInvoice: (invoiceId: string, method: string, reference: string) => void;
  onSendWhatsapp: (recipient: string, message: string, type: string) => void;
  onBackToAdmin?: () => void;
}

export default function DirectBillingPay({
  customers,
  invoices,
  packages,
  areas = [],
  onPayInvoice,
  onSendWhatsapp,
  onBackToAdmin
}: DirectBillingPayProps) {
  // We allow either checking real URL path or typing in our simulated navigation bar
  const [inputUrl, setInputUrl] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerInvoices, setCustomerInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Checkout & Payment states
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'qris' | 'va_bri' | 'va_bca' | 'va_mandiri' | 'retail'>('qris');
  const [paymentStep, setPaymentStep] = useState<'details' | 'checkout' | 'success'>('details');
  const [checkoutRef, setCheckoutRef] = useState('');
  const [countdown, setCountdown] = useState(3600); // 1 hour timer
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Link generator tool states
  const [genPhone, setGenPhone] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  // Handle URL pathname checkout lookups on load or URL change
  useEffect(() => {
    const handleUrlPathnameLookup = () => {
      const savedWebsite = localStorage.getItem('sb_website') || 'https://loacalhost';
      const cleanWebsite = savedWebsite.replace(/^https?:\/\//, '');

      // Look up current real pathname
      const path = window.location.pathname.replace(/^\//, '').trim();
      if (path && /^[0-9a-zA-Z_\-]+$/.test(path)) {
        setInputUrl(`${cleanWebsite}/Direct QuickPay (${path})`);
        findCustomerByQuery(path);
      } else {
        // Default search demo with first unpaid customer
        const unpaidInv = invoices.find(inv => inv.status === 'Belum Bayar' || inv.status === 'Overdue');
        if (unpaidInv) {
          const cust = customers.find(c => c.id === unpaidInv.customer_id);
          if (cust) {
            setInputUrl(`${cleanWebsite}/Direct QuickPay (${cust.phone})`);
            setSearchQuery(cust.phone);
            selectCustomer(cust);
          }
        }
      }
    };

    handleUrlPathnameLookup();
  }, [customers, invoices]);

  // Timer for checkout countdown
  useEffect(() => {
    let timer: any;
    if (paymentStep === 'checkout' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [paymentStep, countdown]);

  const findCustomerByQuery = (query: string) => {
    if (!query) return;
    
    // Extract ID/phone from a format like "Direct QuickPay (6281234567890)", "Direct QuickPay 6281234567890", "Direct QuickPay/6281234567890" or just "6281234567890"
    let targetQuery = query.trim();
    if (targetQuery.toLowerCase().includes('direct quickpay')) {
      targetQuery = targetQuery.replace(/direct\s+quickpay/gi, '')
                               .replace(/[\/()]/g, '')
                               .trim();
    }
    
    const cleanQuery = targetQuery.toLowerCase().replace(/\s+/g, '');
    const normQuery = normalizePhoneNumber(cleanQuery);

    const found = customers.find(c => {
      const matchPhone = normalizePhoneNumber(c.phone) === normQuery || c.phone === cleanQuery;
      const matchCustNum = c.customer_number.toLowerCase() === cleanQuery;
      const matchId = c.id.toLowerCase() === cleanQuery;
      const matchPppoe = c.pppoe_username?.toLowerCase() === cleanQuery;
      return matchPhone || matchCustNum || matchId || matchPppoe;
    });

    if (found) {
      selectCustomer(found);
      setErrorMessage('');
    } else {
      setErrorMessage(`Pelanggan dengan kata kunci "${targetQuery}" tidak ditemukan. Pastikan No. Handphone, ID Pelanggan, atau PPPoE Username terdaftar.`);
      setSelectedCustomer(null);
      setCustomerInvoices([]);
      setActiveInvoice(null);
      setPaymentStep('details');
    }
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    const bills = invoices.filter(inv => inv.customer_id === customer.id);
    setCustomerInvoices(bills);
    
    // Auto detect region gateway
    const custArea = customer.area_id ? areas.find(a => a.id === customer.area_id) : null;
    if (custArea?.payment_gateway) {
      setSelectedMethod('gateway_region');
    } else {
      setSelectedMethod('qris');
    }

    // Auto select first unpaid bill if available
    const unpaid = bills.find(inv => inv.status === 'Belum Bayar' || inv.status === 'Overdue');
    if (unpaid) {
      setActiveInvoice(unpaid);
    } else if (bills.length > 0) {
      setActiveInvoice(bills[0]);
    } else {
      setActiveInvoice(null);
    }
    setPaymentStep('details');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const savedWebsite = localStorage.getItem('sb_website') || 'https://loacalhost';
      const cleanWebsite = savedWebsite.replace(/^https?:\/\//, '');
      setInputUrl(`${cleanWebsite}/Direct QuickPay (${searchQuery.trim()})`);
      findCustomerByQuery(searchQuery.trim());
    }
  };

  const startCheckout = () => {
    if (!activeInvoice) return;
    setPaymentStep('checkout');
    setCountdown(3599);
    setCheckoutRef(`SB-PAY-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  // Simulate payment callback on webhook
  const simulatePaymentWebhook = () => {
    if (!activeInvoice || !selectedCustomer) return;

    const ref = checkoutRef || `SB-PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const methodLabel = 
      selectedMethod === 'gateway_region' && activeGateway ? activeGateway :
      selectedMethod === 'qris' ? 'QRIS' :
      selectedMethod === 'retail' ? 'Alfamart / Indomaret' :
      selectedMethod.replace('va_', 'Virtual Account ').toUpperCase();

    // Trigger parent state update
    onPayInvoice(activeInvoice.id, methodLabel, ref);
    
    // Simulate WhatsApp Dispatch
    const waText = `*[STARBILLING.lokal - NOTIFIKASI BAYAR LUNAS]*\n\nHalo Kak *${selectedCustomer.name}*,\n\nPembayaran tagihan Anda dengan Invoice *${activeInvoice.invoice_number}* sebesar *Rp ${activeInvoice.amount.toLocaleString('id-ID')}* via *${methodLabel}* TELAH BERHASIL DITERIMA.\n\nSistem Mikrotik RouterOS dan TR-069 ACS telah memperbarui status PPPoE / ONU Anda. Layanan internet Anda kini AKTIF penuh kembali.\n\nTerima kasih atas kepercayaan Anda menggunakan layanan kami.`;
    onSendWhatsapp(selectedCustomer.phone, waText, 'Transaksi');

    setPaymentStep('success');

    // Refresh customer bills
    setTimeout(() => {
      const updatedBills = invoices.filter(inv => inv.customer_id === selectedCustomer.id);
      setCustomerInvoices(updatedBills);
    }, 500);
  };

  const generateQuickLink = () => {
    if (!genPhone) return;
    const clean = genPhone.trim();
    const savedWebsite = localStorage.getItem('sb_website') || 'https://loacalhost';
    setGeneratedLink(`${savedWebsite}/Direct QuickPay (${clean})`);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const activePackage = selectedCustomer 
    ? packages.find(p => p.id === selectedCustomer.package_id) 
    : null;

  const customerArea = selectedCustomer?.area_id 
    ? areas.find(a => a.id === selectedCustomer.area_id) 
    : null;

  const activeGateway = customerArea?.payment_gateway;

  return (
    <div className="space-y-6">
      
      {/* 1. Header with simulation context info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white tracking-wide flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-amber-400 animate-pulse" /> STARBILLING QuickPay Link
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Modul pengujian cek tagihan & pembayaran mandiri pelanggan via url langsung (Direct Payment Link).
          </p>
        </div>
        <div className="flex gap-2">
          {onBackToAdmin && (
            <button
              onClick={onBackToAdmin}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border bg-slate-950 text-slate-400 border-slate-800 hover:text-white transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Admin
            </button>
          )}
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-lg border bg-emerald-950/20 text-emerald-400 border-emerald-900/30">
            MODUL AKTIF
          </span>
        </div>
      </div>

      {/* 2. Mock URL Address Bar (Simulates starsbilling.lokal/628xxxxxx) */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-md">
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
          Simulasi Browser Address Bar (Link yang dikirim ke WhatsApp / SMS Pelanggan)
        </span>
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-400 font-mono font-semibold">https://</span>
          </div>
          <div className="flex-1 font-mono text-xs text-slate-200">
            {inputUrl || 'starbilling.lokal/628xxxxxxxxx'}
          </div>
          <button
            onClick={() => copyToClipboard(inputUrl ? `https://${inputUrl}` : '', 'url')}
            className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800"
          >
            {copiedId === 'url' ? 'Disalin!' : 'Salin Link'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: QUICK SEARCH & LINK GENERATOR */}
        <div className="space-y-6">
          
          {/* Search Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Cari Pelanggan & Tagihan
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ketikkan nomor handphone, ID Pelanggan, atau PPPoE Username untuk mensimulasikan akses URL direct link.
            </p>
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Contoh: 081234567890 atau SB-1002"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition"
              >
                Cek Tagihan Sekarang
              </button>
            </form>

            {errorMessage && (
              <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl flex items-start gap-2 text-rose-400 text-[11px] leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Quick billing URL link generator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
              🔗 Pembuat Link Pembayaran
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Gunakan form ini untuk membuat link pembayaran instan untuk dikirimkan melalui blast message template WhatsApp billing.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">HP Pelanggan / ID</label>
                <input
                  type="text"
                  placeholder="Contoh: 6281234567890"
                  value={genPhone}
                  onChange={e => setGenPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <button
                type="button"
                onClick={generateQuickLink}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition"
              >
                Hasilkan Link STARBILLING
              </button>

              {generatedLink && (
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2 mt-2">
                  <span className="text-[10px] text-indigo-400 font-mono block break-all font-semibold">
                    {generatedLink}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(generatedLink, 'gen-link')}
                      className="flex-1 py-1 text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-300 rounded hover:text-white transition flex items-center justify-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> {copiedId === 'gen-link' ? 'Disalin!' : 'Salin'}
                    </button>
                    <button
                      onClick={() => {
                        const pathId = genPhone.trim();
                        const savedWebsite = localStorage.getItem('sb_website') || 'https://loacalhost';
                        const cleanWebsite = savedWebsite.replace(/^https?:\/\//, '');
                        setInputUrl(`${cleanWebsite}/Direct QuickPay (${pathId})`);
                        findCustomerByQuery(pathId);
                      }}
                      className="flex-1 py-1 text-[10px] font-mono font-bold bg-indigo-950/40 border border-indigo-900/30 text-indigo-400 rounded hover:text-indigo-300 transition flex items-center justify-center gap-1"
                    >
                      Buka Link <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT & CENTER COLUMNS: BILL CHECKOUT EXPERIENCE */}
        <div className="lg:col-span-2 space-y-6">
          
          {selectedCustomer ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              
              {/* Customer Profile Banner */}
              <div className="bg-gradient-to-r from-indigo-950 to-slate-900 border-b border-slate-850 p-6 flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold text-white uppercase tracking-wider rounded-md bg-indigo-600">
                      ID: {selectedCustomer.customer_number}
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-md uppercase tracking-wider border ${
                      selectedCustomer.status === 'Aktif' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/30' : 'bg-rose-950/50 text-rose-400 border-rose-900/30'
                    }`}>
                      Status: {selectedCustomer.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-white">{selectedCustomer.name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-500" /> {selectedCustomer.phone}</span>
                    <span className="flex items-center gap-1"><Wifi className="w-3.5 h-3.5 text-indigo-400" /> {activePackage?.name} ({activePackage?.download_speed} Mbps)</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center font-mono">
                  <span className="text-[10px] text-slate-500 block">TAGIHAN</span>
                  <span className="text-lg font-bold text-white mt-0.5 block">
                    Rp {customerInvoices.filter(i => i.status !== 'Lunas').reduce((sum, i) => sum + i.amount, 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Sub-Step views: details, checkout, success */}
              <div className="p-6">
                
                {/* --- A. VIEW BILL DETAILS --- */}
                {paymentStep === 'details' && (
                  <div className="space-y-6">
                    <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                      Rincian Tagihan Bulanan Anda:
                    </h4>

                    {customerInvoices.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 italic bg-slate-950 rounded-2xl border border-slate-850">
                        Tidak ditemukan catatan invoice untuk pelanggan ini.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {customerInvoices.map((inv) => (
                          <div 
                            key={inv.id} 
                            onClick={() => {
                              if (inv.status !== 'Lunas') {
                                setActiveInvoice(inv);
                              }
                            }}
                            className={`p-4 bg-slate-950 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer ${
                              inv.status === 'Lunas' 
                                ? 'border-slate-850 opacity-60' 
                                : activeInvoice?.id === inv.id 
                                  ? 'border-indigo-500 bg-indigo-950/5' 
                                  : 'border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-white">{inv.invoice_number}</span>
                                <span className={`px-2 py-0.5 text-[9px] font-mono rounded font-bold border ${
                                  inv.status === 'Lunas' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-800/40' : 'bg-amber-950/20 text-amber-400 border-amber-800/40'
                                }`}>
                                  {inv.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Jatuh Tempo: <span className="text-slate-300 font-mono">{inv.due_date}</span>
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right font-mono">
                                <span className="text-[10px] text-slate-500 block">Total Tagihan</span>
                                <span className="text-sm font-bold text-white">Rp {inv.amount.toLocaleString('id-ID')}</span>
                              </div>
                              {inv.status !== 'Lunas' && (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-700 flex items-center justify-center">
                                  {activeInvoice?.id === inv.id && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Payment Method Selector (Only shown if unpaid bill selected) */}
                        {activeInvoice && activeInvoice.status !== 'Lunas' && (() => {
                          return (
                            <div className="border-t border-slate-800 pt-5 space-y-4">
                              {customerArea && (
                                <div className="bg-slate-950/85 p-4 rounded-xl border border-indigo-500/20 text-xs">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="font-mono text-[9px] text-indigo-400 uppercase font-bold tracking-wider">Deteksi Wilayah Pelanggan</span>
                                  </div>
                                  <p className="text-slate-300 leading-relaxed text-[11px]">
                                    Pelanggan terdaftar di wilayah <strong className="text-white font-semibold">{customerArea.name}</strong>.
                                    {activeGateway ? (
                                      <span> Wilayah ini dikonfigurasi khusus menggunakan gerbang pembayaran: <strong className="text-cyan-400 font-mono text-[11px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{activeGateway}</strong>.</span>
                                    ) : (
                                      <span> Belum ada konfigurasi gerbang pembayaran khusus wilayah ini. Menggunakan pilihan pembayaran terintegrasi sistem:</span>
                                    )}
                                  </p>
                                </div>
                              )}

                              <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                                {activeGateway ? 'Gerbang Pembayaran Wilayah Terpilih:' : 'Pilih Gerbang Pembayaran STARBILLING:'}
                              </h4>
                              <p className="text-[11px] text-slate-400">
                                {activeGateway 
                                  ? `Gunakan metode pembayaran resmi yang disediakan khusus untuk wilayah ${customerArea?.name || ''}.`
                                  : 'Semua platform pembayaran di bawah terintegrasi secara modular via API Driver ke core backend.'}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {(activeGateway 
                                  ? [
                                      { id: 'gateway_region', name: activeGateway, icon: Shield, desc: `Settle via Gateway ${customerArea?.name || ''}` }
                                    ]
                                  : [
                                      { id: 'qris', name: 'QRIS Auto-Settle', icon: QrCode, desc: 'Scan e-Wallet otomatis' },
                                      { id: 'va_bri', name: 'Virtual Account BRI', icon: CreditCard, desc: 'Verifikasi instan BRIVA' },
                                      { id: 'va_bca', name: 'Virtual Account BCA', icon: CreditCard, desc: 'Verifikasi instan BCA' },
                                      { id: 'va_mandiri', name: 'Virtual Account Mandiri', icon: CreditCard, desc: 'Verifikasi instan Livin' },
                                      { id: 'retail', name: 'Alfamart / Indomaret', icon: DollarSign, desc: 'Pembayaran via gerai ritel' }
                                    ]
                                ).map((m) => {
                                  const Icon = m.icon;
                                  return (
                                    <div
                                      key={m.id}
                                      onClick={() => setSelectedMethod(m.id as any)}
                                      className={`p-3.5 bg-slate-950 border rounded-xl cursor-pointer transition flex items-start gap-3 ${
                                        selectedMethod === m.id || (activeGateway && selectedMethod !== 'gateway_region' && m.id === 'gateway_region') ? 'border-indigo-500 bg-indigo-950/10' : 'border-slate-850 hover:border-slate-800'
                                      }`}
                                    >
                                      <Icon className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                      <div>
                                        <span className="text-xs font-bold text-white block">{m.name}</span>
                                        <span className="text-[10px] text-slate-500 mt-0.5 block">{m.desc}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <button
                                type="button"
                                onClick={startCheckout}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
                              >
                                <span>Lanjutkan ke Pembayaran Instan</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* --- B. CHECKOUT INTERACTIVE SIMULATOR --- */}
                {paymentStep === 'checkout' && activeInvoice && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <button
                        onClick={() => setPaymentStep('details')}
                        className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 font-semibold"
                      >
                        <ArrowLeft className="w-4 h-4" /> Ubah Metode
                      </button>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block font-mono">BATAS PEMBAYARAN</span>
                        <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 justify-end">
                          <Clock className="w-3.5 h-3.5 animate-pulse" /> {formatTimer(countdown)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                      
                      {/* Left side: QR Code or VA detail */}
                      <div className="md:col-span-2 flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-850 rounded-2xl text-center space-y-4">
                        {selectedMethod === 'qris' || selectedMethod === 'gateway_region' ? (
                          <>
                            <div className="p-3 bg-white rounded-xl shadow-lg border border-slate-100">
                              {/* QRIS Graphic Simulation */}
                              <div className="relative w-40 h-40 flex items-center justify-center bg-slate-100 rounded-lg">
                                <QrCode className="w-32 h-32 text-slate-900" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-10 h-10 bg-indigo-600 text-white font-bold font-serif text-[10px] flex items-center justify-center rounded-md border-2 border-white shadow-md">
                                    SB
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block uppercase tracking-wider">
                                {selectedMethod === 'gateway_region' && activeGateway ? activeGateway : 'QRIS STANDAR NASIONAL'}
                              </span>
                              <span className="text-[10px] text-slate-500 mt-1 block">
                                {selectedMethod === 'gateway_region' 
                                  ? `Gerbang Pembayaran Resmi Terintegrasi Wilayah ${customerArea?.name || ''}. Silakan scan kode atau lakukan transfer.` 
                                  : 'Scan dengan GoPay, OVO, Dana, LinkAja, BCA Mobile atau e-Wallet lainnya.'}
                              </span>
                            </div>
                          </>
                        ) : selectedMethod === 'retail' ? (
                          <>
                            <div className="p-5 bg-indigo-950/10 border border-indigo-900/30 rounded-xl w-full text-center space-y-2">
                              <span className="text-[10px] text-slate-500 font-mono block">KODE PEMBAYARAN RITEL</span>
                              <span className="text-xl font-mono font-bold text-indigo-400 block tracking-widest">
                                SB889900123
                              </span>
                              <button
                                onClick={() => copyToClipboard('SB889900123', 'code')}
                                className="text-[10px] font-mono text-indigo-400 bg-slate-900 px-2 py-1 rounded hover:text-white"
                              >
                                {copiedId === 'code' ? 'Disalin!' : 'Salin Kode'}
                              </button>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">GERAI ALFAMART / INDOMARET</span>
                              <span className="text-[10px] text-slate-500 mt-1 block">Tunjukkan kode pembayaran di atas ke kasir untuk melakukan pelunasan tagihan STARBILLING.</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-5 bg-indigo-950/10 border border-indigo-900/30 rounded-xl w-full text-center space-y-2">
                              <span className="text-[10px] text-slate-500 font-mono block">NOMOR VIRTUAL ACCOUNT</span>
                              <span className="text-xl font-mono font-bold text-indigo-400 block tracking-wider">
                                887900{selectedCustomer.customer_number.slice(-6)}
                              </span>
                              <button
                                onClick={() => copyToClipboard(`887900${selectedCustomer.customer_number.slice(-6)}`, 'va')}
                                className="text-[10px] font-mono text-indigo-400 bg-slate-900 px-2 py-1 rounded hover:text-white"
                              >
                                {copiedId === 'va' ? 'Disalin!' : 'Salin VA'}
                              </button>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block uppercase">
                                {selectedMethod.replace('va_', '').toUpperCase()} VIRTUAL ACCOUNT
                              </span>
                              <span className="text-[10px] text-slate-500 mt-1 block">Gunakan menu transfer m-Banking / ATM untuk membayar dengan tagihan pas atau otomatis terverifikasi.</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Right side: Invoice detail receipt */}
                      <div className="md:col-span-3 space-y-4">
                        <div className="p-5 bg-slate-950 rounded-2xl border border-slate-850 space-y-3 font-mono text-xs">
                          <h4 className="text-xs font-bold text-white border-b border-slate-900 pb-2 uppercase tracking-wide">
                            Struk Rincian Pembayaran
                          </h4>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Invoice Ref:</span>
                            <span className="text-slate-300">{activeInvoice.invoice_number}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">No Pelanggan:</span>
                            <span className="text-slate-300">{selectedCustomer.customer_number}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Metode Bayar:</span>
                            <span className="text-indigo-400 font-bold uppercase">
                              {selectedMethod === 'qris' ? 'QRIS' : selectedMethod === 'retail' ? 'ALFAMART' : selectedMethod.replace('va_', '').toUpperCase()}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-slate-900 pb-2">
                            <span className="text-slate-500">Referensi PG:</span>
                            <span className="text-slate-400">{checkoutRef}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Biaya Internet:</span>
                            <span className="text-slate-300">Rp {activePackage ? activePackage.price.toLocaleString('id-ID') : '0'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">PPN (11%):</span>
                            <span className="text-slate-300">Rp {Math.round((activePackage?.price || 0) * 0.11).toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-900 pb-2">
                            <span className="text-slate-500">Admin Gateway Fee:</span>
                            <span className="text-slate-300">Rp 1.500</span>
                          </div>
                          <div className="flex justify-between text-sm pt-1">
                            <span className="text-white font-bold">Total Tagihan:</span>
                            <span className="text-indigo-400 font-bold">Rp {activeInvoice.amount.toLocaleString('id-ID')}</span>
                          </div>
                        </div>

                        {/* Interactive Payment Gateway simulation tool */}
                        <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-xl space-y-3.5">
                          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider block">
                            ⚡ SIMULATOR CALLBACK WEBHOOK PAYMENT GATEWAY
                          </span>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Simulasikan callback lunas instan seakan-akan dikirim oleh Payment Gateway (Midtrans/Tripay) secara real-time ke endpoint callback STARBILLING.
                          </p>
                          <button
                            type="button"
                            onClick={simulatePaymentWebhook}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-600/10"
                          >
                            <CheckCircle className="w-4 h-4" /> Simulasikan Pembayaran Lunas (Webhook Callback)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- C. SUCCESS STATUS VIEW --- */}
                {paymentStep === 'success' && activeInvoice && (
                  <div className="py-8 text-center space-y-6 max-w-md mx-auto animate-fade-in">
                    <div className="w-16 h-16 bg-emerald-950/30 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-serif font-bold text-white">Pembayaran Sukses Terproses!</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Tagihan Invoice <strong>{activeInvoice.invoice_number}</strong> telah lunas. Notifikasi WhatsApp billing dikirim secara instan ke nomor <strong>{selectedCustomer.phone}</strong>.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-3 text-left font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Nama Pelanggan:</span>
                        <span className="text-white font-bold">{selectedCustomer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Metode Pembayaran:</span>
                        <span className="text-indigo-400 uppercase">{selectedMethod.replace('va_', '').toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Jumlah Lunas:</span>
                        <span className="text-emerald-400 font-bold">Rp {activeInvoice.amount.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Waktu Pembayaran:</span>
                        <span className="text-slate-300">{new Date().toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPaymentStep('details')}
                      className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
                    >
                      Kembali ke Detail Tagihan
                    </button>
                  </div>
                )}

              </div>

              {/* Simulated Payment Website Footer with Dynamic Isolir and Custom Promo/Info */}
              <div className="p-6 bg-slate-950/65 border-t border-slate-850 space-y-4 text-left">
                <div className="flex items-center gap-2 text-slate-400 font-serif text-[10px] font-bold tracking-wider uppercase">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span>INFORMASI &amp; CATATAN PEMBAYARAN</span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-850 font-sans shadow-inner">
                  {(localStorage.getItem('sb_catatan_pembayaran') || `[ISOLIR] = Mengambil Tanggal Isolir Pelanggan\nIni akan muncul di footer website https://loacalhost/\ndari Simulasi Browser Address Bar (Link yang dikirim ke WhatsApp / SMS Pelanggan)\nhttps://\nstarbilling.lokal/6281234567890\n\nkamu bisa menambahkan promo dan lain-lain\n💡 [ISOLIR] = Mengambil Tanggal Isolir Pelanggan. Ini akan muncul di footer website https://loacalhost/promo. Anda bisa menambahkan syarat, nomor rekening, promo speed, atau info loket.`).replace(/\[ISOLIR\]/gi, activeInvoice ? activeInvoice.due_date : 'Tanggal Jatuh Tempo')}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[10px] text-slate-500 font-mono pt-1 gap-2 border-t border-slate-900">
                  <span>© {new Date().getFullYear()} {localStorage.getItem('sb_pemilik') || 'PT StarBilling Media Nusantara'}. All rights reserved.</span>
                  <span className="flex items-center gap-1">Website Resmi: <a href={localStorage.getItem('sb_website') || 'https://loacalhost'} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{localStorage.getItem('sb_website') || 'https://loacalhost'}</a></span>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xl">
              <User className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
              <div>
                <h3 className="text-base font-serif font-bold text-white">Direct Billing Quick-Pay</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                  Silakan cari pelanggan menggunakan nomor handphone atau masukkan parameter simulasi URL di sebelah kiri untuk melihat invoice tagihan bulanan pelanggan secara real-time.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
