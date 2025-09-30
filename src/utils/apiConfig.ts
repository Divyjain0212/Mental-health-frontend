// API configuration utility
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      login: `${API_BASE_URL}/api/auth/login`,
      register: `${API_BASE_URL}/api/auth/register`,
      profile: `${API_BASE_URL}/api/auth/profile`,
    },
    counsellors: `${API_BASE_URL}/api/counsellors`,
    appointments: `${API_BASE_URL}/api/appointments`,
    chat: `${API_BASE_URL}/api/chat`,
    moods: `${API_BASE_URL}/api/moods`,
    alerts: `${API_BASE_URL}/api/alerts`,
    vouchers: `${API_BASE_URL}/api/vouchers`,
    forum: `${API_BASE_URL}/api/forum`,
    admin: `${API_BASE_URL}/api/admin`,
  },
  createAuthHeaders: (token?: string) => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

export default apiConfig;