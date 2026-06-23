const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Also handle cases with comments like `paddingHorizontal: 16, // px-4`
  let newContent = content
    .replace(/paddingHorizontal:\s*16/g, 'paddingHorizontal: 12')
    .replace(/paddingHorizontal:\s*spacing\.base/g, 'paddingHorizontal: 12')
    .replace(/paddingHorizontal:\s*20/g, 'paddingHorizontal: 16')
    .replace(/paddingHorizontal:\s*24/g, 'paddingHorizontal: 16');
    
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated ' + filePath);
  }
}

walkDir('/Users/sajidshahriarislam/Code/e-commerce-coderVai/mobile/src/components', processFile);
walkDir('/Users/sajidshahriarislam/Code/e-commerce-coderVai/mobile/app', processFile);
