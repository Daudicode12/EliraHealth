const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacer) {
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = replacer(content);
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated:', filePath);
  }
}

// 1. API routes using getUserIdFromToken
const apiRoutes = [
  'src/app/api/specialist/consultations/route.ts',
  'src/app/api/specialist/consultations/[id]/route.ts',
  'src/app/api/specialist/consultations/[id]/complete/route.ts',
  'src/app/api/specialist/consultations/[id]/notes/route.ts',
  'src/app/api/specialist/consultations/start/route.ts'
];

apiRoutes.forEach(route => {
  const fullPath = path.join(__dirname, route);
  if (!fs.existsSync(fullPath)) return;
  replaceInFile(fullPath, content => {
    let newContent = content;
    // Remove getUserIdFromToken
    newContent = newContent.replace(/function getUserIdFromToken[\s\S]*?return userId \|\| null;\n}\n/g, '');
    
    // Replace API usages
    newContent = newContent.replace(/const token = req\.cookies\.get\('auth-token'\)\?\.value;\s*const userId = getUserIdFromToken\(token\);\s*if \(!userId\)[^;]+;/g, 
      "const auth = await requireSpecialist(req);\n    if (auth instanceof NextResponse) return auth;\n    const userId = auth.userId;\n");
      
    // Add import if needed
    if (newContent.includes('requireSpecialist') && !newContent.includes('import { requireSpecialist }')) {
      newContent = newContent.replace("import { NextRequest, NextResponse } from 'next/server';", "import { NextRequest, NextResponse } from 'next/server';\nimport { requireSpecialist } from '@/lib/auth/specialist';");
    }
    return newContent;
  });
});

// 2. Server Components using mock-jwt
const pageRoutes = [
  'src/app/admin/doctors/page.tsx',
  'src/app/admin/appointments/page.tsx',
  'src/app/application-rejected/page.tsx',
  'src/app/specialist/profile/complete/page.tsx',
  'src/app/specialist/consultations/[id]/page.tsx',
  'src/app/specialist/application-rejected/page.tsx',
  'src/app/specialist/account-suspended/page.tsx',
  'src/app/specialist/(dashboard)/appointments/page.tsx',
  'src/app/specialist/(dashboard)/availability/page.tsx',
  'src/app/specialist/(dashboard)/consultations/page.tsx',
  'src/app/specialist/(dashboard)/dashboard/page.tsx',
  'src/app/specialist/(dashboard)/layout.tsx',
  'src/app/specialist/(dashboard)/medical-records/page.tsx',
  'src/app/specialist/(dashboard)/patients/[id]/page.tsx',
  'src/app/specialist/(dashboard)/patients/page.tsx',
  'src/app/specialist/(dashboard)/profile/page.tsx',
  'src/app/patient/consultations/page.tsx'
];

pageRoutes.forEach(route => {
  const fullPath = path.join(__dirname, route);
  if (!fs.existsSync(fullPath)) return;
  replaceInFile(fullPath, content => {
    let newContent = content;
    
    // Pattern 1: let decoded = null; ... catch(e) {} 
    const p1 = /let\s+(?:adminId|decoded|userId)[\s\S]*?catch\s*\([^)]*\)\s*\{\s*\}/g;
    newContent = newContent.replace(p1, (match) => {
      if (match.includes('mock-jwt-') || match.includes('JSON.parse(Buffer.from')) {
        let varName = match.includes('adminId') ? 'adminId' : (match.includes('userId') ? 'userId' : 'decoded');
        if (varName === 'adminId' || varName === 'userId') {
          return `const session = await getServerSession();\n    let ${varName} = session?.userId || 'system';`;
        }
        return `const decoded = await getServerSession();`;
      }
      return match;
    });

    // Pattern 2: if (token?.startsWith("mock-jwt-")) { ... } catch(e) {} 
    const p2 = /if\s*\(token(?:\?)?\.startsWith\(['"]mock-jwt-['"]\)\)\s*\{\s*try\s*\{[\s\S]*?\}\s*catch\s*\([^)]*\)\s*\{\s*\}/g;
    newContent = newContent.replace(p2, (match) => {
      if (match.includes('adminId')) {
        return `const session = await getServerSession();\n    adminId = session?.userId || 'system';`;
      }
      return `const session = await getServerSession();\n    const decoded = session;`;
    });
    
    // Add import for getServerSession
    if (newContent.includes('getServerSession()') && !newContent.includes('getServerSession')) {
      newContent = `import { getServerSession } from '@/lib/auth/server-session';\n` + newContent;
    }
    
    // Replace explicit mock-jwt- creations (e.g. in profile update)
    if (newContent.includes('`mock-jwt-${payload}`')) {
       // Since the instructions say "remove mock authentication", any manual token generation in frontend is bad,
       // we will replace it with signAccessToken
       const pattern4 = /const payload = Buffer\.from\(JSON\.stringify\(\{([^}]+)\}\)\)\.toString\(['"]base64['"]\);\s*const token = `mock-jwt-\$\{payload\}`;/g;
       newContent = newContent.replace(pattern4, `const token = signAccessToken({$1});`);
       
       const pattern5 = /const payload = Buffer\.from\(JSON\.stringify\(\{([^}]+)\}\)\)\.toString\(['"]base64['"]\);\s*\(await cookies\(\)\)\.set\(['"]auth-token['"],\s*`mock-jwt-\$\{payload\}`/g;
       newContent = newContent.replace(pattern5, `const token = signAccessToken({$1});\n  (await cookies()).set("auth-token", token`);
       
       if (newContent.includes('signAccessToken') && !newContent.includes('signAccessToken')) {
         newContent = `import { signAccessToken } from '@/lib/auth/jwt';\n` + newContent;
       }
    }

    return newContent;
  });
});

// 3. Actions using mock-jwt
const actionRoutes = [
  'src/lib/actions/auth.actions.ts',
  'src/lib/actions/auth.ts',
  'src/lib/actions/consultant.ts',
  'src/lib/actions/signup-specialist.actions.ts',
  'src/lib/actions/signup-user.actions.ts',
  'src/lib/actions/signup.actions.ts'
];

actionRoutes.forEach(route => {
  const fullPath = path.join(__dirname, route);
  if (!fs.existsSync(fullPath)) return;
  replaceInFile(fullPath, content => {
    let newContent = content;
    
    // Replace decoding
    const pattern2 = /const payloadStr = token\.replace\(['"]mock-jwt-['"], ['"]['"]\)(?:\.replace\(['"]mock-token-['"], ['"]['"]\))?;\s*let decoded = null;\s*try\s*\{\s*if\s*\(token\.startsWith\(['"]mock-jwt-['"]\)\)\s*\{\s*decoded = JSON\.parse\([^;]+\);\s*\}\s*\}\s*catch\s*\([^)]+\)\s*\{\s*\}/g;
    newContent = newContent.replace(pattern2, "const decoded = await getServerSession();");
    
    // Replace generation
    const pattern4 = /const payload = Buffer\.from\(JSON\.stringify\(\{([^}]+)\}\)\)\.toString\(['"]base64['"]\);\s*const token = `mock-jwt-\$\{payload\}`;/g;
    newContent = newContent.replace(pattern4, `const token = signAccessToken({$1});`);
    
    const pattern5 = /const payload = Buffer\.from\(JSON\.stringify\(\{([^}]+)\}\)\)\.toString\(['"]base64['"]\);\s*\(await cookies\(\)\)\.set\(['"]auth-token['"],\s*`mock-jwt-\$\{payload\}`/g;
    newContent = newContent.replace(pattern5, `const token = signAccessToken({$1});\n  (await cookies()).set("auth-token", token`);

    if (newContent.includes('signAccessToken') && !content.includes('signAccessToken')) {
      newContent = `import { signAccessToken } from '@/lib/auth/jwt';\n` + newContent;
    }
    if (newContent.includes('getServerSession()') && !content.includes('getServerSession')) {
      newContent = `import { getServerSession } from '@/lib/auth/server-session';\n` + newContent;
    }

    return newContent;
  });
});
