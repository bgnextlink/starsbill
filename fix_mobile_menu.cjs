const fs = require('fs');
let content = fs.readFileSync('generate_admin_php.cjs', 'utf8');

// 1. Update aside
content = content.replace(
    '<aside class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-y-auto hidden md:flex">',
    '<aside id="sidebar" class="w-64 bg-slate-900 border-r border-slate-800 flex-col h-full overflow-y-auto hidden md:flex absolute md:relative z-50">'
);

// 2. Add overlay before aside
content = content.replace(
    '<!-- Sidebar -->',
    '<!-- Mobile Overlay -->\n    <div id="sidebar-overlay" onclick="document.getElementById(\'sidebar\').classList.add(\'hidden\'); document.getElementById(\'sidebar\').classList.remove(\'flex\'); this.classList.add(\'hidden\')" class="fixed inset-0 bg-black/50 z-40 hidden md:hidden"></div>\n\n    <!-- Sidebar -->'
);

// 3. Update the toggle button
content = content.replace(
    '<button class="md:hidden text-slate-400 hover:text-white"><i class="fas fa-bars"></i></button>',
    '<button onclick="document.getElementById(\'sidebar\').classList.toggle(\'hidden\'); document.getElementById(\'sidebar\').classList.toggle(\'flex\'); document.getElementById(\'sidebar-overlay\').classList.toggle(\'hidden\')" class="md:hidden text-slate-400 hover:text-white"><i class="fas fa-bars"></i></button>'
);

fs.writeFileSync('generate_admin_php.cjs', content);
console.log("generate_admin_php.cjs updated with mobile menu toggle");
