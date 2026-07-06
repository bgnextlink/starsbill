const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>StarBilling ISP Suite</title>
                <style>
                    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                    .card { background: #1e293b; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: center; max-width: 500px; }
                    h1 { margin-top: 0; color: #38bdf8; }
                    p { color: #94a3b8; line-height: 1.5; }
                    .btn { display: inline-block; background: #38bdf8; color: #0f172a; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 1rem; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>StarBilling ISP Suite</h1>
                    <p>Proyek backend PHP telah berhasil di-generate sesuai permintaan struktur (tanpa folder src, vite, dll).</p>
                    <p>Lingkungan preview ini tidak memiliki PHP terinstall, sehingga kode PHP tidak dapat dijalankan langsung di sini.</p>
                    <p>Silakan klik <strong>Export to ZIP</strong> melalui menu AI Studio untuk mengunduh source code murni PHP ini, lalu jalankan di server lokal (XAMPP/Laragon) Anda.</p>
                </div>
            </body>
        </html>
    `);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Preview server running on port ${PORT}`);
});
