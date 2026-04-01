import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const ANALYTICS_URL = `${API_BASE}/analytics`;
const REPORTS_URL = `${API_BASE}/reports`;

// ---- Analytics ----

export const rebuildDaily = () =>
    axios.post(`${ANALYTICS_URL}/rebuild-daily`);

export const getDashboardData = (from, to) => {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return axios.get(`${ANALYTICS_URL}/dashboard`, { params });
};

export const getForecast = (days = 7) =>
    axios.get(`${ANALYTICS_URL}/forecast`, { params: { days } });

export const checkAnomalies = () =>
    axios.post(`${ANALYTICS_URL}/check-anomalies`);

export const getAlerts = (status) => {
    const params = {};
    if (status) params.status = status;
    return axios.get(`${ANALYTICS_URL}/alerts`, { params });
};

export const resolveAlert = (id) =>
    axios.patch(`${ANALYTICS_URL}/alerts/${id}/resolve`);

// ---- Reports ----

export const generateReport = (type, from, to) =>
    axios.post(`${REPORTS_URL}/generate`, { type, from, to });

export const getReportPdfUrl = (type, from, to) =>
    `${REPORTS_URL}/pdf?type=${encodeURIComponent(type)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

// ---- Conversational BI (legacy) ----

export const queryAnalytics = (message) =>
    axios.post(`${ANALYTICS_URL}/chat`, { message });
