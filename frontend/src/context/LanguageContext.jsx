import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Auth
    login: 'Login',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember Me',
    signIn: 'Sign In',
    
    // Navigation
    dashboard: 'Dashboard',
    students: 'Students',
    teachers: 'Teachers',
    admins: 'Admins',
    profile: 'Profile',
    logout: 'Logout',
    settings: 'Settings',
    payments: 'Payments',
    customizePreferences: 'Customize your application preferences',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    switchThemes: 'Switch between light and dark themes',
    language: 'Language',
    applicationInfo: 'Application Info',
    appVersion: 'Bluelight Academy Management System v1.0.0',
    bluelightAcademy: 'Bluelight Academy',
    
    // Dashboard
    totalStudents: 'Total Students',
    totalTeachers: 'Total Teachers',
    totalAdmins: 'Total Admins',
    
    // Students
    addStudent: 'Add Student',
    studentName: 'Student Name',
    phoneNumber: 'Phone Number',
    idNumber: 'ID Number',
    class: 'Class',
    filterByClass: 'Filter by Class',
    searchStudents: 'Search students...',
    
    // Teachers
    addTeacher: 'Add Teacher',
    teacherName: 'Teacher Name',
    subject: 'Subject',
    
    // Common
    search: 'Search',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    actions: 'Actions',
    online: 'Online',
    superAdmin: 'Super Admin',
    admin: 'Admin',
  },
  am: {
    // Auth
    login: 'ግባ',
    email: 'ኢሜይል',
    password: 'የይለፍ ቃል',
    forgotPassword: 'የይለፍ ቃልዎን ረሱት?',
    rememberMe: 'አስታውሰኝ',
    signIn: 'ግባ',
    
    // Navigation
    dashboard: 'ዳሽቦርድ',
    students: 'ተማሪዎች',
    teachers: 'መምህራን',
    admins: 'አስተዳዳሪዎች',
    profile: 'መገለጫ',
    logout: 'ውጣ',
    settings: 'ቅንብሮች',
    payments: 'ይፋላዎች',
    customizePreferences: 'የመተግበሪያ ምርጫዎችዎን ያበጁ',
    darkMode: 'ጨለማ ሁነታ',
    lightMode: 'ብርሃን ሁነታ',
    switchThemes: 'በብርሃን እና ጨለማ ጭብጦች መካከል ይቀይሩ',
    language: 'ቋንቋ',
    applicationInfo: 'የመተግበሪያ መረጃ',
    appVersion: 'ብሉላይት አካዳሚ አስተዳደር ስርዓት v1.0.0',
    bluelightAcademy: 'ብሉላይት አካዳሚ',
    
    // Dashboard
    totalStudents: 'ጠቅላላ ተማሪዎች',
    totalTeachers: 'ጠቅላላ መምህራን',
    totalAdmins: 'ጠቅላላ አስተዳዳሪዎች',
    
    // Students
    addStudent: 'ተማሪ ጨምር',
    studentName: 'የተማሪ ስም',
    phoneNumber: 'ስልክ ቁጥር',
    idNumber: 'መታወቂያ ቁጥር',
    class: 'ክፍል',
    filterByClass: 'በክፍል ማጣሪያ',
    searchStudents: 'ተማሪዎችን ፈልግ...',
    
    // Teachers
    addTeacher: 'መምህር ጨምር',
    teacherName: 'የመምህር ስም',
    subject: 'ትምህርት',
    
    // Common
    search: 'ፈልግ',
    add: 'ጨምር',
    edit: 'አርም',
    delete: 'ሰርዝ',
    save: 'አስቀምጥ',
    cancel: 'ሰርዝ',
    actions: 'ድርጊቶች',
    online: 'መስመር ላይ',
    superAdmin: 'ዋና አስተዳዳሪ',
    admin: 'አስተዳዳሪ',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'en' ? 'am' : 'en';
      localStorage.setItem('language', newLang);
      return newLang;
    });
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};