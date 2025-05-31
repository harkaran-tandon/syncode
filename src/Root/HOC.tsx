import React, { useEffect, useState } from "react";
import { useFetchUser } from "../globalHooks";
import GlobalHeader from "./GlobalHeader";
import CopyRightFooter from "./CopyRightFooter";
import { namesWithColors } from "../hooks/useYjs";

const STORAGE_KEY = 'user_id';
const THEME_KEY = 'app_theme';
const LANGUAGE_KEY = 'code_language';

const AppWrapperHOC = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const HOCComponent: React.FC<P> = (props) => {

    const getInitialTheme = () => {
      const stored = localStorage.getItem(THEME_KEY);
      return stored === 'light' || stored === 'vs-dark' ? stored : 'vs-dark';
    };
    
    const getInitialLanguage = () => {
      const stored = localStorage.getItem(LANGUAGE_KEY);
      return stored === 'javascript' || stored === 'typescript' || stored === 'html' ? stored : 'javascript';
    };
    const [isLoading, setIsLoading] = useState(false);
    const [theme, setTheme] = useState<'light' | 'vs-dark'>(getInitialTheme);
    const [language, setLanguage] = useState<'javascript' | 'typescript' | 'html'>(getInitialLanguage);
    const userInfo = useFetchUser();
    const [user, setUser] = useState<{ name: string; hex: string }>({ name: '', hex: '#ffffff' });

  useEffect(() => {
    setIsLoading(false);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      const assigned = namesWithColors[Math.floor(Math.random() * namesWithColors.length)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assigned));
      setUser(assigned);
    }
    const storedTheme = localStorage.getItem(THEME_KEY);
    const storedLanguage = localStorage.getItem(LANGUAGE_KEY) || 'javascript';
    if (storedTheme === 'light' || storedTheme === 'vs-dark') {
      setTheme(storedTheme);
    }
    if (['javascript', 'typescript', 'html'].includes(storedLanguage)) {
      setLanguage(storedLanguage as 'javascript' | 'typescript' | 'html');
    }
  }, []);

  useEffect(() => {
    console.log('running')
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [theme, language]);
    

    if (isLoading) {
      return <div>Loading...</div>;
    }

    const backgroundClass = theme === 'vs-dark' ? 'bg-gray-900 text-white' : 'bg-white text-black';
    const isDark = theme === 'vs-dark';

    return (
      <div className={`${backgroundClass}`}>
      <GlobalHeader
      setTheme={setTheme}
      setLanguage={setLanguage}
      theme={theme}
      language={language}
      user={user}
      />
      <main className={`min-h-screen relative transition-colors duration-300 ${isDark ? 'bg-gray-950 text-white' : 'bg-gradient-to-br from-blue-50 to-purple-100 text-gray-900'}`}>
      <WrappedComponent {...props}
      userInfo={userInfo}
      theme={theme}
      language={language}
      user={user}
      />
      </main>
      <CopyRightFooter/>
      </ div>
    );
  };

  return HOCComponent;
};

export default AppWrapperHOC;
