const fs = require('fs');

// 1. Update src/App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Replace navItems
const oldNavServer = `{ id: 'server', label: 'Setting Server', icon: Server },`;
const newNavServer = `{
      id: 'server',
      label: 'Setting Server',
      icon: Server,
      subItems: [
        { id: 'router-mikrotik', label: 'Router Mikrotik', icon: Router },
        { id: 'genieacs', label: 'GenieACS', icon: Server },
        { id: 'import-data', label: 'Import Data', icon: ArrowRightLeft },
      ]
    },`;

if (appContent.includes(oldNavServer)) {
    appContent = appContent.replace(oldNavServer, newNavServer);
}

// Ensure expandedMenus includes 'server'
if (appContent.includes(`const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({`)) {
    if (!appContent.includes(`'server': false`)) {
        appContent = appContent.replace(`'members': true,`, `'server': false,\n    'members': true,`);
    }
}

// Replace case 'server': with three cases
const oldCaseServerRegex = /case 'server':[\s\S]*?(?=\n\s*case 'kelola-pelanggan':)/;

const newCaseServer = `case 'router-mikrotik':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-3xl">
            <h3 className="text-lg font-bold text-white mb-6">Konfigurasi API Router Mikrotik Utama</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nama Server</label>
                <input type="text" defaultValue="Mikrotik Utama" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">IP Address / Host</label>
                <input type="text" defaultValue="192.168.1.1" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">API Port</label>
                  <input type="number" defaultValue="8728" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">API Username</label>
                  <input type="text" defaultValue="api_admin" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">API Password</label>
                <input type="password" defaultValue="*********" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="pt-4">
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                  Simpan Konfigurasi
                </button>
              </div>
            </div>
          </div>
        );
      case 'genieacs':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-3xl">
            <h3 className="text-lg font-bold text-white mb-6">Konfigurasi GenieACS</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">URL GenieACS NBI</label>
                <input type="text" placeholder="http://10.10.10.10:7557" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">GenieACS Username (Opsional)</label>
                <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">GenieACS Password (Opsional)</label>
                <input type="password" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="pt-4">
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                  Test Connection & Save
                </button>
              </div>
            </div>
          </div>
        );
      case 'import-data':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-3xl">
            <h3 className="text-lg font-bold text-white mb-6">Import Data Pelanggan / Sistem</h3>
            <div className="space-y-6">
              <div className="p-4 border border-dashed border-slate-700 rounded-lg bg-slate-950 text-center">
                <ArrowRightLeft className="mx-auto text-slate-500 mb-2" size={32} />
                <p className="text-sm text-slate-400 mb-4">Upload file Excel (.xlsx, .csv) untuk mengimpor data pelanggan secara massal.</p>
                <input type="file" className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="bg-slate-800 hover:bg-slate-700 cursor-pointer text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  Pilih File Data
                </label>
              </div>
              <div>
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors">
                  Mulai Import Data
                </button>
              </div>
            </div>
          </div>
        );`;

appContent = appContent.replace(oldCaseServerRegex, newCaseServer + '\n');
fs.writeFileSync('src/App.tsx', appContent);
console.log("App.tsx updated");

// 2. Update generate_admin_php.cjs
let phpContent = fs.readFileSync('generate_admin_php.cjs', 'utf8');

const oldMenusPHP = `'Dashboard',
    'Setting Server',
    'Members & Billing'`;

const newMenusPHP = `'Dashboard',
    'Setting Server' => [
        'Router Mikrotik',
        'GenieACS',
        'Import Data'
    ],
    'Members & Billing'`;

if (phpContent.includes(oldMenusPHP)) {
    phpContent = phpContent.replace(oldMenusPHP, newMenusPHP);
}

const oldCaseServerPHP = `<?php elseif ($active_menu === 'Setting Server'): ?>
                <?= renderForm([
                    ['label' => 'Nama Server', 'type' => 'text', 'value' => 'Mikrotik Utama'],
                    ['label' => 'IP Address / Host', 'type' => 'text', 'value' => '192.168.1.1'],
                    ['label' => 'API Port', 'type' => 'number', 'value' => '8728'],
                    ['label' => 'API Username', 'type' => 'text', 'value' => 'api_admin'],
                    ['label' => 'API Password', 'type' => 'password', 'value' => '*********']
                ], 'Koneksi RouterOS') ?>`;

const newCaseServerPHP = `<?php elseif ($active_menu === 'Router Mikrotik' || $active_menu === 'Setting Server'): ?>
                <?= renderForm([
                    ['label' => 'Nama Server', 'type' => 'text', 'value' => 'Mikrotik Utama'],
                    ['label' => 'IP Address / Host', 'type' => 'text', 'value' => '192.168.1.1'],
                    ['label' => 'API Port', 'type' => 'number', 'value' => '8728'],
                    ['label' => 'API Username', 'type' => 'text', 'value' => 'api_admin'],
                    ['label' => 'API Password', 'type' => 'password', 'value' => '*********']
                ], 'Koneksi RouterOS') ?>
            <?php elseif ($active_menu === 'GenieACS'): ?>
                <?= renderForm([
                    ['label' => 'URL GenieACS NBI', 'type' => 'text', 'value' => 'http://10.10.10.10:7557'],
                    ['label' => 'GenieACS Username (Opsional)', 'type' => 'text', 'value' => ''],
                    ['label' => 'GenieACS Password (Opsional)', 'type' => 'password', 'value' => '']
                ], 'Konfigurasi GenieACS') ?>
            <?php elseif ($active_menu === 'Import Data'): ?>
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl">
                    <h3 class="font-bold mb-6 text-lg text-white">Import Data Pelanggan / Sistem</h3>
                    <div class="p-6 border border-dashed border-slate-700 rounded-lg bg-slate-950 text-center mb-6">
                        <i class="fas fa-file-excel text-3xl text-slate-500 mb-4"></i>
                        <p class="text-sm text-slate-400 mb-4">Upload file Excel (.xlsx, .csv) untuk mengimpor data pelanggan secara massal.</p>
                        <button class="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">Pilih File Data</button>
                    </div>
                    <button class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors">Mulai Import Data</button>
                </div>`;

phpContent = phpContent.replace(oldCaseServerPHP, newCaseServerPHP);

fs.writeFileSync('generate_admin_php.cjs', phpContent);
console.log("generate_admin_php.cjs updated");
