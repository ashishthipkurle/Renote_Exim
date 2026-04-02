import os
import re

def replace_colors(directory):
    replacements = [
        (r'dark:bg-\[#0[aA]0[cC]12\]', 'dark:bg-background'), # #0a0c12 -> background
        (r'dark:bg-gradient-to-br dark:from-\[#0[aA]0[cC]12\] dark:via-\[#0[dD]1[01]17\] dark:to-\[#0[aA]0[cC]12\]', 'dark:bg-background'),
        (r'dark:bg-\[#151[cC]2[aA]\]/60', 'dark:bg-card'),
        (r'dark:bg-\[#151[cC]2[aA]\]/40', 'dark:bg-card'),
        (r'bg-slate-50\s+dark:bg-\[#0[aA]0[cC]12\]', 'bg-slate-50 dark:bg-background'),
        (r'bg-slate-900', 'bg-card'),
        (r'bg-slate-950', 'bg-background'),
        (r'dark:bg-slate-900', 'dark:bg-card'),
        (r'dark:bg-slate-950', 'dark:bg-background'),
        (r'dark:border-slate-800', 'dark:border-border'),
        (r'dark:border-slate-700', 'dark:border-border'),
        (r'border-slate-800', 'border-border'),
        (r'dark:text-slate-400', 'dark:text-muted-foreground'),
        (r'text-slate-400\s+dark:text-slate-600', 'text-muted-foreground'),
        (r'text-slate-500\s+dark:text-slate-400', 'text-muted-foreground'),
    ]

    modified_files = 0
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                original_content = content
                for pattern, replacement in replacements:
                    content = re.sub(pattern, replacement, content)

                if content != original_content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated {path}")
                    modified_files += 1

    print(f"Total files updated: {modified_files}")

if __name__ == "__main__":
    replace_colors(r"d:\Job\Ranote_exim\Ranote_exim_2\client\app\dashboard")
    replace_colors(r"d:\Job\Ranote_exim\Ranote_exim_2\client\components\dashboard")
    replace_colors(r"d:\Job\Ranote_exim\Ranote_exim_2\client\components\exporter")
    replace_colors(r"d:\Job\Ranote_exim\Ranote_exim_2\client\components\client")
