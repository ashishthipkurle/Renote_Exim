const fs = require('fs');

const path = 'app/dashboard/importer/inventory/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update Grid
content = content.replace(
    /grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8/,
    'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
);

// 2. Update MarketplaceProductCard component
// Note: We'll replace the whole function to be safe.
const newCardFunction = `function MarketplaceProductCard({ product, onToggleWishlist }: { product: Product; onToggleWishlist: () => void }) {
  const isInStock = (product.quantity ?? 0) > 0;
  
  return (
    <div className="group relative">
      <Link href={\`/products/\${product.id}\`} className="block">
        {/* Card Image */}
        <div className="relative mb-3 overflow-hidden rounded-lg bg-[#f8f9fa] dark:bg-white/[0.03] aspect-square border border-border dark:border-white/5 group-hover:border-primary/40 transition-all duration-500 shadow-sm group-hover:shadow-md">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-2 transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
              <Package className="w-12 h-12" />
            </div>
          )}
          
          {/* Badge */}
          <div className="absolute top-4 left-4">
            {isInStock ? (
              <span className="bg-[#b4d6ff] text-[#002d66] dark:bg-primary/20 dark:text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <Check className="w-3 h-3" />
                In Stock
              </span>
            ) : (
              <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                Pre-Order
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 mr-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                {product.category}
              </span>
              <h2 className="text-base font-black mt-1 text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors uppercase tracking-tight font-headline">
                {product.name}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-foreground">{formatCurrency(product.price)}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">/ {product.unit}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-tight">
              {product.exporter.businessName || product.exporter.name || "Verified Merchant"}
            </span>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-border">
            <span className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 group-hover:gap-3 transition-all">
              Analyze Specs <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>

      <button
        onClick={(e) => { e.preventDefault(); onToggleWishlist(); }}
        className="absolute top-4 right-4 p-2.5 rounded-lg bg-background/80 backdrop-blur-md border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 z-10"
      >
        <Bookmark className="w-4 h-4" />
      </button>
    </div>
  );
}`;

// Use a more robust search for the function
const cardFunctionRegex = /function MarketplaceProductCard[\s\S]*?}\s*}\s*\r?\n/m;
if (content.match(cardFunctionRegex)) {
    content = content.replace(cardFunctionRegex, newCardFunction + '\n\n');
} else {
    console.error("Could not find function MarketplaceProductCard");
    process.exit(1);
}

fs.writeFileSync(path, content);
console.log("Successfully updated Importer Inventory page with new Marketplace card design.");
