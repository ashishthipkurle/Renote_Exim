'use client';

import { useTranslation } from 'react-i18next';

export function useFormat() {
  const { i18n } = useTranslation();
  const locale = i18n.language || 'en';

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(locale, options).format(value);
  };

  const formatCompact = (value: number) => {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  };

  const formatCurrency = (value: number, currency = 'USD') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  };

  return {
    formatNumber,
    formatCompact,
    formatCurrency,
    locale
  };
}
