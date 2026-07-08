const fs = require('fs');
let content = fs.readFileSync('generate_admin_php.cjs', 'utf8');

// The issue is only inside $html .= '...'
// Replace <button onclick="alert('Fitur...')" with <button onclick="alert(\\'Fitur...\\')"
// We'll just replace alert('Fitur ini masih dalam tahap pengembangan!') with alert(\\'Fitur ini masih dalam tahap pengembangan!\\') where it's inside single quotes.

content = content.replace(
    /onclick="alert\(\\'Fitur ini masih dalam tahap pengembangan!\\'\)"/g,
    'onclick="alert(\\\\\'Fitur ini masih dalam tahap pengembangan!\\\\')" '
);

content = content.replace(
    /onclick="alert\('Fitur ini masih dalam tahap pengembangan!'\)"/g,
    'onclick="alert(\\\\\'Fitur ini masih dalam tahap pengembangan!\\\\')" '
);

fs.writeFileSync('generate_admin_php.cjs', content);
