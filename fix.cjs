const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/activeMenu\.replace\(\/-\/g, ' '\)/g, "activeMenu.split('-').join(' ')");

fs.writeFileSync('src/App.tsx', content);
