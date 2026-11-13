import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT token ─────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('uscoded_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: unwrap .data ────────────────────────────
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/login')) {
      // Token expired or invalid
      localStorage.removeItem('uscoded_auth_token');
      localStorage.removeItem('uscoded_auth_user');
    }
    const message =
      err.response?.data?.message ||
      err.response?.data?.errors?.[0]?.msg ||
      err.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ── Authentication ────────────────────────────────────────────────
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
};

// ── Projects ──────────────────────────────────────────────────────
export const projectsApi = {
  getAll: () => api.get('/projects'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getTwin: (id) => api.get(`/projects/${id}/twin`),
};

// ── Team ──────────────────────────────────────────────────────────
export const teamApi = {
  getAll: () => api.get('/team'),
  create: (data) => api.post('/team', data),
  update: (id, data) => api.put(`/team/${id}`, data),
  delete: (id) => api.delete(`/team/${id}`),
};

// ── Tasks ─────────────────────────────────────────────────────────
export const tasksApi = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// ── Dashboard ─────────────────────────────────────────────────────
export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
};

// ── Employee (self-service) ───────────────────────────────────────
export const employeeApi = {
  getDashboard: () => api.get('/employee/dashboard'),
  getMyTasks: (params) => api.get('/employee/tasks', { params }),
  getMyTaskById: (id) => api.get(`/employee/tasks/${id}`),
  updateMyTaskStatus: (id, data) => api.put(`/employee/tasks/${id}/status`, data),
  addComment: (id, data) => api.post(`/employee/tasks/${id}/comment`, data),
  getMyProfile: () => api.get('/employee/profile'),
  updateMyProfile: (data) => api.put('/employee/profile', data),
};

export const aiApi = {
  analyze: () => api.get('/ai/analyze'),
  getPredictions: () => api.get('/ai/predictions'),
  getRisks: () => api.get('/ai/risks'),
  getTaskPriority: () => api.get('/ai/tasks/priority'),
  getWorkload: () => api.get('/ai/workload'),
  getBriefing: () => api.get('/ai/briefing'),
  getRecommendations: (params) => api.get('/ai/recommendations', { params }),
  acceptRecommendation: (id) => api.post(`/ai/recommendations/${id}/accept`),
  dismissRecommendation: (id) => api.post(`/ai/recommendations/${id}/dismiss`),
  simulate: (data) => api.post('/ai/simulate', data),
  ask: (question) => api.post('/ai/ask', { question }),
  employeeAsk: (question) => api.post('/ai/employee/ask', { question }),
  triggerAnalysis: () => api.post('/ai/analyze/trigger'),
  getHistory: () => api.get('/ai/history'),
};

export default api;

