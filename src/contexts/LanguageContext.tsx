import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
  availableLanguages: Array<{
    value: string;
    label: string;
    flag: string;
    direction: 'ltr' | 'rtl';
  }>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

const AVAILABLE_LANGUAGES = [
  {
    value: 'en',
    label: 'English',
    flag: '🇬🇧',
    direction: 'ltr' as const,
  },
  {
    value: 'fr',
    label: 'Français',
    flag: '🇫🇷',
    direction: 'ltr' as const,
  },
  {
    value: 'ar',
    label: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl' as const,
  },
];

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [isRTL, setIsRTL] = useState(false);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    // Get saved language from localStorage or use default 'fr'
    const savedLanguage = localStorage.getItem('language') || 'fr';
    const currentLang = AVAILABLE_LANGUAGES.find(lang => lang.value === savedLanguage) || AVAILABLE_LANGUAGES[0];
    
    console.log('🌐 Initial Language Load Debug:', {
      savedLanguage,
      currentLang,
      direction: currentLang.direction,
      willBeRTL: currentLang.direction === 'rtl'
    });
    
    setCurrentLanguage(savedLanguage);
    setIsRTL(currentLang.direction === 'rtl');
    setDirection(currentLang.direction);
    
    // Apply language changes
    applyLanguageChanges(savedLanguage, currentLang.direction);
  }, []);

  const applyLanguageChanges = (language: string, dir: 'ltr' | 'rtl') => {
    // Change document direction and language
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    // Apply RTL-specific styles
    if (dir === 'rtl') {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
    
    // Change i18n language
    i18n.changeLanguage(language);
  };

  const changeLanguage = (language: string) => {
    const selectedLang = AVAILABLE_LANGUAGES.find(lang => lang.value === language);
    if (!selectedLang) return;

    console.log('🌐 Language Change Debug:', {
      language,
      selectedLang,
      direction: selectedLang.direction,
      willBeRTL: selectedLang.direction === 'rtl'
    });

    setCurrentLanguage(language);
    setIsRTL(selectedLang.direction === 'rtl');
    setDirection(selectedLang.direction);
    
    // Save to localStorage
    localStorage.setItem('language', language);
    
    // Apply changes
    applyLanguageChanges(language, selectedLang.direction);
  };

  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    isRTL,
    direction,
    availableLanguages: AVAILABLE_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 