import os
import re

def standardize_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    
    # 1. Replace large rounded classes with rounded-lg
    patterns_to_replace = [
        r'rounded-\[2\.5rem\]',
        r'rounded-\[2rem\]',
        r'rounded-2xl',
        r'rounded-3xl',
    ]
    
    for pattern in patterns_to_replace:
        new_content = re.sub(pattern, 'rounded-lg', new_content)
    
    # Also handle dynamic ones like rounded-[3rem]
    new_content = re.sub(r'rounded-\[[1-9][0-9]*(\.[0-9]+)?rem\]', 'rounded-lg', new_content)

    # 2. Remove 'italic' class safely
    # Must only match complete word, not inside another string
    new_content = re.sub(r'\bitalic\b', '', new_content)
    
    # Clean up double spaces created by removing classes, 
    # but ONLY on the same line to avoid destroying code structure
    new_content = re.sub(r'[ \t]{2,}', ' ', new_content)

    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    base_dir = '.'
    target_dirs = ['app', 'components']
    modified_count = 0
    
    for target_dir in target_dirs:
        full_path = os.path.join(base_dir, target_dir)
        for root, dirs, files in os.walk(full_path):
            for file in files:
                if file.endswith('.tsx') or file.endswith('.ts') or file.endswith('.css'):
                    filepath = os.path.join(root, file)
                    if standardize_file(filepath):
                        print(f"Modified: {filepath}")
                        modified_count += 1
    
    print(f"Total files modified: {modified_count}")

if __name__ == "__main__":
    main()
