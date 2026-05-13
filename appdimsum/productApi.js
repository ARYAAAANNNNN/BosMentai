import axiosInstance from './axiosInstance';

// Mengambil semua data produk (Metode GET)
export const getProducts = async () => {
    const response = await axiosInstance.get('/products');
    return response.data;
};

// Mengambil detail satu produk berdasarkan ID (Metode GET)
export const getProductById = async (id) => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
};

// Menambah produk baru (Metode POST)
export const createProduct = async (productData) => {
    const response = await axiosInstance.post('/products', productData);
    return response.data;
};

// Mengupdate produk (Metode PUT)
export const updateProduct = async (id, productData) => {
    const response = await axiosInstance.put(`/products/${id}`, productData);
    return response.data;
};

// Menghapus produk (Metode DELETE)
export const deleteProduct = async (id) => {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
};