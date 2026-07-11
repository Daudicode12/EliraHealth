const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/application-rejected/page.tsx',
  'src/app/specialist/profile/complete/page.tsx',
  'src/app/specialist/application-rejected/page.tsx',
  'src/app/specialist/account-suspended/page.tsx',
  'src/app/specialist/(dashboard)/layout.tsx',
  'src/app/user/dashboard/page.tsx'
];

filesToFix.forEach(route => {
  const fullPath = path.join(__dirname, route);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // They all do some version of:
  // const payloadStr = token.replace("mock-jwt-", "");
  // try { const decoded = JSON.parse(Buffer.from(payloadStr, "base64").toString("utf-8")); userId = decoded.id; } ...
  
  const pattern1 = /const token = \(await cookies\(\)\)\.get\(['"]auth-token['"]\)\?\.value;\s*let userId = ['"]['"];\s*if\s*\(token\)\s*\{\s*const payloadStr = token\.replace\([^;]+;\s*try\s*\{\s*if\s*\(token\.startsWith\([^;]+\)\s*\{\s*const decoded = JSON\.parse\([^;]+\);\s*userId = decoded\.id;\s*\}\s*else\s*\{\s*userId = payloadStr;\s*\}\s*\}\s*catch\s*\([^)]+\)\s*\{\s*userId = payloadStr;\s*\}\s*\}/g;
  
  content = content.replace(pattern1, 'const session = await getServerSession();\n  const userId = session?.userId;');

  const pattern2 = /const token = \(await cookies\(\)\)\.get\(['"]auth-token['"]\)\?\.value;\s*let userId = ['"]['"];\s*if\s*\(token\)\s*\{\s*try\s*\{\s*const payloadStr = token\.replace\([^;]+;\s*const decoded = JSON\.parse\([^;]+\);\s*userId = decoded\.id;\s*\}\s*catch\s*\([^)]+\)\s*\{\s*\}\s*\}/g;
  
  content = content.replace(pattern2, 'const session = await getServerSession();\n  const userId = session?.userId;');
  
  if (content.includes('getServerSession') && !content.includes('import { getServerSession }')) {
    content = `import { getServerSession } from '@/lib/auth/server-session';\n` + content;
  }
  
  fs.writeFileSync(fullPath, content, 'utf8');
});
