const fs = require('fs');
let content = fs.readFileSync('generate_admin_php.cjs', 'utf8');

const oldDashboardPHP = `<?php if ($active_menu === 'Dashboard'): ?>
                <!-- Same dashboard content -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div class="text-slate-400 text-sm mb-1">Total Pelanggan</div>
                        <div class="text-2xl font-bold text-blue-400">1,248</div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div class="text-slate-400 text-sm mb-1">Pendapatan Bulan Ini</div>
                        <div class="text-2xl font-bold text-emerald-400">Rp 45.2M</div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div class="text-slate-400 text-sm mb-1">Tiket Aktif</div>
                        <div class="text-2xl font-bold text-rose-400">12</div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div class="text-slate-400 text-sm mb-1">Router Aktif</div>
                        <div class="text-2xl font-bold text-indigo-400">8</div>
                    </div>
                </div>`;

const newDashboardPHP = `<?php if ($active_menu === 'Dashboard'): ?>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center">
                        <div class="text-slate-400 text-sm mb-2">PPP Screets</div>
                        <div class="text-4xl font-bold text-white">0</div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center">
                        <div class="text-slate-400 text-sm mb-2">PPP Online</div>
                        <div class="text-4xl font-bold text-emerald-400">0</div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center">
                        <div class="text-slate-400 text-sm mb-2">PPP Offline</div>
                        <div class="text-4xl font-bold text-rose-400">0</div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 class="font-bold text-white mb-4">Pendapatan vs Pengeluaran</h3>
                        <div class="h-48 flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg">
                            [Grafik Pendapatan vs Pengeluaran]
                        </div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="font-bold text-white">Metode Pembayaran</h3>
                            <div class="text-right">
                                <div class="text-xs text-slate-400">Periode</div>
                                <div class="text-sm font-medium text-blue-400">01-07-2026 s/d 09-07-2026</div>
                                <div class="text-xs text-slate-400 mt-1">25 Transaksi</div>
                            </div>
                        </div>
                        <div class="h-36 flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg">
                            [Grafik Metode Pembayaran]
                        </div>
                    </div>
                </div>

                <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
                    <div class="p-6 border-b border-slate-800">
                        <h3 class="font-bold text-white text-lg">Status Pelanggan</h3>
                        <p class="text-slate-400 text-sm mt-1">Daftar Pelanggan Layanan Belum Terpasang atau belum aktif</p>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                                <tr>
                                    <th class="px-6 py-4">No</th>
                                    <th class="px-6 py-4">Nama</th>
                                    <th class="px-6 py-4">Telp / Wa</th>
                                    <th class="px-6 py-4">Alamat</th>
                                    <th class="px-6 py-4">Area</th>
                                    <th class="px-6 py-4">Paket</th>
                                    <th class="px-6 py-4">Tarif</th>
                                    <th class="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800/50 text-slate-300">
                                <tr class="hover:bg-slate-800/20">
                                    <td colspan="8" class="px-6 py-8 text-center text-slate-500">
                                        Tidak ada data pelanggan yang belum terpasang/aktif
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>`;

if (content.includes("<?php if ($active_menu === 'Dashboard'): ?>")) {
    content = content.replace(oldDashboardPHP, newDashboardPHP);
    fs.writeFileSync('generate_admin_php.cjs', content);
    console.log("generate_admin_php.cjs updated");
} else {
    console.log("Could not find Dashboard section in generate_admin_php.cjs");
}
