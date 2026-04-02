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
      className="bg-white hover:bg-neutral-200 text-black px-10 h-14 rounded-2xl transition-all shadow-2xl shadow-white/10 font-black uppercase tracking-[0.2em] active:scale-[0.98] text-[10px]"
    >
      {actionLabel}
    </button>
  );

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-muted/20 backdrop-blur-3xl border border-border rounded-[2.5rem] flex items-center justify-center mb-10 text-white shadow-2xl relative group">
        <div className="absolute inset-0 bg-white/5 rounded-[2.5rem] animate-pulse group-hover:bg-white/10 transition-colors" />
        <Icon className="w-10 h-10 relative z-10" />
      </div>
      <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase italic shadow-[0_0_20px_rgba(255,255,255,0.1)]">{title}</h3>
      <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] max-w-sm mx-auto mb-12 leading-relaxed opacity-60">
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

