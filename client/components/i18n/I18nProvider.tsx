'use client';

import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import '@/lib/i18n/client'; // ensure client initialization

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <I18nextProvider i18n={i18next}>
      {children}
    </I18nextProvider>
  );
}
