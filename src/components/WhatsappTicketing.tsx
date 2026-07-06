/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  QrCode, 
  Smartphone, 
  History, 
  CheckCircle, 
  AlertTriangle, 
  UserCheck, 
  Clock, 
  HelpCircle,
  Plus,
  RefreshCw,
  X,
  Filter,
  Sparkles,
  Search,
  Trash2
} from 'lucide-react';
import { Ticket, WaDevice, WaMessage, Customer } from '../types';
import { INITIAL_PACKAGES, INITIAL_ODPS } from '../data/mockData';

interface WhatsappTicketingProps {
  tickets: Ticket[];
  waDevices: WaDevice[];
  waMessages: WaMessage[];
  customers: Customer[];
  onAddTicket: (ticket: Ticket) => void;
  onUpdateTicket: (ticket: Ticket) => void;
  onAddWaMessage: (msg: WaMessage) => void;
}

export default function WhatsappTicketing({ 
  tickets, 
  waDevices, 
  waMessages, 
  customers, 
  onAddTicket, 
  onUpdateTicket,
  onAddWaMessage
}: WhatsappTicketingProps) {
  const [activeTab, setActiveTab] = useState<'tickets' | 'devices' | 'broadcast' | 'messages'>('tickets');
  
  // Ticket actions
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assigneeName, setAssigneeName] = useState('');
  const [ticketStatus, setTicketStatus] = useState<'Open' | 'Assigned' | 'Progress' | 'Solved' | 'Closed'>('Open');

  // Broadcast fields
  const [broadcastType, setBroadcastType] = useState<'Billing Reminder' | 'Broadcast' | 'Notification' | 'OTP'>('Broadcast');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  
  // Advanced Broadcast filters state
  const [channelPengiriman, setChannelPengiriman] = useState<'Evolution API' | 'WAHA' | 'Go WhatsApp' | 'Fonte'>('Go WhatsApp');
  const [templateTersimpan, setTemplateTersimpan] = useState<string>('');
  const [statusPembayaran, setStatusPembayaran] = useState<string>('SEMUA');
  const [tipePenagihan, setTipePenagihan] = useState<string>('SEMUA');
  const [showFilterLanjutan, setShowFilterLanjutan] = useState<boolean>(false);
  const [areaWilayah, setAreaWilayah] = useState<string>('SEMUA AREA / WILAYAH');
  const [odpFilter, setOdpFilter] = useState<string>('SEMUA ODP');
  const [paketFilter, setPaketFilter] = useState<string>('SEMUA PAKET');
  const [kriteriaJatuhTempo, setKriteriaJatuhTempo] = useState<string>('TANPA KRITERIA / SEMUA');
  const [kriteriaIsolir, setKriteriaIsolir] = useState<string>('TANPA KRITERIA / SEMUA');
  const [kirimSatuPelanggan, setKirimSatuPelanggan] = useState<string>('SEMUA PELANGGAN');

  // New ticket field
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTicketFields, setNewTicketFields] = useState({
    customer_id: customers[0]?.id || '',
    title: '',
    category: 'LOS / Kabel Putus' as any,
    priority: 'Medium' as any,
    description: ''
  });

  // Message outbox states for search and filters
  const [searchQueryMsg, setSearchQueryMsg] = useState('');
  const [filterModul, setFilterModul] = useState('Semua Modul');
  const [filterTemplate, setFilterTemplate] = useState('Semua Template');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [filterLimit, setFilterLimit] = useState(20);
  const [deletedMessageIds, setDeletedMessageIds] = useState<string[]>([]);

  const getMessageTemplateLabel = (msg: WaMessage) => {
    const text = msg.message.toUpperCase();
    if (text.includes('REMINDER TAGIHAN')) return 'Reminder H-7';
    if (text.includes('PERINGATAN ISOLIR') || text.includes('TERISOLIR OTOMATIS')) return 'Isolir H-1';
    if (text.includes('GANGGUAN NETWORK') || text.includes('GANGGUAN MASSAL')) return 'Gangguan Massal';
    if (text.includes('KODE VERIFIKASI') || text.includes('OTP_CODE') || text.includes('KODE OTP')) return 'OTP Verifikasi';
    if (text.includes('PROMO UPGRADE')) return 'Broadcast Promo';
    return 'Custom / Non-template';
  };

  const getFilteredMessages = () => {
    return waMessages
      .filter(m => !deletedMessageIds.includes(m.id))
      .filter(msg => {
        // 1. Search Query (Matches Recipient or Message)
        if (searchQueryMsg) {
          const query = searchQueryMsg.toLowerCase();
          const matchesRecipient = msg.recipient.toLowerCase().includes(query);
          const matchesContent = msg.message.toLowerCase().includes(query);
          if (!matchesRecipient && !matchesContent) {
            return false;
          }
        }

        // 2. Modul Filter
        if (filterModul !== 'Semua Modul') {
          if (filterModul === 'Billing' && msg.type !== 'Billing Reminder') return false;
          if (filterModul === 'Broadcast' && msg.type !== 'Broadcast') return false;
          if (filterModul === 'Notification' && msg.type !== 'Notification') return false;
          if (filterModul === 'OTP' && msg.type !== 'OTP') return false;
        }

        // 3. Template Filter
        if (filterTemplate !== 'Semua Template') {
          const templateLabel = getMessageTemplateLabel(msg);
          if (templateLabel !== filterTemplate) return false;
        }

        // 4. Status Filter
        if (filterStatus !== 'Semua Status') {
          if (filterStatus === 'Sent' && msg.status !== 'Sent') return false;
          if (filterStatus === 'Failed' && msg.status !== 'Failed') return false;
          if (filterStatus === 'Pending' && msg.status !== 'Pending') return false;
        }

        return true;
      });
  };

  const getCustomerName = (id: string) => {
    return customers.find(c => c.id === id)?.name || 'Pelanggan';
  };

  const handleOpenAssign = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setAssigneeName(ticket.assignee || '');
    setTicketStatus(ticket.status);
    setIsAssignOpen(true);
  };

  const handleSaveAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    onUpdateTicket({
      ...selectedTicket,
      assignee: assigneeName,
      status: ticketStatus
    });
    setIsAssignOpen(false);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketFields.title) {
      alert('Judul aduan wajib diisi!');
      return;
    }
    onAddTicket({
      id: `tic-${Date.now()}`,
      ticket_number: `TCK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(tickets.length + 1).padStart(3, '0')}`,
      customer_id: newTicketFields.customer_id,
      title: newTicketFields.title,
      category: newTicketFields.category,
      priority: newTicketFields.priority,
      status: 'Open',
      description: newTicketFields.description,
      created_at: new Date().toISOString().split('T')[0]
    });
    setIsNewTicketOpen(false);
  };

  const templates: Record<string, string> = {
    'sambutan_welcome': localStorage.getItem('sb_template_welcome') || `*[STARBILLING.lokal - NOTIFIKASI SELAMAT DATANG]*\n\nHalo Kak *[NAMA_PELANGGAN]*, (ID: [NOMOR_PELANGGAN])\n\nSelamat bergabung di StarBilling ISP! Akun Anda telah aktif terpasang.\n\n• *Paket Langganan*: [NAMA_PAKET]\n• *Biaya Bulanan*: Rp [TARIF_BULANAN]\n• *Tanggal Pemasangan*: [TANGGAL_PEMASANGAN]\n• *Tanggal Aktif*: [TANGGAL_AKTIF]\n• *Tanggal Jatuh Tempo*: [TANGGAL_JATUH_TEMPO] (Mengikuti tanggal pemasangan/aktif Anda)\n\nTerima kasih atas kepercayaannya!`,
    'reminder_h7': localStorage.getItem('sb_template_billing') || `*[STARBILLING.lokal - NOTIFIKASI TAGIHAN BULANAN]*\n\nHalo Kak *[NAMA]*, (ID: [NOPEL])\n\nTagihan internet bulanan Anda untuk periode ini telah terbit. Silakan lakukan pembayaran sebelum tanggal jatuh tempo agar koneksi Anda tetap lancar.\n\n• *Paket Langganan*: [PAKET]\n• *Total Tagihan*: [TARIFPAKET]\n• *Tanggal Jatuh Tempo*: [ISOLIR]\n\nBayar instan via: https://starbilling.lokal/portal\n\nTerima kasih.`,
    'gangguan_massal': localStorage.getItem('sb_template_outage') || `*[STARBILLING.lokal - INFORMASI GANGGUAN JARINGAN]*\n\nHalo Kak *[NAMA]*,\n\nKami informasikan bahwa saat ini sedang terjadi kendala teknis (gangguan massal) di cluster area Anda. Tim teknisi kami sedang melakukan penanganan intensif di lapangan.\n\n• *Area Terdampak*: [AREA]\n• *Estimasi Penanganan*: 2-3 Jam\n\nKami memohon maaf atas ketidaknyamanan yang dialami. Koneksi akan pulih secara otomatis setelah penanganan selesai.`,
    'isolir_h1': '🚨 PERINGATAN ISOLIR LAYANAN\n\nYth. [NAMA] ([NOPEL]), layanan internet [PAKET] Anda sebesar [TARIFPAKET] akan terisolir otomatis besok karena belum ada pembayaran. Silakan selesaikan tagihan Anda via [BANK] agar tetap terhubung.\n\nLink Ketentuan: [TOS]',
    'otp_verifikasi': '🔐 KODE VERIFIKASI (OTP)\n\nKode OTP StarBilling Anda adalah: [OTP_CODE]\n\nRahasiakan kode ini dari siapa pun termasuk petugas kami. Kode ini valid selama 5 menit.',
    'broadcast_promo': '🎁 PROMO UPGRADE SPEED STARBILLING\n\nYth. [NAMA], nikmati kuota tanpa batasan (Unlimited) dengan kecepatan 2x lebih cepat hanya dengan tambah Rp 30.000/bulan!\n\nBalas pesan ini untuk aktivasi sekarang juga.'
  };

  const broadcastVariables = [
    { tag: '[NOPEL]', label: 'Nomor Pelanggan' },
    { tag: '[NAMA]', label: 'Nama Pelanggan' },
    { tag: '[PAKET]', label: 'Nama Paket' },
    { tag: '[HARGA_DASAR]', label: 'Tarif Dasar' },
    { tag: '[PPN_DASAR]', label: 'PPN (%) Dasar' },
    { tag: '[TOTAL_PPN_DASAR]', label: 'Nom. PPN Dasar' },
    { tag: '[TARIFPAKET]', label: 'Tarif Paket' },
    { tag: '[JENIS_PENAGIHAN]', label: 'PRA/PASCA' },
    { tag: '[TAGIHAN]', label: 'Data Tagihan' },
    { tag: '[PERIODEBAYARFULL]', label: 'Periode Lengkap' },
    { tag: '[PERIODEBAYAR]', label: 'Periode Bln/Thn' },
    { tag: '[PERIODE]', label: 'Periode Pakai' },
    { tag: '[QTY]', label: 'QTY Tagihan' },
    { tag: '[PPN]', label: 'PPN (%)' },
    { tag: '[TOTALPPN]', label: 'Total PPN' },
    { tag: '[TOTALADDON]', label: 'Total Addon' },
    { tag: '[TOTALDISKON]', label: 'Total Diskon' },
    { tag: '[LAIN2]', label: 'Biaya & Diskon' },
    { tag: '[ISOLIR]', label: 'Tgl Isolir' },
    { tag: '[BANK]', label: 'Bank Perusahaan' },
    { tag: '[TOS]', label: 'Link TOS' },
  ];

  const getFilteredCustomers = () => {
    return customers.filter(cust => {
      // 1. Kirim ke Satu Pelanggan
      if (kirimSatuPelanggan !== 'SEMUA PELANGGAN' && cust.id !== kirimSatuPelanggan) {
        return false;
      }
      
      // 2. Paket filter
      if (paketFilter !== 'SEMUA PAKET' && cust.package_id !== paketFilter) {
        return false;
      }

      // 3. ODP filter
      if (odpFilter !== 'SEMUA ODP' && cust.odp_id !== odpFilter) {
        return false;
      }

      // 4. Status Pembayaran filter
      if (statusPembayaran !== 'SEMUA') {
        if (statusPembayaran === 'LUNAS' && cust.status !== 'Aktif') {
          return false;
        }
        if (statusPembayaran === 'BELUM BAYAR' && cust.status !== 'Suspend') {
          return false;
        }
      }

      // 5. Tipe Penagihan filter
      if (tipePenagihan !== 'SEMUA') {
        const isPrepaid = cust.customer_number.charCodeAt(0) % 2 === 0;
        if (tipePenagihan === 'PRA-BAYAR' && !isPrepaid) return false;
        if (tipePenagihan === 'PASCA-BAYAR' && isPrepaid) return false;
      }

      // 6. Area / Wilayah filter
      if (areaWilayah !== 'SEMUA AREA / WILAYAH') {
        const lowerAddress = cust.address.toLowerCase();
        if (areaWilayah === 'BANDUNG' && !lowerAddress.includes('bandung')) return false;
        if (areaWilayah === 'JAKARTA' && !lowerAddress.includes('jakarta') && !lowerAddress.includes('menteng') && !lowerAddress.includes('gambir')) return false;
      }

      return true;
    });
  };

  const handleSelectTemplate = (val: string) => {
    setTemplateTersimpan(val);
    if (templates[val]) {
      setBroadcastMessage(templates[val]);
    } else {
      setBroadcastMessage('');
    }
  };

  const handleInsertVariable = (variable: string) => {
    setBroadcastMessage(prev => {
      if (prev.endsWith(' ') || prev.length === 0) {
        return prev + variable + ' ';
      }
      return prev + ' ' + variable + ' ';
    });
  };

  const handleTriggerBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage) {
      alert('Pesan broadcast tidak boleh kosong!');
      return;
    }

    const connectedDevice = waDevices.find(d => d.status === 'Connected') || waDevices[0];
    const filteredList = getFilteredCustomers();

    if (filteredList.length === 0) {
      alert('Tidak ada pelanggan yang memenuhi kriteria filter saat ini!');
      return;
    }

    filteredList.forEach((cust, idx) => {
      // Dynamic variables replacement
      let personalizedMsg = broadcastMessage
        .replace(/\[NAMA\]/g, cust.name)
        .replace(/\[NOPEL\]/g, cust.customer_number)
        .replace(/\[PAKET\]/g, cust.package_id === 'pkg-1' ? 'StarHome Basic 20 Mbps' : cust.package_id === 'pkg-2' ? 'StarHome Family 50 Mbps' : cust.package_id === 'pkg-3' ? 'StarHome Ultimate 100 Mbps' : 'StarDedicated Enterprise 50 Mbps')
        .replace(/\[TARIFPAKET\]/g, cust.package_id === 'pkg-1' ? 'Rp 185.000' : cust.package_id === 'pkg-2' ? 'Rp 299.000' : cust.package_id === 'pkg-3' ? 'Rp 499.000' : 'Rp 2.500.000')
        .replace(/\[HARGA_DASAR\]/g, cust.package_id === 'pkg-1' ? 'Rp 166.666' : cust.package_id === 'pkg-2' ? 'Rp 269.369' : 'Rp 449.549')
        .replace(/\[PPN_DASAR\]/g, '11%')
        .replace(/\[TOTAL_PPN_DASAR\]/g, cust.package_id === 'pkg-1' ? 'Rp 18.334' : cust.package_id === 'pkg-2' ? 'Rp 29.631' : 'Rp 49.451')
        .replace(/\[JENIS_PENAGIHAN\]/g, cust.customer_number.charCodeAt(0) % 2 === 0 ? 'PRA-BAYAR' : 'PASCA-BAYAR')
        .replace(/\[TAGIHAN\]/g, 'Bulan Juli 2026')
        .replace(/\[PERIODEBAYARFULL\]/g, 'Periode Juli 2026 (01/07/2026 - 31/07/2026)')
        .replace(/\[PERIODEBAYAR\]/g, '07/2026')
        .replace(/\[PERIODE\]/g, 'Juli 2026')
        .replace(/\[QTY\]/g, '1 Bulan')
        .replace(/\[PPN\]/g, '11%')
        .replace(/\[TOTALPPN\]/g, 'Rp 18.334')
        .replace(/\[TOTALADDON\]/g, 'Rp 0')
        .replace(/\[TOTALDISKON\]/g, 'Rp 0')
        .replace(/\[LAIN2\]/g, 'Biaya Admin Rp 5.000')
        .replace(/\[ISOLIR\]/g, '10 Juli 2026')
        .replace(/\[BANK\]/g, 'Bank BCA (882-019-2110) a/n PT StarBilling Media Nusantara')
        .replace(/\[TOS\]/g, 'https://starbilling.local/tos');

      onAddWaMessage({
        id: `msg-${Date.now()}-${idx}`,
        device_id: connectedDevice.id,
        recipient: cust.phone,
        message: personalizedMsg,
        type: broadcastType,
        status: 'Sent',
        created_at: new Date().toISOString()
      });
    });

    alert(`Sukses: Broadcast berhasil dikirimkan ke ${filteredList.length} nomor pelanggan.`);
    setBroadcastMessage('');
    setTemplateTersimpan('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">WhatsApp Gateway & Ticketing NOC</h2>
          <p className="text-xs text-slate-400">Pusat penanganan trouble ticket pelanggan terintegrasi broadcast engine WhatsApp API.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'tickets' && (
            <button 
              onClick={() => setIsNewTicketOpen(true)}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/10"
            >
              <Plus className="w-4 h-4" />
              Open Ticket Baru
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar inside the tab */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 h-fit">
          <span className="text-[10px] font-mono text-slate-500 block uppercase px-3 mb-2">NAVIGASI FITUR</span>
          <button 
            onClick={() => setActiveTab('tickets')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
              activeTab === 'tickets' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-800/80' : 'text-slate-400 hover:bg-slate-950/40'
            }`}
          >
            <span>Trouble Tickets ({tickets.length})</span>
            <HelpCircle className="w-4 h-4 text-slate-500" />
          </button>
          <button 
            onClick={() => setActiveTab('broadcast')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
              activeTab === 'broadcast' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-800/80' : 'text-slate-400 hover:bg-slate-950/40'
            }`}
          >
            <span>Broadcast Campaign</span>
            <Send className="w-4 h-4 text-slate-500" />
          </button>
          <button 
            onClick={() => setActiveTab('devices')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
              activeTab === 'devices' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-800/80' : 'text-slate-400 hover:bg-slate-950/40'
            }`}
          >
            <span>WhatsApp Devices ({waDevices.length})</span>
            <Smartphone className="w-4 h-4 text-slate-500" />
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
              activeTab === 'messages' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-800/80' : 'text-slate-400 hover:bg-slate-950/40'
            }`}
          >
            <span>Riwayat Pesan</span>
            <History className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Dynamic Display Panel */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl min-h-[400px] flex flex-col justify-between">
          
          {activeTab === 'tickets' && (
            <div className="flex-1">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                ACTIVE TROUBLE TICKETS
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 font-mono text-[10px] text-slate-500 uppercase pb-2">
                      <th>No. Tiket / Pelanggan</th>
                      <th>Masalah / Deskripsi</th>
                      <th>Kategori</th>
                      <th>Prioritas</th>
                      <th className="text-center">Status</th>
                      <th className="text-right">Tindakan CS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {tickets.map(tic => (
                      <tr key={tic.id} className="hover:bg-slate-950/20">
                        <td className="py-2.5 font-mono">
                          <span className="text-white font-bold block">{tic.ticket_number}</span>
                          <span className="text-slate-500 text-[10px]">{getCustomerName(tic.customer_id)}</span>
                        </td>
                        <td className="py-2.5 pr-2 max-w-xs">
                          <span className="text-slate-300 font-medium block truncate">{tic.title}</span>
                          <span className="text-[11px] text-slate-500 block truncate">{tic.description}</span>
                        </td>
                        <td className="py-2.5 font-medium text-slate-400">{tic.category}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            tic.priority === 'High' ? 'bg-red-950 text-red-400' : tic.priority === 'Medium' ? 'bg-amber-950 text-amber-400' : 'bg-slate-850 text-slate-400'
                          }`}>
                            {tic.priority}
                          </span>
                        </td>
                        <td className="py-2.5 text-center font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                            tic.status === 'Solved' || tic.status === 'Closed' 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' 
                              : 'bg-indigo-950 text-indigo-400 border border-indigo-800/40'
                          }`}>
                            {tic.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button 
                            onClick={() => handleOpenAssign(tic)}
                            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-850 rounded-lg text-[10px] font-semibold transition"
                          >
                            Assign Teknisi
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'broadcast' && (
            <div className="flex-1 space-y-6">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Kirim Pesan Broadcast
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Sistem Pengiriman Pesan Massal Tersegmentasi dengan Variabel Dinamis.</p>
                </div>
                <span className="px-3 py-1 bg-cyan-950 text-cyan-400 font-mono text-[10px] font-bold rounded-lg border border-cyan-800/50">
                  {getFilteredCustomers().length} Penerima Terfilter
                </span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Form column (7 cols) */}
                <form onSubmit={handleTriggerBroadcast} className="xl:col-span-7 space-y-4">
                  
                  {/* Row 1: Channel & Template */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                        CHANNEL PENGIRIMAN / Integrasi
                      </label>
                      <select
                        value={channelPengiriman}
                        onChange={(e) => setChannelPengiriman(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Go WhatsApp">Go WhatsApp (Aldinokemal) - Default</option>
                        <option value="Evolution API">Evolution API (Official)</option>
                        <option value="WAHA">WAHA (WhatsApp HTTP API)</option>
                        <option value="Fonte">Fonte API Gateway</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                        TEMPLATE TERSIMPAN
                      </label>
                      <select
                        value={templateTersimpan}
                        onChange={(e) => handleSelectTemplate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">-- Pilih Template --</option>
                        <option value="sambutan_welcome">Pesan Sambutan (Selamat Datang) [NEW]</option>
                        <option value="reminder_h7">Reminder H-7 Tagihan Bulanan</option>
                        <option value="isolir_h1">Isolir H-1 Peringatan Keras</option>
                        <option value="gangguan_massal">Pemberitahuan Gangguan Massal NOC</option>
                        <option value="otp_verifikasi">Kode OTP Verifikasi Keamanan</option>
                        <option value="broadcast_promo">Penawaran Upgrade Speed (Promo)</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Status Pembayaran & Tipe Penagihan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                        STATUS PEMBAYARAN
                      </label>
                      <select
                        value={statusPembayaran}
                        onChange={(e) => setStatusPembayaran(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="SEMUA">SEMUA STATUS</option>
                        <option value="LUNAS">LUNAS</option>
                        <option value="BELUM BAYAR">BELUM BAYAR</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                        TIPE PENAGIHAN
                      </label>
                      <select
                        value={tipePenagihan}
                        onChange={(e) => setTipePenagihan(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="SEMUA">SEMUA TIPE</option>
                        <option value="PRA-BAYAR">PRA-BAYAR</option>
                        <option value="PASCA-BAYAR">PASCA-BAYAR</option>
                      </select>
                    </div>
                  </div>

                  {/* Filter Lanjutan Button Toggle */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowFilterLanjutan(!showFilterLanjutan)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                    >
                      <Filter className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Filter Lanjutan</span>
                      <span className="text-[10px] text-slate-500">
                        ({showFilterLanjutan ? 'Sembunyikan' : 'Tampilkan'})
                      </span>
                    </button>
                  </div>

                  {/* Filter Lanjutan Section */}
                  {showFilterLanjutan && (
                    <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                            AREA / WILAYAH
                          </label>
                          <select
                            value={areaWilayah}
                            onChange={(e) => setAreaWilayah(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                          >
                            <option value="SEMUA AREA / WILAYAH">SEMUA AREA / WILAYAH</option>
                            <option value="JAKARTA">DKI JAKARTA</option>
                            <option value="BANDUNG">BANDUNG</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                            ODP
                          </label>
                          <select
                            value={odpFilter}
                            onChange={(e) => setOdpFilter(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                          >
                            <option value="SEMUA ODP">SEMUA ODP</option>
                            {INITIAL_ODPS.map(o => (
                              <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                            PAKET
                          </label>
                          <select
                            value={paketFilter}
                            onChange={(e) => setPaketFilter(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                          >
                            <option value="SEMUA PAKET">SEMUA PAKET</option>
                            {INITIAL_PACKAGES.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                            KRITERIA JATUH TEMPO
                          </label>
                          <select
                            value={kriteriaJatuhTempo}
                            onChange={(e) => setKriteriaJatuhTempo(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                          >
                            <option value="TANPA KRITERIA / SEMUA">TANPA KRITERIA / SEMUA</option>
                            <option value="H-7">H-7 (Pengingat Lembut)</option>
                            <option value="H-3">H-3 (Pengingat Sedang)</option>
                            <option value="H-1">H-1 (Segera Diisolir)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                            KRITERIA ISOLIR / SUSPEND
                          </label>
                          <select
                            value={kriteriaIsolir}
                            onChange={(e) => setKriteriaIsolir(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                          >
                            <option value="TANPA KRITERIA / SEMUA">TANPA KRITERIA / SEMUA</option>
                            <option value="ISOLIR_TODAY">Terisolir Hari Ini</option>
                            <option value="ISOLIR_OVERDUE">Terisolir Lebih dari 3 Hari</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                            KIRIM KE SATU PELANGGAN
                          </label>
                          <select
                            value={kirimSatuPelanggan}
                            onChange={(e) => setKirimSatuPelanggan(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                          >
                            <option value="SEMUA PELANGGAN">SEMUA PELANGGAN</option>
                            {customers.map(c => (
                              <option key={c.id} value={c.id}>{c.customer_number} - {c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      TULIS PESAN YANG AKAN DIKIRIM
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Contoh: Halo [NAMA], tagihan paket [PAKET] Anda sebesar [TARIFPAKET] jatuh tempo [ISOLIR]. Harap lakukan pembayaran ke rekening [BANK]."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full px-5 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-slate-950 font-bold rounded-xl text-xs transition duration-200 shadow-xl shadow-cyan-500/10 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4 text-slate-950" />
                      <span>Kirim Ke {getFilteredCustomers().length} Pelanggan Terpilih</span>
                    </button>
                  </div>

                </form>

                {/* Right side helper panel for click-to-insert variables & preview (5 cols) */}
                <div className="xl:col-span-5 space-y-4">
                  <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="text-[11px] font-mono uppercase tracking-wider text-white font-bold">
                        VARIABEL
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Klik tombol variabel di bawah ini untuk menyisipkan tag dinamis langsung ke dalam teks pesan:
                    </p>
                    
                    {/* Variables Scroll/Grid wrapper */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[280px] overflow-y-auto pr-1">
                      {broadcastVariables.map(v => (
                        <button
                          key={v.tag}
                          type="button"
                          onClick={() => handleInsertVariable(v.tag)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700 text-left rounded-xl transition text-[11px] flex flex-col justify-between"
                        >
                          <code className="text-cyan-400 font-bold font-mono text-[10px]">{v.tag}</code>
                          <span className="text-slate-500 text-[9px] truncate">{v.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Simulation Preview Card */}
                  <div className="bg-slate-950/30 border border-slate-850 rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider font-bold">
                      SIMULASI PREVIEW WA (BUDI SANTOSO)
                    </span>
                    <div className="p-3.5 bg-emerald-950/10 border border-emerald-900/30 rounded-xl text-xs text-slate-300 font-sans space-y-2 leading-relaxed whitespace-pre-wrap">
                      {broadcastMessage ? (
                        broadcastMessage
                          .replace(/\[NAMA\]/g, 'Budi Santoso')
                          .replace(/\[NOPEL\]/g, 'SB-2026-0001')
                          .replace(/\[PAKET\]/g, 'StarHome Family 50 Mbps')
                          .replace(/\[TARIFPAKET\]/g, 'Rp 299.000')
                          .replace(/\[HARGA_DASAR\]/g, 'Rp 269.369')
                          .replace(/\[PPN_DASAR\]/g, '11%')
                          .replace(/\[TOTAL_PPN_DASAR\]/g, 'Rp 29.631')
                          .replace(/\[JENIS_PENAGIHAN\]/g, 'PASCA-BAYAR')
                          .replace(/\[TAGIHAN\]/g, 'Bulan Juli 2026')
                          .replace(/\[PERIODEBAYARFULL\]/g, 'Periode Juli 2026 (01/07/2026 - 31/07/2026)')
                          .replace(/\[PERIODEBAYAR\]/g, '07/2026')
                          .replace(/\[PERIODE\]/g, 'Juli 2026')
                          .replace(/\[QTY\]/g, '1 Bulan')
                          .replace(/\[PPN\]/g, '11%')
                          .replace(/\[TOTALPPN\]/g, 'Rp 29.631')
                          .replace(/\[TOTALADDON\]/g, 'Rp 0')
                          .replace(/\[TOTALDISKON\]/g, 'Rp 0')
                          .replace(/\[LAIN2\]/g, 'Biaya Admin Rp 5.000')
                          .replace(/\[ISOLIR\]/g, '10 Juli 2026')
                          .replace(/\[BANK\]/g, 'Bank BCA (882-019-2110) a/n PT StarBilling Media Nusantara')
                          .replace(/\[TOS\]/g, 'https://starbilling.local/tos')
                      ) : (
                        <span className="text-slate-500 italic block text-center py-4">Tulis pesan atau pilih template untuk melihat preview langsung...</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="flex-1">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                WHATSAPP API ROUTER DEVICES
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {waDevices.map(device => (
                  <div key={device.id} className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-200">{device.name}</span>
                        <span className="text-[9px] font-mono bg-cyan-950 text-cyan-400 px-1.5 rounded">{device.platform}</span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-1 font-mono">No: {device.number}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Session: {device.session_name}</span>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        device.status === 'Connected' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                      }`}>
                        {device.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="flex-1 space-y-6">
              {/* Header section with Title and Subtitle */}
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Pesan
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manajemen pengiriman pesan & broadcast
                </p>
              </div>

              {/* Filters & Search Control Bar */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Search bar (5 cols) */}
                <div className="lg:col-span-5 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    value={searchQueryMsg}
                    onChange={(e) => setSearchQueryMsg(e.target.value)}
                    placeholder="Cari pesan atau no. tujuan…"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-500 transition"
                  />
                </div>

                {/* Filter Modul (2 cols) */}
                <div className="lg:col-span-2">
                  <select
                    value={filterModul}
                    onChange={(e) => setFilterModul(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                  >
                    <option value="Semua Modul">Semua Modul</option>
                    <option value="Billing">Billing Reminder</option>
                    <option value="Broadcast">Broadcast</option>
                    <option value="Notification">Notification</option>
                    <option value="OTP">OTP</option>
                  </select>
                </div>

                {/* Filter Template (2 cols) */}
                <div className="lg:col-span-2">
                  <select
                    value={filterTemplate}
                    onChange={(e) => setFilterTemplate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                  >
                    <option value="Semua Template">Semua Template</option>
                    <option value="Reminder H-7">Reminder H-7</option>
                    <option value="Isolir H-1">Isolir H-1</option>
                    <option value="Gangguan Massal">Gangguan Massal</option>
                    <option value="OTP Verifikasi">OTP Verifikasi</option>
                    <option value="Broadcast Promo">Broadcast Promo</option>
                  </select>
                </div>

                {/* Filter Status (2 cols) */}
                <div className="lg:col-span-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                  >
                    <option value="Semua Status">Semua Status</option>
                    <option value="Sent">Sent</option>
                    <option value="Failed">Failed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                {/* Limit Rows (1 col) */}
                <div className="lg:col-span-1">
                  <select
                    value={filterLimit}
                    onChange={(e) => setFilterLimit(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 text-center transition"
                  >
                    <option value={10}>10 baris</option>
                    <option value={20}>20 baris</option>
                    <option value={50}>50 baris</option>
                    <option value={100}>100 baris</option>
                  </select>
                </div>
              </div>

              {/* Data Table Container */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900/60 border-b border-slate-800 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-4 text-center font-bold w-12">No</th>
                        <th className="py-3.5 px-3 font-semibold">Tanggal</th>
                        <th className="py-3.5 px-3 font-semibold">Modul</th>
                        <th className="py-3.5 px-3 font-semibold">Tujuan</th>
                        <th className="py-3.5 px-4 font-semibold max-w-sm">Pesan</th>
                        <th className="py-3.5 px-3 font-semibold text-center">Status</th>
                        <th className="py-3.5 px-2 text-center font-semibold">Hit</th>
                        <th className="py-3.5 px-3 font-semibold">Log API</th>
                        <th className="py-3.5 px-3 font-semibold">Tgl Status</th>
                        <th className="py-3.5 px-3 font-semibold">Next Kirim</th>
                        <th className="py-3.5 px-4 text-right font-semibold">Act</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60 font-sans">
                      {getFilteredMessages().length === 0 ? (
                        <tr>
                          <td colSpan={11} className="py-12 text-center text-slate-500 italic bg-slate-950/20">
                            Tidak ada data pesan yang sesuai dengan kriteria pencarian & filter saat ini.
                          </td>
                        </tr>
                      ) : (
                        getFilteredMessages().slice(0, filterLimit).map((msg, index) => {
                          const customerName = customers.find(c => c.phone === msg.recipient || c.customer_number === msg.recipient)?.name;
                          const formattedDate = msg.created_at.replace('T', ' ').substring(0, 16);
                          return (
                            <tr key={msg.id} className="hover:bg-slate-900/40 transition duration-150">
                              {/* No */}
                              <td className="py-3 px-4 text-center font-mono text-slate-500 font-bold">
                                {index + 1}
                              </td>

                              {/* Tanggal */}
                              <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                                {formattedDate}
                              </td>

                              {/* Modul */}
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                                  msg.type === 'Billing Reminder' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/40' :
                                  msg.type === 'Broadcast' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900/40' :
                                  msg.type === 'Notification' ? 'bg-amber-950 text-amber-400 border border-amber-900/40' :
                                  'bg-slate-850 text-slate-300'
                                }`}>
                                  {msg.type === 'Billing Reminder' ? 'Billing' : msg.type}
                                </span>
                              </td>

                              {/* Tujuan */}
                              <td className="py-3 px-3">
                                <div className="font-mono text-slate-200 font-semibold">{msg.recipient}</div>
                                {customerName && (
                                  <div className="text-[10px] text-slate-500 truncate max-w-[120px]" title={customerName}>
                                    {customerName}
                                  </div>
                                )}
                              </td>

                              {/* Pesan */}
                              <td className="py-3 px-4 max-w-sm">
                                <div 
                                  className="text-slate-300 line-clamp-2 hover:line-clamp-none transition-all duration-200 cursor-help break-words leading-relaxed"
                                  title={msg.message}
                                >
                                  {msg.message}
                                </div>
                              </td>

                              {/* Status */}
                              <td className="py-3 px-3 text-center">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  msg.status === 'Sent' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' :
                                  msg.status === 'Failed' ? 'bg-rose-950 text-rose-400 border border-rose-900/30' :
                                  'bg-amber-950 text-amber-400 border border-amber-900/30'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    msg.status === 'Sent' ? 'bg-emerald-400 animate-pulse' :
                                    msg.status === 'Failed' ? 'bg-rose-400' :
                                    'bg-amber-400 animate-pulse'
                                  }`} />
                                  {msg.status}
                                </span>
                              </td>

                              {/* Hit */}
                              <td className="py-3 px-2 text-center font-mono font-bold text-slate-300">
                                {msg.status === 'Failed' ? '2' : '1'}
                              </td>

                              {/* Log API */}
                              <td className="py-3 px-3">
                                <code className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                  msg.status === 'Sent' ? 'bg-emerald-950/20 text-emerald-500' :
                                  msg.status === 'Failed' ? 'bg-rose-950/20 text-rose-500 font-bold' :
                                  'bg-slate-900 text-slate-400'
                                }`}>
                                  {msg.status === 'Sent' ? '200 OK (Success)' :
                                   msg.status === 'Failed' ? '500 Timeout (Gateway)' :
                                   'Queue (Waiting)'}
                                </code>
                              </td>

                              {/* Tgl Status */}
                              <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                                {formattedDate}
                              </td>

                              {/* Next Kirim */}
                              <td className="py-3 px-3 font-mono text-slate-400">
                                {msg.status === 'Pending' ? '04/07/2026 10:00' : 'Selesai'}
                              </td>

                              {/* Act */}
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Resend button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onAddWaMessage({
                                        ...msg,
                                        id: `msg-retry-${Date.now()}`,
                                        status: 'Sent',
                                        created_at: new Date().toISOString()
                                      });
                                      alert(`Sukses mengirim ulang pesan ke ${msg.recipient}`);
                                    }}
                                    className="p-1 bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 rounded-lg border border-slate-800 hover:border-slate-700 transition"
                                    title="Kirim Ulang Pesan"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                  </button>
                                  {/* Delete button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm('Apakah Anda yakin ingin menghapus log pesan ini dari riwayat?')) {
                                        setDeletedMessageIds(prev => [...prev, msg.id]);
                                      }
                                    }}
                                    className="p-1 bg-slate-900 hover:bg-red-950 text-slate-500 hover:text-rose-400 rounded-lg border border-slate-800 hover:border-red-900 transition"
                                    title="Hapus Log Pesan"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
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
                <div className="bg-slate-900/40 border-t border-slate-850 px-4 py-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>
                    Menampilkan <strong className="text-slate-300">{Math.min(getFilteredMessages().slice(0, filterLimit).length, filterLimit)}</strong> dari <strong className="text-slate-300">{getFilteredMessages().length}</strong> pesan logs terfilter
                  </span>
                  <div className="flex gap-1.5">
                    <button className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg cursor-not-allowed">
                      Prev
                    </button>
                    <button className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg cursor-not-allowed">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Assign Technician Modal Dialog */}
      {isAssignOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">TINDAK LANJUT TIKET ADUAN</h3>
              <button onClick={() => setIsAssignOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveAssign} className="p-5 space-y-4 text-slate-200">
              <div>
                <span className="text-[10px] font-mono text-slate-500 block uppercase">DETAIL MASALAH</span>
                <p className="text-xs font-semibold text-white mt-1">{selectedTicket.title}</p>
                <p className="text-xs text-slate-400 mt-1 italic">"{selectedTicket.description}"</p>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Delegasi Teknisi Lapangan</label>
                <select 
                  required
                  value={assigneeName}
                  onChange={(e) => setAssigneeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                >
                  <option value="">-- Pilih Teknisi --</option>
                  <option value="Farhan (Teknisi Lapangan)">Farhan (Teknisi Core & Fiber Optic)</option>
                  <option value="Andri (Teknisi Lapangan)">Andri (Instalasi Baru & Dropcore)</option>
                  <option value="Susi (Customer Service)">Susi (L2 Remote Support)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Update Status Tiket</label>
                <select 
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                >
                  <option value="Open">Open</option>
                  <option value="Assigned">Assigned (Petugas Didelegasikan)</option>
                  <option value="Progress">Progress (Dalam Penanganan)</option>
                  <option value="Solved">Solved (Selesai Berhasil)</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsAssignOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg"
                >
                  Simpan Delegasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">OPEN TICKET ADUAN</h3>
              <button onClick={() => setIsNewTicketOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTicket} className="p-5 space-y-4 text-slate-200">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Pilih Pelanggan *</label>
                <select 
                  required
                  value={newTicketFields.customer_id}
                  onChange={(e) => setNewTicketFields({...newTicketFields, customer_id: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.customer_number} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Masalah / Subjek Pengaduan *</label>
                <input 
                  type="text" 
                  required
                  value={newTicketFields.title}
                  onChange={(e) => setNewTicketFields({...newTicketFields, title: e.target.value})}
                  placeholder="Contoh: Redaman tinggi Los Merah"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Kategori Gangguan</label>
                  <select 
                    value={newTicketFields.category}
                    onChange={(e) => setNewTicketFields({...newTicketFields, category: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="LOS / Kabel Putus">LOS / Kabel Putus</option>
                    <option value="Internet Lambat">Internet Lambat</option>
                    <option value="RTRW Net Redaman Tinggi">RTRW Net Redaman Tinggi</option>
                    <option value="Ganti Password Wi-Fi">Ganti Password Wi-Fi</option>
                    <option value="Registrasi / Aktivasi">Registrasi / Aktivasi</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Prioritas</label>
                  <select 
                    value={newTicketFields.priority}
                    onChange={(e) => setNewTicketFields({...newTicketFields, priority: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none font-semibold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Deskripsi Masalah Lengkap</label>
                <textarea 
                  rows={3}
                  value={newTicketFields.description}
                  onChange={(e) => setNewTicketFields({...newTicketFields, description: e.target.value})}
                  placeholder="Ceritakan detail kronologi kerusakan agar langsung diproses NOC..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg"
                >
                  Submit Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
