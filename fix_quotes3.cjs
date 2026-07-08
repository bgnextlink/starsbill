const fs = require('fs');
let content = fs.readFileSync('generate_admin_php.cjs', 'utf8');

content = content.replace(
    /onclick="alert\(\\'Fitur ini masih dalam tahap pengembangan!\\'\)"/g,
    "onclick=\"alert(\\\\'Fitur ini masih dalam tahap pengembangan!\\\\')\""
);

content = content.replace(
    /onclick="alert\('Fitur ini masih dalam tahap pengembangan!'\)"/g,
    "onclick=\"alert(\\\\'Fitur ini masih dalam tahap pengembangan!\\\\')\""
);

fs.writeFileSync('generate_admin_php.cjs', content);
