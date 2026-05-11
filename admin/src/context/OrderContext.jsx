import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { menuAPI, orderAPI } from '../services/api';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null); // ← state error koneksi

  // ── Fetch Data Awal ─────────────────────────────────────────────────────────
  const fetchData = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      const [menuRes, orderRes] = await Promise.all([
        menuAPI.getAll(),
        orderAPI.getAll()
      ]);

      if (menuRes.success) setMenuItems(menuRes.data);
      if (orderRes.success) setOrders(orderRes.data);

      setApiError(null); // koneksi berhasil → reset error
    } catch (err) {
      // Tampilkan di console hanya saat fetch pertama agar polling tidak spam
      if (!quiet) {
        console.error(
          '[OrderContext fetchData] Gagal mengambil data.\n' +
          'Pastikan:\n' +
          '  1. File .env memiliki VITE_API_URL yang benar\n' +
          '  2. Backend server sudah berjalan\n' +
          `Detail: ${err.message}`
        );
        setApiError(err.message);
      }
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false); // fetch pertama — tampilkan loading & error
    // Polling setiap 5 detik agar tidak membebani server/rate limit
    const intervalId = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Tambah menu baru
  const tambahMenu = async (formData) => {
    try {
      const res = await menuAPI.create(formData);
      if (res.success) {
        await fetchData();
        return { success: true };
      }
      return { success: false, message: res.message || 'Gagal tambah menu' };
    } catch (err) {
      console.error('[OrderContext tambahMenu]', err);
      return { success: false, message: err.message };
    }
  };

  // Edit menu yang sudah ada
  const editMenu = async (id, formData) => {
    try {
      const res = await menuAPI.update(id, formData);
      if (res.success) {
        await fetchData();
        return { success: true };
      }
      return { success: false, message: res.message || 'Gagal edit menu' };
    } catch (err) {
      console.error('[OrderContext editMenu]', err);
      return { success: false, message: err.message };
    }
  };

  // Hapus menu
  const hapusMenu = async (id) => {
    try {
      const res = await menuAPI.delete(id);
      if (res.success) {
        setMenuItems(prev => prev.filter(item => item.id !== id));
        return { success: true };
      }
      return { success: false, message: res.message || 'Gagal hapus menu' };
    } catch (err) {
      console.error('[OrderContext hapusMenu]', err);
      return { success: false, message: err.message };
    }
  };

  const updateStok = async (id, stokBaru) => {
    try {
      const res = await menuAPI.updateStok(id, { stok: stokBaru });
      if (res.success) {
        setMenuItems(prev =>
          prev.map(item => item.id === id ? { ...item, stok: stokBaru } : item)
        );
      }
    } catch (err) {
      console.error('[OrderContext updateStok]', err);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const res = await orderAPI.updateStatus(id, newStatus);
      if (res.success) {
        setOrders(prev => prev.map(order =>
          order.id === id ? { ...order, status: newStatus } : order
        ));
        return { success: true };
      }
      return { success: false, message: res.message || 'Gagal update status' };
    } catch (err) {
      console.error('[OrderContext updateOrderStatus]', err);
      return { success: false, message: err.message };
    }
  };

  const hapusOrder = async (id) => {
    try {
      const res = await orderAPI.delete(id);
      if (res.success) {
        setOrders(prev => prev.filter(order => order.id !== id));
        return { success: true };
      }
      return { success: false, message: res.message || 'Gagal hapus pesanan' };
    } catch (err) {
      console.error('[OrderContext hapusOrder]', err);
      return { success: false, message: err.message };
    }
  };

  return (
    <OrderContext.Provider value={{
      orders, selectedOrder, setSelectedOrder, updateOrderStatus, hapusOrder,
      menuItems, tambahMenu, editMenu, hapusMenu, updateStok,
      loading, apiError, refreshData: fetchData
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => useContext(OrderContext);
