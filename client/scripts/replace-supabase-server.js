const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let files = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { files = files.concat(walkDir(file)); }
    else if (file.endsWith('.tsx') || file.endsWith('.ts')) { files.push(file); }
  });
  return files;
}

const files = walkDir(path.join(process.cwd(), 'app'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('@/lib/supabase/server') || content.includes('getServerAuth')) {
    content = content.replace(/@\/lib\/supabase\/server/g, '@/lib/auth-server');
    content = content.replace(/getServerAuth\(/g, 'getServerAuthContext(');
    content = content.replace(/import\s+\{\s*getServerAuth\s*\}\s+from\s+[\"']@\/lib\/auth-server[\"']/g, 'import { getServerAuthContext } from "@/lib/auth-server"');
    content = content.replace(/import\s+\{\s*getServerAuth\s*\}\s+from\s+[\"']@\/lib\/supabase\/server[\"']/g, 'import { getServerAuthContext } from "@/lib/auth-server"');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file);
  }
});
