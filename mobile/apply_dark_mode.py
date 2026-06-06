import os
import re

directories = ['src', 'app']
base_dir = '/Users/sajidshahriarislam/Code/e-commerce-coderVai/mobile'

color_mappings = {
    r'colors\.grey\[0\]': 'colors.background',
    r'colors\.grey\[5\]': 'colors.surface',
    r'colors\.grey\[10\]': 'colors.cardBorder',
    r'colors\.grey\[20\]': 'colors.border',
    r'colors\.grey\[40\]': 'colors.textMuted',
    r'colors\.grey\[50\]': 'colors.textMuted',
    r'colors\.grey\[60\]': 'colors.textMuted',
    r'colors\.grey\[80\]': 'colors.text',
    r'colors\.grey\[90\]': 'colors.text',
    r'colors\.brand\.tealHover': 'colors.primaryHover',
    r'colors\.brand\.tealMuted': 'colors.primaryMuted',
    r'colors\.brand\.teal': 'colors.primary',
    r'colors\.success': 'colors.success',
    r'colors\.error': 'colors.error',
    r'colors\.warning': 'colors.warning',
    r'colors\.sale': 'colors.sale',
    r'colors\.whatsapp': 'colors.whatsapp',
}

files_to_update = []

for dir_name in directories:
    for root, _, files in os.walk(os.path.join(base_dir, dir_name)):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                files_to_update.append(os.path.join(root, file))

for file_path in files_to_update:
    if 'useAppTheme.ts' in file_path or 'theme.ts' in file_path or 'ThemedText.tsx' in file_path:
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'import { colors } from "@design/theme"' in content or 'colors.' in content:
        # We need to replace import
        content = content.replace('import { colors } from "@design/theme"', 'import { useAppTheme } from "@/hooks/useAppTheme"')
        
        # Replace usages
        for old, new in color_mappings.items():
            content = re.sub(old, new, content)
            
        # We need to insert `const { colors } = useAppTheme()` inside the main component.
        # This is a naive heuristic: find the first `export function` or `export default function`
        # and insert it after the `{`.
        
        def insert_hook(match):
            return match.group(0) + '\n  const { colors } = useAppTheme();\n'
            
        content = re.sub(r'(export (?:default )?function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{)', insert_hook, content)
        
        # Also handle const components: export const Foo = () => {
        content = re.sub(r'(export const\s+[A-Za-z0-9_]+\s*=\s*(?:[^=]*=>)?\s*\{)', insert_hook, content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Updated {file_path}")
