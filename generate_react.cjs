const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
          {/* Default fallback for menus to show they are functional */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white capitalize">{activeMenu.replace(/-/g, ' ')}</h2>
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                + Tambah Data
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Keterangan</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  <tr className="hover:bg-slate-700/20">
                    <td className="px-6 py-4 font-mono text-slate-300">#001</td>
                    <td className="px-6 py-4 text-slate-200">Data dummy untuk {activeMenu.replace(/-/g, ' ')}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Aktif</span>
                    </td>
                    <td className="px-6 py-4 text-right text-blue-400 cursor-pointer hover:text-blue-300">Edit</td>
                  </tr>
                  <tr className="hover:bg-slate-700/20">
                    <td className="px-6 py-4 font-mono text-slate-300">#002</td>
                    <td className="px-6 py-4 text-slate-200">Contoh konfigurasi 2</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Aktif</span>
                    </td>
                    <td className="px-6 py-4 text-right text-blue-400 cursor-pointer hover:text-blue-300">Edit</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
`;

content = content.replace(
  /<div className="bg-slate-800 rounded-xl border border-slate-700 p-6 min-h-\[600px\] flex items-center justify-center">[\s\S]*?<\/div>\s*<\/div>\s*\)\}/m,
  replacement + '        )}\n'
);

fs.writeFileSync('src/App.tsx', content);
