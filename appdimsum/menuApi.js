import axiosInstance from './axiosInstance';

export const getAllMenus = async () => {
  const response = await axiosInstance.get('/menu');
  return response.data.data; // backend returns data.results or data.data
};

export const getMenuById = async (id) => {
  const response = await axiosInstance.get(`/menu/${id}`);
  return response.data;
};

export const createMenu = async (menuData) => {
  const response = await axiosInstance.post('/menu', menuData);
  return response.data;
};

export const updateMenu = async (id, menuData) => {
  const response = await axiosInstance.put(`/menu/${id}`, menuData);
  return response.data;
};

export const deleteMenu = async (id) => {
  const response = await axiosInstance.delete(`/menu/${id}`);
  return response.data;
};
