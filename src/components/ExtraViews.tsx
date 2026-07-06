import React, { useState } from 'react';
import { 
  UserPlus, 
  Wallet, 
  DollarSign, 
  Percent, 
  BarChart3, 
  Landmark, 
  Key, 
  Puzzle, 
  UserCheck, 
  Settings2, 
  Monitor, 
  Check, 
  X, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Copy, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Database, 
  Server, 
  RefreshCw 
} from 'lucide-react';
import { Customer } from '../types';
import { normalizePhoneNumber } from '../App';

// Interface definitions
interface ExtraViewsProps {
  tab: string;
  customers: Customer[];
  onAddCustomer?: (newCust: Customer) => void;
}

// 1. PENDAFTARAN ONLINE MOCK DATA
interface OnlineRegistration {
  id: string;
  name: string;
  phone: string;
  address: string;
  package_name: string;
  price: number;
  coordinates: string;
  status: 'Pending' | 'Disetujui' | 'Ditolak';
  date: string;
}

const INITIAL_REGISTRATIONS: OnlineRegistration[] = [
  {
    id: 'reg-01',
    name: 'Andi Wijaya',
    phone: '081234567890',
    address: 'Perumahan Sekojo Indah Blok C No 5, Palembang',
    package_name: 'Lite (20 Mbps)',
    price: 150000,
    coordinates: '-2.9815, 104.7892',
    status: 'Pending',
    date: '2026-07-02'
  },
  {
    id: 'reg-02',
    name: 'Citra Kirana',
    phone: '085277889900',
    address: 'Jl. Mayor Ruslan No. 12A, Palembang',
    package_name: 'Premium (50 Mbps)',
    price: 300000,
    coordinates: '-2.9912, 104.6985',
    status: 'Pending',
    date: '2026-07-03'
  },
  {
    id: 'reg-03',
    name: 'Eko Prasetyo',
    phone: '081366228833',
    address: 'Dusun III RT 04, Sako, Palembang',
    package_name: 'Standard (30 Mbps)',
    price: 220000,
    coordinates: '-2.9452, 104.8104',
    status: 'Disetujui',
    date: '2026-07-01'
  }
];

// 2. KOLEKTOR MOCK DATA
interface Collector {
  id: string;
  name: string;
  phone: string;
  area: string;
  collected_cash: number;
  target_invoices: number;
  settled_invoices: number;
  commission_pct: number;
}

const INITIAL_COLLECTORS: Collector[] = [
  {
    id: 'col-01',
    name: 'Heri Kurniawan',
    phone: '082188990011',
    area: 'Palembang Timur & Sekojo',
    collected_cash: 2450000,
    target_invoices: 25,
    settled_invoices: 14,
    commission_pct: 5
  },
  {
    id: 'col-02',
    name: 'Rudi Hartono',
    phone: '081922334455',
    area: 'Palembang Barat & Sako',
    collected_cash: 1800000,
    target_invoices: 18,
    settled_invoices: 10,
    commission_pct: 5
  }
];

// 3. MASTER BANK MOCK DATA
interface BankAccount {
  id: string;
  bank_name: string;
  acc_number: string;
  acc_owner: string;
  branch: string;
  active: boolean;
}

const INITIAL_BANKS: BankAccount[] = [
  { id: 'b-01', bank_name: 'BCA (Bank Central Asia)', acc_number: '117688866', acc_owner: 'PT StarBilling Media Nusantara', branch: 'KCU Palembang', active: true },
  { id: 'b-02', bank_name: 'Mandiri', acc_number: '1420011768886', acc_owner: 'PT StarBilling Media Nusantara', branch: 'KC Sudirman Palembang', active: true },
  { id: 'b-03', bank_name: 'BRI (Bank Rakyat Indonesia)', acc_number: '003201001176886', acc_owner: 'PT StarBilling Media Nusantara', branch: 'Unit Sako', active: false }
];

// 4. KARYAWAN MOCK DATA
interface Employee {
  id: string;
  name: string;
  role: 'Superadmin' | 'Admin CS' | 'Teknisi Lapangan' | 'Kolektor Tagihan';
  email: string;
  phone: string;
  status: 'Aktif' | 'Cuti' | 'Nonaktif';
}

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-01', name: 'Betara Syahputra', role: 'Superadmin', email: 'betara@nextlink.co.id', phone: '085117688866', status: 'Aktif' },
  { id: 'emp-02', name: 'Adinda Lestari', role: 'Admin CS', email: 'adinda.cs@starbilling.com', phone: '085117682244', status: 'Aktif' },
  { id: 'emp-03', name: 'Rian Hidayat', role: 'Teknisi Lapangan', email: 'rian.tech@starbilling.com', phone: '085233441122', status: 'Aktif' }
];

// 5. ADDON MOCK DATA
interface Addon {
  id: string;
  name: string;
  description: string;
  price: string;
  installed: boolean;
}

const INITIAL_ADDONS: Addon[] = [
  { id: 'add-01', name: 'WhatsApp Gateway Engine Pro', description: 'Kirim pengingat tagihan dan isolir otomatis via nomor WA korporat secara real-time.', price: 'Rp 100.000 / bln', installed: true },
  { id: 'add-02', name: 'MikroTik Multi-Router Sync', description: 'Sinkronisasi user PPPoE / Hotspot di lebih dari 5 Routerboard MikroTik sekaligus.', price: 'Rp 150.000 / bln', installed: true },
  { id: 'add-03', name: 'OLT GPON Auto-Provisioning', description: 'Daftarkan ONU/ONT langsung dari aplikasi tanpa harus login ke CLI ODT ZTE / Huawei.', price: 'Rp 250.000 / bln', installed: false },
  { id: 'add-04', name: 'Bot Telegram Komplain Pelanggan', description: 'Menerima alert tiket keluhan baru langsung ke grup tim teknisi Anda.', price: 'FREE', installed: false }
];

export default function ExtraViews({ tab, customers, onAddCustomer }: ExtraViewsProps) {
  // Local states for persistence/interaction with pre-normalization
  const [registrations, setRegistrations] = useState<OnlineRegistration[]>(() =>
    INITIAL_REGISTRATIONS.map(r => ({ ...r, phone: normalizePhoneNumber(r.phone) }))
  );
  const [collectors, setCollectors] = useState<Collector[]>(() =>
    INITIAL_COLLECTORS.map(c => ({ ...c, phone: normalizePhoneNumber(c.phone) }))
  );
  const [banks, setBanks] = useState<BankAccount[]>(INITIAL_BANKS);
  const [employees, setEmployees] = useState<Employee[]>(() =>
    INITIAL_EMPLOYEES.map(e => ({ ...e, phone: normalizePhoneNumber(e.phone) }))
  );
  const [addons, setAddons] = useState<Addon[]>(INITIAL_ADDONS);

  // New item triggers
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);

  // Interactive Employee states
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    role: 'Admin CS' as Employee['role'],
    email: '',
    phone: '',
    status: 'Aktif' as Employee['status']
  });

  // Interactive Collector states
  const [isCollectorModalOpen, setIsCollectorModalOpen] = useState(false);
  const [editingCollectorId, setEditingCollectorId] = useState<string | null>(null);
  const [collectorForm, setCollectorForm] = useState({
    name: '',
    phone: '',
    area: '',
    collected_cash: 0,
    target_invoices: 15,
    settled_invoices: 0,
    commission_pct: 5
  });

  // Interactive Registration states
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    phone: '',
    address: '',
    package_name: 'Lite (20 Mbps)',
    price: 150000,
    coordinates: '-2.9815, 104.7892'
  });

  // Unique validation check functions
  const isEmployeePhoneDuplicate = (phone: string, excludeId: string | null) => {
    const norm = normalizePhoneNumber(phone);
    return employees.some(e => e.id !== excludeId && normalizePhoneNumber(e.phone) === norm);
  };

  const isCollectorPhoneDuplicate = (phone: string, excludeId: string | null) => {
    const norm = normalizePhoneNumber(phone);
    return collectors.some(c => c.id !== excludeId && normalizePhoneNumber(c.phone) === norm);
  };

  const isRegPhoneDuplicate = (phone: string, excludeId: string | null) => {
    const norm = normalizePhoneNumber(phone);
    return registrations.some(r => r.id !== excludeId && normalizePhoneNumber(r.phone) === norm);
  };

  // Handlers for registrations
  const handleApproveRegistration = (reg: OnlineRegistration) => {
    if (onAddCustomer) {
      // Convert to new Customer
      const newCustId = `cust-${Date.now()}`;
      const normPhone = normalizePhoneNumber(reg.phone);
      
      onAddCustomer({
        id: newCustId,
        customer_number: normPhone, // Aturan: customer_number = phone
        name: reg.name,
        nik: `16710${Math.floor(10000000000 + Math.random() * 90000000000)}`,
        phone: normPhone, // Aturan: phone = normalized WhatsApp number
        email: `${reg.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        address: reg.address,
        package_id: 'pkg-02', // Standard standard mapping
        router_id: 'rtr-01',
        odp_id: 'odp-01',
        marketing_id: 'mkt-01',
        status: 'Aktif',
        latitude: parseFloat(reg.coordinates.split(',')[0].trim()) || -2.9815,
        longitude: parseFloat(reg.coordinates.split(',')[1].trim()) || 104.7892,
        created_at: new Date().toISOString().split('T')[0]
      });

      setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, status: 'Disetujui' } : r));
      alert(`Sukses: Pendaftaran online ${reg.name} telah disetujui! Pelanggan baru otomatis ditambahkan ke database dengan nomor pelanggan ${normPhone}.`);
    }
  };

  const handleDeclineRegistration = (id: string) => {
    setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: 'Ditolak' } : r));
    alert('Pendaftaran online ditolak.');
  };

  // Employee action handlers
  const handleOpenAddEmployee = () => {
    setEmployeeForm({
      name: '',
      role: 'Admin CS',
      email: '',
      phone: '',
      status: 'Aktif'
    });
    setEditingEmployeeId(null);
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: Employee) => {
    setEmployeeForm({
      name: emp.name,
      role: emp.role,
      email: emp.email,
      phone: emp.phone,
      status: emp.status
    });
    setEditingEmployeeId(emp.id);
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, role, email, phone, status } = employeeForm;
    const normPhone = normalizePhoneNumber(phone);

    // Validation rules
    if (!name || !email || !phone) {
      alert('Semua field wajib diisi.');
      return;
    }

    if (normPhone.length < 10 || normPhone.length > 15) {
      alert('Validasi Gagal: Nomor WhatsApp minimal harus memiliki 10-15 digit angka.');
      return;
    }

    if (isEmployeePhoneDuplicate(phone, editingEmployeeId)) {
      alert('Validasi Gagal: Nomor WhatsApp sudah terdaftar sebagai karyawan lain (Wajib Unik).');
      return;
    }

    if (editingEmployeeId) {
      // Edit mode
      setEmployees(prev => prev.map(emp => emp.id === editingEmployeeId ? {
        ...emp,
        name,
        role,
        email,
        phone: normPhone,
        status
      } : emp));
      alert('Data karyawan berhasil diperbarui.');
    } else {
      // Create mode
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        name,
        role,
        email,
        phone: normPhone,
        status
      };
      setEmployees(prev => [...prev, newEmp]);
      alert('Karyawan baru berhasil ditambahkan.');
    }

    setIsEmployeeModalOpen(false);
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      alert('Karyawan berhasil dihapus.');
    }
  };

  // Collector action handlers
  const handleOpenAddCollector = () => {
    setCollectorForm({
      name: '',
      phone: '',
      area: '',
      collected_cash: 0,
      target_invoices: 15,
      settled_invoices: 0,
      commission_pct: 5
    });
    setEditingCollectorId(null);
    setIsCollectorModalOpen(true);
  };

  const handleOpenEditCollector = (col: Collector) => {
    setCollectorForm({
      name: col.name,
      phone: col.phone,
      area: col.area,
      collected_cash: col.collected_cash,
      target_invoices: col.target_invoices,
      settled_invoices: col.settled_invoices,
      commission_pct: col.commission_pct
    });
    setEditingCollectorId(col.id);
    setIsCollectorModalOpen(true);
  };

  const handleSaveCollector = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, phone, area, collected_cash, target_invoices, settled_invoices, commission_pct } = collectorForm;
    const normPhone = normalizePhoneNumber(phone);

    // Validation rules
    if (!name || !phone || !area) {
      alert('Nama, WhatsApp, dan Area penugasan wajib diisi.');
      return;
    }

    if (normPhone.length < 10 || normPhone.length > 15) {
      alert('Validasi Gagal: Nomor WhatsApp minimal harus memiliki 10-15 digit angka.');
      return;
    }

    if (isCollectorPhoneDuplicate(phone, editingCollectorId)) {
      alert('Validasi Gagal: Nomor WhatsApp sudah terdaftar sebagai kolektor lain (Wajib Unik).');
      return;
    }

    if (editingCollectorId) {
      // Edit mode
      setCollectors(prev => prev.map(col => col.id === editingCollectorId ? {
        ...col,
        name,
        phone: normPhone,
        area,
        collected_cash: Number(collected_cash),
        target_invoices: Number(target_invoices),
        settled_invoices: Number(settled_invoices),
        commission_pct: Number(commission_pct)
      } : col));
      alert('Data kolektor berhasil diperbarui.');
    } else {
      // Create mode
      const newCol: Collector = {
        id: `col-${Date.now()}`,
        name,
        phone: normPhone,
        area,
        collected_cash: Number(collected_cash),
        target_invoices: Number(target_invoices),
        settled_invoices: Number(settled_invoices),
        commission_pct: Number(commission_pct)
      };
      setCollectors(prev => [...prev, newCol]);
      alert('Kolektor baru berhasil ditambahkan.');
    }

    setIsCollectorModalOpen(false);
  };

  const handleDeleteCollector = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kolektor ini?')) {
      setCollectors(prev => prev.filter(col => col.id !== id));
      alert('Kolektor berhasil dihapus.');
    }
  };

  // Online Registration action handlers
  const handleOpenAddRegistration = () => {
    setRegistrationForm({
      name: '',
      phone: '',
      address: '',
      package_name: 'Lite (20 Mbps)',
      price: 150000,
      coordinates: '-2.9815, 104.7892'
    });
    setIsRegModalOpen(true);
  };

  const handleSaveRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, phone, address, package_name, price, coordinates } = registrationForm;
    const normPhone = normalizePhoneNumber(phone);

    // Validation rules
    if (!name || !phone || !address) {
      alert('Nama, WhatsApp, dan Alamat lengkap wajib diisi.');
      return;
    }

    if (normPhone.length < 10 || normPhone.length > 15) {
      alert('Validasi Gagal: Nomor WhatsApp minimal harus memiliki 10-15 digit angka.');
      return;
    }

    if (isRegPhoneDuplicate(phone, null)) {
      alert('Validasi Gagal: Nomor WhatsApp sudah terdaftar di sistem pendaftaran (Wajib Unik).');
      return;
    }

    const newReg: OnlineRegistration = {
      id: `reg-${Date.now()}`,
      name,
      phone: normPhone,
      address,
      package_name,
      price: Number(price),
      coordinates,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };

    setRegistrations(prev => [newReg, ...prev]);
    alert('Pendaftaran online mandiri berhasil dikirim.');
    setIsRegModalOpen(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankId(id);
    setTimeout(() => setCopiedBankId(null), 2000);
  };

  // Toggle addons
  const toggleAddon = (id: string) => {
    setAddons(prev => prev.map(a => a.id === id ? { ...a, installed: !a.installed } : a));
  };

  // ==========================================
  // 1. PENDAFTARAN ONLINE VIEW
  // ==========================================
  if (tab === 'pendaftaran-online') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-400" /> Pendaftaran Online Calon Pelanggan
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Verifikasi pendaftaran calon pelanggan mandiri yang masuk via portal website radius jangkauan Anda.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleOpenAddRegistration}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Pendaftaran Baru
            </button>
            <span className="px-2.5 py-1 bg-indigo-950 text-indigo-400 font-mono text-[10px] font-bold rounded-lg border border-indigo-800/50">
              {registrations.filter(r => r.status === 'Pending').length} Pending
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400">
                <th className="py-3 px-4">Nama Pelanggan</th>
                <th className="py-3 px-4">Kontak / WA</th>
                <th className="py-3 px-4">Alamat &amp; Koordinat</th>
                <th className="py-3 px-4">Paket Dipilih</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs">
              {registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-950/20 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">{reg.name}</td>
                  <td className="py-3.5 px-4 font-mono">{reg.phone}</td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="truncate text-slate-300" title={reg.address}>{reg.address}</p>
                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">{reg.coordinates}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-300 block">{reg.package_name}</span>
                    <span className="text-[10px] font-mono text-cyan-400 block">Rp {reg.price.toLocaleString('id-ID')}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      reg.status === 'Pending' 
                        ? 'bg-amber-950/40 text-amber-400 border border-amber-800/40' 
                        : reg.status === 'Disetujui'
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                        : 'bg-rose-950/40 text-rose-400 border border-rose-800/40'
                    }`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {reg.status === 'Pending' ? (
                      <div className="flex gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => handleApproveRegistration(reg)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-[10px] rounded flex items-center gap-1 transition"
                        >
                          <Check className="w-3 h-3" /> SETUJUI
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineRegistration(reg.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 font-mono font-bold text-[10px] rounded flex items-center gap-1 transition border border-slate-700 hover:border-rose-900"
                        >
                          <X className="w-3 h-3" /> TOLAK
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">Selesai</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Pendaftaran Online Baru */}
        {isRegModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-indigo-400" /> Pendaftaran Online Baru (Simulasi)
                </h3>
                <button 
                  onClick={() => setIsRegModalOpen(false)} 
                  className="text-slate-400 hover:text-white transition text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveRegistration} className="p-5 space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Nama Calon Pelanggan *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: Andi Wijaya"
                    value={registrationForm.name}
                    onChange={e => setRegistrationForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Nomor WhatsApp *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: 081234567890 atau +628..."
                    value={registrationForm.phone}
                    onChange={e => setRegistrationForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition font-mono"
                  />
                  <div className="text-[10px] font-mono mt-1 text-slate-500 flex justify-between">
                    <span>Live Normalisasi (Format 62):</span>
                    <span className="text-cyan-400 font-bold">{normalizePhoneNumber(registrationForm.phone) || '-'}</span>
                  </div>
                  {registrationForm.phone && (normalizePhoneNumber(registrationForm.phone).length < 10 || normalizePhoneNumber(registrationForm.phone).length > 15) && (
                    <p className="text-[10px] text-rose-400 font-mono mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Panjang nomor harus 10-15 digit angka.
                    </p>
                  )}
                  {isRegPhoneDuplicate(registrationForm.phone, null) && (
                    <p className="text-[10px] text-rose-400 font-mono mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Nomor WhatsApp ini sudah terdaftar di sistem.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Alamat Lengkap Pemasangan *</label>
                  <textarea 
                    required 
                    rows={2}
                    placeholder="Masukkan alamat lengkap rumah calon pelanggan..."
                    value={registrationForm.address}
                    onChange={e => setRegistrationForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Paket Layanan *</label>
                    <select 
                      value={registrationForm.package_name}
                      onChange={e => {
                        const val = e.target.value;
                        const price = val.includes('Lite') ? 150000 : val.includes('Standard') ? 220000 : 300000;
                        setRegistrationForm(prev => ({ ...prev, package_name: val, price }));
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                    >
                      <option value="Lite (20 Mbps)">Lite (20 Mbps)</option>
                      <option value="Standard (30 Mbps)">Standard (30 Mbps)</option>
                      <option value="Premium (50 Mbps)">Premium (50 Mbps)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Harga Bulanan</label>
                    <div className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold">
                      Rp {registrationForm.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Koordinat Maps (Latitude, Longitude) *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: -2.9815, 104.7892"
                    value={registrationForm.coordinates}
                    onChange={e => setRegistrationForm(prev => ({ ...prev, coordinates: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setIsRegModalOpen(false)} 
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs transition"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition"
                  >
                    Kirim Pendaftaran
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. KOLEKTOR VIEW
  // ==========================================
  if (tab === 'kolektor') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-400" /> Kolektor Tagihan Lapangan
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Pantau total cash, target tagihan, dan komisi harian dari kolektor pembayaran tunai di lapangan.
            </p>
          </div>
          <button 
            onClick={handleOpenAddCollector}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Kolektor
          </button>
        </div>

        {/* List of collectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collectors.map((col) => {
            const targetPct = Math.round((col.settled_invoices / col.target_invoices) * 100) || 0;
            return (
              <div key={col.id} className="p-5 bg-slate-950/50 border border-slate-850 rounded-xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white">{col.name}</h4>
                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">Area: {col.area} | WA: {col.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleOpenEditCollector(col)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-mono text-[9px] font-bold rounded transition"
                    >
                      Ubah
                    </button>
                    <button 
                      onClick={() => handleDeleteCollector(col.id)}
                      className="px-2 py-1 bg-rose-950/40 hover:bg-rose-900/30 text-rose-400 font-mono text-[9px] font-bold rounded border border-rose-900/20 transition"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Progres Penagihan</span>
                    <span className="text-white font-bold">{col.settled_invoices} / {col.target_invoices} Invoice ({targetPct}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all" style={{ width: `${targetPct}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-900 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">CASH DI TANGAN</span>
                    <strong className="text-emerald-400 font-mono text-sm">Rp {col.collected_cash.toLocaleString('id-ID')}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">ESTIMASI KOMISI ({col.commission_pct}%)</span>
                    <strong className="text-white font-mono text-sm">Rp {Math.round(col.collected_cash * (col.commission_pct / 100)).toLocaleString('id-ID')}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Kolektor Baru / Edit */}
        {isCollectorModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-indigo-400" /> {editingCollectorId ? 'Edit Data Kolektor' : 'Tambah Kolektor Lapangan Baru'}
                </h3>
                <button 
                  onClick={() => setIsCollectorModalOpen(false)} 
                  className="text-slate-400 hover:text-white transition text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveCollector} className="p-5 space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Nama Lengkap Kolektor *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: Budi Santoso"
                    value={collectorForm.name}
                    onChange={e => setCollectorForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Nomor WhatsApp *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: 081112345678"
                    value={collectorForm.phone}
                    onChange={e => setCollectorForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition font-mono"
                  />
                  <div className="text-[10px] font-mono mt-1 text-slate-500 flex justify-between">
                    <span>Live Normalisasi (Format 62):</span>
                    <span className="text-cyan-400 font-bold">{normalizePhoneNumber(collectorForm.phone) || '-'}</span>
                  </div>
                  {collectorForm.phone && (normalizePhoneNumber(collectorForm.phone).length < 10 || normalizePhoneNumber(collectorForm.phone).length > 15) && (
                    <p className="text-[10px] text-rose-400 font-mono mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Panjang nomor harus 10-15 digit angka.
                    </p>
                  )}
                  {isCollectorPhoneDuplicate(collectorForm.phone, editingCollectorId) && (
                    <p className="text-[10px] text-rose-400 font-mono mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Nomor WhatsApp ini sudah terdaftar sebagai kolektor.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Area Wilayah Penagihan *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: Seberang Ulu I, Jakabaring"
                    value={collectorForm.area}
                    onChange={e => setCollectorForm(prev => ({ ...prev, area: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Target Invoices (Lembar) *</label>
                    <input 
                      type="number" 
                      required 
                      min={1}
                      value={collectorForm.target_invoices}
                      onChange={e => setCollectorForm(prev => ({ ...prev, target_invoices: Math.max(1, Number(e.target.value)) }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Selesai Ditagih (Lembar)</label>
                    <input 
                      type="number" 
                      required 
                      min={0}
                      max={collectorForm.target_invoices}
                      value={collectorForm.settled_invoices}
                      onChange={e => setCollectorForm(prev => ({ ...prev, settled_invoices: Math.min(collectorForm.target_invoices, Math.max(0, Number(e.target.value))) }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Komisi Kolektor (%) *</label>
                    <input 
                      type="number" 
                      required 
                      min={1}
                      max={100}
                      value={collectorForm.commission_pct}
                      onChange={e => setCollectorForm(prev => ({ ...prev, commission_pct: Math.min(100, Math.max(1, Number(e.target.value))) }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Cash Terkumpul (Rupiah)</label>
                    <input 
                      type="number" 
                      required 
                      min={0}
                      value={collectorForm.collected_cash}
                      onChange={e => setCollectorForm(prev => ({ ...prev, collected_cash: Math.max(0, Number(e.target.value)) }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition font-mono text-emerald-400 font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setIsCollectorModalOpen(false)} 
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs transition"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition"
                  >
                    {editingCollectorId ? 'Simpan Perubahan' : 'Tambah Kolektor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 3. TRANSAKSI LAINYA VIEW
  // ==========================================
  if (tab === 'transaksi-lainya') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-400" /> Pembayaran &amp; Transaksi Lainnya
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Catat mutasi transaksi non-iuran seperti biaya pemasangan baru, pembelian router pelanggan, atau penggantian dropcore fiber optik.
            </p>
          </div>
          <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Tambah Mutasi Baru
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-850 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-mono uppercase block">Pemasangan Baru (PSB)</span>
              <span className="text-xs font-mono font-bold text-white">Rp 1.450.000</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-850 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-950 text-indigo-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-mono uppercase block">Peralatan &amp; Kabel</span>
              <span className="text-xs font-mono font-bold text-white">Rp 750.000</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-850 flex items-center gap-3">
            <div className="p-2.5 bg-rose-950 text-rose-400 rounded-lg">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-mono uppercase block">Biaya Sewa IP Transit</span>
              <span className="text-xs font-mono font-bold text-white">Rp 12.000.000</span>
            </div>
          </div>
        </div>

        {/* Dummy list */}
        <div className="bg-slate-950/30 rounded-xl p-4 text-center text-xs text-slate-500 font-mono">
          📁 Total terdapat 3 transaksi non-iuran terdaftar bulan ini. Seluruh mutasi disinkronkan ke pembukuan utama Jurnal Keuangan.
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. BIAYA & DISKON VIEW
  // ==========================================
  if (tab === 'biaya-diskon') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Percent className="w-5 h-5 text-indigo-400" /> Biaya Administrasi &amp; Diskon Promo
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Atur persentase pajak PPN 11%, biaya administrasi bank, diskon pemutihan isolasi, atau kupon potongan harga tagihan.
            </p>
          </div>
          <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Tambah Aturan Biaya
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Aturan Tambahan Biaya (Surcharges)</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-slate-900/50 rounded">
                <span>Biaya Admin Gerbang / Merchant</span>
                <span className="font-mono font-bold text-cyan-400">Rp 3.500 / trx</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-900/50 rounded">
                <span>Pajak PPN ISP (Kementerian)</span>
                <span className="font-mono font-bold text-cyan-400">11.00%</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-900/50 rounded">
                <span>Denda Keterlambatan Isolir</span>
                <span className="font-mono font-bold text-cyan-400">Rp 15.000 / bln</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Diskon &amp; Promo Aktif</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-slate-900/50 rounded">
                <span>Diskon Anggota Baru (KODE: STARNEW)</span>
                <span className="font-mono font-bold text-emerald-400">- Rp 25.000</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-900/50 rounded">
                <span>Kompensasi Gangguan Massal</span>
                <span className="font-mono font-bold text-emerald-400">- 10.00%</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-900/50 rounded">
                <span>Diskon Langganan Tahunan</span>
                <span className="font-mono font-bold text-emerald-400">- 1 Bulan FREE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 5. LAPORAN VIEW
  // ==========================================
  if (tab === 'laporan') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" /> Analitik &amp; Laporan Keuangan
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Visualisasikan performa pendaftaran pelanggan, pendapatan bulanan, status isolasi, dan rasio pencairan dana.
            </p>
          </div>
          <button className="px-3 py-1.5 bg-slate-800 text-slate-200 border border-slate-700 hover:text-white rounded-lg text-xs transition font-semibold">
            Export PDF/XLS
          </button>
        </div>

        {/* Reporting bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-500 font-mono block">TAGIHAN BULAN INI</span>
            <strong className="text-base font-mono text-white mt-1 block">Rp 5.250.000</strong>
            <span className="text-[9px] text-emerald-400 mt-1 block">📈 +14.2% dari bln lalu</span>
          </div>

          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-500 font-mono block">SUDAH DIBAYAR</span>
            <strong className="text-base font-mono text-emerald-400 mt-1 block">Rp 3.420.000</strong>
            <span className="text-[9px] text-slate-400 mt-1 block">Rasio Keberhasilan: 65%</span>
          </div>

          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-500 font-mono block">PIUTANG (BELUM LUNAS)</span>
            <strong className="text-base font-mono text-rose-400 mt-1 block">Rp 1.830.000</strong>
            <span className="text-[9px] text-slate-400 mt-1 block">Pelanggan Suspended: 4 orang</span>
          </div>

          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-500 font-mono block">PENDAPATAN LAINNYA</span>
            <strong className="text-base font-mono text-indigo-400 mt-1 block">Rp 2.200.000</strong>
            <span className="text-[9px] text-slate-400 mt-1 block">Sejak 1 Juli 2026</span>
          </div>
        </div>

        {/* Chart mock indicator */}
        <div className="p-10 bg-slate-950/20 border border-slate-850 rounded-2xl text-center space-y-2">
          <BarChart3 className="w-8 h-8 text-indigo-500 mx-auto animate-pulse" />
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Metrik Sebaran Layanan</h4>
          <p className="text-[10px] text-slate-500 max-w-sm mx-auto leading-normal">
            Grafik interaktif menunjukkan 70% pelanggan memilih paket Standard (30 Mbps) dan 20% memilih Premium (50 Mbps). Uptime server stabil di angka 99.98%.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 6. MASTER BANK VIEW
  // ==========================================
  if (tab === 'master-bank') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Landmark className="w-5 h-5 text-indigo-400" /> Rekening Bank Perusahaan
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Atur daftar nomor rekening bank resmi perusahaan untuk konfirmasi transfer manual oleh pelanggan.
            </p>
          </div>
          <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Tambah Rekening
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {banks.map((b) => (
            <div key={b.id} className={`p-4 bg-slate-950/40 rounded-xl border space-y-3 transition ${b.active ? 'border-indigo-800' : 'border-slate-850 opacity-60'}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white font-mono">{b.bank_name}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${b.active ? 'bg-indigo-950 text-indigo-400' : 'bg-slate-900 text-slate-500'}`}>
                  {b.active ? 'AKTIF' : 'NONAKTIF'}
                </span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded font-mono text-center space-y-1 relative">
                <span className="text-[10px] text-slate-500 uppercase block">NOMOR REKENING</span>
                <strong className="text-cyan-400 text-sm tracking-widest block">{b.acc_number}</strong>
                <button
                  type="button"
                  onClick={() => copyToClipboard(b.acc_number, b.id)}
                  className="absolute right-2 top-2 p-1 text-slate-500 hover:text-white transition"
                  title="Salin No Rekening"
                >
                  {copiedBankId === b.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-[10px] text-slate-400 text-center leading-normal">
                Atas Nama: <strong className="text-slate-200">{b.acc_owner}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // 7. PAYMENT GATEWAY VIEW
  // ==========================================
  if (tab === 'payment-gateway') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-400" /> Integrasi Payment Gateway API
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Hubungkan billing Anda ke Midtrans, Tripay, Xendit, atau Gerbang QRIS nasional untuk pembukuan lunas otomatis harian.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold rounded border border-emerald-800/40">
            SINKRON
          </span>
        </div>

        {/* PG Forms Mockup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Integrasi Tripay Gateway</h4>
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 font-mono block mb-1">TRIPAY MERCHANT CODE</label>
                <input type="text" value="T117688" readOnly className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded font-mono text-slate-300 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-mono block mb-1">TRIPAY PRIVATE KEY</label>
                <input type="password" value="••••••••••••••••••••••••" readOnly className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded font-mono text-slate-400 focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Integrasi Midtrans QRIS</h4>
              <span className="w-3 h-3 rounded-full bg-slate-700"></span>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 font-mono block mb-1">MIDTRANS MERCHANT ID</label>
                <input type="text" value="M-0851176" readOnly className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded font-mono text-slate-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-mono block mb-1">MIDTRANS CLIENT KEY</label>
                <input type="password" value="••••••••••••••••••••••••" readOnly className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded font-mono text-slate-500 focus:outline-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 8. ADDON VIEW
  // ==========================================
  if (tab === 'addon') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-indigo-400" /> Marketplace Modul &amp; AddOn StarBilling
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Instal modul pendukung tambahan untuk memperluas jangkauan operasional ISP dan automasi peranti OLT/ONT Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addons.map((add) => (
            <div key={add.id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex items-start gap-4 hover:border-slate-800 transition">
              <div className={`p-2 rounded-lg ${add.installed ? 'bg-indigo-950 text-indigo-400' : 'bg-slate-900 text-slate-500'}`}>
                <Puzzle className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white">{add.name}</h4>
                  <span className="text-[10px] font-mono font-bold text-cyan-400">{add.price}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">{add.description}</p>
                <div className="pt-2 flex justify-between items-center">
                  <span className={`text-[10px] font-mono font-bold uppercase ${add.installed ? 'text-indigo-400' : 'text-slate-500'}`}>
                    {add.installed ? '● Installed' : 'Not Installed'}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleAddon(add.id)}
                    className={`px-3 py-1 font-mono font-bold text-[10px] rounded transition ${
                      add.installed 
                        ? 'bg-rose-950 text-rose-400 hover:bg-rose-900/40 border border-rose-900/30' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {add.installed ? 'DISABLE' : 'INSTALL NOW'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // 9. KARYAWAN VIEW
  // ==========================================
  if (tab === 'karyawan') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" /> Manajemen Karyawan &amp; Hak Akses
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Atur profil karyawan, teknisi lapangan, sales marketing, dan tingkat otoritas login admin panel.
            </p>
          </div>
          <button 
            onClick={handleOpenAddEmployee}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Karyawan
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-500">
                <th className="py-2.5 px-4">Nama</th>
                <th className="py-2.5 px-4">Role/Jabatan</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">WhatsApp</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-950/20 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">{emp.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-slate-950 rounded text-[10px] border border-slate-800 text-slate-300 font-mono">
                      {emp.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono">{emp.email}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono">{emp.phone}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${emp.status === 'Aktif' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/30' : 'bg-slate-950 text-slate-500'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => handleOpenEditEmployee(emp)} 
                        className="text-slate-400 hover:text-white transition font-mono text-[10px] font-bold uppercase"
                      >
                        Ubah
                      </button>
                      <button 
                        onClick={() => handleDeleteEmployee(emp.id)} 
                        className="text-slate-500 hover:text-rose-400 transition font-mono text-[10px] font-bold uppercase"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Karyawan Baru / Edit */}
        {isEmployeeModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-400" /> {editingEmployeeId ? 'Edit Profil Karyawan' : 'Tambah Karyawan Baru'}
                </h3>
                <button 
                  onClick={() => setIsEmployeeModalOpen(false)} 
                  className="text-slate-400 hover:text-white transition text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEmployee} className="p-5 space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Nama Karyawan *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: Adinda Lestari"
                    value={employeeForm.name}
                    onChange={e => setEmployeeForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Role Jabatan *</label>
                    <select 
                      value={employeeForm.role}
                      onChange={e => setEmployeeForm(prev => ({ ...prev, role: e.target.value as Employee['role'] }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                    >
                      <option value="Superadmin">Superadmin</option>
                      <option value="Admin CS">Admin CS</option>
                      <option value="Teknisi Lapangan">Teknisi Lapangan</option>
                      <option value="Kolektor Tagihan">Kolektor Tagihan</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Status Kepegawaian *</label>
                    <select 
                      value={employeeForm.status}
                      onChange={e => setEmployeeForm(prev => ({ ...prev, status: e.target.value as Employee['status'] }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Cuti">Cuti</option>
                      <option value="Resign">Resign</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Alamat Email *</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="Contoh: adinda.cs@starbilling.com"
                    value={employeeForm.email}
                    onChange={e => setEmployeeForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Nomor WhatsApp *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: 085117682244"
                    value={employeeForm.phone}
                    onChange={e => setEmployeeForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition font-mono"
                  />
                  <div className="text-[10px] font-mono mt-1 text-slate-500 flex justify-between">
                    <span>Live Normalisasi (Format 62):</span>
                    <span className="text-cyan-400 font-bold">{normalizePhoneNumber(employeeForm.phone) || '-'}</span>
                  </div>
                  {employeeForm.phone && (normalizePhoneNumber(employeeForm.phone).length < 10 || normalizePhoneNumber(employeeForm.phone).length > 15) && (
                    <p className="text-[10px] text-rose-400 font-mono mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Panjang nomor harus 10-15 digit angka.
                    </p>
                  )}
                  {isEmployeePhoneDuplicate(employeeForm.phone, editingEmployeeId) && (
                    <p className="text-[10px] text-rose-400 font-mono mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Nomor WhatsApp ini sudah terdaftar sebagai karyawan.
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setIsEmployeeModalOpen(false)} 
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs transition"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition"
                  >
                    {editingEmployeeId ? 'Simpan Perubahan' : 'Tambah Karyawan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 10. SISTEM SETTING VIEW
  // ==========================================
  if (tab === 'sistem-setting') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-400" /> Konfigurasi &amp; Pemeliharaan Sistem
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Utilitas backup, pemulihan database utama, reset logs whatsapp gateway, dan otentikasi admin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1">
              <Database className="w-4 h-4 text-cyan-400" /> Database Backup Manager
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Unduh cadangan data pelanggan, invoice tagihan, logs chatbot, dan riwayat mutasi dalam format database SQL terenkripsi secara instan.
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded transition flex items-center gap-1">
                Backup SQL Now
              </button>
              <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] rounded border border-slate-750 transition flex items-center gap-1">
                Restore Database
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1">
              <Server className="w-4 h-4 text-indigo-400" /> Router System Cron Sync
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Verifikasi apakah thread sinkronisasi MikroTik API dan database sedang berjalan lancar di port server lokal.
            </p>
            <div className="flex justify-between items-center p-2.5 bg-slate-900/60 rounded border border-slate-800 text-[11px]">
              <span className="font-mono text-slate-400">STATUS DAEMON SINKRONISASI</span>
              <strong className="text-emerald-400 font-bold">● RUNNING (OK)</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 11. BILLING SYSTEM VIEW
  // ==========================================
  if (tab === 'billing-system') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-400" /> StarBilling Engine Dashboard
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Status runtime engine, memori pool, and API throughput server utama Anda.
          </p>
        </div>

        {/* Dashboard health indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 text-center">
            <span className="text-[10px] text-slate-500 font-mono block">SERVER RUNTIME UPTIME</span>
            <strong className="text-lg font-mono text-white mt-1 block">43 Hari, 12 Jam, 4 Menit</strong>
          </div>

          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 text-center">
            <span className="text-[10px] text-slate-500 font-mono block">CPU UTILIZATION</span>
            <strong className="text-lg font-mono text-cyan-400 mt-1 block">1.84% (Low Peak)</strong>
          </div>

          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 text-center">
            <span className="text-[10px] text-slate-500 font-mono block">DATABASE MEMORY CONSUMED</span>
            <strong className="text-lg font-mono text-emerald-400 mt-1 block">142 MB / 2048 MB</strong>
          </div>
        </div>

        <div className="p-4 bg-slate-950 rounded-xl border border-slate-850/80 space-y-2 text-xs">
          <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wide">StarBilling ISP Enterprise License Verification</h4>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Sistem valid dan diizinkan secara hukum oleh PT StarBilling Media Nusantara untuk mengelola klien dengan kapasitas tak terbatas. Dibuat dengan fondasi tangguh Laravel 12.1-stable and React 19.0.
          </p>
        </div>
      </div>
    );
  }

  // Fallback default
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400 font-mono">
      🔧 Modul <strong className="text-white">"{tab}"</strong> sedang diproses atau diintegrasikan.
    </div>
  );
}
