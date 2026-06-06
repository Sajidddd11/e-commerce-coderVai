const fs = require('fs');
const path = require('path');

const files = [
  "src/components/checkout/AddressSelect.tsx",
  "src/components/checkout/DistrictPicker.tsx",
  "src/components/home/CategoryTiles.tsx",
  "src/components/home/CTASection.tsx",
  "src/components/home/HeroBanner.tsx",
  "src/components/home/HeroCarousel.tsx",
  "src/components/home/SectionHeader.tsx",
  "src/components/home/TrustSection.tsx",
  "src/components/product/ProductCard.tsx"
];

files.forEach(file => {
  const fullPath = path.join('/Users/sajidshahriarislam/Code/e-commerce-coderVai/mobile', file);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');

  // Fix useAppTheme imports
  if (!content.includes('useAppTheme')) {
    content = content.replace(/import \{.*?\} from "@design\/theme"/, (match) => {
      return `import { useAppTheme } from "@hooks/useAppTheme";\n${match}`;
    });
  }

  // Remove `colors` from @design/theme imports
  content = content.replace(/import \{([^}]*)colors([^}]*)\} from "@design\/theme"/g, (match, p1, p2) => {
    const newImport = `import {${p1}${p2}} from "@design/theme"`.replace(/,\s*,/g, ',').replace(/\{\s*,/g, '{').replace(/,\s*\}/g, '}');
    return newImport.includes('{}') ? '' : newImport;
  });

  // Inject useAppTheme into component bodies
  content = content.replace(/(export function [a-zA-Z0-9_]+\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{)/g, (match) => {
    if (!content.includes('const { colors } = useAppTheme();')) {
      return `${match}\n  const { colors } = useAppTheme();`;
    }
    return match;
  });

  // Fix absoluteFillObject -> absoluteFill
  content = content.replace(/absoluteFillObject/g, 'absoluteFill');

  // Any leftover `colors.` in styles needs to be removed or we just ignore the TS errors by casting to any in StyleSheet?
  // No, let's replace `colors.[a-zA-Z]+` inside StyleSheet.create with a fallback or just use inline styles where possible.
  // Actually, wait, replacing `colors.background` inside StyleSheet.create with `"#FFF"` is an option, but breaks dark mode unless we inline.
  // Instead of complex AST replacements, let's just restore these specific files to main branch and do the dark mode properly on them later?
  
  fs.writeFileSync(fullPath, content);
});
