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
  
  let newContent = content
    .replace(/paddingHorizontal:\s*16/g, 'paddingHorizontal: spacing.md')
    .replace(/paddingHorizontal:\s*spacing\.base/g, 'paddingHorizontal: spacing.md')
    .replace(/paddingHorizontal:\s*20/g, 'paddingHorizontal: spacing.base')
    .replace(/paddingHorizontal:\s*24/g, 'paddingHorizontal: spacing.base')
    .replace(/const H_PAD = spacing\.base/g, 'const H_PAD = spacing.md');
    
  if (content !== newContent) {
    // Check if we need to add spacing import
    if (!newContent.includes('import { spacing }') && !newContent.includes(' spacing,') && !newContent.includes(', spacing') && !newContent.match(/import.*\{.*spacing.*\}.*from/)) {
      
      // If there's an existing import from @design/theme
      if (newContent.includes('@design/theme')) {
        newContent = newContent.replace(/import\s+\{([^}]+)\}\s+from\s+"@design\/theme"/, (match, p1) => {
          if (!p1.includes('spacing')) {
            return `import { ${p1.trim()}, spacing } from "@design/theme"`;
          }
          return match;
        });
      } else {
        // No existing import, add it at the top after other imports
        // Just add to the very top for safety
        newContent = `import { spacing } from "@design/theme"\n` + newContent;
      }
    }
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated ' + filePath);
  }
}

walkDir('/Users/sajidshahriarislam/Code/e-commerce-coderVai/mobile/src/components', processFile);
walkDir('/Users/sajidshahriarislam/Code/e-commerce-coderVai/mobile/app', processFile);
