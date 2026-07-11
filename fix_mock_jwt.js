const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findFiles(dir, filter) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, filter));
    } else {
      if (filter(filePath)) results.push(filePath);
    }
  }
  return results;
}

const files = findFiles(path.join(__dirname, 'src/app'), file => file.endsWith('.tsx') || file.endsWith('.ts'));

let modifiedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Pattern to find standard manual mock JWT extraction
  // Typically looks like:
  // const cookieStore = cookies(); (or await cookies())
  // const token = cookieStore.get('auth-token')?.value;
  // let decoded = null;
  // if (token?.startsWith('mock-jwt-')) { ... }
  
  // Or:
  // const payloadStr = token.replace("mock-jwt-", "");
  // const decoded = JSON.parse(...)

  if (content.includes('mock-jwt-')) {
    // We will just do a simpler replacement or log it for manual fixing if it's too complex.
    // Let's replace the common block:
    const regex1 = /if\s*\(\s*token(?:\?)?\.startsWith\(['"]mock-jwt-['"]\)\s*\)\s*\{\s*try\s*\{\s*const\s*decoded\s*=\s*JSON\.parse\(Buffer\.from\(token\.replace\(['"]mock-jwt-['"],\s*['"]['"]\),\s*['"]base64['"]\)\.toString\(['"]utf-8['"]\)\);/g;
    
    // We can just replace the whole block if we are careful, but it's safer to just replace the parsing line
    
    content = content.replace(/JSON\.parse\(Buffer\.from\(token\.replace\(['"]mock-jwt-['"],\s*['"]['"]\),\s*['"]base64['"]\)\.toString\(['"]utf-8['"]\)\)/g, "import('@/lib/auth/server-session').then(m => m.getServerSession()) /* MANUAL FIX NEEDED HERE */");
    
    content = content.replace(/const payloadStr = token.replace\(['"]mock-jwt-['"], ['"]['"]\)(?:\.replace\(['"]mock-token-['"], ['"]['"]\))?;/g, "/* MANUAL FIX mock-jwt */");
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      modifiedCount++;
      console.log('Modified:', file);
    } else {
      console.log('Contains mock-jwt- but not replaced:', file);
    }
  }
}

console.log('Modified', modifiedCount, 'files.');
