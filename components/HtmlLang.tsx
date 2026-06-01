"use client";

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function HtmlLang() {
  const { language } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
