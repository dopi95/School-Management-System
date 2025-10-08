import React, { useEffect } from 'react';
import { CheckCircle, X, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const isSuccess = type === 'success';
  const iconBgColor = isSuccess ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900';
  const iconColor = isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const borderColor = isSuccess ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800';
  const titleColor = isSuccess ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200';
  const progressColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
  const title = isSuccess ? 'Success!' : 'Error!';
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className={`bg-white dark:bg-gray-800 border ${borderColor} rounded-lg shadow-lg p-4 min-w-[320px] max-w-md`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${iconBgColor} rounded-full flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm font-semibold ${titleColor} mb-1`}>
                  {title}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {message}
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
          <div 
            className={`${progressColor} h-1 rounded-full animate-progress`}
            style={{
              animation: `progress ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;