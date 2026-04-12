const fs = require('fs');
const path = require('path');

function fixSwallowedComments(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Pattern to find // followed by anything but a newline, then a JS/TS keyword
    const pattern = /\/\/(.*?)[^\n]\s+(const|let|var|if|for|while|return|export|import|function|class|await|prisma|Promise|axios|router|toast)\b/g;
    
    let newContent = content;
    // We just insert a newline before the keyword if it was swallowed
    let match;
    let modified = false;
    
    // More precise replacement string regex
    // Looks for // some comment text const ...
    // and replaces it with // some comment text\nconst ...
    
    const replacer = (match, group1, group2) => {
        // If there is already a newline in the matched string somehow, skip it
        if (match.includes('\n')) {
            return match;
        }
        modified = true;
        return `//${group1}\n${group2}`;
    };
    
    newContent = newContent.replace(pattern, replacer);
    
    if (modified && newContent !== content) {
        fs.writeFileSync(filepath, newContent, 'utf8');
        console.log(`Fixed comments in: ${filepath}`);
        return true;
    }
    return false;
}

function traverseAndFix(dir) {
    let count = 0;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            count += traverseAndFix(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            if (fixSwallowedComments(fullPath)) {
                count++;
            }
        }
    }
    return count;
}

function main() {
    let count = 0;
    count += traverseAndFix('./app');
    count += traverseAndFix('./components');
    console.log(`Total files repaired: ${count}`);
}

main();
