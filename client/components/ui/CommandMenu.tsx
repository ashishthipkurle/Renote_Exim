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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl transition-opacity animate-in fade-in duration-300"
      onClick={() => setOpen(false)}
    >
      <div className="flex h-full w-full items-center justify-center p-4">
        <Command 
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[640px] overflow-hidden rounded-3xl bg-black border border-white/10 shadow-2xl ring-1 ring-white/5 animate-in zoom-in-95 duration-300"
        >
          <div className="flex items-center border-b border-white/5 px-6">
            <Search className="mr-4 h-5 w-5 text-muted-foreground/40" />
            <Command.Input
              placeholder="Search data nodes or execute protocol..."
              className="flex h-20 w-full bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground/20 text-white font-medium italic"
            />
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-4 scrollbar-none">
            <Command.Empty className="py-12 text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">
              No telemetry matches found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="px-3 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic">
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard'))}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl text-muted-foreground hover:bg-white/5 hover:text-white cursor-pointer transition-all group"
              >
                <LayoutDashboard className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-black uppercase tracking-widest">Dashboard Home</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/marketplace'))}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl text-muted-foreground hover:bg-white/5 hover:text-white cursor-pointer transition-all group"
              >
                <Box className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-black uppercase tracking-widest">Marketplace Hub</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard/orders'))}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl text-muted-foreground hover:bg-white/5 hover:text-white cursor-pointer transition-all group"
              >
                <ShoppingCart className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-black uppercase tracking-widest">Transmission Logs</span>
              </Command.Item>
            </Command.Group>

            <div className="h-px bg-white/5 mx-4 my-2" />

            <Command.Group heading="Procurement" className="px-3 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic">
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard/products/new'))}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl text-muted-foreground hover:bg-white/5 hover:text-white cursor-pointer transition-all group"
              >
                <Plus className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-black uppercase tracking-widest">Initialize Asset</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/inbox'))}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl text-muted-foreground hover:bg-white/5 hover:text-white cursor-pointer transition-all group"
              >
                <MessageSquare className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-black uppercase tracking-widest">Comms Interface</span>
              </Command.Item>
            </Command.Group>

            <div className="h-px bg-white/5 mx-4 my-2" />

            <Command.Group heading="System" className="px-3 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic">
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard/settings'))}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl text-muted-foreground hover:bg-white/5 hover:text-white cursor-pointer transition-all group"
              >
                <Settings className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-black uppercase tracking-widest">Configurations</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard/profile'))}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl text-muted-foreground hover:bg-white/5 hover:text-white cursor-pointer transition-all group"
              >
                <User className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-black uppercase tracking-widest">Node Profile</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center border-t border-white/5 px-6 py-4 bg-muted/10">
            <div className="flex items-center gap-3">
              <kbd className="inline-flex h-6 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[9px] font-black text-white uppercase tracking-widest">
                ESC
              </kbd>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Abort</span>
            </div>
            <div className="ml-auto flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <kbd className="inline-flex h-6 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[9px] font-black text-white uppercase tracking-widest">
                  ENTER
                </kbd>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Execute</span>
              </div>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
