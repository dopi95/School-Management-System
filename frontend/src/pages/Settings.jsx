import React from 'react';
import { Settings as SettingsIcon, Moon, Sun, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const Settings = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t('customizePreferences')}</p>
      </div>

      {/* Settings Cards */}
      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="card dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                {isDark ? (
                  <Moon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Sun className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isDark ? t('darkMode') : t('lightMode')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('switchThemes')}
                </p>
              </div>
            </div>
            
            {/* Theme Toggle Switch */}
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isDark ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDark ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Language Settings */}
        <div className="card dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('language')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'en' ? 'English (EN)' : 'Amharic (AM)'}
                </p>
              </div>
            </div>
            
            {/* Language Toggle Switch */}
            <button
              onClick={toggleLanguage}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                language === 'am' ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  language === 'am' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {/* Language Labels */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className={`flex items-center space-x-1 ${language === 'en' ? 'text-green-600 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
              <span>🇺🇸</span>
              <span>English</span>
            </span>
            <span className={`flex items-center space-x-1 ${language === 'am' ? 'text-green-600 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
              <span>🇪🇹</span>
              <span>አማርኛ</span>
            </span>
          </div>
        </div>

        {/* Application Info */}
        <div className="card dark:bg-gray-800">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('applicationInfo')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('appVersion')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;