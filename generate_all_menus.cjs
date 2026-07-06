const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const startIndex = content.indexOf('const renderContent = () => {');
const endIndex = content.indexOf('  return (', startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find boundaries");
    process.exit(1);
}

// Read the github-sync part to keep it intact
const githubStart = content.indexOf(') : activeMenu === \'github-sync\' ? (');
let githubSyncBlock = '';
if (githubStart !== -1) {
    let bracketCount = 0;
    let foundFirst = false;
    let i = githubStart;
    let githubEndIndex = -1;
    
    // We can just extract everything between 'github-sync\' ? (' and ') : ('
    const nextColonIndex = content.indexOf(') : (', githubStart + 20);
    if (nextColonIndex !== -1) {
        githubSyncBlock = content.substring(githubStart + 36, nextColonIndex);
    }
}

// Generate the new renderContent
const newRenderContent = `const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex items-center gap-4">
                <div className="p-4 rounded-lg bg-blue-500/10 text-blue-400"><Users size={32} /></div>
                <div><div className="text-sm text-slate-400">Total Pelanggan</div><div className="text-2xl font-bold text-white">1,248</div></div>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex items-center gap-4">
                <div className="p-4 rounded-lg bg-emerald-500/10 text-emerald-400"><CreditCard size={32} /></div>
                <div><div className="text-sm text-slate-400">Pendapatan Bulan Ini</div><div className="text-2xl font-bold text-white">Rp 45.2M</div></div>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex items-center gap-4">
                <div className="p-4 rounded-lg bg-rose-500/10 text-rose-400"><Ticket size={32} /></div>
                <div><div className="text-sm text-slate-400">Tiket Aktif</div><div className="text-2xl font-bold text-white">12</div></div>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex items-center gap-4">
                <div className="p-4 rounded-lg bg-indigo-500/10 text-indigo-400"><Router size={32} /></div>
                <div><div className="text-sm text-slate-400">Router Aktif</div><div className="text-2xl font-bold text-white">8</div></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">Aktivitas Terakhir</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3 text-sm"><div className="text-emerald-400 mt-0.5"><CheckCircle2 size={16} /></div><div><span className="text-white font-medium">Pembayaran Sukses</span> - Budi Santoso (INV-10023)<br/><span className="text-slate-500 text-xs">5 menit yang lalu</span></div></li>
                  <li className="flex gap-3 text-sm"><div className="text-rose-400 mt-0.5"><AlertCircle size={16} /></div><div><span className="text-white font-medium">Isolir Otomatis</span> - Andi Network<br/><span className="text-slate-500 text-xs">15 menit yang lalu</span></div></li>
                  <li className="flex gap-3 text-sm"><div className="text-blue-400 mt-0.5"><UserPlus size={16} /></div><div><span className="text-white font-medium">Pelanggan Baru</span> - PT. Makmur Jaya<br/><span className="text-slate-500 text-xs">1 jam yang lalu</span></div></li>
                </ul>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">Statistik Tagihan</h3>
                <div className="space-y-4">
                  <div><div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Lunas</span><span className="text-emerald-400">75%</span></div><div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-emerald-400 h-2 rounded-full" style={{width: '75%'}}></div></div></div>
                  <div><div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Belum Bayar</span><span className="text-yellow-400">20%</span></div><div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-yellow-400 h-2 rounded-full" style={{width: '20%'}}></div></div></div>
                  <div><div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Jatuh Tempo</span><span className="text-rose-400">5%</span></div><div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-rose-400 h-2 rounded-full" style={{width: '5%'}}></div></div></div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'server':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-3xl">
            <h3 className="text-lg font-bold text-white mb-6">Konfigurasi API Router Mikrotik Utama</h3>
            <form className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Nama Server</label><input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="Mikrotik Utama"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">IP Address / Host</label><input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="192.168.1.1"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">API Port</label><input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="8728"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">API Username</label><input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="api_admin"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">API Password</label><input type="password" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="*********"/></div>
              <div className="pt-4"><button type="button" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">Simpan Perubahan</button></div>
            </form>
          </div>
        );

      case 'kelola-pelanggan':
      case 'data-pelanggan':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Data Pelanggan</h3>
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Tambah Pelanggan</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Nama</th><th className="px-6 py-4">Paket</th><th className="px-6 py-4">IP Address</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 font-mono text-xs">CST-001</td><td className="px-6 py-4 text-white">Budi Santoso</td><td className="px-6 py-4">Home 20 Mbps</td><td className="px-6 py-4 font-mono">10.10.1.5</td><td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Aktif</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 font-mono text-xs">CST-002</td><td className="px-6 py-4 text-white">Siti Aminah</td><td className="px-6 py-4">Home 50 Mbps</td><td className="px-6 py-4 font-mono">10.10.1.6</td><td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Aktif</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 font-mono text-xs">CST-003</td><td className="px-6 py-4 text-white">Andi Network</td><td className="px-6 py-4">Bisnis 100 Mbps</td><td className="px-6 py-4 font-mono">10.10.2.2</td><td className="px-6 py-4"><span className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded-full text-xs">Isolir</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'wilayah':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Setting Wilayah</h3>
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Tambah Wilayah</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">Kode Wilayah</th><th className="px-6 py-4">Nama Wilayah</th><th className="px-6 py-4">Keterangan</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4">WL-01</td><td className="px-6 py-4 text-white">Kecamatan Utara</td><td className="px-6 py-4">Area Coverage Utara</td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4">WL-02</td><td className="px-6 py-4 text-white">Kecamatan Selatan</td><td className="px-6 py-4">Area Coverage Selatan</td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'odp':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Setting ODP</h3>
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Tambah ODP</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">Nama ODP</th><th className="px-6 py-4">Wilayah</th><th className="px-6 py-4">Kapasitas</th><th className="px-6 py-4">Terpakai</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 font-mono">ODP-UTR-01</td><td className="px-6 py-4">Kecamatan Utara</td><td className="px-6 py-4">16 Port</td><td className="px-6 py-4">12 Port</td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 font-mono">ODP-SEL-05</td><td className="px-6 py-4">Kecamatan Selatan</td><td className="px-6 py-4">8 Port</td><td className="px-6 py-4">8 Port <span className="text-rose-400 text-xs ml-2">(Penuh)</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'paket':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Setting Paket</h3>
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Tambah Paket</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">Nama Paket</th><th className="px-6 py-4">Kecepatan</th><th className="px-6 py-4">Harga (Rp)</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 text-white">Home Basic</td><td className="px-6 py-4 font-mono">20 Mbps</td><td className="px-6 py-4">150.000</td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 text-white">Home Pro</td><td className="px-6 py-4 font-mono">50 Mbps</td><td className="px-6 py-4">250.000</td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 text-white">Bisnis Ultimate</td><td className="px-6 py-4 font-mono">100 Mbps</td><td className="px-6 py-4">500.000</td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'pendaftaran':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Pendaftaran Online</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">Tanggal</th><th className="px-6 py-4">Nama Calon</th><th className="px-6 py-4">Alamat</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4">2026-07-05</td><td className="px-6 py-4 text-white">Rudi Hermawan</td><td className="px-6 py-4">Jl. Merdeka No 10</td><td className="px-6 py-4"><span className="text-yellow-400">Menunggu Survey</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Proses</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4">2026-07-06</td><td className="px-6 py-4 text-white">CV. Maju Terus</td><td className="px-6 py-4">Ruko Sentra Bisnis</td><td className="px-6 py-4"><span className="text-blue-400">Proses Instalasi</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Proses</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'kolektor':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Kolektor Lapangan</h3>
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Tambah Kolektor</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">Nama Kolektor</th><th className="px-6 py-4">Wilayah</th><th className="px-6 py-4">Total Tagihan Dikutip</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 text-white">Agus Lapangan</td><td className="px-6 py-4">Kecamatan Utara</td><td className="px-6 py-4 font-mono">Rp 4.500.000</td><td className="px-6 py-4"><span className="text-emerald-400">Aktif</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Detail</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 text-white">Bagas Sentosa</td><td className="px-6 py-4">Kecamatan Selatan</td><td className="px-6 py-4 font-mono">Rp 2.100.000</td><td className="px-6 py-4"><span className="text-emerald-400">Aktif</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Detail</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'komplain':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Ticket Komplain</h3>
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Buat Tiket</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">ID Tiket</th><th className="px-6 py-4">Pelanggan</th><th className="px-6 py-4">Keluhan</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 font-mono">TK-9921</td><td className="px-6 py-4 text-white">Budi Santoso</td><td className="px-6 py-4">Internet Putus-putus</td><td className="px-6 py-4"><span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Open</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Tindak Lanjuti</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 font-mono">TK-9922</td><td className="px-6 py-4 text-white">Siti Aminah</td><td className="px-6 py-4">Modem Merah (LOS)</td><td className="px-6 py-4"><span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">In Progress</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Tindak Lanjuti</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'pesan':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-3xl">
            <h3 className="text-lg font-bold text-white mb-6">Setting WhatsApp Gateway & Pesan Otomatis</h3>
            <form className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-400 mb-1">WhatsApp API Endpoint</label><input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="http://localhost:8000/send-message"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Template Tagihan Baru</label><textarea rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="Yth. *{nama}*, tagihan internet Anda sebesar *{jumlah}* sudah terbit. Harap bayar sebelum tanggal *{jatuh_tempo}*."/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Template Peringatan Isolir</label><textarea rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="Yth. *{nama}*, internet Anda telah di-isolir karena melewati batas pembayaran."/></div>
              <div className="pt-4"><button type="button" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">Simpan Perubahan</button></div>
            </form>
          </div>
        );

      case 'transaksi':
      case 'transaksi-lain':
      case 'pembayaran':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Pembayaran & Transaksi</h3>
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Proses Pembayaran</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">Invoice</th><th className="px-6 py-4">Pelanggan</th><th className="px-6 py-4">Bulan</th><th className="px-6 py-4">Total</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 font-mono text-xs">INV-202607-001</td><td className="px-6 py-4 text-white">Budi Santoso</td><td className="px-6 py-4">Juli 2026</td><td className="px-6 py-4">Rp 150.000</td><td className="px-6 py-4"><span className="text-emerald-400">Lunas</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Cetak Struk</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 font-mono text-xs">INV-202607-002</td><td className="px-6 py-4 text-white">Andi Network</td><td className="px-6 py-4">Juli 2026</td><td className="px-6 py-4">Rp 500.000</td><td className="px-6 py-4"><span className="text-rose-400">Belum Bayar</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Bayar</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'biaya-diskon':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-3xl">
            <h3 className="text-lg font-bold text-white mb-6">Konfigurasi Biaya Global & Diskon</h3>
            <form className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Pajak PPN (%)</label><input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="11"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Biaya Keterlambatan</label><input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="10000"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Biaya Pemasangan Standar</label><input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="250000"/></div>
              <div className="pt-4"><button type="button" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">Simpan Perubahan</button></div>
            </form>
          </div>
        );

      case 'laporan':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">Ringkasan Laporan Pemasukan</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-slate-950 rounded-lg text-sm text-slate-300"><span>Total Tagihan:</span> <span className="font-mono text-emerald-400">Rp 45.200.000</span></div>
                <div className="flex justify-between p-3 bg-slate-950 rounded-lg text-sm text-slate-300"><span>Lunas:</span> <span className="font-mono text-emerald-400">Rp 35.000.000</span></div>
                <div className="flex justify-between p-3 bg-slate-950 rounded-lg text-sm text-slate-300 border border-rose-900/50"><span>Tunggakan:</span> <span className="font-mono text-rose-400">Rp 10.200.000</span></div>
              </div>
              <button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-sm text-white font-medium">Export Laporan Pemasukan (Excel)</button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">Laporan Pelanggan</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-slate-950 rounded-lg text-sm text-slate-300"><span>Total Aktif:</span> <span className="font-mono text-blue-400">1,248</span></div>
                <div className="flex justify-between p-3 bg-slate-950 rounded-lg text-sm text-slate-300"><span>Terisolir:</span> <span className="font-mono text-rose-400">42</span></div>
                <div className="flex justify-between p-3 bg-slate-950 rounded-lg text-sm text-slate-300"><span>Berhenti / Terminate:</span> <span className="font-mono text-slate-400">18</span></div>
              </div>
              <button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-sm text-white font-medium">Export Laporan Pelanggan (Excel)</button>
            </div>
          </div>
        );

      case 'identitas':
      case 'sistem':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-3xl">
            <h3 className="text-lg font-bold text-white mb-6">Identitas Perusahaan & Sistem</h3>
            <form className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Nama Perusahaan (ISP)</label><input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="PT. StarBilling Network"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Alamat</label><textarea rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="Jl. Teknologi No. 42, Cyber City"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Telepon</label><input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="081234567890"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Email Bantuan</label><input type="email" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="support@starbilling.net"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Kunci Lisensi (License Key)</label><input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono" defaultValue="SB-LIFETIME-DEMO-2026"/></div>
              <div className="pt-4"><button type="button" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">Simpan Perubahan</button></div>
            </form>
          </div>
        );

      case 'bank':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Master Bank</h3>
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Tambah Rekening</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">Bank</th><th className="px-6 py-4">Nama Rekening</th><th className="px-6 py-4">Nomor Rekening</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 text-white">BCA</td><td className="px-6 py-4">PT. StarBilling Network</td><td className="px-6 py-4 font-mono">0123456789</td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 text-white">Mandiri</td><td className="px-6 py-4">PT. StarBilling Network</td><td className="px-6 py-4 font-mono">1370000123456</td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-3xl">
            <h3 className="text-lg font-bold text-white mb-6">Payment Gateway Configuration</h3>
            <form className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Tripay Merchant Code</label><input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="T12345"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Tripay API Key</label><input type="password" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="DEV-****************"/></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1">Tripay Private Key</label><input type="password" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" defaultValue="****************"/></div>
              <div className="pt-4"><button type="button" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">Simpan Perubahan</button></div>
            </form>
          </div>
        );

      case 'addon':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg"><CreditCard size={24} /></div>
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">Installed</span>
              </div>
              <h3 className="font-bold text-white mb-2">QRIS Generator</h3>
              <p className="text-sm text-slate-400 mb-4">Generate QRIS dinamis untuk pembayaran tagihan otomatis tanpa PG.</p>
              <button className="w-full bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-sm transition-colors text-white">Pengaturan</button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg"><Receipt size={24} /></div>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Installed</span>
              </div>
              <h3 className="font-bold text-white mb-2">Thermal Printer</h3>
              <p className="text-sm text-slate-400 mb-4">Cetak struk tagihan langsung ke printer thermal bluetooth/USB.</p>
              <button className="w-full bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-sm transition-colors text-white">Pengaturan</button>
            </div>
          </div>
        );

      case 'karyawan':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Data Karyawan</h3>
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Tambah Karyawan</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr><th className="px-6 py-4">Nama Karyawan</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Role (Jabatan)</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 text-white">Super Admin</td><td className="px-6 py-4">admin@starbilling.lokal</td><td className="px-6 py-4 font-bold text-blue-400">Administrator</td><td className="px-6 py-4"><span className="text-emerald-400">Aktif</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                  <tr className="hover:bg-slate-800/20"><td className="px-6 py-4 text-white">Teknisi 1</td><td className="px-6 py-4">teknisi@starbilling.lokal</td><td className="px-6 py-4">Teknisi / Lapangan</td><td className="px-6 py-4"><span className="text-emerald-400">Aktif</span></td><td className="px-6 py-4 text-right text-blue-400 cursor-pointer">Edit</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'github-sync':
        return (
          <div className="max-w-3xl">
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-slate-900 rounded-lg text-slate-300">
                    <Github size={32} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">GitHub Synchronization</h2>
                    <p className="text-slate-400 text-sm">Sinkronisasi source code dari repositori GitHub secara real-time</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-900 space-y-6">
                <div>
                  <h3 className="text-slate-300 font-medium mb-1">Repository Target</h3>
                  <div className="flex items-center gap-2 text-blue-400 font-mono text-sm bg-slate-950 p-3 rounded border border-slate-800">
                    https://github.com/bgnextlink/starsbill/
                  </div>
                </div>
                <div className="space-y-4">
                  <button 
                    onClick={() => alert('Fitur sinkronisasi GitHub akan mengambil source terbaru dari branch main...')}
                    className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    <RefreshCw size={20} />
                    Check for Updates
                  </button>
                  
                  <button 
                    onClick={() => alert('Fitur ini akan me-replace seluruh core PHP system dengan versi terbaru dari GitHub.')}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    <Github size={20} />
                    Force Sync & Replace System
                  </button>
                </div>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-200/80 text-sm">
                    <strong>Peringatan:</strong> Melakukan Force Sync akan menimpa file core sistem. Pastikan Anda telah melakukan backup database dan custom module sebelum melanjutkan proses update.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white capitalize">{activeMenu.split('-').join(' ')}</h2>
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                + Tambah Data
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Keterangan</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20">
                    <td className="px-6 py-4 font-mono text-xs">#001</td>
                    <td className="px-6 py-4 text-white">Data dummy untuk {activeMenu.split('-').join(' ')}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Aktif</span>
                    </td>
                    <td className="px-6 py-4 text-right text-blue-400 cursor-pointer hover:text-blue-300">Edit</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20">
                    <td className="px-6 py-4 font-mono text-xs">#002</td>
                    <td className="px-6 py-4 text-white">Contoh konfigurasi 2</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Aktif</span>
                    </td>
                    <td className="px-6 py-4 text-right text-blue-400 cursor-pointer hover:text-blue-300">Edit</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
    }
  };
`;

content = content.substring(0, startIndex) + newRenderContent + content.substring(endIndex);

fs.writeFileSync('src/App.tsx', content);
