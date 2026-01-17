import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

/**
 * Axios instance configured with base URL and interceptors
 */
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ===========================================
// AUTH API
// ===========================================

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  getMe: () => api.get('/auth/me'),
};

// ===========================================
// USERS API
// ===========================================

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  update: (userId, data) => api.put(`/users/${userId}`, data),
};

// ===========================================
// CATEGORIES API
// ===========================================

export const categoriesAPI = {
  getAll: (includeInactive = false) => api.get('/categories', { params: { include_inactive: includeInactive } }),
  create: (data) => api.post('/categories', data),
  update: (categoryId, data) => api.put(`/categories/${categoryId}`, data),
};

// ===========================================
// COURSES API
// ===========================================

export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (courseId) => api.get(`/courses/${courseId}`),
  create: (data) => api.post('/courses', data),
  update: (courseId, data) => api.put(`/courses/${courseId}`, data),
};

// ===========================================
// QUESTIONS API
// ===========================================

export const questionsAPI = {
  getAll: (params) => api.get('/questions', { params }),
  getById: (questionId) => api.get(`/questions/${questionId}`),
  create: (data) => api.post('/questions', data),
  update: (questionId, data) => api.put(`/questions/${questionId}`, data),
  delete: (questionId) => api.delete(`/questions/${questionId}`),
};

// ===========================================
// EXAMS API
// ===========================================

export const examsAPI = {
  getAll: (params) => api.get('/exams', { params }),
  getById: (examId) => api.get(`/exams/${examId}`),
  create: (data) => api.post('/exams', data),
  update: (examId, data) => api.put(`/exams/${examId}`, data),
  publish: (examId) => api.post(`/exams/${examId}/publish`),
  start: (examId) => api.post(`/exams/${examId}/start`),
};

// ===========================================
// ATTEMPTS API
// ===========================================

export const attemptsAPI = {
  getAll: (params) => api.get('/attempts', { params }),
  getById: (attemptId) => api.get(`/attempts/${attemptId}`),
  submit: (attemptId, data) => api.post(`/attempts/${attemptId}/submit`, data),
};

// ===========================================
// DASHBOARD API
// ===========================================

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: (limit = 10) => api.get('/dashboard/recent-activity', { params: { limit } }),
  getPerformanceChart: (days = 30) => api.get('/dashboard/performance-chart', { params: { days } }),
};

// ===========================================
// AI API
// ===========================================

export const aiAPI = {
  generateQuestions: (data) => api.post('/ai/generate-questions', data),
  suggestCourse: (topic) => api.post('/ai/suggest-course', { topic }),
};

// ===========================================
// TENANTS API
// ===========================================

export const tenantsAPI = {
  getAll: () => api.get('/tenants'),
  create: (data) => api.post('/tenants', data),
};

// ===========================================
// LEADERBOARD API
// ===========================================

export const leaderboardAPI = {
  getTop: (limit = 10) => api.get('/leaderboard', { params: { limit } }),
};

export default api;
