import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const translations = {
  en: {
    home: "Home",
    dashboard: "Dashboard",
    cityMap: "City Map",
    leaderboard: "Leaderboard",
    activity: "Activity",
    report: "Report",
    admin: "Admin Panel",
    login: "Sign In",
    logout: "Logout",
    heroTitle: "Fix Your City,",
    heroSubtitle: "One Report at a Time.",
    heroDesc: "UrbanPulse connects citizens with local authorities to resolve infrastructure issues quickly. See a problem? Report it. Track it. Get it fixed.",
    reportBtn: "Report an Issue",
    viewDashboard: "View Dashboard",
    empowering: "Empowering Communities",
    howItWorks: "How UrbanPulse Works",
    recentActivity: "Recent Activity",
    issuesResolved: "Issues Resolved",
    activeCitizens: "Active Citizens",
    localAuthorities: "Local Authorities",
    avgResolution: "Avg Resolution",
    cityExplorer: "City Explorer",
    cityCenter: "City Center (Urban HQ)",
    fullCoverage: "Full Urban Coverage",
    activeReports: "Active Reports",
    manage: "Manage",
    details: "Details",
    location: "Location",
    description: "Description",
    category: "Category",
    priority: "Priority",
    status: "Status",
    points: "Points",
    badges: "Badges",
    socialShare: "Share this Issue",
  },
  hi: {
    home: "मुख्य पृष्ठ",
    dashboard: "डैशबोर्ड",
    cityMap: "शहर का नक्शा",
    leaderboard: "लीडरबोर्ड",
    activity: "गतिविधि",
    report: "रिपोर्ट करें",
    admin: "एडमिन पैनल",
    login: "लॉग इन",
    logout: "लॉगआउट",
    heroTitle: "अपने शहर को सुधारें,",
    heroSubtitle: "एक रिपोर्ट के साथ।",
    heroDesc: "अर्बनपल्स नागरिकों को बुनियादी ढांचे के मुद्दों को जल्दी से हल करने के लिए स्थानीय अधिकारियों से जोड़ता है। कोई समस्या देखें? इसकी रिपोर्ट करें। इसे ट्रैक करें। इसे ठीक करवाएं।",
    reportBtn: "रिपोर्ट दर्ज करें",
    viewDashboard: "डैशबोर्ड देखें",
    empowering: "समुदायों को सशक्त बनाना",
    howItWorks: "अर्बनपल्स कैसे काम करता है",
    recentActivity: "हाल की गतिविधि",
    issuesResolved: "मुद्दे हल हुए",
    activeCitizens: "सक्रिय नागरिक",
    localAuthorities: "स्थानीय अधिकारी",
    avgResolution: "औसत समाधान",
    cityExplorer: "सिटी एक्सप्लोरर",
    cityCenter: "सिटी सेंटर (शहरी मुख्यालय)",
    fullCoverage: "पूर्ण शहरी कवरेज",
    activeReports: "सक्रिय रिपोर्ट",
    manage: "प्रबंधित करें",
    details: "विवरण",
    location: "स्थान",
    description: "विवरण",
    category: "श्रेणी",
    priority: "प्राथमिकता",
    status: "स्थिति",
    points: "अंक",
    badges: "बैज",
    socialShare: "इस मुद्दे को साझा करें",
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('urbanpulse_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('urbanpulse_lang', lang);
  }, [lang]);

  const t = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return { lang: 'en', setLang: () => {}, t: translations.en };
  }
  return context;
};
