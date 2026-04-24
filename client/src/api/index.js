import api from './axios';

export const login = (data) => api.post('/auth/login', data);
export const signup = (data) => api.post('/auth/signup', data);

export const getTasks = (month, year) => api.get('/tasks', { params: { month, year } });
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

export const getLogs = (params) => api.get('/logs', { params });
export const toggleLog = (data) => api.post('/logs/toggle', data);

export const getMonthlyAnalytics = (month, year) => api.get('/analytics/monthly', { params: { month, year } });
export const getDailyAnalytics = (startDate, endDate) => api.get('/analytics/daily', { params: { startDate, endDate } });
export const getHeatmap = (startDate, endDate) => api.get('/analytics/heatmap', { params: { startDate, endDate } });
export const getStreak = () => api.get('/analytics/streak');
export const getTaskDailyLogs = (taskId, startDate, endDate) => api.get(`/analytics/task/${taskId}`, { params: { startDate, endDate } });

export const getWeeklyTasks = (weekNumber, month, year) => api.get('/weekly/tasks', { params: { weekNumber, month, year } });
export const createWeeklyTask = (data) => api.post('/weekly/tasks', data);
export const updateWeeklyTask = (id, data) => api.put(`/weekly/tasks/${id}`, data);
export const deleteWeeklyTask = (id) => api.delete(`/weekly/tasks/${id}`);
export const getWeeklyLogs = (startDate, endDate) => api.get('/weekly/logs', { params: { startDate, endDate } });
export const toggleWeeklyLog = (data) => api.post('/weekly/logs/toggle', data);
