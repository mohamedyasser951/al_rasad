import axiosInstance from './axios'

export const authService = {
  login: (email, password) =>
    axiosInstance.post('/auth/login/', { email, password }),

  logout: (refreshToken) =>
    axiosInstance.post('/auth/logout/', { refresh: refreshToken }),

  getMe: () =>
    axiosInstance.get('/auth/me/'),

  refreshToken: (refreshToken) =>
    axiosInstance.post('/auth/refresh/', { refresh: refreshToken }),

  register: (data) =>
    axiosInstance.post('/auth/register/', data),
}

export const contractorService = {
  list: (params = {}) =>
    axiosInstance.get('/contractors/', { params }),

  get: (id) =>
    axiosInstance.get(`/contractors/${id}/`),

  create: (data) =>
    axiosInstance.post('/contractors/', data),

  update: (id, data) =>
    axiosInstance.put(`/contractors/${id}/`, data),

  partialUpdate: (id, data) =>
    axiosInstance.patch(`/contractors/${id}/`, data),

  delete: (id) =>
    axiosInstance.delete(`/contractors/${id}/`),

  profile: (id) =>
    axiosInstance.get(`/contractors/${id}/profile/`),
}

export const reportService = {
  list: (params = {}) =>
    axiosInstance.get('/reports/', { params }),

  get: (id) =>
    axiosInstance.get(`/reports/${id}/`),

  create: (data) =>
    axiosInstance.post('/reports/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id, data) =>
    axiosInstance.put(`/reports/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  partialUpdate: (id, data) =>
    axiosInstance.patch(`/reports/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id) =>
    axiosInstance.delete(`/reports/${id}/`),

  changeStatus: (id, data) =>
    axiosInstance.patch(`/reports/${id}/change_status/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export const dailyWorkService = {
  list: (params = {}) =>
    axiosInstance.get('/daily-work/', { params }),

  get: (id) =>
    axiosInstance.get(`/daily-work/${id}/`),

  create: (data) =>
    axiosInstance.post('/daily-work/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id, data) =>
    axiosInstance.put(`/daily-work/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  partialUpdate: (id, data) =>
    axiosInstance.patch(`/daily-work/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id) =>
    axiosInstance.delete(`/daily-work/${id}/`),

  changeStatus: (id, data) =>
    axiosInstance.patch(`/daily-work/${id}/change_status/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export const userService = {
  list: (params = {}) =>
    axiosInstance.get('/users/', { params }),

  get: (id) =>
    axiosInstance.get(`/users/${id}/`),

  create: (data) =>
    axiosInstance.post('/users/', data),

  update: (id, data) =>
    axiosInstance.put(`/users/${id}/`, data),

  partialUpdate: (id, data) =>
    axiosInstance.patch(`/users/${id}/`, data),

  delete: (id) =>
    axiosInstance.delete(`/users/${id}/`),

  setPassword: (id, data) =>
    axiosInstance.post(`/users/${id}/set_password/`, data),
}

export const dashboardService = {
  getKpi: () =>
    axiosInstance.get('/dashboard/'),
}
