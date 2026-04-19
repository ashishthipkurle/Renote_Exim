const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('route.ts') || file.endsWith('route.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'client', 'app', 'api'));
let updated = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('force-dynamic')) {
        fs.writeFileSync(file, 'export const dynamic = "force-dynamic";\n' + content);
        console.log('Updated ' + file);
        updated++;
    }
});

console.log('Done! Updated ' + updated + ' routes.');
