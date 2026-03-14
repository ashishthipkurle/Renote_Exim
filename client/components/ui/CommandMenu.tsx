'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Box,
  ShoppingCart,
  MessageSquare,
  Settings,
  User,
  Plus,
} from 'lucide-react';
import { Command } from 'cmdk';

export default function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={() => setOpen(false)}
    >
      <div className="flex h-full w-full items-center justify-center p-4">
        <Command 
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[640px] overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl ring-1 ring-white/10"
        >
          <div className="flex items-center border-b border-slate-800 px-4">
            <Search className="mr-3 h-5 w-5 text-slate-400" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-14 w-full bg-transparent py-4 text-sm outline-none placeholder:text-slate-500 text-white"
            />
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-800">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="px-2 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard Home</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/marketplace'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
              >
                <Box className="h-4 w-4" />
                <span>Marketplace</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard/orders'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>My Orders</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-px bg-slate-800 my-2" />

            <Command.Group heading="Actions" className="px-2 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard/products/new'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>List New Product</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/inbox'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Messenger</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-px bg-slate-800 my-2" />

            <Command.Group heading="Account" className="px-2 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard/settings'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard/profile'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center border-t border-slate-800 px-4 py-3 bg-slate-950/50">
            <kbd className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded border border-slate-700 bg-slate-800 text-[10px] text-slate-400 font-medium">
              ESC
            </kbd>
            <span className="text-[10px] text-slate-500">to close</span>
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                 <kbd className="inline-flex h-5 w-8 items-center justify-center rounded border border-slate-700 bg-slate-800 text-[10px] text-slate-400 font-medium whitespace-nowrap">
                  ENTER
                </kbd>
                <span className="text-[10px] text-slate-500">to select</span>
              </div>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
