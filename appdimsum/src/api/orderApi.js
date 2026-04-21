import axiosInstance from './axiosInstance';

// Mengambil semua data pesanan
export const getOrders = async () => {
    const response = await axiosInstance.get('/orders');
    return response.data;
};

// Mengambil detail satu pesanan berdasarkan ID
export const getOrderById = async (id) => {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data;
};

// Membuat pesanan baru (Checkout)
export const createOrder = async (orderData) => {
    const response = await axiosInstance.post('/orders', orderData);
    return response.data;
};

// Mengupdate status pesanan (misal: dari 'pending' ke 'success')
export const updateOrderStatus = async (id, statusData) => {
    const response = await axiosInstance.put(`/orders/${id}`, statusData);
    return response.data;
};

// Menghapus riwayat pesanan
export const deleteOrder = async (id) => {
    const response = await axiosInstance.delete(`/orders/${id}`);
    return response.data;
};