import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr'; // Common for Supabase SSR

export function useRealtimeNotifications(userId: string | undefined, onNotification: (payload: any) => void) {
  useEffect(() => {
    if (!userId) return;
    
    // Fallback to minimal createClient if user doesnt have a strict wrapper
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const channel = supabase.channel(`user:${userId}:notifications`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications', // Match mapped table name in schema
        filter: `userId=eq.${userId}` 
      }, (payload) => {
        onNotification(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onNotification]);
}
