import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Clear old cache on component mount to avoid compatibility issues
  useEffect(() => {
    const cacheVersion = localStorage.getItem('cartCacheVersion')
    if (cacheVersion !== '2') {
      localStorage.removeItem('cart')
      localStorage.removeItem('kitchenOrders')
      localStorage.setItem('cartCacheVersion', '2')
    }
  }, [])

  // Inisialisasi state langsung dari localStorage agar tidak ada "flicker" data kosong
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [tableNumber, setTableNumber] = useState(12);
  
  const [kitchenOrders, setKitchenOrders] = useState(() => {
    const savedOrders = localStorage.getItem('kitchenOrders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  const [showCart, setShowCart] = useState(false);

  // Effect untuk simpan Kitchen Orders setiap kali ada perubahan
  useEffect(() => {
    localStorage.setItem('kitchenOrders', JSON.stringify(kitchenOrders));
  }, [kitchenOrders]);

  // Effect untuk simpan Cart setiap kali ada perubahan
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const sendToKitchen = (orderData) => {
    const newOrder = {
      id: Date.now(),
      tableNumber: tableNumber,
      items: orderData,
      timestamp: new Date().toISOString(),
      status: 'pending' 
    };
    
    // Gunakan functional update (prev) untuk menghindari bug data lama
    setKitchenOrders((prevOrders) => [...prevOrders, newOrder]);
    
    return newOrder.id;
  };

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prevCart.filter((cartItem) => cartItem.id !== itemId);
    });
  };

  const incrementQuantity = (itemId) => {
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      )
    );
  };

  const decrementQuantity = (itemId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prevCart.filter((cartItem) => cartItem.id !== itemId);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Menghitung total harga (tambahan fungsionalitas umum)
  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const priceValue = typeof item.priceValue === 'number' ? item.priceValue : 0
      return total + (priceValue * (item.quantity || 1))
    }, 0)
  };

  const value = {
    cart,
    tableNumber,
    setTableNumber,
    addToCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    sendToKitchen,
    kitchenOrders,
    showCart,
    setShowCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};