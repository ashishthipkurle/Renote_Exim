import os
import re

def fix_exporter_page():
    path = r"d:\Job\Ranote_exim\Ranote_exim_2\client\app\dashboard\exporter\page.tsx"
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # We only want to replace classes that are NOT already prefixed with `dark:`
    # We use negative lookbehinds `(?<!dark:)`
    
    replacements = [
        # Backgrounds
        (r'(?<!dark:)bg-\[#0a0c12\]/40', 'bg-white/80 dark:bg-background/40'),
        (r'(?<!dark:)via-\[#0a0c12\]', 'via-slate-50 dark:via-background'),
        (r'(?<!dark:)to-\[#0a0c12\]', 'to-slate-50 dark:to-background'),
        (r'(?<!dark:)from-indigo-900/20', 'from-slate-100 dark:from-indigo-900/20'),
        (r'(?<!dark:)bg-\[#151c2a\]/60', 'bg-white dark:bg-card/60'),
        (r'(?<!dark:)bg-\[#0f1521\]', 'bg-white dark:bg-popover'),
        
        # Text colors
        (r'(?<!dark:)(?<!hover:)text-white', 'text-slate-900 dark:text-white'),
        (r'(?<!dark:)text-slate-400', 'text-slate-500 dark:text-slate-400'),
        (r'(?<!dark:)hover:text-white', 'hover:text-slate-900 dark:hover:text-white'),
        
        # Borders
        (r'(?<!dark:)border-white/5', 'border-slate-200 dark:border-white/5'),
        (r'(?<!dark:)border-white/8', 'border-slate-200 dark:border-white/8'),
        (r'(?<!dark:)border-white/10', 'border-slate-200 dark:border-white/10'),
        (r'(?<!dark:)border-white/15', 'border-slate-300 dark:border-white/15'),
        (r'(?<!dark:)border-white/20', 'border-slate-300 dark:border-white/20'),
        
        # Hovers
        (r'(?<!dark:)hover:bg-white/5', 'hover:bg-slate-100 dark:hover:bg-white/5'),
        (r'(?<!dark:)hover:bg-white/8', 'hover:bg-slate-100 dark:hover:bg-white/8'),
        (r'(?<!dark:)hover:bg-white/10', 'hover:bg-slate-100 dark:hover:bg-white/10'),
        
        # Map specifics (The map will look better if it keeps a distinct background or adapts, but for now we adapt the SVGs Tooltips)
        (r'fill="#04080f"', 'fill="currentColor" className="text-white dark:text-[#04080f]"'),
    ]

    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)

    # Some manual fixes for map backgrounds that might be hard-coded
    # The map background:
    content = content.replace('background:"radial-gradient(ellipse 130% 80% at 50% 55%,rgba(3,12,30,0.1) 0%,rgba(2,6,14,0.45) 100%)"', 
                            'background:"radial-gradient(ellipse 130% 80% at 50% 55%, var(--tw-gradient-from, rgba(3,12,30,0.1)) 0%, var(--tw-gradient-to, rgba(2,6,14,0.45)) 100%)"')

    # Fix the button for View all Orders in the search
    content = content.replace('text-slate-900 dark:text-slate-900 dark:text-white', 'text-slate-900 dark:text-white')
    content = content.replace('text-slate-900 dark:text-slate-900 dark:text-white', 'text-slate-900 dark:text-white')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success! Exporter dashboard colors are now responsive to light mode.")

if __name__ == "__main__":
    fix_exporter_page()
