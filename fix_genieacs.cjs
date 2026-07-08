const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

if (!appContent.includes('Search,')) {
    appContent = appContent.replace("} from 'lucide-react';", "Search } from 'lucide-react';");
}

const oldGenieAppRegex = /case 'genieacs':[\s\S]*?(?=\n\s*case 'import-data':)/;

const newGenieApp = `case 'genieacs':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-lg">Devices List</h3>
                <p className="text-slate-400 text-sm mt-1">Daftar perangkat GenieACS yang terhubung</p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm">
                <Settings2 size={16} /> Konfigurasi
              </button>
            </div>
            
            <div className="p-6 border-b border-slate-800 bg-slate-950/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Cari Berdasarkan</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="all">SEMUA</option>
                    <option value="mac">MAC Address</option>
                    <option value="serial">Serial Number</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Pencarian</label>
                  <div className="relative">
                    <input type="text" placeholder="Masukkan Kata Kunci Pencarian" className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Device Status</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="all">SEMUA</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">No</th>
                    <th className="px-6 py-4">Device Status</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Last Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20">
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Tidak ada data perangkat ditemukan
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );`;

appContent = appContent.replace(oldGenieAppRegex, newGenieApp);
fs.writeFileSync('src/App.tsx', appContent);
console.log("App.tsx genieacs updated");

let phpContent = fs.readFileSync('generate_admin_php.cjs', 'utf8');

const oldGeniePHPRegex = /<\?php elseif \(\$active_menu === 'GenieACS'\): \?>[\s\S]*?(?=<\?php elseif \(\$active_menu === 'Import Data'\): \?>)/;

const newGeniePHP = `<?php elseif ($active_menu === 'GenieACS'): ?>
                <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div class="p-6 border-b border-slate-800 flex justify-between items-center">
                        <div>
                            <h3 class="font-bold text-white text-lg">Devices List</h3>
                            <p class="text-slate-400 text-sm mt-1">Daftar perangkat GenieACS yang terhubung</p>
                        </div>
                        <button class="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm">
                            <i class="fas fa-cog"></i> Konfigurasi
                        </button>
                    </div>
                    
                    <div class="p-6 border-b border-slate-800 bg-slate-950/30">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label class="block text-sm font-medium text-slate-400 mb-1">Cari Berdasarkan</label>
                                <select class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                                    <option value="all">SEMUA</option>
                                    <option value="mac">MAC Address</option>
                                    <option value="serial">Serial Number</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-400 mb-1">Pencarian</label>
                                <div class="relative">
                                    <input type="text" placeholder="Masukkan Kata Kunci Pencarian" class="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                                    <i class="fas fa-search absolute left-3 top-3 text-slate-500"></i>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-400 mb-1">Device Status</label>
                                <select class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                                    <option value="all">SEMUA</option>
                                    <option value="online">Online</option>
                                    <option value="offline">Offline</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                                <tr>
                                    <th class="px-6 py-4">No</th>
                                    <th class="px-6 py-4">Device Status</th>
                                    <th class="px-6 py-4">Product</th>
                                    <th class="px-6 py-4">Last Update</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800/50 text-slate-300">
                                <tr class="hover:bg-slate-800/20">
                                    <td colspan="4" class="px-6 py-8 text-center text-slate-500">
                                        Tidak ada data perangkat ditemukan
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

if (phpContent.match(oldGeniePHPRegex)) {
    phpContent = phpContent.replace(oldGeniePHPRegex, newGeniePHP);
    fs.writeFileSync('generate_admin_php.cjs', phpContent);
    console.log("generate_admin_php.cjs genieacs updated");
} else {
    console.log("Could not find GenieACS section in generate_admin_php.cjs");
}
