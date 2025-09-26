const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
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
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Student API methods
  async getStudents() {
    return this.request('/students');
  }

  async getStudent(id) {
    return this.request(`/students/${id}`);
  }

  async createStudent(studentData) {
    return this.request('/students', {
      method: 'POST',
      body: studentData,
    });
  }

  async updateStudent(id, studentData) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: studentData,
    });
  }

  async updateStudentStatus(id, status) {
    return this.request(`/students/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async updateStudentPayment(id, monthKey, paymentData) {
    return this.request(`/students/${id}/payment`, {
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
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  // Employee API methods
  async getEmployees() {
    return this.request('/employees');
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

  // Payment API methods
  async getPayments() {
    return this.request('/payments');
  }

  async getStudentPayments(studentId) {
    return this.request(`/payments/student/${studentId}`);
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

  async getSpecialStudent(id) {
    return this.request(`/special-students/${id}`);
  }

  async createSpecialStudent(studentData) {
    return this.request('/special-students', {
      method: 'POST',
      body: studentData,
    });
  }

  async updateSpecialStudent(id, studentData) {
    return this.request(`/special-students/${id}`, {
      method: 'PUT',
      body: studentData,
    });
  }

  async updateSpecialStudentStatus(id, status) {
    return this.request(`/special-students/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async updateSpecialStudentPayment(id, monthKey, paymentData) {
    return this.request(`/special-students/${id}/payment`, {
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
    return this.request(`/special-students/${id}`, {
      method: 'DELETE',
    });
  }

  // Special Payment API methods
  async getSpecialPayments() {
    return this.request('/special-payments');
  }

  async getSpecialStudentPayments(studentId) {
    return this.request(`/special-payments/student/${studentId}`);
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
}

export default new ApiService();