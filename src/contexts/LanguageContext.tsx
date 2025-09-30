import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (code: string) => void;
  languages: Language[];
  t: (key: string) => string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡିଆ' },
];

const translations: Record<string, Record<string, string>> = {
  en: {
    'site.title': 'MindCare Campus',
    'nav.home': 'Home',
    'nav.resources': 'Resources',
    'nav.relaxation': 'Relaxation',
    'nav.chat': 'AI Support',
    'nav.forum': 'Peer Support',
    'nav.counselors': 'Counselors',
    'nav.games': 'Games',
    'nav.redeem': 'Redeem',
    'hero.title': 'Your Mental Wellness Journey Starts Here',
    'hero.subtitle': 'Culturally-aware, confidential mental health support designed for Indian college students',
    'hero.cta': 'Begin Your Wellness Journey',
    'resources.title': 'Psychoeducational Resources',
    'resources.subtitle': 'Learn about mental health in culturally relevant ways',
    'relaxation.title': 'Relaxation & Mindfulness',
    'relaxation.subtitle': 'Guided practices rooted in Indian wellness traditions',
    'chat.title': 'AI Mental Health First Aid',
    'chat.subtitle': 'Immediate, confidential support when you need it most',
    'forum.title': 'Anonymous Peer Support',
    'forum.subtitle': 'Connect with fellow students in a safe, stigma-free environment',
    'counselors.title': 'Campus Support Directory',
    'counselors.subtitle': 'Find qualified counselors and helplines at your institution',
  },
  hi: {
    'site.title': 'माइंडकेयर कैंपस',
    'nav.home': 'होम',
    'nav.resources': 'संसाधन',
    'nav.relaxation': 'विश्राम',
    'nav.chat': 'AI सहायता',
    'nav.forum': 'साथी सहायता',
    'nav.counselors': 'सलाहकार',
    'nav.games': 'खेल',
    'nav.redeem': 'रिडीम',
    'hero.title': 'आपकी मानसिक कल्याण यात्रा यहाँ शुरू होती है',
    'hero.subtitle': 'भारतीय कॉलेज छात्रों के लिए सांस्कृतिक रूप से जागरूक, गोपनीय मानसिक स्वास्थ्य सहायता',
    'hero.cta': 'अपनी कल्याण यात्रा शुरू करें',
    'resources.title': 'मनोशिक्षा संसाधन',
    'resources.subtitle': 'सांस्कृतिक रूप से प्रासंगिक तरीकों से मानसिक स्वास्थ्य के बारे में जानें',
    'relaxation.title': 'विश्राम और माइंडफुलनेस',
    'relaxation.subtitle': 'भारतीय कल्याण परंपराओं में निहित निर्देशित अभ्यास',
    'chat.title': 'AI मानसिक स्वास्थ्य प्राथमिक चिकित्सा',
    'chat.subtitle': 'जब आपको सबसे ज्यादा जरूरत हो तो तत्काल, गोपनीय सहायता',
    'forum.title': 'गुमनाम साथी सहायता',
    'forum.subtitle': 'एक सुरक्षित, कलंक मुक्त वातावरण में साथी छात्रों से जुड़ें',
    'counselors.title': 'कैंपस सहायता निर्देशिका',
    'counselors.subtitle': 'अपनी संस्था में योग्य सलाहकारों और हेल्पलाइनों का पता लगाएं',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => localStorage.getItem('lang') || 'en');

  const setLanguage = (code: string) => {
    setCurrentLanguage(code);
    localStorage.setItem('lang', code);
  };

  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, languages, t }}>
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