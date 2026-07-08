const fs = require('fs');
let content = fs.readFileSync('generate_admin_php.cjs', 'utf8');

// Replace all combinations with alert(&quot;...&quot;)
content = content.replace(
    /onclick="alert\([^)]+\)"/g,
    'onclick="alert(&quot;Fitur ini masih dalam tahap pengembangan!&quot;)"'
);

fs.writeFileSync('generate_admin_php.cjs', content);
