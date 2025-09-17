import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  UserCog, 
  User,
  LogOut,
  Settings,
  Menu,
  X,
  CreditCard,
  UserX
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/students', icon: Users, label: t('students') },
    { path: '/inactive-students', icon: UserX, label: 'Inactive Students' },
    { path: '/teachers', icon: GraduationCap, label: t('teachers') },
    { path: '/admins', icon: UserCog, label: t('admins') },
    { path: '/payments', icon: CreditCard, label: t('payments') },
    { path: '/settings', icon: Settings, label: t('settings') },
  ];

  return (
    <>
      {/* Mobile Header with Bluelight Academy */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-lg p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary-700 dark:text-primary-400">{t('bluelightAcademy')}</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`bg-white dark:bg-gray-800 shadow-lg h-screen w-64 fixed left-0 z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } lg:top-0 top-16`}>
        {/* Desktop Header */}
        <div className="hidden lg:block p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-primary-700 dark:text-primary-400">{t('bluelightAcademy')}</h1>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 lg:mt-0">
          <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-400 px-2 py-1 rounded-full">
                  Super Admin
                </span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Online</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-400 border-r-4 border-primary-600'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              logout();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center space-x-2 w-full px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">{t('logout')}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;