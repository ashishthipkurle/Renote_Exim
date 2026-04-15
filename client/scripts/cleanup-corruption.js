const fs = require('fs');
const path = 'app/dashboard/importer/inventory/page.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// We know the corruption is between the MarketplaceProductCard and WishlistCard.
// MarketplaceProductCard ends at line 457 (1-indexed).
// WishlistCard starts around line 468.
// We want to delete the lines in between that are not empty correctly.

const startDelete = 457; // Just after the brace at 457
const endDelete = 466;   // Just before WishlistCard title

// Let's find the closing brace of the refined card and the start of the next component.
const newLines = [];
let insideCorruptedZone = false;

for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    // The previous component ends at "}\r" or "}"
    if (lineNum > 457 && lineNum < 467) {
        // Skip these lines
        continue;
    }
    newLines.push(lines[i]);
}

fs.writeFileSync(path, newLines.join('\n'));
console.log("Cleaned up corrupted code in Importer Inventory page.");
