const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'app', 'api');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('@/lib/supabase/auth')) {
        console.log(`Updating: ${fullPath}`);
        content = content.replace(/@\/lib\/supabase\/auth/g, '@/lib/auth-server');
        fs.writeFileSync(fullPath, content);
      }
      if (content.includes('@/lib/supabase/browser')) {
        console.log(`Updating (browser): ${fullPath}`);
        content = content.replace(/@\/lib\/supabase\/browser/g, '@/lib/auth-client');
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

walk(targetDir);
console.log('Done!');
