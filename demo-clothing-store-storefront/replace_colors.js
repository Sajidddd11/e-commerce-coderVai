const fs = require('fs');
const filePath = '/Users/sajidshahriarislam/Code/e-commerce-coderVai/demo-clothing-store-storefront/src/app/[countryCode]/(main)/about/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Root background
content = content.replace('bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e]', 'bg-black');

// 2. Gradients with text-transparent
content = content.replace(/bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent/g, 'text-[#56aebf]');
content = content.replace(/bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent/g, 'text-[#56aebf]');

// 3. rgba for shadows
content = content.replace(/rgba\(0,255,255,/g, 'rgba(86,174,191,');

// 4. simple cyan replacements
content = content.replace(/text-cyan-[0-9]{3}(\/[0-9]+)?/g, (match) => {
    if (match.includes('/')) {
        return `text-[#56aebf]${match.substring(match.indexOf('/'))}`;
    }
    return 'text-[#56aebf]';
});

content = content.replace(/border-cyan-[0-9]{3}(\/[0-9]+)?/g, (match) => {
    if (match.includes('/')) {
        return `border-[#56aebf]${match.substring(match.indexOf('/'))}`;
    }
    return 'border-[#56aebf]';
});

// For backgrounds, e.g., bg-cyan-X
// from-cyan-X, to-cyan-X
content = content.replace(/bg-gradient-to-r from-cyan-[0-9]{3} to-cyan-[0-9]{3}/g, 'bg-[#56aebf]');
content = content.replace(/hover:from-cyan-[0-9]{3} hover:to-cyan-[0-9]{3}/g, 'hover:bg-[#458f9e]');
content = content.replace(/bg-cyan-[0-9]{3}(\/[0-9]+)?/g, (match) => {
    if (match.includes('/')) {
        return `bg-[#56aebf]${match.substring(match.indexOf('/'))}`;
    }
    return 'bg-[#56aebf]';
});

// Other bg-gradients
content = content.replace(/bg-gradient-to-br from-cyan-500\/[0-9]+ to-cyan-600\/[0-9]+/g, 'bg-[#56aebf]/20');

// Hover bg
content = content.replace(/hover:bg-cyan-[0-9]{3}(\/[0-9]+)?/g, (match) => {
    if (match.includes('/')) {
        return `hover:bg-[#56aebf]${match.substring(match.indexOf('/'))}`;
    }
    return 'hover:bg-[#56aebf]';
});

fs.writeFileSync(filePath, content);
console.log('Done!');
