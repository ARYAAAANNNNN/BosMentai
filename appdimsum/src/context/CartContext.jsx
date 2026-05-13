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
  // 1. Inisialisasi State dari LocalStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [tableNumber, setTableNumber] = useState(1);
  const [showCart, setShowCart] = useState(false);

  // 2. Simpan perubahan ke LocalStorage otomatis
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  /**
   * FUNGSI HELPER: Cek Status Stok
   * Sesuai permintaan: >20 Tersedia, 5-20 Menipis, <5 Hampir Habis
   */
  const getStockStatus = (stok) => {
    const s = Number(stok || 0);
    if (s > 20) return { label: "Stok Tersedia", color: "#16a34a" }; // Hijau
    if (s >= 5 && s <= 20) return { label: "Stok Menipis", color: "#d97706" }; // Oranye
    if (s > 0 && s < 5) return { label: "Hampir Habis", color: "#ef4444" }; // Merah
    return { label: "Stok Habis", color: "#9ca3af" }; // Abu-abu
  };

  /**
   * FUNGSI: Tambah Menu ke Keranjang
   */
  const addToCart = (item) => {
    setCart((prevCart) => {
      // Ambil nama menu (antisipasi kolom database yang berbeda)
      const namaMenu = item.nama_menu || item.nama || item.name || "Menu";
      const stokDatabase = Number(item.stok || 0);
      
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      const jumlahDiKeranjang = existingItem ? existingItem.quantity : 0;

      // VALIDASI: Jangan sampai pesan lebih banyak dari stok yang ada
      if (stokDatabase <= 0) {
        alert(`Maaf, ${namaMenu} sudah habis!`);
        return prevCart;
      }

      if (jumlahDiKeranjang >= stokDatabase) {
        alert(`Maaf, Anda sudah memesan semua stok ${namaMenu} yang tersedia.`);
        return prevCart;
      }

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      }

      // Masukkan item baru dengan nama yang sudah dipastikan ada
      return [...prevCart, { ...item, quantity: 1, nama_menu: namaMenu }];
    });
  };

  /**
   * FUNGSI: Tambah Jumlah di Keranjang (+)
   */
  const incrementQuantity = (itemId) => {
    setCart((prevCart) =>
      prevCart.map((cartItem) => {
        if (cartItem.id === itemId) {
          const stokDatabase = Number(cartItem.stok || 0);
          if (cartItem.quantity >= stokDatabase) {
            alert("Maaf, stok maksimal sudah tercapai.");
            return cartItem;
          }
          return { ...cartItem, quantity: cartItem.quantity + 1 };
        }
        return cartItem;
      })
    );
  };

  /**
   * FUNGSI: Kurangi Jumlah di Keranjang (-)
   */
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
      // Kalau cuma 1, lalu dikurangi, otomatis hapus dari keranjang
      return prevCart.filter((cartItem) => cartItem.id !== itemId);
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.id !== itemId));
  };

  const clearCart = () => setCart([]);

  const getTotalItems = () => cart.reduce((total, item) => total + item.quantity, 0);

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const harga = Number(item.priceValue || item.harga || 0);
      return total + (harga * item.quantity);
    }, 0);
  };

  const value = {
    cart,
    addToCart,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
    tableNumber,
    setTableNumber,
    showCart,
    setShowCart,
    getStockStatus // Ekspor fungsi ini supaya bisa dipake di MenuCard
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};