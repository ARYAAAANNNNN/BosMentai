import axiosInstance from './axiosInstance';

// Mengambil semua daftar user (biasanya untuk admin)
export const getUsers = async () => {
    const response = await axiosInstance.get('/users');
    return response.data;
};

// Mengambil data profil user yang sedang login
export const getUserProfile = async (id) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
};

// Registrasi user baru
export const registerUser = async (userData) => {
    const response = await axiosInstance.post('/users', userData);
    return response.data;
};

// Update data profil atau password
export const updateUser = async (id, userData) => {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return response.data;
};

// Menghapus akun user
export const deleteUser = async (id) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
};