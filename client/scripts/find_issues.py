import os
import re

def find_swallowed_comments(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Look for // ... then a keyword without a newline
    pattern = r'//.*(const|let|var|if|for|while|return|export|import|function|class|await|prisma|Promise|axios|router|toast)\b'
    matches = re.finditer(pattern, content)
    found = False
    for match in matches:
        # Check if there's a newline between the // and the keyword
        match_str = match.group(0)
        if '\n' not in match_str:
            print(f"File: {filepath} | Match: {match_str.strip()}")
            found = True
    return found

def main():
    base_dir = '.'
    target_dirs = ['app', 'components']
    count = 0
    for target_dir in target_dirs:
        full_path = os.path.join(base_dir, target_dir)
        for root, dirs, files in os.walk(full_path):
            for file in files:
                if file.endswith('.tsx') or file.endswith('.ts'):
                    filepath = os.path.join(root, file)
                    if find_swallowed_comments(filepath):
                        count += 1
    print(f"Total files with issues: {count}")

if __name__ == "__main__":
    main()
