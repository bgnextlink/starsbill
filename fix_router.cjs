const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Update imports
if (!appContent.includes('Plus,')) {
    appContent = appContent.replace("} from 'lucide-react';", "Plus, Edit, Trash2 } from 'lucide-react';");
}

const oldRouterAppRegex = /case 'router-mikrotik':[\s\S]*?(?=\n\s*case 'genieacs':)/;

const newRouterApp = `case 'router-mikrotik':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-lg">Router Mikrotik</h3>
                <p className="text-slate-400 text-sm mt-1">Daftar koneksi Router Mikrotik yang terhubung dengan sistem</p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                <Plus size={18} /> Tambah Router
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">No</th>
                    <th className="px-6 py-4">Koneksi</th>
                    <th className="px-6 py-4">Auto Isolir</th>
                    <th className="px-6 py-4">Aksi Isolir</th>
                    <th className="px-6 py-4">Profile</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Mode Aktif</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className="hover:bg-slate-800/20">
                    <td className="px-6 py-4">1</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">Mikrotik Utama</div>
                      <div className="text-xs text-slate-500">192.168.1.1:8728</div>
                    </td>
                    <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs">Aktif</span></td>
                    <td className="px-6 py-4">Disable Secret</td>
                    <td className="px-6 py-4">PPPoE</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs">Connected</span></td>
                    <td className="px-6 py-4">API</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-blue-400 hover:bg-blue-400/10 rounded transition-colors" title="Edit"><Edit size={16} /></button>
                        <button className="p-2 text-rose-400 hover:bg-rose-400/10 rounded transition-colors" title="Hapus"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );`;

appContent = appContent.replace(oldRouterAppRegex, newRouterApp + '\n');
fs.writeFileSync('src/App.tsx', appContent);
console.log("App.tsx router mikrotik updated");

let phpContent = fs.readFileSync('generate_admin_php.cjs', 'utf8');

const oldRouterPHPRegex = /<\?php elseif \(\$active_menu === 'Router Mikrotik' \|\| \$active_menu === 'Setting Server'\): \?>[\s\S]*?(?=<\?php elseif \(\$active_menu === 'GenieACS'\): \?>)/;

const newRouterPHP = `<?php elseif ($active_menu === 'Router Mikrotik' || $active_menu === 'Setting Server'): ?>
                <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div class="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 class="font-bold text-white text-lg">Router Mikrotik</h3>
                            <p class="text-slate-400 text-sm mt-1">Daftar koneksi Router Mikrotik yang terhubung dengan sistem</p>
                        </div>
                        <button class="shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                            <i class="fas fa-plus"></i> Tambah Router
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                                <tr>
                                    <th class="px-6 py-4 whitespace-nowrap">No</th>
                                    <th class="px-6 py-4 whitespace-nowrap">Koneksi</th>
                                    <th class="px-6 py-4 whitespace-nowrap">Auto Isolir</th>
                                    <th class="px-6 py-4 whitespace-nowrap">Aksi Isolir</th>
                                    <th class="px-6 py-4 whitespace-nowrap">Profile</th>
                                    <th class="px-6 py-4 whitespace-nowrap">Status</th>
                                    <th class="px-6 py-4 whitespace-nowrap">Mode Aktif</th>
                                    <th class="px-6 py-4 whitespace-nowrap text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800/50 text-slate-300">
                                <tr class="hover:bg-slate-800/20">
                                    <td class="px-6 py-4">1</td>
                                    <td class="px-6 py-4">
                                        <div class="font-medium text-white whitespace-nowrap">Mikrotik Utama</div>
                                        <div class="text-xs text-slate-500 whitespace-nowrap">192.168.1.1:8728</div>
                                    </td>
                                    <td class="px-6 py-4"><span class="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs whitespace-nowrap">Aktif</span></td>
                                    <td class="px-6 py-4 whitespace-nowrap">Disable Secret</td>
                                    <td class="px-6 py-4 whitespace-nowrap">PPPoE</td>
                                    <td class="px-6 py-4"><span class="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs whitespace-nowrap">Connected</span></td>
                                    <td class="px-6 py-4 whitespace-nowrap">API</td>
                                    <td class="px-6 py-4 text-right">
                                        <div class="flex items-center justify-end gap-2">
                                            <button class="p-2 text-blue-400 hover:bg-blue-400/10 rounded transition-colors" title="Edit"><i class="fas fa-edit"></i></button>
                                            <button class="p-2 text-rose-400 hover:bg-rose-400/10 rounded transition-colors" title="Hapus"><i class="fas fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

if (phpContent.match(oldRouterPHPRegex)) {
    phpContent = phpContent.replace(oldRouterPHPRegex, newRouterPHP);
    fs.writeFileSync('generate_admin_php.cjs', phpContent);
    console.log("generate_admin_php.cjs router mikrotik updated");
} else {
    console.log("Could not find Router Mikrotik section in generate_admin_php.cjs");
}
