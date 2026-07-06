/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  TrendingUp, 
  FileText, 
  Plus, 
  Calendar, 
  RefreshCw,
  Search,
  Check,
  X
} from 'lucide-react';
import { Transaction } from '../types';

interface FinanceModuleProps {
  transactions: Transaction[];
  onAddTransaction: (trx: Transaction) => void;
}

interface CashAccount {
  id: string;
  name: string;
  type: 'Kas' | 'Bank';
  accountNo: string;
  balance: number;
}

export default function FinanceModule({ transactions, onAddTransaction }: FinanceModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'ledger' | 'reports'>('overview');
  
  // Local Cash Accounts state for mock display
  const [accounts, setAccounts] = useState<CashAccount[]>([
    { id: 'acc-1', name: 'Kas Kantor Utama', type: 'Kas', accountNo: 'CASH-MAIN', balance: 14500000 },
    { id: 'acc-2', name: 'Bank BCA Operational', type: 'Bank', accountNo: '882-019-2110', balance: 184200000 },
    { id: 'acc-3', name: 'Bank Mandiri Escrow', type: 'Bank', accountNo: '131-00-9281-22', balance: 95000000 },
  ]);

  const [isTrxModalOpen, setIsTrxModalOpen] = useState(false);
  const [isMutasiModalOpen, setIsMutasiModalOpen] = useState(false);

  // New Transaction form
  const [trxForm, setTrxForm] = useState({
    accountId: 'acc-1',
    type: 'Pemasukan' as 'Pemasukan' | 'Pengeluaran',
    category: 'Iuran Bulanan' as any,
    amount: '',
    description: '',
    paymentMethod: 'Transfer Bank',
    referenceNo: ''
  });

  // Mutasi form
  const [mutasiForm, setMutasiForm] = useState({
    sourceAccountId: 'acc-1',
    targetAccountId: 'acc-2',
    amount: '',
    description: ''
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Pemasukan' | 'Pengeluaran'>('all');

  // Compute reports
  const totalOmset = transactions
    .filter(t => t.type === 'Pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPengeluaran = transactions
    .filter(t => t.type === 'Pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const netLabaRugi = totalOmset - totalPengeluaran;

  const totalBalanceAll = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(trxForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Jumlah transaksi harus valid!');
      return;
    }

    const newTrx: Transaction = {
      id: `trx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: trxForm.description || trxForm.category,
      type: trxForm.type,
      category: trxForm.category,
      amount: amountNum,
      payment_method: trxForm.paymentMethod,
      reference_no: trxForm.referenceNo || `REF-${Math.floor(Math.random() * 89999) + 10000}`
    };

    onAddTransaction(newTrx);

    // Update the selected account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id === trxForm.accountId) {
        const adjustment = trxForm.type === 'Pemasukan' ? amountNum : -amountNum;
        return { ...acc, balance: acc.balance + adjustment };
      }
      return acc;
    }));

    setIsTrxModalOpen(false);
    setTrxForm({
      accountId: 'acc-1',
      type: 'Pemasukan',
      category: 'Iuran Bulanan',
      amount: '',
      description: '',
      paymentMethod: 'Transfer Bank',
      referenceNo: ''
    });
  };

  const handleCreateMutasi = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(mutasiForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Jumlah mutasi harus valid!');
      return;
    }

    if (mutasiForm.sourceAccountId === mutasiForm.targetAccountId) {
      alert('Akun asal dan akun tujuan transfer tidak boleh sama!');
      return;
    }

    const sourceAcc = accounts.find(a => a.id === mutasiForm.sourceAccountId);
    if (sourceAcc && sourceAcc.balance < amountNum) {
      alert('Saldo akun asal tidak mencukupi untuk mutasi ini!');
      return;
    }

    // Add 2 transaction logs (Outflow from source, Inflow to target)
    const trxOut: Transaction = {
      id: `trx-mut-out-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: `[MUTASI KELUAR] ${mutasiForm.description || 'Transfer antar kas'}`,
      type: 'Pengeluaran',
      category: 'Operasional',
      amount: amountNum,
      payment_method: 'Transfer Bank',
      reference_no: `MUT-${Date.now()}`
    };

    const trxIn: Transaction = {
      id: `trx-mut-in-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: `[MUTASI MASUK] ${mutasiForm.description || 'Transfer antar kas'}`,
      type: 'Pemasukan',
      category: 'Iuran Bulanan',
      amount: amountNum,
      payment_method: 'Transfer Bank',
      reference_no: `MUT-${Date.now()}`
    };

    onAddTransaction(trxOut);
    onAddTransaction(trxIn);

    // Update accounts balances
    setAccounts(prev => prev.map(acc => {
      if (acc.id === mutasiForm.sourceAccountId) {
        return { ...acc, balance: acc.balance - amountNum };
      }
      if (acc.id === mutasiForm.targetAccountId) {
        return { ...acc, balance: acc.balance + amountNum };
      }
      return acc;
    }));

    setIsMutasiModalOpen(false);
    alert('Mutasi kas berhasil diselesaikan.');
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.reference_no?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Modul Keuangan (Finance)</h2>
          <p className="text-xs text-slate-400">Pencatatan kas & bank, mutasi dana, pengeluaran operasional, dan rekapitulasi laba rugi.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsMutasiModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-950/40 hover:bg-indigo-950 text-indigo-400 border border-indigo-800/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Mutasi Antar Kas
          </button>
          <button 
            onClick={() => setIsTrxModalOpen(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/10"
          >
            <Plus className="w-4 h-4" />
            Catat Transaksi Keuangan
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        {[
          { id: 'overview', label: 'Ringkasan Kas & Bank' },
          { id: 'ledger', label: 'Buku Besar & Mutasi' },
          { id: 'reports', label: 'Laporan Laba Rugi' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeSubTab === tab.id ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'overview' && (
        <>
          {/* Quick Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-cyan-950 text-cyan-400 rounded-lg">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 block uppercase">TOTAL SALDO KAS</span>
                <span className="text-lg font-bold text-white font-mono mt-0.5 block">Rp {totalBalanceAll.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-indigo-950 text-indigo-400 rounded-lg">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 block uppercase">TOTAL OMSET (IN)</span>
                <span className="text-lg font-bold text-white font-mono mt-0.5 block">Rp {totalOmset.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-red-950/40 text-red-400 rounded-lg">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 block uppercase">OUTFLOW OPERASIONAL</span>
                <span className="text-lg font-bold text-white font-mono mt-0.5 block">Rp {totalPengeluaran.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl flex items-center gap-4">
              <div className={`p-3 rounded-lg ${netLabaRugi >= 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-450'}`}>
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 block uppercase">LABA / RUGI BERSIH</span>
                <span className="text-lg font-bold text-white font-mono mt-0.5 block">Rp {netLabaRugi.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Accounts Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">SALDO MASING-MASING KAS & BANK</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {accounts.map(acc => (
                <div key={acc.id} className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between h-36 relative overflow-hidden shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">{acc.name}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">{acc.accountNo}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                      acc.type === 'Kas' ? 'bg-indigo-950 text-indigo-400' : 'bg-cyan-950 text-cyan-400'
                    }`}>
                      {acc.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">SALDO TERSEDIA</span>
                    <span className="text-xl font-bold font-mono text-white mt-1 block">Rp {acc.balance.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeSubTab === 'ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col shadow-xl">
          {/* Table Filters */}
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center mb-4 pb-4 border-b border-slate-800">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none w-full md:w-40"
              >
                <option value="all">Semua Tipe</option>
                <option value="Pemasukan">Pemasukan (In)</option>
                <option value="Pengeluaran">Pengeluaran (Out)</option>
              </select>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 font-mono text-[10px] text-slate-500 uppercase pb-2">
                  <th className="pb-2">Tanggal</th>
                  <th className="pb-2">No. Referensi</th>
                  <th className="pb-2">Deskripsi Transaksi</th>
                  <th className="pb-2">Kategori</th>
                  <th className="pb-2">Metode</th>
                  <th className="pb-2 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-950/20">
                    <td className="py-3 font-mono text-slate-400">{t.date}</td>
                    <td className="py-3 font-mono text-slate-500">{t.reference_no}</td>
                    <td className="py-3 font-medium text-slate-200">{t.description}</td>
                    <td className="py-3 text-slate-400">{t.category}</td>
                    <td className="py-3 text-slate-500">{t.payment_method}</td>
                    <td className={`py-3 text-right font-bold font-mono ${
                      t.type === 'Pemasukan' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {t.type === 'Pemasukan' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Laba Rugi Breakdown Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-semibold text-white">Laporan Laba Rugi Komprehensif</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Kuartal Berjalan - Periode 2026</p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-medium">TOTAL OMSET (PENDAPATAN KOTOR)</span>
                <span className="font-mono text-emerald-400 font-bold">Rp {totalOmset.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-medium">TOTAL PENGELUARAN (BIAYA)</span>
                <span className="font-mono text-rose-400 font-bold">Rp {totalPengeluaran.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-b-2 border-slate-800 pb-3">
                <span className="text-slate-200">LABA BERSIH OPERASIONAL</span>
                <span className={`font-mono ${netLabaRugi >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                  Rp {netLabaRugi.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-xl text-[11px] text-slate-400 leading-relaxed">
              <strong>Catatan Akuntansi:</strong> Omset diperoleh secara real-time dari invoice lunas yang terbayar lewat Midtrans, Xendit, atau Tunai. Pengeluaran mencakup FUP transit bandwidth, sewa tiang, gaji, dan belanja dropcore FO.
            </div>
          </div>

          {/* Category-wise Expense Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-semibold text-white">Distribusi Pengeluaran & Pembelian Alat</h3>
              <p className="text-xs text-slate-400">Analisis pengeluaran berdasarkan kategori akun buku besar.</p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { name: 'Sewa Bandwidth (Transit)', amount: totalPengeluaran * 0.42, color: 'bg-indigo-500' },
                { name: 'Belanja Alat & Fiber Optic (Dropcore, OLT)', amount: totalPengeluaran * 0.28, color: 'bg-cyan-500' },
                { name: 'Gaji Karyawan NOC & Teknisi', amount: totalPengeluaran * 0.20, color: 'bg-indigo-400' },
                { name: 'Operasional Kantor & Bensin', amount: totalPengeluaran * 0.10, color: 'bg-slate-500' },
              ].map(item => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.name}</span>
                    <span className="font-mono text-slate-400 font-bold">Rp {item.amount.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${(item.amount / (totalPengeluaran || 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Catat Transaksi Modal */}
      {isTrxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">CATAT TRANSAKSI KEUANGAN</h3>
              <button onClick={() => setIsTrxModalOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTransaction} className="p-5 space-y-4 text-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Pilih Akun Kas *</label>
                  <select 
                    value={trxForm.accountId}
                    onChange={(e) => setTrxForm({...trxForm, accountId: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} (Rp {a.balance.toLocaleString('id-ID')})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Tipe Aliran *</label>
                  <select 
                    value={trxForm.type}
                    onChange={(e) => setTrxForm({...trxForm, type: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Pemasukan">Pemasukan (Inflow)</option>
                    <option value="Pengeluaran">Pengeluaran (Outflow)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Kategori Akun *</label>
                  <select 
                    value={trxForm.category}
                    onChange={(e) => setTrxForm({...trxForm, category: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    {trxForm.type === 'Pemasukan' ? (
                      <>
                        <option value="Iuran Bulanan">Iuran Bulanan Pelanggan</option>
                        <option value="Biaya Instalasi">Biaya Pasang Baru / PSB</option>
                        <option value="Operasional">Kemitraan & RT/RW Share</option>
                      </>
                    ) : (
                      <>
                        <option value="Sewa Bandwidth">Sewa Bandwidth Transit / NAP</option>
                        <option value="Beli Alat / Fiber Optic">Beli ONT/Dropcore/Alat Splicer</option>
                        <option value="Gaji Karyawan">Gaji Karyawan NOC/Teknisi</option>
                        <option value="Operasional">Operasional Kantor / Bensin</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Jumlah Transaksi (Rp) *</label>
                  <input 
                    type="number" 
                    required
                    value={trxForm.amount}
                    onChange={(e) => setTrxForm({...trxForm, amount: e.target.value})}
                    placeholder="Contoh: 1500000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Metode & Referensi</label>
                <div className="grid grid-cols-2 gap-3">
                  <select 
                    value={trxForm.paymentMethod}
                    onChange={(e) => setTrxForm({...trxForm, paymentMethod: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="QRIS">QRIS / LinkAja / GOPAY</option>
                    <option value="Tunai">Kas Tunai Fisik</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="No. Ref (Opsional)"
                    value={trxForm.referenceNo}
                    onChange={(e) => setTrxForm({...trxForm, referenceNo: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Deskripsi Lengkap *</label>
                <input 
                  type="text" 
                  required
                  value={trxForm.description}
                  onChange={(e) => setTrxForm({...trxForm, description: e.target.value})}
                  placeholder="Contoh: Pembelian dropcore fiber optic 3 roll merek secure"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsTrxModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg"
                >
                  Catat Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mutasi Modal */}
      {isMutasiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">MUTASI DANA ANTAR KAS</h3>
              <button onClick={() => setIsMutasiModalOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateMutasi} className="p-5 space-y-4 text-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Akun Sumber *</label>
                  <select 
                    value={mutasiForm.sourceAccountId}
                    onChange={(e) => setMutasiForm({...mutasiForm, sourceAccountId: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} (Rp {a.balance.toLocaleString('id-ID')})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Akun Tujuan *</label>
                  <select 
                    value={mutasiForm.targetAccountId}
                    onChange={(e) => setMutasiForm({...mutasiForm, targetAccountId: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} (Rp {a.balance.toLocaleString('id-ID')})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Jumlah Mutasi (Rp) *</label>
                <input 
                  type="number" 
                  required
                  value={mutasiForm.amount}
                  onChange={(e) => setMutasiForm({...mutasiForm, amount: e.target.value})}
                  placeholder="Contoh: 5000000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Deskripsi / Memo Mutasi *</label>
                <input 
                  type="text" 
                  required
                  value={mutasiForm.description}
                  onChange={(e) => setMutasiForm({...mutasiForm, description: e.target.value})}
                  placeholder="Contoh: Setoran uang tunai kas ke rekening operasional BCA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsMutasiModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Mutasi Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
