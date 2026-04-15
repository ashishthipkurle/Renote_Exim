const fs = require('fs');

// --- 1. Modify DashboardHeader.tsx ---
const headerPath = 'components/dashboard/DashboardHeader.tsx';
let headerContent = fs.readFileSync(headerPath, 'utf8');

if (!headerContent.includes('const isMarketplace = pathname === "/products"')) {
    headerContent = headerContent.replace(
        /const \[isProfileOpen, setIsProfileOpen\] = useState\(false\);\s*const dropdownRef = useRef<HTMLDivElement>\(null\);/,
        `const [isProfileOpen, setIsProfileOpen] = useState(false);\n  const dropdownRef = useRef<HTMLDivElement>(null);\n\n  const pathname = usePathname();\n  const isMarketplace = pathname === "/products" || pathname.startsWith("/products/");`
    );

    headerContent = headerContent.replace(
        /\{\/\* Orders \*\/}[\s\S]*?<Link\s*href="\/orders"[\s\S]*?<ListOrdered className="w-4 h-4" \/>\s*<\/Link>/m,
        `{/* Orders */}\n  {isMarketplace && (\n    <Link\n      href="/orders"\n      className="size-9 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 group text-muted-foreground hover:text-primary"\n      title="Orders"\n    >\n      <ListOrdered className="w-4 h-4" />\n    </Link>\n  )}`
    );
    
    fs.writeFileSync(headerPath, headerContent);
    console.log("Updated DashboardHeader.tsx");
}

// --- 2. Modify products/page.tsx ---
const productsPath = 'app/(market)/products/page.tsx';
let productsContent = fs.readFileSync(productsPath, 'utf8');

// Reduce gap (padding) and size of "Market Verticals"
// Gap: `className="max-w-screen-xl mx-auto px-8 md:px-16 py-12"` -> change px-16 to px-8
productsContent = productsContent.replace(
    /className="max-w-screen-xl mx-auto px-8 md:px-16 py-12"/,
    'className="max-w-screen-xl mx-auto px-4 md:px-8 py-8"'
);

// Market Verticals font sizes
// Reduce padding in category link items: `className={\`flex items-center px-4 py-2.5 rounded-xl transition-all group...`
// Change `py-2.5` to `py-2` and `text-xs` to `text-[10px]` OR leave text-xs. Let's make it more compact.

productsContent = productsContent.replace(
    /className=\{\`flex items-center px-4 py-2\.5 rounded-xl transition-all group \$\{\!categoryParam \? "bg-primary\/10 text-primary font-bold border border-primary\/20" : "text-slate-500 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white\/5 hover:text-primary"\}\`\}/g,
    'className={`flex items-center px-4 py-1.5 rounded-lg transition-all group ${!categoryParam ? "text-primary font-bold" : "text-slate-500 dark:text-muted-foreground hover:text-primary"}`}'
);

productsContent = productsContent.replace(
    /className=\{\`flex items-center px-4 py-2\.5 rounded-xl transition-all group \$\{isActive \? "bg-primary\/10 text-primary font-bold border border-primary\/20" : "text-slate-500 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white\/5 hover:text-primary"\}\`\}/g,
    'className={`flex items-center px-4 py-2 rounded-lg transition-all group ${isActive ? "text-primary font-bold" : "text-slate-500 dark:text-muted-foreground hover:text-primary"}`}'
);

// Reduce icon sizes for categories
productsContent = productsContent.replace(/<span className="material-symbols-outlined mr-3 text-lg">/g, '<span className="material-symbols-outlined mr-3 text-[16px]">');

fs.writeFileSync(productsPath, productsContent);
console.log("Updated products/page.tsx");
