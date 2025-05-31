import { Listbox } from '@headlessui/react';
import { Check, ChevronDown, Sun, Moon } from 'lucide-react';

interface GlobalHeaderProps {
  setTheme: (theme: 'light' | 'vs-dark') => void;
  setLanguage: (language: 'javascript' | 'typescript' | 'html') => void;
  theme: 'light' | 'vs-dark';
  language: 'javascript' | 'typescript' | 'html';
  user: { name: string, hex: string }
}

const themes = [
  { id: 'light', name: 'Light', icon: <Sun className="w-5 h-5" /> },
  { id: 'vs-dark', name: 'Dark', icon: <Moon className="w-5 h-5" /> },
];

const languages = [
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  },
  {
    id: 'html',
    name: 'HTML',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
  },
  {
    id: 'react',
    name: 'React',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  },
];

function GlobalHeader({ setTheme, setLanguage, theme, language, user }: GlobalHeaderProps) {
  const isDark = theme === 'vs-dark';
  const themeSelected = themes.find((t) => t.id === theme) || themes[0];
  const langSelected = languages.find((l) => l.id === language) || languages[0];

  const listboxBtnClasses = `flex items-center w-full border rounded-lg px-3 py-1.5 cursor-pointer 
    ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}
    focus:outline-none focus:ring-2 focus:ring-blue-500`;

  const listboxOptionsClasses = `absolute mt-1 min-w-full rounded-lg shadow-lg max-h-60 overflow-auto z-50
    ${isDark ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white border border-gray-300 text-black'}`;

  const renderLanguageSelection = () => (
    <div className="relative w-40">
      <Listbox value={language} onChange={(val) => setLanguage(val as 'javascript' | 'typescript' | 'html')}>
        <Listbox.Button className={listboxBtnClasses} title="Select Language">
          <img src={langSelected.icon} alt="" className="w-5 h-5 mr-2" />
          {langSelected.name}
          <ChevronDown className="ml-auto w-4 h-4" />
        </Listbox.Button>

        <Listbox.Options className={listboxOptionsClasses}>
          {languages.map((lang) => (
            <Listbox.Option
              key={lang.id}
              value={lang.id}
              className={({ active }) =>
                `flex items-center px-4 py-2 cursor-pointer ${
                  active ? (isDark ? 'bg-gray-700' : 'bg-blue-100') : ''
                }`
              }
            >
              <img src={lang.icon} alt={lang.name} className="w-5 h-5 mr-2" />
              {lang.name}
              {lang.id === language && <Check className="ml-auto w-4 h-4" />}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );

  const themeSelection = () => (
    <div className="relative w-32">
      <Listbox value={theme} onChange={(val) => setTheme(val as 'light' | 'vs-dark')}>
        <Listbox.Button className={listboxBtnClasses} title="Select Theme">
          <span className="mr-2">{themeSelected.icon}</span>
          {themeSelected.name}
          <ChevronDown className="ml-auto w-4 h-4" />
        </Listbox.Button>

        <Listbox.Options className={listboxOptionsClasses}>
          {themes.map((t) => (
            <Listbox.Option
              key={t.id}
              value={t.id}
              className={({ active }) =>
                `flex items-center px-4 py-2 cursor-pointer ${
                  active ? (isDark ? 'bg-gray-700' : 'bg-blue-100') : ''
                }`
              }
            >
              <span className="mr-2">{t.icon}</span>
              {t.name}
              {t.id === theme && <Check className="ml-auto w-4 h-4" />}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );

  const renderUserBadge = () => (
    <div
      className="px-4 py-2 rounded-full shadow-lg text-sm font-semibold ml-4"
      style={{ backgroundColor: user.hex, color: '#222' }}
    >
      👤 {user.name}
    </div>
  );

  return (
    <div
      className={`sticky top-0 z-50 w-full py-4 shadow-md transition-colors duration-300 ${
        isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}
    >
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 px-4"> {/* removed max-w-7xl and mx-auto */}
        <h1 className="text-2xl font-bold">🛠️ Real-Time Code Editor</h1>

        <div className="flex items-center gap-3">
          {themeSelection()}
          {renderLanguageSelection()}
          {renderUserBadge()} {/* now correctly spaced and not overlapping */}
        </div>
      </div>
    </div>
  );
}

export default GlobalHeader;
