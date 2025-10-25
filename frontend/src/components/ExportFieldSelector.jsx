import React, { useState } from 'react';
import { FileText, FileSpreadsheet, X, CheckSquare, Square } from 'lucide-react';

const ExportFieldSelector = ({ 
  isOpen, 
  onClose, 
  fields, 
  onExport, 
  title = "Select Fields to Export",
  data = []
}) => {
  const [selectedFields, setSelectedFields] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.key]: false }), {})
  );

  const handleSelectAll = (checked) => {
    setSelectedFields(fields.reduce((acc, field) => ({ ...acc, [field.key]: checked }), {}));
  };

  const handleFieldToggle = (fieldKey) => {
    setSelectedFields(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const handleExport = (format) => {
    const selected = fields.filter(field => selectedFields[field.key]);
    onExport(selected, format, data);
    onClose();
  };

  const isAllSelected = fields.every(field => selectedFields[field.key]);
  const isIndeterminate = fields.some(field => selectedFields[field.key]) && !isAllSelected;
  const selectedCount = Object.values(selectedFields).filter(Boolean).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <label className="flex items-center space-x-2 cursor-pointer p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => { if (el) el.indeterminate = isIndeterminate; }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="font-medium text-gray-900 dark:text-white">
                Select All Fields ({selectedCount}/{fields.length})
              </span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fields.map((field) => (
              <label key={field.key} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                <input
                  type="checkbox"
                  checked={selectedFields[field.key] || false}
                  onChange={() => handleFieldToggle(field.key)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 dark:border-gray-600">
          <div className="flex space-x-3">
            <button
              onClick={() => handleExport('pdf')}
              disabled={selectedCount === 0}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex-1"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={selectedCount === 0}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex-1"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportFieldSelector;