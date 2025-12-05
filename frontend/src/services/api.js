import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 30000,
  // HEADERS REMOVED: Let Axios determine Content-Type automatically
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Suppress 404 errors from the console (common when image isn't uploaded yet)
    if (error.response && error.response.status === 404) {
        return Promise.reject(error);
    }
    console.error("API Error:", error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

export default api;
