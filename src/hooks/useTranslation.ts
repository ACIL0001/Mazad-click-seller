import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  const { currentLanguage, changeLanguage, isRTL, direction, availableLanguages } = useLanguage();

  return {
    t,
    i18n,
    currentLanguage,
    changeLanguage,
    isRTL,
    direction,
    availableLanguages,
    // Helper function to format text based on direction
    formatText: (text: string) => {
      return isRTL ? text : text;
    },
    // Helper function to get text alignment class
    getTextAlignClass: () => {
      return isRTL ? 'text-right' : 'text-left';
    },
    // Helper function to get flex direction class
    getFlexDirectionClass: () => {
      return isRTL ? 'flex-row-reverse' : 'flex-row';
    },
  };
}; 