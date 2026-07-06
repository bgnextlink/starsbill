/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Wifi, 
  Receipt, 
  MessageSquare, 
  ArrowUpRight, 
  Check, 
  AlertCircle,
  HelpCircle,
  Clock,
  Settings,
  Send,
  Zap,
  RotateCw,
  X,
  QrCode,
  CreditCard,
  Eye,
  EyeOff,
  Terminal,
  Cpu,
  Save
} from 'lucide-react';
import { Customer, Invoice, Ticket, InternetPackage } from '../types';

interface CustomerPortalProps {
  customer: Customer;
  invoices: Invoice[];
  tickets: Ticket[];
  packages: InternetPackage[];
  onAddTicket: (ticket: Ticket) => void;
  onPayInvoice: (id: string, method: string, reference: string) => void;
  onSendWhatsapp: (recipient: string, message: string, type: string) => void;
  onLogout?: () => void;
  onUpdateCustomer?: (updatedCust: Customer) => void;
}

export default function CustomerPortal({ 
  customer, 
  invoices, 
  tickets, 
  packages, 
  onAddTicket, 
  onPayInvoice,
  onSendWhatsapp,
  onLogout,
  onUpdateCustomer
}: CustomerPortalProps) {
  const [portalTab, setPortalTab] = useState<'dash' | 'billing' | 'ticket'>('dash');

  // New ticket state
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'Internet Lambat' | 'LOS / Kabel Putus' | 'Ganti Password Wi-Fi'>('Internet Lambat');
  const [ticketDesc, setTicketDesc] = useState('');

  // Payment VA modal checkout
  const [checkoutInvoice, setCheckoutInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'BCA Virtual Account'>('QRIS');
  const [showPayModal, setShowPayModal] = useState(false);

  // Buy/upgrade package states
  const [selectedPackageForBuy, setSelectedPackageForBuy] = useState<InternetPackage | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyPaymentMethod, setBuyPaymentMethod] = useState<'QRIS' | 'BCA Virtual Account'>('QRIS');

  // GenieACS Wifi Configuration states
  const [wifiSsid, setWifiSsid] = useState(`NextLink_${customer.name.replace(/\s+/g, '')}`);
  const [wifiPassword, setWifiPassword] = useState(`starbilling_${customer.customer_number.toLowerCase().replace(/[^a-z0-9]/g, '')}`);
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingWifi, setIsSavingWifi] = useState(false);
  const [acsLogs, setAcsLogs] = useState<string[]>([]);
  const [showAcsPanel, setShowAcsPanel] = useState(false);

  // GenieACS ONT Telemetry parameters
  const [ontSuhu, setOntSuhu] = useState('44.8 °C');
  const [ontRedaman, setOntRedaman] = useState('-21.4 dBm');
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState(false);

  const handleConfirmUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackageForBuy || !onUpdateCustomer) return;

    onUpdateCustomer({
      ...customer,
      package_id: selectedPackageForBuy.id
    });

    const isUpgrade = customer.package_id !== selectedPackageForBuy.id;

    // Auto send notification via WhatsApp
    const myPackage = packages.find(p => p.id === customer.package_id) || packages[0];
    const waMsg = `*[STARBILLING.lokal - ${isUpgrade ? 'UPGRADE' : 'BELI'} PAKET SUKSES]*\n\nHalo Kak *${customer.name}*,\n\nPermintaan ${isUpgrade ? 'upgrade' : 'pembelian'} paket Anda berhasil diproses!\n\n• *Paket Sebelumnya*: ${myPackage.name}\n• *Paket Sekarang*: ${selectedPackageForBuy.name}\n• *Kecepatan*: ${selectedPackageForBuy.download_speed}\n• *Tarif Baru*: Rp ${selectedPackageForBuy.price.toLocaleString('id-ID')}/bulan\n\nLayanan baru telah disinkronisasikan ke router MikroTik Anda secara otomatis via API Router.\n\nTerima kasih atas kepercayaannya!`;
    onSendWhatsapp(customer.phone, waMsg, 'Notification');

    setShowBuyModal(false);
    setSelectedPackageForBuy(null);
    alert(`Sukses: Layanan Anda berhasil dialihkan ke paket ${selectedPackageForBuy.name}! Sinkronisasi profile di MikroTik selesai.`);
  };

  const handleSaveWifi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wifiSsid.trim()) {
      alert('Nama Wi-Fi (SSID) tidak boleh kosong!');
      return;
    }
    if (wifiPassword.length < 8) {
      alert('Sandi Wi-Fi minimal 8 karakter demi keamanan!');
      return;
    }

    setIsSavingWifi(true);
    setShowAcsPanel(true);
    setAcsLogs([]);

    const logSteps = [
      `[TR-069] Mengirimkan request koneksi ke CPE ID: ONT_${customer.customer_number}...`,
      `[Sistem Otomatis TR-069] Koneksi terjalin via TR-069 CWMP protocol.`,
      `[TR-069] Memperbarui Parameter: InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.SSID -> "${wifiSsid}"`,
      `[TR-069] Memperbarui Parameter: InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.PreSharedKey.1.KeyPassphrase -> "${wifiPassword}"`,
      `[TR-069] Mengirimkan sinyal SPV (SetParameterValues) ke perangkat ONT...`,
      `[Sistem Otomatis TR-069] Perangkat membalas dengan Status Code: 0 (Menerima perintah sukses)`,
      `[TR-069] Menjalankan fungsi soft-reboot pada subsistem Wi-Fi ONT...`,
      `[Sistem] Konfigurasi Wi-Fi baru berhasil disimpan! Perangkat Wi-Fi Anda akan terputus sejenak untuk menerapkan sandi baru.`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < logSteps.length) {
        setAcsLogs(prev => [...prev, logSteps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsSavingWifi(false);
        // Auto send notification via whatsapp as well
        const waMsg = `*[STARBILLING.lokal - NOTIFIKASI GANTI SANDI WI-FI]*\n\nHalo Kak *${customer.name}*,\n\nAnda baru saja merubah pengaturan Wi-Fi ONT secara mandiri lewat Portal:\n\n• *Nama Wi-Fi (SSID)*: ${wifiSsid}\n• *Kata Sandi baru*: ${wifiPassword}\n\nPerubahan ini terhubung dan diproses secara otomatis via Sistem Sinkronisasi Modem Otomatis (TR-069). Jika Wi-Fi terputus, silakan sambungkan kembali perangkat Anda dengan sandi baru tersebut.\n\nTerima kasih.`;
        onSendWhatsapp(customer.phone, waMsg, 'Notification');
      }
    }, 800);
  };

  const myInvoices = invoices.filter(inv => inv.customer_id === customer.id);
  const myTickets = tickets.filter(t => t.customer_id === customer.id);
  const myPackage = packages.find(p => p.id === customer.package_id) || packages[0];

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutInvoice) return;

    const refNo = `TRX-PORTAL-${Math.floor(Math.random() * 899999) + 100000}`;
    onPayInvoice(checkoutInvoice.id, `${paymentMethod} (Customer Portal)`, refNo);
    
    // Auto WhatsApp
    const waMsg = `Halo *${customer.name}*,\n\nPembayaran tagihan *${checkoutInvoice.invoice_number}* sebesar *Rp ${checkoutInvoice.amount.toLocaleString('id-ID')}* via *${paymentMethod}* sukses dilakukan.\n\nLayanan internet Anda tetap aktif. Terima kasih atas kepercayaan Anda.`;
    onSendWhatsapp(customer.phone, waMsg, 'Notification');

    setShowPayModal(false);
    alert('Pembayaran Berhasil! Tagihan Anda telah lunas diperbarui.');
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle) {
      alert('Judul aduan wajib diisi!');
      return;
    }

    onAddTicket({
      id: `tic-${Date.now()}`,
      ticket_number: `TCK-PORTAL-${Math.floor(Math.random() * 8999) + 1000}`,
      customer_id: customer.id,
      title: ticketTitle,
      category: ticketCategory as any,
      priority: 'Medium',
      status: 'Open',
      description: ticketDesc,
      created_at: new Date().toISOString().split('T')[0]
    });

    setTicketTitle('');
    setTicketDesc('');
    alert('Sukses: Pengaduan gangguan Anda telah diteruskan ke NOC NOC StarBilling. Teknisi akan menghubungi Anda lewat WA.');
  };

  return (
    <div className="space-y-6">
      {/* Upper Account Banner */}
      <div className="bg-gradient-to-r from-emerald-900/60 to-slate-900 p-6 rounded-2xl border border-emerald-800/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-emerald-400 block font-bold uppercase tracking-wider">SELAMAT DATANG DI PORTAL LAYANAN</span>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">{customer.name}</h2>
          <span className="text-xs text-slate-400 block mt-1 font-mono">No. Pelanggan: {customer.customer_number} | Status: <span className="text-emerald-400 font-bold uppercase">AKTIF</span></span>
        </div>
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="bg-slate-950/40 border border-slate-800 px-4 py-2.5 rounded-xl text-right">
            <span className="text-[10px] text-slate-500 font-mono block uppercase">PAKET SAYA</span>
            <span className="text-sm font-bold text-indigo-400">{myPackage.name}</span>
            <span className="text-xs text-slate-400 block mt-0.5">{myPackage.download_speed} Simetris</span>
          </div>
          {onLogout && (
            <button 
              onClick={onLogout}
              className="px-4 py-2.5 bg-rose-950/45 border border-rose-900/40 hover:bg-rose-900/40 text-rose-400 font-bold text-xs rounded-xl font-mono tracking-wider transition"
            >
              LOGOUT
            </button>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs w-fit">
        <button 
          onClick={() => setPortalTab('dash')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${portalTab === 'dash' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          My Dashboard
        </button>
        <button 
          onClick={() => setPortalTab('billing')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${portalTab === 'billing' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          Riwayat Tagihan & Bayar
        </button>
        <button 
          onClick={() => setPortalTab('ticket')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${portalTab === 'ticket' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          Aduan Gangguan NOC
        </button>
      </div>

      {/* Active display page */}
      {portalTab === 'dash' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TR-069 ONT Telemetry Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>TELEMETRI MODEM PPPoE CPE</span>
              <span className="text-[9px] text-cyan-400 font-bold tracking-normal px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-900/30 font-mono uppercase">ACS ONLINE</span>
            </h3>
            
            <p className="text-[11px] text-slate-500 leading-normal">
              Informasi real-time ditarik otomatis dari modem PPPoE (ONT) terpasang di rumah Anda melalui protokol Sinkronisasi Modem Otomatis TR-069.
            </p>

            <div className="space-y-3">
              {/* SSID & Password */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">INFO WI-FI AKTIF</span>
                  <span className="text-[9px] font-mono text-emerald-400">TR-069 Pull Success</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-left font-mono text-xs">
                  <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                    <span className="text-slate-500 text-[10px]">SSID Wi-Fi:</span>
                    <span className="text-white font-bold">{wifiSsid}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                    <span className="text-slate-500 text-[10px]">Password:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">{showPassword ? wifiPassword : '••••••••'}</span>
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[9px] text-slate-400 hover:text-white underline font-sans"
                      >
                        {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suhu & Redaman */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-center">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">SUHU INTERNAL ONT</span>
                  <span className="text-lg font-bold text-amber-500 font-mono mt-1 block">{ontSuhu}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-center">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">REDAMAN SERAT (Rx)</span>
                  <span className={`text-lg font-bold font-mono mt-1 block ${
                    parseFloat(ontRedaman) < -25 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>{ontRedaman}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setIsRefreshingTelemetry(true);
                setOntSuhu('Membaca...');
                setOntRedaman('Membaca...');
                setTimeout(() => {
                  const randomSuhu = (40 + Math.random() * 8).toFixed(1) + ' °C';
                  const randomRedaman = '-' + (19 + Math.random() * 4).toFixed(2) + ' dBm';
                  setOntSuhu(randomSuhu);
                  setOntRedaman(randomRedaman);
                  setIsRefreshingTelemetry(false);
                }, 1200);
              }}
              disabled={isRefreshingTelemetry}
              className="w-full py-2 bg-slate-950 border border-slate-800 hover:bg-slate-850 disabled:bg-slate-950 text-slate-200 disabled:text-slate-600 font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-1.5"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshingTelemetry ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
              {isRefreshingTelemetry ? 'Menarik data TR-069...' : 'Tarik Parameter ONT Terkini'}
            </button>
          </div>

          {/* Quick Actions (Reboot Wi-Fi) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              PENGATURAN MANDIRI ONT
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Koneksi modem terasa lambat atau ingin mengganti password Wi-Fi? Lakukan konfigurasi mandiri instan via ACS TR-069 di bawah ini.
            </p>

            <button 
              onClick={() => { alert('Perintah Reboot ONT terkirim via TR-069. ONT akan menyala kembali dalam 60 detik.'); }}
              className="w-full py-2 bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Reboot ONT Wi-Fi Remote
            </button>

            <div className="border-t border-slate-800 pt-3.5 space-y-3">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Ganti SSID & Sandi Wi-Fi
              </span>

              <form onSubmit={handleSaveWifi} className="space-y-3">
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Nama Wi-Fi (SSID)</label>
                  <input
                    type="text"
                    required
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="Contoh: NextLink_Wi-Fi_Rumah"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Kata Sandi Wi-Fi</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="Sandi minimal 8 karakter"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-9 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingWifi}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingWifi ? 'Sinkronisasi ACS...' : 'Simpan Perubahan Wi-Fi'}
                </button>
              </form>
            </div>

            {/* Simulated ACS Logging Terminal Panel */}
            {showAcsPanel && (
              <div className="border-t border-slate-800 pt-3 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono flex items-center gap-1 font-bold text-amber-400">
                    <Terminal className="w-3 h-3 text-amber-400" /> SINKRONISASI TR-069 logs
                  </span>
                  <button 
                    onClick={() => setShowAcsPanel(false)}
                    className="text-slate-500 hover:text-slate-300 text-[9px] font-mono font-bold"
                    disabled={isSavingWifi}
                  >
                    TUTUP LOG
                  </button>
                </div>
                
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-850 text-[10px] font-mono text-slate-300 space-y-1.5 max-h-40 overflow-y-auto">
                  {acsLogs.map((log, index) => {
                    const isSuccess = log.includes('[Sistem]') || log.includes('Selesai');
                    const isAcs = log.includes('[Sistem Otomatis TR-069]');
                    return (
                      <div 
                        key={index} 
                        className={`${
                          isSuccess ? 'text-emerald-400 font-semibold' : isAcs ? 'text-cyan-400' : 'text-slate-400'
                        }`}
                      >
                        {log}
                      </div>
                    );
                  })}
                  {isSavingWifi && (
                    <div className="flex items-center gap-1.5 text-amber-400 italic">
                      <RotateCw className="w-3 h-3 animate-spin" />
                      Memproses perubahan parameter pada ONT...
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-xs flex gap-2">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Redaman serat optik ONT Anda terpantau aman (<strong>-19.4 dBm</strong>). Wi-Fi terlindungi enkripsi WPA2 Personal.
              </p>
            </div>
          </div>

          <div className="space-y-6 flex flex-col">
            {/* Customer unpaid bill quick alert */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 mb-3">
                TAGIHAN BULAN INI
              </h3>
              
              {myInvoices.some(i => i.status !== 'Lunas') ? (
                <div className="p-3.5 bg-red-950/20 border border-red-900/40 rounded-xl">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-red-300">Belum Dibayar</span>
                    <span className="font-mono text-white font-bold">Rp {myInvoices.find(i => i.status !== 'Lunas')?.amount.toLocaleString('id-ID')}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
                    Jatuh Tempo: {myInvoices.find(i => i.status !== 'Lunas')?.due_date}
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-center text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" /> Tagihan Anda Lunas!
                </div>
              )}

              {myInvoices.some(i => i.status !== 'Lunas') && (
                <button 
                  onClick={() => {
                    const unpaid = myInvoices.find(i => i.status !== 'Lunas');
                    if (unpaid) {
                      setCheckoutInvoice(unpaid);
                      setShowPayModal(true);
                    }
                  }}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs transition mt-4 shadow"
                >
                  Bayar Sekarang
                </button>
              )}
            </div>

            {/* Beli & Upgrade Paket Filtered by Area */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex-1">
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                  BELI &amp; UPGRADE PAKET
                </h3>
                <span className="text-[9px] text-slate-500 font-mono block mt-1.5 uppercase">
                  Area Jangkauan Anda: <span className="text-cyan-400 font-bold">{customer.area_id || 'Seluruh Area'}</span>
                </span>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {(() => {
                  const allowedPackages = packages.filter(pkg => {
                    // Must be active
                    if (pkg.status === 'Nonaktif') return false;
                    
                    // Filter by area restriction
                    if (pkg.allowed_areas && pkg.allowed_areas.length > 0) {
                      if (!customer.area_id || !pkg.allowed_areas.includes(customer.area_id)) {
                        return false;
                      }
                    }
                    
                    return true;
                  });

                  if (allowedPackages.length === 0) {
                    return (
                      <p className="text-xs text-slate-500 italic text-center py-4">
                        Tidak ada paket tambahan yang tersedia untuk area Anda saat ini.
                      </p>
                    );
                  }

                  return allowedPackages.map(pkg => {
                    const isCurrent = pkg.id === customer.package_id;
                    return (
                      <div key={pkg.id} className={`p-3 rounded-xl border transition ${isCurrent ? 'bg-indigo-950/30 border-indigo-500/40' : 'bg-slate-950 border-slate-850 hover:border-slate-700'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-white block">{pkg.name}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">{pkg.download_speed} Simetris</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-400">Rp {pkg.price.toLocaleString('id-ID')}</span>
                        </div>
                        {pkg.description && (
                          <p className="text-[9px] text-slate-550 mt-1 font-sans">{pkg.description}</p>
                        )}
                        <div className="mt-2.5 flex justify-end">
                          {isCurrent ? (
                            <span className="text-[9px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900 font-bold uppercase">
                              Paket Aktif Saya
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedPackageForBuy(pkg);
                                setShowBuyModal(true);
                              }}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg transition"
                            >
                              Beli / Upgrade
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Riwayat Tagihan Page */}
      {portalTab === 'billing' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">
            RIWAYAT INVOICE & PEMBAYARAN SAYA
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 font-mono text-[10px] text-slate-500 uppercase pb-2">
                  <th>No. Invoice</th>
                  <th>Jumlah Tagihan</th>
                  <th>Jatuh Tempo</th>
                  <th>Status</th>
                  <th>Tanggal Bayar</th>
                  <th className="text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {myInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-950/20">
                    <td className="py-3 font-mono font-bold text-white">{inv.invoice_number}</td>
                    <td className="py-3 font-mono text-cyan-400">Rp {inv.amount.toLocaleString('id-ID')}</td>
                    <td className="py-3 font-mono text-slate-400">{inv.due_date}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase inline-block ${
                        inv.status === 'Lunas' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 font-mono">{inv.paid_date ? inv.paid_date.split('T')[0] : '-'}</td>
                    <td className="py-3 text-right">
                      {inv.status !== 'Lunas' ? (
                        <button 
                          onClick={() => { setCheckoutInvoice(inv); setShowPayModal(true); }}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-[10px] transition"
                        >
                          Bayar
                        </button>
                      ) : (
                        <span className="text-slate-500 font-mono text-[10px]">LUNAS VIA VA</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pengaduan Gangguan Tiket Page */}
      {portalTab === 'ticket' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submit ticket form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-fit">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">
              FORM LAPOR GANGGUAN NOC
            </h3>
            <form onSubmit={handleSubmitTicket} className="space-y-4 text-slate-300">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Subjek Pengaduan *</label>
                <input 
                  type="text" 
                  required
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="Contoh: Koneksi terputus LOS Merah"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Kategori Masalah</label>
                <select 
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Internet Lambat">Koneksi Wi-Fi Lambat</option>
                  <option value="LOS / Kabel Putus">LOS (Modem Merah Berkedip)</option>
                  <option value="Ganti Password Wi-Fi">Bantuan Ganti Sandi Wi-Fi</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Isi Laporan Detail *</label>
                <textarea 
                  rows={3}
                  required
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  placeholder="Ceritakan detail masalah yang Anda alami agar langsung dieksekusi tim NOC..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" /> Kirim Aduan ke NOC
              </button>
            </form>
          </div>

          {/* Ticket history logs list */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">
              STATUS GANGGUAN SAYA ({myTickets.length})
            </h3>
            {myTickets.length === 0 ? (
              <p className="text-slate-500 text-xs font-mono py-12 text-center">Belum ada riwayat pengaduan.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {myTickets.map(tic => (
                  <div key={tic.id} className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">{tic.ticket_number}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono ${
                          tic.status === 'Solved' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                        }`}>{tic.status}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-300 mt-1 block">{tic.title}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{tic.description}</p>
                      {tic.assignee && (
                        <span className="text-[10px] text-cyan-400 font-mono block mt-1">Petugas: {tic.assignee}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{tic.created_at}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pay Modal Virtual Account */}
      {showPayModal && checkoutInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">CHECKOUT PEMBAYARAN</h3>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCheckoutSubmit} className="p-5 space-y-4 text-slate-200">
              <div>
                <span className="text-[10px] font-mono text-slate-500 block uppercase">TAGIHAN YANG AKAN DIBAYAR</span>
                <p className="text-xs font-semibold text-white mt-1">{checkoutInvoice.invoice_number}</p>
                <p className="text-sm font-mono font-bold text-emerald-400 mt-1">Rp {checkoutInvoice.amount.toLocaleString('id-ID')}</p>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Pilih Metode Instan</label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setPaymentMethod('QRIS')}
                    className={`p-3 rounded-xl border cursor-pointer text-center transition ${
                      paymentMethod === 'QRIS' ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}
                  >
                    <QrCode className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-[11px] font-semibold">QRIS Shopee/GOPAY</span>
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('BCA Virtual Account')}
                    className={`p-3 rounded-xl border cursor-pointer text-center transition ${
                      paymentMethod === 'BCA Virtual Account' ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-[11px] font-semibold">BCA Virtual Acc</span>
                  </div>
                </div>
              </div>

              {paymentMethod === 'QRIS' ? (
                <div className="bg-white p-4 rounded-xl text-center space-y-2 max-w-[200px] mx-auto border-2 border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">SCAN BARCODE QRIS</span>
                  <img 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" 
                    alt="QRIS Code" 
                    className="w-32 h-32 mx-auto border-2 border-slate-100 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[9px] font-mono text-slate-400 block">Xendit QRIS Licensed</span>
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-xl text-center font-mono border border-slate-850">
                  <span className="text-[10px] text-slate-500 block uppercase">NOMOR VIRTUAL ACCOUNT BCA</span>
                  <span className="text-lg font-bold text-white tracking-widest mt-1 block">82093 + {customer.customer_number.replace(/\D/g, '')}</span>
                  <span className="text-[9px] text-slate-400 mt-1 block">Nama VA: NEXTLINK STARBILLING</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg flex items-center gap-1.5"
                >
                  Bayar & Selesaikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buy/Upgrade Package Modal */}
      {showBuyModal && selectedPackageForBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">KONFIRMASI BELI &amp; UPGRADE</h3>
              <button onClick={() => setShowBuyModal(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleConfirmUpgrade} className="p-5 space-y-4 text-slate-200">
              <div>
                <span className="text-[10px] font-mono text-slate-500 block uppercase">PAKET TERPILIH</span>
                <p className="text-sm font-bold text-white mt-1">{selectedPackageForBuy.name}</p>
                <p className="text-xs text-slate-400 mt-1">{selectedPackageForBuy.download_speed} Simetris | FUP Limit: {selectedPackageForBuy.fup_limit || 'Unlimited'}</p>
                <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">Tarif Bulanan:</span>
                    <span className="text-emerald-400 font-bold">Rp {selectedPackageForBuy.price.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono border-t border-slate-900 pt-1.5">
                    <span className="text-slate-500">Biaya Upgrade ACS:</span>
                    <span className="text-white font-bold">FREE (Auto TR-069)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Metode Aktivasi Instan</label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setBuyPaymentMethod('QRIS')}
                    className={`p-3 rounded-xl border cursor-pointer text-center transition ${
                      buyPaymentMethod === 'QRIS' ? 'bg-indigo-950/40 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}
                  >
                    <QrCode className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-[11px] font-semibold">QRIS Instan</span>
                  </div>

                  <div 
                    onClick={() => setBuyPaymentMethod('BCA Virtual Account')}
                    className={`p-3 rounded-xl border cursor-pointer text-center transition ${
                      buyPaymentMethod === 'BCA Virtual Account' ? 'bg-indigo-950/40 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-[11px] font-semibold">BCA VA Instan</span>
                  </div>
                </div>
              </div>

              {buyPaymentMethod === 'QRIS' ? (
                <div className="bg-white p-4 rounded-xl text-center space-y-2 max-w-[180px] mx-auto border-2 border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">PINDAI UNTUK AKTIVASI</span>
                  <img 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" 
                    alt="QRIS Code" 
                    className="w-28 h-28 mx-auto border-2 border-slate-100 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[8px] font-mono text-slate-400 block">Xendit QRIS Licensed</span>
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-xl text-center font-mono border border-slate-850">
                  <span className="text-[10px] text-slate-500 block uppercase">NOMOR VIRTUAL ACCOUNT BCA</span>
                  <span className="text-base font-bold text-white tracking-widest mt-1 block">82093 + {customer.customer_number.replace(/\D/g, '')}</span>
                  <span className="text-[9px] text-slate-400 mt-1 block">Nama VA: NEXTLINK STARBILLING</span>
                </div>
              )}

              <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl text-[10px] text-slate-400 leading-normal">
                💡 <span className="font-semibold text-slate-300">Catatan:</span> Membeli atau meningkatkan paket akan memperbarui profile PPPoE Anda di database server MikroTik dan merubah redaman/speed limit secara instan tanpa reboot modem.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowBuyModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center gap-1.5"
                >
                  Konfirmasi Beli &amp; Aktifkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Information & Payment Notes Footer */}
      <div className="bg-slate-900 border border-slate-800 pb-6 rounded-2xl space-y-4 text-left shadow-xl">
        <div className="flex items-center gap-2 text-slate-400 font-serif text-[10px] font-bold tracking-wider uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>INFORMASI &amp; CATATAN PEMBAYARAN</span>
        </div>
        <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-850 font-sans shadow-inner">
          {(localStorage.getItem('sb_catatan_pembayaran') || `[ISOLIR] = Mengambil Tanggal Isolir Pelanggan\nIni akan muncul di footer website https://starbilling.lokal/\ndari Simulasi Browser Address Bar (Link yang dikirim ke WhatsApp / SMS Pelanggan)\nhttps://starbilling.lokal/6281234567890\n\nkamu bisa menambahkan promo dan lain-lain\n💡 [ISOLIR] = Mengambil Tanggal Isolir Pelanggan. Ini akan muncul di footer website https://starbilling.lokal/promo. Anda bisa menambahkan syarat, nomor rekening, promo speed, atau info loket.`).replace(/\[ISOLIR\]/gi, myInvoices.find(inv => inv.status === 'Belum Bayar' || inv.status === 'Overdue')?.due_date || 'Tanggal Jatuh Tempo')}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[10px] text-slate-500 font-mono pt-1 gap-2 border-t border-slate-850">
          <span>© {new Date().getFullYear()} {localStorage.getItem('sb_pemilik') || 'PT StarBilling Media Nusantara'}. All rights reserved.</span>
          <span className="flex items-center gap-1">Website Resmi: <a href={localStorage.getItem('sb_website') || 'https://loacalhost'} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{localStorage.getItem('sb_website') || 'https://loacalhost'}</a></span>
        </div>
      </div>

    </div>
  );
}
