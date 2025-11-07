const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.requestCache = new Map();
    this.cacheTimeout = 30000; // 30 seconds cache for GET requests
    this.testConnection();
  }

  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}`);
    } catch (error) {
      // Silent fail
    }
  }

  clearCache() {
    this.requestCache.clear();
  }

  invalidateCache(pattern) {
    for (const key of this.requestCache.keys()) {
      if (key.includes(pattern)) {
        this.requestCache.delete(key);
      }
    }
  }

  async request(endpoint, options = {}) {
    // Check cache for GET requests
    if (!options.method || options.method === 'GET') {
      const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
      const cached = this.requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && !endpoint.includes('/auth/login') ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { message: errorText || 'Something went wrong' };
        }
        throw new Error(error.message || 'Something went wrong');
      }

      const data = await response.json();
      
      // Cache GET requests
      if (!options.method || options.method === 'GET') {
        const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
        this.requestCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        
        // Clean old cache entries
        if (this.requestCache.size > 50) {
          const oldestKey = this.requestCache.keys().next().value;
          this.requestCache.delete(oldestKey);
        }
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Student API methods
  async getStudents() {
    try {
      const result = await this.request('/students');
      return Array.isArray(result) ? result : [];
    } catch (error) {
      return [];
    }
  }

  async getStudentsFull() {
    try {
      const result = await this.request('/students/full');
      return Array.isArray(result) ? result : [];
    } catch (error) {
      return [];
    }
  }

  async getStudent(id) {
    return this.request(`/students/${encodeURIComponent(id)}`);
  }

  async createStudent(studentData) {
    return this.request('/students', {
      method: 'POST',
      body: studentData,
    });
  }

  async updateStudent(id, studentData) {
    return this.request(`/students/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: studentData,
    });
  }

  async updateStudentStatus(id, status) {
    return this.request(`/students/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async updateStudentPayment(id, monthKey, paymentData) {
    return this.request(`/students/${encodeURIComponent(id)}/payment`, {
      method: 'PATCH',
      body: { monthKey, paymentData },
    });
  }

  async bulkUpdateStudents(studentIds, updates) {
    return this.request('/students/bulk/update', {
      method: 'PATCH',
      body: { studentIds, updates },
    });
  }

  async deleteStudent(id) {
    return this.request(`/students/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // Employee API methods
  async getEmployees() {
    try {
      const result = await this.request('/employees');
      return result;
    } catch (error) {
      console.error('API: Failed to fetch employees:', error);
      throw error;
    }
  }

  async getEmployee(id) {
    return this.request(`/employees/${id}`);
  }

  async createEmployee(employeeData) {
    return this.request('/employees', {
      method: 'POST',
      body: employeeData,
    });
  }

  async updateEmployee(id, employeeData) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: employeeData,
    });
  }

  async updateEmployeeStatus(id, status) {
    return this.request(`/employees/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async deleteEmployee(id) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  async addEmployeeSalary(id, year, monthlySalary) {
    return this.request(`/employees/${id}/salary`, {
      method: 'POST',
      body: { year, monthlySalary },
    });
  }

  async updateEmployeeSalary(id, year, monthlySalary) {
    return this.request(`/employees/${id}/salary/${year}`, {
      method: 'PUT',
      body: { monthlySalary },
    });
  }

  // Payment API methods
  async getPayments() {
    return this.request('/payments');
  }

  async getStudentPayments(studentId) {
    return this.request(`/payments/student/${encodeURIComponent(studentId)}`);
  }

  async createPayment(paymentData) {
    return this.request('/payments', {
      method: 'POST',
      body: paymentData,
    });
  }

  async updatePayment(id, paymentData) {
    return this.request(`/payments/${id}`, {
      method: 'PUT',
      body: paymentData,
    });
  }

  async deletePayment(id) {
    return this.request(`/payments/${id}`, {
      method: 'DELETE',
    });
  }

  // Special Student API methods
  async getSpecialStudents() {
    return this.request('/special-students');
  }

  async getSpecialStudentsFull() {
    try {
      const result = await this.request('/special-students/full');
      return Array.isArray(result) ? result : [];
    } catch (error) {
      return [];
    }
  }

  async getSpecialStudent(id) {
    return this.request(`/special-students/${encodeURIComponent(id)}`);
  }

  async createSpecialStudent(studentData) {
    return this.request('/special-students', {
      method: 'POST',
      body: studentData,
    });
  }

  async updateSpecialStudent(id, studentData) {
    return this.request(`/special-students/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: studentData,
    });
  }

  async updateSpecialStudentStatus(id, status) {
    return this.request(`/special-students/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async updateSpecialStudentPayment(id, monthKey, paymentData) {
    return this.request(`/special-students/${encodeURIComponent(id)}/payment`, {
      method: 'PATCH',
      body: { monthKey, paymentData },
    });
  }

  async bulkUpdateSpecialStudents(studentIds, updates) {
    return this.request('/special-students/bulk/update', {
      method: 'PATCH',
      body: { studentIds, updates },
    });
  }

  async deleteSpecialStudent(id) {
    return this.request(`/special-students/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // Special Payment API methods
  async getSpecialPayments() {
    return this.request('/special-payments');
  }

  async getSpecialStudentPayments(studentId) {
    return this.request(`/special-payments/student/${encodeURIComponent(studentId)}`);
  }

  async createSpecialPayment(paymentData) {
    return this.request('/special-payments', {
      method: 'POST',
      body: paymentData,
    });
  }

  async updateSpecialPayment(id, paymentData) {
    return this.request(`/special-payments/${id}`, {
      method: 'PUT',
      body: paymentData,
    });
  }

  async deleteSpecialPayment(id) {
    return this.request(`/special-payments/${id}`, {
      method: 'DELETE',
    });
  }

  // Auth API methods
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: profileData,
    });
  }

  async uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/auth/profile/picture`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }
    
    return await response.json();
  }

  async removeProfilePicture() {
    return this.request('/auth/profile/picture', {
      method: 'DELETE',
    });
  }

  async getAdmins() {
    return this.request('/auth/admins');
  }

  async createAdmin(adminData) {
    return this.request('/auth/admins', {
      method: 'POST',
      body: adminData,
    });
  }

  async updateAdmin(id, adminData) {
    return this.request(`/auth/admins/${id}`, {
      method: 'PUT',
      body: adminData,
    });
  }

  async deleteAdmin(id) {
    return this.request(`/auth/admins/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminProfiles() {
    return this.request('/auth/admins/profiles');
  }

  async getAdminActivityLogs() {
    return this.request('/auth/admins/activity-logs');
  }

  // Pending Students API methods
  async getPendingStudents() {
    try {
      const result = await this.request('/pending-students');
      return Array.isArray(result) ? result : [];
    } catch (error) {
      return [];
    }
  }

  async approvePendingStudent(id) {
    return this.request(`/pending-students/${encodeURIComponent(id)}/approve`, {
      method: 'POST',
    });
  }

  async rejectPendingStudent(id) {
    return this.request(`/pending-students/${encodeURIComponent(id)}/reject`, {
      method: 'DELETE',
    });
  }

  async registerStudent(studentData) {
    return this.request('/pending-students/register', {
      method: 'POST',
      body: studentData,
    });
  }
}

export default new ApiService();