'use client';

import { useTranslation } from 'react-i18next';
import { useHydration } from '@/hooks/use-hydration';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const isHydrated = useHydration();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'te' : 'en';
    i18n.changeLanguage(newLang);
  };

  // During SSR and initial hydration, always show "తెలుగు" (toggle to Telugu)
  // since we force 'en' on the server
  const buttonText = !isHydrated || i18n.language === 'en' ? 'తెలుగు' : 'English';

  return (
    <button
      onClick={toggleLanguage}
      className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
    >
      {buttonText}
    </button>
  );
}

