import axios from 'axios';

const api = axios.create({
  baseURL: "https://real-estate-project-production-b5a8.up.railway.app"
, // 🔁 تم التعديل هنا
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `${token}`;
      delete config.headers.token;
    }

    // Log the submission data
    if (config.method === 'post' || config.method === 'put') {
      console.log(`📤 ${config.method.toUpperCase()} submission to ${config.url}:`, config.data);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout error: Server took too long to respond');
    }

    if (error.response?.status === 401) {
      // localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?sessionExpired=true';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
