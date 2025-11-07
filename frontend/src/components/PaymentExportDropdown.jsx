import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, ChevronDown } from 'lucide-react';

const PaymentExportDropdown = ({ onExportPaid, onExportUnpaid }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (type) => {
    if (type === 'paid') {
      onExportPaid();
    } else if (type === 'unpaid') {
      onExportUnpaid();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary flex items-center space-x-1 text-xs lg:text-sm px-2 py-1 lg:px-4 lg:py-2"
        title="Export payment reports"
      >
        <Download className="w-3 h-3 lg:w-4 lg:h-4" />
        <span>Export</span>
        <ChevronDown className={`w-3 h-3 lg:w-4 lg:h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            <button
              onClick={() => handleExport('paid')}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <FileText className="w-4 h-4 text-green-600" />
              <span>Paid Students</span>
            </button>
            <button
              onClick={() => handleExport('unpaid')}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <FileText className="w-4 h-4 text-red-600" />
              <span>Unpaid Students</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentExportDropdown;