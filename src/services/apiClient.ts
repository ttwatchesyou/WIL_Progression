import axios from 'axios';
import Cookies from 'js-cookie';
import { message } from 'antd';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage =
      error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';

    if (error.response?.status === 401) {
      Cookies.remove('token');
      Cookies.remove('user_role');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        message.error('เซสชั่นหมดอายุ กรุณาล็อกอินใหม่อีกครั้ง');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error.response?.data || { message: errorMessage });
  }
);