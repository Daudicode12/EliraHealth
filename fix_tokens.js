const fs = require('fs');
const path = require('path');

const files = [
  'src/app/doctor/dashboard/page.tsx',
  'src/app/doctor/profile/page.tsx',
  'src/app/doctor/availability/page.tsx',
  'src/app/doctor/consultations/page.tsx',
  'src/app/doctor/patients/page.tsx',
  'src/app/doctor/patients/[id]/page.tsx',
  'src/app/doctor/medical-records/page.tsx',
  'src/app/admin/doctors/page.tsx'
];

const replacement = `let userId = token?.replace("mock-token-", "");
  if (token?.startsWith("mock-jwt-")) {
    try {
      const decoded = JSON.parse(Buffer.from(token.replace("mock-jwt-", ""), "base64").toString("utf-8"));
      userId = decoded.id;
    } catch(e) {}
  }`;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // For doctor pages
    content = content.replace(/const userId = token\?\.replace\("mock-token-", ""\);/g, replacement);
    
    // For admin page specifically
    const adminReplacement = `let adminId = token?.replace("mock-token-", "") || 'system';
    if (token?.startsWith("mock-jwt-")) {
      try {
        const decoded = JSON.parse(Buffer.from(token.replace("mock-jwt-", ""), "base64").toString("utf-8"));
        adminId = decoded.id;
      } catch(e) {}
    }`;
    content = content.replace(/const adminId = token\?\.replace\("mock-token-", ""\) \|\| 'system';/g, adminReplacement);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', file);
  } else {
    console.log('Not found', file);
  }
});