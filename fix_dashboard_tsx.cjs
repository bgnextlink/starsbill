const fs = require('fs');

const appFile = 'src/App.tsx';
let content = fs.readFileSync(appFile, 'utf8');

const dashboardRegex = /case 'dashboard':[\s\S]*?(?=\n\s*case 'server':)/;

const newDashboardContent = `case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                <div className="text-sm text-slate-400 mb-2">PPP Screets</div>
                <div className="text-4xl font-bold text-white">0</div>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                <div className="text-sm text-slate-400 mb-2">PPP Online</div>
                <div className="text-4xl font-bold text-emerald-400">0</div>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                <div className="text-sm text-slate-400 mb-2">PPP Offline</div>
                <div className="text-4xl font-bold text-rose-400">0</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">Pendapatan vs Pengeluaran</h3>
                <div className="h-48 flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg">
                  [Grafik Pendapatan vs Pengeluaran]
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-white">Metode Pembayaran</h3>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Periode</div>
                    <div className="text-sm font-medium text-blue-400">01-07-2026 s/d 09-07-2026</div>
                    <div className="text-xs text-slate-400 mt-1">25 Transaksi</div>
                  </div>
                </div>
                <div className="h-36 flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg">
                  [Grafik Metode Pembayaran]
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
              <div className="p-6 border-b border-slate-800">
                <h3 className="font-bold text-white text-lg">Status Pelanggan</h3>
                <p className="text-slate-400 text-sm mt-1">Daftar Pelanggan Layanan Belum Terpasang atau belum aktif</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">No</th>
                      <th className="px-6 py-4">Nama</th>
                      <th className="px-6 py-4">Telp / Wa</th>
                      <th className="px-6 py-4">Alamat</th>
                      <th className="px-6 py-4">Area</th>
                      <th className="px-6 py-4">Paket</th>
                      <th className="px-6 py-4">Tarif</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    <tr className="hover:bg-slate-800/20">
                      <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                        Tidak ada data pelanggan yang belum terpasang/aktif
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );`;

content = content.replace(dashboardRegex, newDashboardContent + '\n\n');
fs.writeFileSync(appFile, content);
console.log("App.tsx updated!");
