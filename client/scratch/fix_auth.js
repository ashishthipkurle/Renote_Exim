const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Base directory for API routes
const baseDir = path.join(process.cwd(), 'client', 'app', 'api');

// Function to walk through directory
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('route.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(baseDir);
console.log(`Found ${files.length} API routes.`);

let fixedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Pattern 1: Multi-line with curly braces
  // const auth = await getApiAuthContext(req);
  // if (!auth) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }
  const pattern1 = /const auth = await getApiAuthContext\((req|request)\);\s+if \(!auth\) {\s+return NextResponse\.json\({\s*error:\s*['"]Unauthorized['"]\s*},\s*{\s*status:\s*401\s*}\);\s+}/g;
  content = content.replace(pattern1, (match, r) => {
    return `const { auth, error } = await getApiAuthContext(${r});\n    if (error || !auth) return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });`;
  });

  // Pattern 2: Single line if
  // const auth = await getApiAuthContext(req);
  // if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const pattern2 = /const auth = await getApiAuthContext\((req|request)\);\s+if \(!auth\) return NextResponse\.json\({\s*error:\s*['"]Unauthorized['"]\s*},\s*{\s*status:\s*401\s*}\);/g;
  content = content.replace(pattern2, (match, r) => {
    return `const { auth, error } = await getApiAuthContext(${r});\n    if (error || !auth) return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });`;
  });
  
  // Pattern 3: With role check combined
  // const auth = await getApiAuthContext(request);
  // const role = auth?.role as any;
  // if (!auth || role !== 'SUPPLIER') { ... }
  // (We'll skip complex ones and do them manually if needed, 
  // but let's try a common one)

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed: ${path.relative(process.cwd(), file)}`);
    fixedCount++;
  }
});

console.log(`Finished. Total files modified: ${fixedCount}`);
