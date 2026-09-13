import React, { createContext, useContext, useState } from 'react';
import { languageFor, type Language } from '../config/languages';
import { getTranslation, type Translations } from '../config/i18n';

interface LanguageContextType {
  language: Language;
  languageCode: string;
  setLanguageCode: (code: string) => void;
  t: Translations;
  questions: string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [languageCode, setLanguageCodeState] = useState<string>(() => {
    return localStorage.getItem('triora_lang') || 'en';
  });

  const setLanguageCode = (code: string) => {
    const langObj = languageFor(code);
    setLanguageCodeState(langObj.code);
    localStorage.setItem('triora_lang', langObj.code);
  };

  const language = languageFor(languageCode);
  const t = getTranslation(language.code);
  const questions = t.questions || getTranslation('en').questions;

  return (
    <LanguageContext.Provider
      value={{
        language,
        languageCode,
        setLanguageCode,
        t,
        questions,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
