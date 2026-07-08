const fs = require('fs');

function addAlertToButtons(filePath, isReact) {
    let content = fs.readFileSync(filePath, 'utf8');
    const alertCode = isReact 
        ? " onClick={() => alert('Fitur ini masih dalam tahap pengembangan!')}"
        : " onclick=\"alert('Fitur ini masih dalam tahap pengembangan!')\"";

    // Regex to match <button ...> tag and ensuring it doesn't already have onClick or onclick
    const buttonRegex = /<button(?![^>]*\bon[cC]lick\b)([^>]*)>/g;
    
    content = content.replace(buttonRegex, (match, p1) => {
        // Skip some specific buttons like the menu toggle which we might have missed or has special logic
        if (p1.includes('id="btn-sync"') || p1.includes('this.nextElementSibling.classList.toggle')) {
            return match;
        }
        return `<button${alertCode}${p1}>`;
    });

    fs.writeFileSync(filePath, content);
    console.log(`Updated buttons in ${filePath}`);
}

addAlertToButtons('src/App.tsx', true);
addAlertToButtons('generate_admin_php.cjs', false);
