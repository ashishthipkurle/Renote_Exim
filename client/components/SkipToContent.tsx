'use client';

import { useEffect, useState } from 'react';

export default function SkipToContent() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <a
      href="#main-content"
      className="fixed left-0 top-0 z-50 -translate-y-full bg-blue-600 text-white px-4 py-2 opacity-0 transition-all focus:translate-y-0 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
    >
      Skip to main content
    </a>
  );
}
