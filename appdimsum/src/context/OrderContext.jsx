import { createContext, useContext, useState, useEffect } from 'react';
import { menuAPI, orderAPI } from '../services/api';

const STORAGE_KEY_ORDERS = 'restaurant_orders';

const getStoredOrders = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading orders from localStorage:', e);
  }
  return [
    { id: 1, meja: 12, menu: "Siomay Udang", waktu: "10:00", status: "Selesai",
      items: [{name: 'Siomay Udang', qty: 2},{name: 'Siomai Ayam', qty: 1},{name: 'Hakau', qty: 3}], totalItems: 6 },
    { id: 2, meja: 10, menu: "Siomay Udang", waktu: "10:05", status: "Menunggu",
      items: [{name: 'Siomay Udang', qty: 4},{name: 'Air Mineral', qty: 2},{name: 'Es Teh Manis', qty: 1}], totalItems: 7 },
    { id: 3, meja: 2,  menu: "Siomay Udang", waktu: "10:05", status: "Diproses",
      items: [{name: 'Dimsum Udang Keju', qty: 3},{name: 'Bao Coklat', qty: 2}], totalItems: 5 },
    { id: 4, meja: 9,  menu: "Siomay Udang", waktu: "10:00", status: "Selesai",
      items: [{name: 'Siomay Udang', qty: 5},{name: 'Es Teh Tawar', qty: 3},{name: 'Bakpao Ayam', qty: 2}], totalItems: 10 },
    { id: 5, meja: 1,  menu: "Hakau Hargow", waktu: "10:05", status: "Menunggu",
      items: [{name: 'Hakau Hargow', qty: 4},{name: 'Jus Jeruk', qty: 1}], totalItems: 5 },
  ];
};

const saveOrdersToStorage = (orders) => {
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving orders to localStorage:', e);
  }
};

const OrderContext = createContext({});

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [menuItems, setMenuItems] = useState([])

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getAll()
      if (res.success) {
        setOrders(res.data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  useEffect(() => {
    fetchOrders()
    const intervalId = setInterval(fetchOrders, 7000) // Polling setiap 7 detik
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await menuAPI.getAll();
        const items = res?.data || res;
        if (Array.isArray(items)) {
          setMenuItems(items);
        }
      } catch (error) {
        console.error('Error fetching menus:', error);
      }
    };
    
    fetchMenus();
    const intervalId = setInterval(fetchMenus, 30000); // Polling setiap 30 detik (menu jarang berubah)
    return () => clearInterval(intervalId);
  }, []);

  const addMenu = (menuBaru) => {
    setMenuItems(prev => [...prev, {
      id:       Date.now(),
      nama:     menuBaru.nama_menu,
      stok:     parseInt(menuBaru.stok) || 0,
      harga:    parseInt(menuBaru.harga) || 0,
      pesanan:  0,
      image:    menuBaru.image || null,
    }]);
  };

  const updateMenu = (id, data) => {
    setMenuItems(prev => prev.map(item =>
      item.id === id ? {
        ...item,
        nama:     data.nama_menu  ?? item.nama,
        stok:     data.stok !== undefined ? parseInt(data.stok) : item.stok,
        harga:    data.harga !== undefined ? parseInt(data.harga) : item.harga,
        image:    data.image      ?? item.image,
      } : item
    ));
  };

  const deleteMenu = (id) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const updateStok = (id, stokBaru) => {
    setMenuItems(prev =>
      prev.map(item => item.id === id ? { ...item, stok: stokBaru } : item)
    );
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const res = await orderAPI.updateStatus(id, newStatus)
      if (res.success) {
        setOrders(prev => prev.map(order =>
          order.id === id ? { ...order, status: newStatus } : order
        ))
      } else {
        console.error('Failed to update status:', res.message)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const deleteOrder = async (id) => {
    try {
      const res = await orderAPI.delete(id)
      if (res.success) {
        setOrders(prev => prev.filter(order => order.id !== id))
      } else {
        console.error('Failed to delete order:', res.message)
      }
    } catch (error) {
      console.error('Error deleting order:', error)
    }
  }

  return (
    <OrderContext.Provider value={{
      orders, selectedOrder, setSelectedOrder, updateOrderStatus,
      menuItems, addMenu, updateMenu, deleteMenu, updateStok, deleteOrder,
      refreshOrders: fetchOrders,
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) return {};
  return context;
};