const fs = require('fs');
const path = require('path');

const dirs = [
  'admin', 'docs', 'install', 'pages_template', 'qrcode', 'scan', 'system', 'ui'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, 'index.php'), `<?php\n// ${dir} module\necho "Module ${dir}";\n`);
});

const files = {
  'index.php': `<?php
require 'init.php';
echo "Welcome to StarBilling ISP Suite";
`,
  'init.php': `<?php
// Core initialization
session_start();
`,
  'radius.php': `<?php
// Radius server integration
`,
  'update.php': `<?php
// Auto-update script
`,
  'config.sample.php': `<?php
$db_host = 'localhost';
$db_user = 'app_admin';
$db_pass = 'v%HB3JOrP^1jD*sE';
$db_name = 'app_starbill';
`,
  'README.md': `# StarBilling ISP Suite\nProfessional ISP Billing System.\n`,
  'version.json': `{\n  "version": "1.0.0"\n}`,
  'composer.json': `{\n  "name": "starbilling/core",\n  "require": {\n    "php": "^8.2"\n  }\n}`
};

for (const [file, content] of Object.entries(files)) {
  fs.writeFileSync(file, content);
}

console.log("PHP files generated.");
