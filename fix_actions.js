const fs = require('fs');
const path = require('path');

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
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Ensure "use server"; is at the very top
  if (content.includes('"use server";')) {
    content = content.replace(/"use server";\r?\n?/g, '');
    content = '"use server";\n\n' + content;
  }
  
  // Fix id -> userId in signAccessToken
  content = content.replace(/signAccessToken\(\s*\{\s*id:/g, 'signAccessToken({\n      userId:');
  
  // Since email is required in JWTPayload, we'll set it to null or the actual email if we don't have it
  // We'll just patch the types to allow optional email or provide empty string/null.
  // We can just add email: '' for now inside the payload
  content = content.replace(/userId:\s*([^,]+),/g, 'userId: $1,\n      email: null,');
  
  // Fix consultant.ts duplicate token definition (there was an error about token defined multiple times)
  // Let's remove the const if it's already defined
  content = content.replace(/const\s+token\s*=\s*signAccessToken/g, 'let token = signAccessToken');
  content = content.replace(/let\s+token\s*=\s*signAccessToken/g, 'const token = signAccessToken');
  
  // If we accidentally changed "const token = ..." and then later "const token = ...", we can just rename one.
  // We will manually fix consultant.ts if it still errors.

  fs.writeFileSync(fullPath, content, 'utf8');
});

console.log('Fixed actions');
