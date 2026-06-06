import os

files = [
    "src/components/ui/Card.tsx",
    "src/components/ui/Input.tsx",
    "src/components/ui/Skeleton.tsx",
    "src/components/search/SearchSuggestionsPanel.tsx"
]

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    # ensure import is added if missing
    if '@hooks/useAppTheme' not in content:
        content = content.replace('import { colors', 'import { useAppTheme } from "@hooks/useAppTheme";\nimport { colors')
        # if colors wasn't there, just prepend it
        if 'import { useAppTheme }' not in content:
            content = 'import { useAppTheme } from "@hooks/useAppTheme";\n' + content
            
    # Also we don't want the raw palette
    # Actually wait, let's just make sure "const { colors } = useAppTheme()" is present inside the component.
    # We already have that in some files, but let's do a safe replace for the remaining issues.
    
    # 1. cardBorder error -> border
    content = content.replace("colors.cardBorder", "colors.border")
    
    # 2. primaryMuted error -> primary (or if it exists, leave it, wait we removed it from darkTheme?)
    # actually darkTheme had primaryMuted as string "rgba...". So it's fine, let's check what TS said.
    # "Property 'cardBorder' does not exist on type '{ readonly brand: ... }'"
    # This means the variable `colors` refers to `@design/theme` raw palette because we imported it!
    # Let's remove `colors` from `@design/theme` import!
    content = content.replace('import { colors, ', 'import { ')
    content = content.replace('import { colors }', 'import {}')
    
    # Make sure `const { colors } = useAppTheme()` is in the component body
    if 'const { colors } = useAppTheme()' not in content:
        import re
        def insert_hook(match):
            return match.group(0) + '\n  const { colors } = useAppTheme();\n'
        content = re.sub(r'(export (?:default )?function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{)', insert_hook, content)
        content = re.sub(r'(export const\s+[A-Za-z0-9_]+\s*=\s*(?:[^=]*=>)?\s*\{)', insert_hook, content)

    with open(file_path, 'w') as f:
        f.write(content)
