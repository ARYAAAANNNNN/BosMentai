import { useState } from 'react';
import { menuData, categories } from '../data/menuData';
import MenuCard from"../components/MenuCard";

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [cart, setCart] = useState([]);
  const [addedItems, setAddedItems] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const filteredMenu = activeCategory === 'Semua' 
    ? menuData 
    : menuData.filter(item => item.category === activeCategory);

  const handleAddToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i);
      }
      return [...prev, {...item, quantity: 1}];
    });
    
    setAddedItems(prev => ({...prev, [item.id]: true}));
    setTimeout(() => {
      setAddedItems(prev => ({...prev, [item.id]: false}));
    }, 1000);
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === itemId ? {...i, quantity: i.quantity - 1} : i);
      }
      return prev.filter(i => i.id !== itemId);
    });
  };

  const handleDeleteItem = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const HandleClearCart = () => {
    setCart([]);
  };

  const handleConfirmOrder = () => {
    if (cart.length === 0) return;
    
    // Simpan pesanan ke localStorage (bisa dilihat di kitchen page)
    const orderId = Date.now();
    const orderData = {
      id: orderId,
      tableNumber: 12,
      items: cart,
      totalItems: cart.reduce((total, item) => total + item.quantity, 0),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    const existingOrders = JSON.parse(localStorage.getItem('kitchenOrders') || '[]');
    existingOrders.push(orderData);
    localStorage.setItem('kitchenOrders', JSON.stringify(existingOrders));
    
    // Tampilkan pesan sukses
    setOrderPlaced(true);
    setCart([]);
    
    // Tutup modal setelah 2 detik dan kembali ke menu
    setTimeout(() => {
      setShowCart(false);
      setOrderPlaced(false);
      setActiveCategory('Semua');
    }, 2500);
  };

  const handleCancelOrder = () => {
    setShowCart(false);
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)'}}>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">🥟</div>
            <div className="logo-text">
              <h1>QR SmartOrder</h1>
              <p>AYCE Dimsum Restaurant</p>
            </div>
          </div>
          <div className="header-actions">
            <div className="table-badge">🍽️ Meja 12</div>
            <button className="cart-button" onClick={() => setShowCart(true)}>
              🛒
              {getTotalItems() > 0 ? (
                <span className="cart-badge">{getTotalItems()}</span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="categories">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === 'Semua' ? ' Semua' : cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="menu-container">
        <h2 className="menu-title">
          {activeCategory === 'Semua' ? ' Semua Menu' : ` ${activeCategory}`}
        </h2>
        <p className="menu-subtitle">
          {filteredMenu.length} menu tersedia • Semua gratis (AYCE)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMenu.map((item) => (
            <div key={item.id} className="menu-card" style={{position: 'relative'}}>
              <div className="menu-image">
                <img 
                  src={item.image} 
                  alt={item.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:48px;">🥟</div>';
                  }}
                ></img>
              </div>
             
              <div className="menu-info">
                <h3 className="menu-name">{item.name}</h3>
                <button 
                  className={`add-button ${addedItems[item.id] ? 'added' : ''}`}
                  onClick={() => handleAddToCart(item)}
                >
                  {addedItems[item.id] ? '✓ Ditambahkan' : '+ Pesan'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredMenu.length === 0 ? (
          <div style={{textAlign: 'center', padding: '48px'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>😔</div>
            <p style={{color: '#6b7280'}}>Menu tidak ditemukan</p>
            <button 
              onClick={() => setActiveCategory('Semua')}
              style={{marginTop: '16px', color: '#dc2626', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}
            >
              Lihat semua menu →
            </button>
          </div>
        ) : null}
      </div>

      {/* Cart Modal - Success State */}
      {orderPlaced ? (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '40px',
            textAlign: 'center',
            maxWidth: '300px',
            margin: '20px'
          }}>
            <div style={{fontSize: '64px', marginBottom: '20px'}}>✅</div>
            <h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', color: '#22c55e'}}>Pesanan Dikirim!</h2>
            <p style={{color: '#6b7280'}}>Pesanan Anda sedang diproses di dapur</p>
            <div style={{marginTop: '20px', color: '#9ca3af', fontSize: '14px'}}>Kembali ke menu...</div>
          </div>
        </div>
      ) : null}

      {/* Cart Modal */}
      {showCart && !orderPlaced ? (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 1000
        }} onClick={() => setShowCart(false)}>
          <div style={{
            background: 'white',
            width: '100%',
            maxHeight: '85vh',
            borderRadius: '24px 24px 0 0',
            padding: '24px',
            overflow: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h2 style={{fontSize: '20px', fontWeight: 'bold'}}>🛒 Keranjang Pesanan</h2>
              <button onClick={() => setShowCart(false)} style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer'}}>✕</button>
            </div>

            {cart.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px'}}>
                <div style={{fontSize: '48px', marginBottom: '16px'}}>🛒</div>
                <p style={{color: '#6b7280'}}>Keranjang masih kosong</p>
                <p style={{color: '#9ca3af', fontSize: '14px', marginTop: '8px'}}>Pilih menu untuk memesan</p>
              </div>
            ) : (
              <>
                <div style={{marginBottom: '16px'}}>
                  {cart.map(item => (
                    <div key={item.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      background: '#f9fafb',
                      borderRadius: '12px',
                      marginBottom: '8px'
                    }}>
                      <img src={item.image} alt={item.name} style={{width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', marginRight: '12px'}}></img>
                      <div style={{flex: 1}}>
                        <p style={{fontWeight: '600', fontSize: '14px'}}>{item.name}</p>
                        <p style={{color: '#6b7280', fontSize: '12px'}}>{item.category}</p>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <button 
                          onClick={() => handleRemoveFromCart(item.id)}
                          style={{width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer'}}
                        >-</button>
                        <span style={{fontWeight: '600', minWidth: '20px', textAlign: 'center'}}>{item.quantity}</span>
                        <button 
                          onClick={() => handleAddToCart(item)}
                          style={{width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer'}}
                        >+</button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          style={{marginLeft: '4px', width: '28px', height: '28px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontSize: '14px'}}
                        >🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginBottom: '16px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                    <span style={{color: '#6b7280'}}>Total Item:</span>
                    <span style={{fontWeight: '600'}}>{getTotalItems()} items</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{color: '#6b7280'}}>Status:</span>
                    <span style={{fontWeight: '600', color: '#22c55e'}}>AYCE - Gratis</span>
                  </div>
                </div>

                {/* Tombol Batal */}
                <button 
                  onClick={handleCancelOrder}
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px solid #dc2626',
                    borderRadius: '12px',
                    background: 'white',
                    color: '#dc2626',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    fontSize: '16px'
                  }}
                >
                   Batal & Hapus Semua
                </button>

                {/* Tombol Konfirmasi */}
                <button 
                  onClick={handleConfirmOrder}
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: 'none',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                   Konfirmasi Pesanan
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}

      {/* Footer */}
      <footer className="footer">
        <p>📱 Scan QR Code di meja Anda untuk memesan • AYCE Dimsum SmartOrder System</p>
      </footer>
    </div>
  );
};

export default MenuPage;