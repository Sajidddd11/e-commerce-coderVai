import os

directories = ['src', 'app']
base_dir = '/Users/sajidshahriarislam/Code/e-commerce-coderVai/mobile'
files_to_update = []

for dir_name in directories:
    for root, _, files in os.walk(os.path.join(base_dir, dir_name)):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                files_to_update.append(os.path.join(root, file))

for file_path in files_to_update:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if '@/hooks/useAppTheme' in content:
        content = content.replace('@/hooks/useAppTheme', '@hooks/useAppTheme')
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
