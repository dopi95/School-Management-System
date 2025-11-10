import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Calendar, FileText, Filter } from 'lucide-react';
import apiService from '../services/api.js';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';
import { canView, canCreate, canEdit, canDelete } from '../utils/permissions.js';

const CustomPaymentLists = () => {
  const { admin } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newList, setNewList] = useState({ title: '', year: 2018 });
  const [editingList, setEditingList] = useState(null);
  const [yearFilter, setYearFilter] = useState('all');

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const response = await apiService.request('/custom-payment-lists');
      setLists(response);
    } catch (error) {
      console.error('Failed to load lists:', error);
      setLists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newList.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      const createdList = await apiService.request('/custom-payment-lists', {
        method: 'POST',
        body: JSON.stringify(newList)
      });
      
      // Add the new list to the existing lists immediately
      setLists(prev => [createdList, ...prev]);
      
      toast.success('List created successfully!');
      setShowCreateModal(false);
      setNewList({ title: '', year: 2018 });
    } catch (error) {
      toast.error('Failed to create list: ' + error.message);
    }
  };

  const handleUpdateList = async () => {
    if (!newList.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      const updatedList = await apiService.request(`/custom-payment-lists/${editingList._id}`, {
        method: 'PUT',
        body: JSON.stringify(newList)
      });
      
      // Update the list in state immediately
      setLists(prev => prev.map(list => 
        list._id === editingList._id ? updatedList : list
      ));
      
      toast.success('List updated successfully!');
      setShowEditModal(false);
      setEditingList(null);
      setNewList({ title: '', year: 2018 });
    } catch (error) {
      toast.error('Failed to update list: ' + error.message);
    }
  };

  const handleDeleteList = async (listId) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        await apiService.request(`/custom-payment-lists/${listId}`, { method: 'DELETE' });
        
        // Remove the list from state immediately
        setLists(prev => prev.filter(list => list._id !== listId));
        
        toast.success('List deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete list: ' + error.message);
      }
    }
  };

  const generateYearOptions = () => {
    const years = [];
    for (let year = 2017; year <= 2050; year++) {
      years.push(year);
    }
    return years;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading payment lists...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Custom Payment Lists</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">Create and manage custom student payment lists</p>
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          {canCreate(admin, 'customPaymentLists') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Create New List</span>
            </button>
          )}
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
            >
              <option value="all">All Years</option>
              {generateYearOptions().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lists Grid */}
      {(() => {
        const filteredLists = yearFilter === 'all' ? lists : lists.filter(list => list.year.toString() === yearFilter);
        
        return filteredLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLists.map((list) => (
            <div key={list._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{list.title}</h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{list.year}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <p>{list.students?.length || 0} students added</p>
                <p>Created: {new Date(list.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="flex items-center space-x-2">
                {canView(admin, 'customPaymentLists') && (
                  <Link
                    to={`/custom-payment-lists/${list._id}`}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </Link>
                )}
                {canEdit(admin, 'customPaymentLists') && (
                  <button
                    onClick={() => {
                      setEditingList(list);
                      setNewList({ title: list.title, year: list.year });
                      setShowEditModal(true);
                    }}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
                {canDelete(admin, 'customPaymentLists') && (
                  <button
                    onClick={() => handleDeleteList(list._id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {yearFilter === 'all' ? 'No custom payment lists created yet' : `No lists found for ${yearFilter}`}
            </p>
            {canCreate(admin, 'customPaymentLists') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Your First List
              </button>
            )}
          </div>
        );
      })()}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Payment List
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  List Title
                </label>
                <input
                  type="text"
                  value={newList.title}
                  onChange={(e) => setNewList(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Student Lists for Logo, Graduation Photo Payment..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year
                </label>
                <select
                  value={newList.year}
                  onChange={(e) => setNewList(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateList}
                className="btn-primary flex-1"
              >
                Create List
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewList({ title: '', year: 2018 });
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit Payment List
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  List Title
                </label>
                <input
                  type="text"
                  value={newList.title}
                  onChange={(e) => setNewList(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Student Lists for Logo, Graduation Photo Payment..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year
                </label>
                <select
                  value={newList.year}
                  onChange={(e) => setNewList(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleUpdateList}
                className="btn-primary flex-1"
              >
                Update List
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingList(null);
                  setNewList({ title: '', year: 2018 });
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomPaymentLists;