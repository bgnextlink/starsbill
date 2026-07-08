const fs = require('fs');

// 1. Update src/App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const oldSistemSettingApp = `{
      id: 'sistem-setting',
      label: 'Sistem Setting',
      icon: Settings2,
      subItems: [
        { id: 'sistem-identitas', label: 'Identitas', icon: Settings2 },
        { id: 'sistem-widget', label: 'Widget', icon: Settings2 },
        { id: 'sistem-riset', label: 'Riset Ulang Isolir', icon: Settings2 },
        { id: 'sistem-lisensi', label: 'Lisensi', icon: Settings2 },
      ]
    },
    { id: 'github-sync', label: 'Update & GitHub Sync', icon: Github }`;

const newSistemSettingApp = `{
      id: 'sistem-setting',
      label: 'Sistem Setting',
      icon: Settings2,
      subItems: [
        { id: 'sistem-identitas', label: 'Identitas', icon: Settings2 },
        { id: 'sistem-widget', label: 'Widget', icon: Settings2 },
        { id: 'sistem-riset', label: 'Riset Ulang Isolir', icon: Settings2 },
        { id: 'sistem-lisensi', label: 'Lisensi', icon: Settings2 },
        { id: 'github-sync', label: 'Update', icon: Github },
      ]
    }`;

if (appContent.includes(oldSistemSettingApp)) {
    appContent = appContent.replace(oldSistemSettingApp, newSistemSettingApp);
    fs.writeFileSync('src/App.tsx', appContent);
    console.log("App.tsx menus updated");
} else {
    console.log("Could not find old sistem setting menu in App.tsx");
}

// 2. Update generate_admin_php.cjs
let phpContent = fs.readFileSync('generate_admin_php.cjs', 'utf8');

const oldSistemSettingPHP = `'Sistem Setting' => [
        'Identitas',
        'Widget',
        'Riset Ulang Isolir',
        'Lisensi'
    ],
    'Update & GitHub Sync'`;

const newSistemSettingPHP = `'Sistem Setting' => [
        'Identitas',
        'Widget',
        'Riset Ulang Isolir',
        'Lisensi',
        'Update'
    ]`;

if (phpContent.includes(oldSistemSettingPHP)) {
    phpContent = phpContent.replace(oldSistemSettingPHP, newSistemSettingPHP);
    
    // Also replace the active_menu check in phpContent
    phpContent = phpContent.replace("<?php elseif ($active_menu === 'Update & GitHub Sync'): ?>", "<?php elseif ($active_menu === 'Update'): ?>");
    
    fs.writeFileSync('generate_admin_php.cjs', phpContent);
    console.log("generate_admin_php.cjs menus updated");
} else {
    console.log("Could not find old sistem setting menu in generate_admin_php.cjs");
}
