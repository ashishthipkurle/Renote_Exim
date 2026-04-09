const fs = require('fs');
const path = require('path');

const dirsToScan = ['app', 'components', 'lib'];
const rootDir = path.join(__dirname, '..');

function walk(dir) {
  if (dir.includes('lib' + path.sep + 'supabase')) return; // Skip the directory we are deleting

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      if (content.includes('@/lib/supabase/auth')) {
        console.log(`Updating (auth): ${fullPath}`);
        content = content.replace(/@\/lib\/supabase\/auth/g, '@/lib/auth-server');
        changed = true;
      }
      if (content.includes('@/lib/supabase/browser')) {
        console.log(`Updating (browser client): ${fullPath}`);
        content = content.replace(/@\/lib\/supabase\/browser/g, '@/lib/auth-client');
        changed = true;
      }
      if (content.includes('@/lib/supabase/shared')) {
        console.log(`Updating (shared): ${fullPath}`);
        content = content.replace(/@\/lib\/supabase\/shared/g, '@/lib/auth-client');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

for (const d of dirsToScan) {
    const dirPath = path.join(rootDir, d);
    if (fs.existsSync(dirPath)) {
        walk(dirPath);
    }
}

console.log('Global Refactor Done!');
