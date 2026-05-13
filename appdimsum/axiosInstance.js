import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        // Jika nanti project ini butuh login, kamu bisa set token di sini:
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
});

export default axiosInstance;