'use client';

import React, { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n'; // Adjust path as needed

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  // i18n is now initialized at the module level in frontend/lib/i18n.ts
  // No need for local state or useEffect for initialization here.

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
