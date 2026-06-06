import os

# Badge.tsx
badge_path = "src/components/ui/Badge.tsx"
with open(badge_path, 'r') as f:
    content = f.read()
if 'import { useAppTheme }' not in content:
    content = content.replace('import { colors, borderRadius, spacing } from "@design/theme"', 'import { borderRadius, spacing } from "@design/theme"\nimport { useAppTheme } from "@hooks/useAppTheme"')
content = content.replace('export function Badge', 'export function Badge') # find insertion point later if needed
# Actually just do string replaces for Badge
content = content.replace('backgroundColor: colors.primary', 'backgroundColor: colors.primary') # Wait, this needs to be inside the component.
# Let's write a simple regex or string replace per file
with open(badge_path, 'w') as f: f.write(content)

print("Use sed/python to fix manually")
