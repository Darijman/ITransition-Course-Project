import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9000';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10sec
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({ error: 'Request timed out!' });
    }
    return Promise.reject(error);
  },
);

export default api;
