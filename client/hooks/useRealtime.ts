import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';

export function useRealtimeNotifications(userId: string | undefined, onNotification: (payload: any) => void) {
  useEffect(() => {
    if (!userId) return;
    
    const socket = getSocket();
    
    // Join a room specific to the user
    socket.emit("join-user-room", userId);
    
    const handleNotification = (payload: any) => {
      onNotification(payload);
    };
    
    socket.on("new-notification", handleNotification);

    return () => {
      socket.off("new-notification", handleNotification);
    };
  }, [userId, onNotification]);
}
