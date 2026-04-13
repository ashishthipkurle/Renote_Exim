const fs = require('fs');

const path = 'components/importer/ImporterSidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add ShoppingBag import if not already there
if (!content.includes('ShoppingBag')) {
    content = content.replace(/Users,\n} from "lucide-react";/, '  Users,\n  ShoppingBag\n} from "lucide-react";');
}

// 2. Add children prop to component signature if not already there
if (!content.includes('children?: React.ReactNode')) {
    content = content.replace(/export default function ImporterSidebar\({ basePath }: { basePath: string }\) {/, 'export default function ImporterSidebar({ basePath, children }: { basePath: string; children?: React.ReactNode }) {');
}

// 3. Update nav array
const oldNav = `const nav: NavItem[] = [
  { href: basePath, label: "Dashboard", icon: Home },
  { href: \`\${basePath}/directory\`, label: "Sellers", icon: Users },
  { href: \`\${basePath}/orders\`, label: "Orders", icon: Truck },
  { href: \`\${basePath}/rfqs\`, label: "RFQs", icon: FileText },
  { href: \`\${basePath}/inventory\`, label: "Inventory", icon: Boxes },
  { href: \`\${basePath}/analytics\`, label: "Analytics", icon: LineChart },
  { href: \`\${basePath}/finance\`, label: "Finance", icon: Wallet },
  ];`;

const newNav = `const nav: NavItem[] = [
    { href: basePath, label: "Dashboard", icon: Home },
    { href: "/products", label: "Marketplace", icon: ShoppingBag },
    { href: \`\${basePath}/directory\`, label: "Sellers", icon: Users },
    { href: \`\${basePath}/orders\`, label: "Orders", icon: Truck },
    { href: \`\${basePath}/rfqs\`, label: "RFQs", icon: FileText },
    { href: \`\${basePath}/inventory\`, label: "Inventory", icon: Boxes },
    { href: \`\${basePath}/analytics\`, label: "Analytics", icon: LineChart },
    { href: \`\${basePath}/finance\`, label: "Finance", icon: Wallet },
  ];`;

// Relaxed regex for the nav array because of potential previous partial updates
content = content.replace(/const nav: NavItem\[] = \[\s*\{ href: basePath, label: "Dashboard", icon: Home \},[\s\S]*?\];/, newNav);

// 4. Render children in sidebar content
if (!content.includes('{children && (')) {
    content = content.replace(/<\/SidebarMenu>\s*<\/SidebarContent>/, '</SidebarMenu>\n      {children && (\n        <div className="mt-8 mb-4 px-2">\n          {children}\n        </div>\n      )}\n    </SidebarContent>');
}

fs.writeFileSync(path, content);
console.log("Successfully updated ImporterSidebar with Marketplace integration.");
