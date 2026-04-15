const fs = require('fs');
const path = require('path');

function replaceCompanyName(dir) {
    let count = 0;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            count += replaceCompanyName(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('companyName')) {
                const newContent = content.replace(/companyName/g, 'businessName');
                fs.writeFileSync(fullPath, newContent, 'utf8');
                count++;
            }
        }
    }
    return count;
}

function main() {
    let count = 0;
    count += replaceCompanyName('./app');
    count += replaceCompanyName('./components');
    console.log(`Successfully replaced 'companyName' with 'businessName' in ${count} files.`);
}

main();
