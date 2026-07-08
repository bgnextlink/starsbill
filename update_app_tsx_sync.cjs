const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldSync1 = `onClick={() => alert('Fitur sinkronisasi GitHub akan mengambil source terbaru dari branch main...')}
                    className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"`;

const newSync1 = `onClick={() => {
                      const btn = document.getElementById('sync-btn-1');
                      if (btn) btn.innerHTML = '<span class="animate-spin mr-2">↻</span> Sedang Sinkronisasi...';
                      setTimeout(() => {
                        if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg> Check for Updates';
                        alert('Simulasi: Berhasil terhubung ke repositori GitHub. Pada mode localhost/PHP, sistem akan menjalankan perintah git pull origin main.');
                      }, 2000);
                    }}
                    id="sync-btn-1"
                    className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"`;

const oldSync2 = `onClick={() => alert('Fitur ini akan me-replace seluruh core PHP system dengan versi terbaru dari GitHub.')}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"`;

const newSync2 = `onClick={() => {
                      const btn = document.getElementById('sync-btn-2');
                      if (btn) btn.innerHTML = '<span class="animate-spin mr-2">↻</span> Force Syncing...';
                      setTimeout(() => {
                        if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg> Force Sync & Replace System';
                        alert('Simulasi: Source Code Core telah di-replace secara paksa dari branch main GitHub. Pada localhost/cPanel, sistem akan menjalankan git fetch --all && git reset --hard origin/main.');
                      }, 2500);
                    }}
                    id="sync-btn-2"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"`;

if (content.includes("onClick={() => alert('Fitur sinkronisasi GitHub")) {
    content = content.replace(oldSync1, newSync1);
    content = content.replace(oldSync2, newSync2);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Updated App.tsx");
} else {
    console.log("Could not find the target string in App.tsx");
}
