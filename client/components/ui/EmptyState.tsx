'use client';

import { 
 LucideIcon, 
 Search, 
 SearchX, 
 Package, 
 ShoppingCart, 
 AlertCircle,
 FileSearch
} from 'lucide-react';
import Link from 'next/link';

const ICON_MAP = {
 search: Search,
 searchX: SearchX,
 package: Package,
 shoppingCart: ShoppingCart,
 alert: AlertCircle,
 fileSearch: FileSearch
};

type IconName = keyof typeof ICON_MAP;

interface EmptyStateProps {
 icon?: LucideIcon;
 iconName?: IconName;
 title: string;
 description: string;
 actionLabel?: string;
 onAction?: () => void;
 href?: string;
}

export default function EmptyState({
 icon,
 iconName,
 title,
 description,
 actionLabel,
 onAction,
 href,
}: EmptyStateProps) {
 // Determine which icon to use
 const Icon = (iconName ? ICON_MAP[iconName] : icon) || Search;

 const ActionButton = () => (
 <button 
 onClick={onAction}
 className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 h-14 rounded-lg transition-all shadow-xl font-black uppercase tracking-[0.2em] active:scale-[0.98] text-[10px]"
 >
 {actionLabel}
 </button>
 );

 return (
 <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in-95 duration-500">
 <div className="w-24 h-24 bg-muted/20 backdrop-blur-3xl border border-border rounded-lg flex items-center justify-center mb-10 text-foreground shadow-2xl relative group">
 <div className="absolute inset-0 bg-foreground/5 rounded-lg animate-pulse group-hover:bg-foreground/10 transition-colors" />
 <Icon className="w-10 h-10 relative z-10" />
 </div>
 <h3 className="text-3xl font-black text-foreground mb-4 tracking-tighter uppercase ">{title}</h3>
 <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] max-w-sm mx-auto mb-12 leading-relaxed">
 {description}
 </p>
 {actionLabel && (
 <>
 {href ? (
 <Link href={href}>
 <ActionButton />
 </Link>
 ) : onAction ? (
 <ActionButton />
 ) : null}
 </>
 )}
 </div>
 );
}

