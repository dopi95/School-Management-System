/**
 * Utility functions for handling profile pictures
 */

/**
 * Get the full URL for a profile picture
 * @param {string} profilePicturePath - The relative path from the database
 * @returns {string|null} - The full URL or null if no picture
 */
export const getProfilePictureUrl = (profilePicturePath) => {
  if (!profilePicturePath) {
    return null;
  }
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${baseUrl}/${profilePicturePath}`;
};

/**
 * Get initials from a name for fallback display
 * @param {string} name - The user's name
 * @returns {string} - The initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return '?';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Validate if a file is a valid image
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result with isValid and error message
 */
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Please select a valid image file (JPEG, PNG, or GIF)' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }
  
  return { isValid: true, error: null };
};