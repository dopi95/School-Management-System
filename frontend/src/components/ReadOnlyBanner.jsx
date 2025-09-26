import React from 'react';
import { Eye, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const ReadOnlyBanner = () => {
  const { admin } = useAuth();

  if (admin?.role !== 'user') return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <Eye className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Read-Only Access
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            You have view-only permissions. You cannot add, edit, or delete any data.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        </div>
      </div>
    </div>
  );
};

export default ReadOnlyBanner;