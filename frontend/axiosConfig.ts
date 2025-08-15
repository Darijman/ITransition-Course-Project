import axios from 'axios';
// import { emitter } from '@/events';

export const BASE_URL = 'http://localhost:9000';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10sec
});

// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     if (error.response?.status === 401 && !error.config.url?.includes('/logout')) {
//       emitter.emit('logout');
//     }

//     if (error.response.status === 403) {
//       emitter.emit('logout');
//     }

//     if (error.code === 'ECONNABORTED') {
//       return Promise.reject({ error: 'Request timed out!' });
//     }
//     return Promise.reject(error);
//   },
// );

export default api;
