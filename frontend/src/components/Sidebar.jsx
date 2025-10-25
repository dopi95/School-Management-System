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
  UserX,
  Send,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getProfilePictureUrl, getInitials } from '../utils/profileUtils.js';
import logo from '../assets/lo.png';

const Sidebar = () => {
  const { admin, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getMenuLabel = (key) => {
    if (language === 'am') {
      const amharicLabels = {
        dashboard: 'ዳሽቦርድ',
        students: 'ተማሪዎች',
        'inactive-students': 'Inactive ተማሪዎች',
        employees: 'ሰራተኞች',
        'inactive-employees': 'Inactive ሰራተኞች',
        admins: 'አስተዳዳሪዎች',
        payments: 'ክፍያዎች',
        notifications: 'ማሳወቂያዎች',
        profile: 'የእኔ መገለጫ',
        settings: 'ሴቲንግ'
      };
      return amharicLabels[key] || key;
    }
    
    const englishLabels = {
      dashboard: 'Dashboard',
      students: 'Students',
      'inactive-students': 'Inactive Students',
      employees: 'Employees',
      'inactive-employees': 'Inactive Employees',
      admins: 'Admins',
      payments: 'Payments',
      notifications: 'Send Notifications',
      profile: 'My Profile',
      settings: 'Settings'
    };
    return englishLabels[key] || key;
  };

  const allMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: getMenuLabel('dashboard'), permission: 'dashboard' },
    { path: '/students', icon: Users, label: getMenuLabel('students'), permission: 'students' },
    { path: '/special-students', icon: Users, label: 'SP Students', permission: 'specialStudents' },
    { path: '/inactive-students', icon: UserX, label: getMenuLabel('inactive-students'), permission: 'inactiveStudents' },
    { path: '/teachers', icon: GraduationCap, label: getMenuLabel('employees'), permission: 'employees' },
    { path: '/inactive-employees', icon: UserX, label: getMenuLabel('inactive-employees'), permission: 'inactiveEmployees' },
    { path: '/payments', icon: CreditCard, label: getMenuLabel('payments'), permission: 'payments' },
    { path: '/special-payments', icon: CreditCard, label: 'SP Payments', permission: 'specialPayments' },
    { path: '/notifications', icon: Send, label: getMenuLabel('notifications'), permission: 'notifications' },
    { path: '/admin-management', icon: UserCog, label: getMenuLabel('admins'), permission: 'admins' },
    { path: '/activity-logs', icon: Activity, label: 'Activity Logs', permission: 'admins' },
    // { path: '/admin-profiles', icon: User, label: 'Admin Profiles', permission: 'superadmin', superAdminOnly: true },
    { path: '/profile', icon: User, label: getMenuLabel('profile'), permission: 'profile' },
    { path: '/settings', icon: Settings, label: getMenuLabel('settings'), permission: 'settings' },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (item.superAdminOnly) {
      return admin?.role === 'superadmin';
    }
    if (admin?.role === 'superadmin') return true;
    
    // Check for granular permissions (object with actions)
    if (typeof admin?.permissions?.[item.permission] === 'object') {
      // Show menu item if user has at least view permission
      return admin.permissions[item.permission].view === true;
    }
    
    // Check for simple boolean permissions (backwards compatibility)
    return admin?.permissions?.[item.permission] === true;
  });

  return (
    <>
      {/* Mobile Hamburger Button */}
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed top-2 left-4 z-50 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg touch-manipulation"
          style={{ 
            position: 'fixed', 
            top: '8px', 
            left: '16px',
            zIndex: 9999
          }}
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`bg-white dark:bg-gray-800 shadow-lg w-64 fixed left-0 z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } top-0 h-screen overflow-hidden`}>
        {/* Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={logo}
              alt="Logo"
              className="h-10 w-16"
            />
            <h1 className="text-sm font-bold text-primary-700 dark:text-primary-400 whitespace-nowrap">{t('bluelightAcademy')}</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center overflow-hidden">
              {getProfilePictureUrl(admin?.profilePicture) ? (
                <img
                  src={getProfilePictureUrl(admin.profilePicture)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log('Sidebar profile picture failed to load:', e.target.src);
                    e.target.style.display = 'none';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                  onLoad={(e) => {
                    e.target.style.display = 'block';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) {
                      fallback.style.display = 'none';
                    }
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${getProfilePictureUrl(admin?.profilePicture) ? 'hidden' : 'flex'}`}>
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                  {getInitials(admin?.name)}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{admin?.name}</p>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-400 px-2 py-1 rounded-full capitalize">
                  {admin?.role}
                </span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Online</span>
                </div>
              </div>
            </div>
          </Link>
          
          {/* Mobile Logout Button - Show at top on mobile */}
          {admin && (
            <div className="lg:hidden mt-2">
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors duration-200 font-medium"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">
                  {language === 'am' ? 'ውጣ' : 'Logout'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-2 flex-1">
          <ul className="space-y-0.5">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-400 border-r-4 border-primary-600'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Logout - Only show on desktop */}
        {admin && (
          <div className="hidden lg:block p-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 w-full px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors duration-200 font-medium"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-medium">
                {language === 'am' ? 'ውጣ' : 'Logout'}
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;