import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/components/auth/AuthProvider";

interface UnreadCounts {
  buyers: number;
  dealers: number;
  sellers: number;
  exporters: number;
}

export function useUnreadCategories(pollInterval = 30000) {
  const { user } = useAuth();
  const [counts, setCounts] = useState<UnreadCounts>({
    buyers: 0,
    dealers: 0,
    sellers: 0,
    exporters: 0,
  });
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCounts = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get("/api/messaging/unread-categories");
      setCounts(res.data);
    } catch (err) {
      console.error("Failed to fetch unread categories", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    fetchCounts();

    if (pollInterval > 0) {
      intervalRef.current = setInterval(fetchCounts, pollInterval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, fetchCounts, pollInterval]);

  return { counts, loading, refresh: fetchCounts };
}
