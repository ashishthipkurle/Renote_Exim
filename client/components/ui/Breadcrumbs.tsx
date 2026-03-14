'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  if (pathname === '/') return null;

  const paths = pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 font-medium">
      <Link 
        href="/" 
        className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Home</span>
      </Link>

      {paths.map((path, index) => {
        const href = `/${paths.slice(0, index + 1).join('/')}`;
        const isLast = index === paths.length - 1;
        const label = path
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());

        return (
          <div key={path} className="flex items-center gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            {isLast ? (
              <span className="text-slate-300 truncate max-w-[150px]">{label}</span>
            ) : (
              <Link 
                href={href}
                className="hover:text-blue-500 transition-colors whitespace-nowrap"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
