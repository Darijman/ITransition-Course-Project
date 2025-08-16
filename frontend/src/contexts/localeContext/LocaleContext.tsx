'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Messages, IntlProvider } from 'next-intl';
import en from '../../locales/en.json';
import ru from '../../locales/ru.json';

type Locale = 'en' | 'ru';

interface LocaleContextType {
  locale: Locale;
  switchLocale: (newLocale: Locale) => void;
}

const messagesMap: Record<Locale, Messages> = { en, ru };

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within LocaleProvider');
  return context;
};

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('en');
  const [messages, setMessages] = useState<Messages>(messagesMap['en']);
  const [mounted, setMounted] = useState<boolean>(false); 

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale | null;
    if (savedLocale && messagesMap[savedLocale]) {
      setLocale(savedLocale);
      setMessages(messagesMap[savedLocale]);
    }
    setMounted(true);
  }, []);

  const switchLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    setMessages(messagesMap[newLocale]);
    localStorage.setItem('locale', newLocale);
  };

  if (!mounted) return null;

  return (
    <LocaleContext.Provider value={{ locale, switchLocale }}>
      <IntlProvider locale={locale} messages={messages}>
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
};
