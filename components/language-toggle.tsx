'use client';

import { useTranslation } from 'react-i18next';

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'te' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
    >
      {i18n.language === 'en' ? 'తెలుగు' : 'English'}
    </button>
  );
}
