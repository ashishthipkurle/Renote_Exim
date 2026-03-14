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
import { Button } from '@/components/ui/button';
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
    <Button 
      onClick={onAction}
      className="bg-blue-600 hover:bg-blue-500 text-white px-10 h-14 rounded-2xl transition-all shadow-lg shadow-blue-500/20 font-bold active:scale-[0.98]"
    >
      {actionLabel}
    </Button>
  );

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-slate-900/50 border border-slate-800 rounded-[2rem] flex items-center justify-center mb-8 text-slate-500 shadow-xl">
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-400 text-sm max-w-sm mx-auto mb-10 leading-relaxed font-medium">
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

