import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const SessionWarning = () => {
  const { isAuthenticated, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check session every minute
    const interval = setInterval(() => {
      const sessionActive = sessionStorage.getItem('sessionActive');
      if (!sessionActive) {
        logout();
        return;
      }

      // Show warning 2 minutes before session expires
      const warningTime = 2 * 60 * 1000; // 2 minutes
      const sessionTimeout = 15 * 60 * 1000; // 15 minutes
      
      // This is a simplified version - in a real app you'd track the actual session start time
      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity);
        const timeUntilExpiry = sessionTimeout - timeSinceActivity;
        
        if (timeUntilExpiry <= warningTime && timeUntilExpiry > 0) {
          setShowWarning(true);
          setTimeLeft(Math.ceil(timeUntilExpiry / 1000));
        } else {
          setShowWarning(false);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  const extendSession = () => {
    sessionStorage.setItem('sessionActive', 'true');
    localStorage.setItem('lastActivity', Date.now().toString());
    setShowWarning(false);
  };

  if (!showWarning || !isAuthenticated) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Session Expiring Soon
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Your session will expire in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} minutes due to inactivity.
          </p>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={extendSession}
              className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
            >
              Stay Logged In
            </button>
            <button
              onClick={() => setShowWarning(false)}
              className="text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionWarning;