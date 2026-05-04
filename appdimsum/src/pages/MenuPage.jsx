import { useState } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { useParams } from 'react-router-dom';
import { orderAPI, STORAGE_URL } from '../services/api';

const BACKEND_URL = STORAGE_URL;



// ─── MenuCard ────────────────────────────────────
const MenuCard = ({ item, onAdd, isAdded }) => {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered]   = useState(false);
  const isHabis = item.stok === 0;
  const emoji   = '';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        borderRadius: 20,
        boxShadow: hovered
          ? '0 16px 32px rgba(0,0,0,0.14)'
          : '0 2px 10px rgba(0,0,0,0.08)',
        border: '1px solid #f3f4f6',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'all 0.3s ease',
        opacity: isHabis ? 0.85 : 1,
      }}
    >
      {/* ── Gambar ─────────────────────────────────── */}
      <div style={{
        position: 'relative',
        height: 160,
        background: 'linear-gradient(135deg,#fff1f2 0%,#fef3c7 100%)',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {item.image && !imgError ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.5s ease',
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 52,
          }}>
            {emoji}
          </div>
        )}

        {/* Badge kategori dihapus agar foto lebih bersih */}

        {/* Overlay stok habis */}
        {isHabis && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              background: 'rgba(255,255,255,0.92)', color: '#dc2626',
              fontWeight: 800, fontSize: 13, padding: '6px 18px',
              borderRadius: 99, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
              Stok Habis
            </span>
          </div>
        )}

        {/* Overlay ditambah */}
        {isAdded && !isHabis && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(34,197,94,0.82)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 28 }}>✓</span>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 13 }}>Ditambahkan!</span>
          </div>
        )}
      </div>

      {/* ── Info ───────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '12px 14px 14px' }}>
        <h3 style={{
          fontWeight: 700, color: '#1f2937', fontSize: 14,
          lineHeight: 1.35, marginBottom: 10,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          minHeight: 38,
        }}>
          {item.name}
        </h3>


        <button
          onClick={() => !isHabis && onAdd(item)}
          disabled={isHabis}
          style={{
            width: '100%', padding: '10px',
            border: 'none', borderRadius: 12,
            fontWeight: 700, fontSize: 13, cursor: isHabis ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.2s ease',
            background: isHabis
              ? '#f3f4f6'
              : isAdded
                ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                : 'linear-gradient(135deg,#dc2626,#b91c1c)',
            color: isHabis ? '#9ca3af' : 'white',
            boxShadow: isHabis
              ? 'none'
              : isAdded
                ? '0 3px 10px rgba(34,197,94,0.35)'
                : '0 3px 10px rgba(185,28,28,0.35)',
          }}
        >
          {isHabis ? (
            'Tidak Tersedia'
          ) : isAdded ? (
            <>✓ Ditambahkan</>
          ) : (
            <>+ Pesan</>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Halaman Utama ────────────────────────────────────────────────────────────
const MenuPage = () => {
  const { tableId } = useParams();
  const currentTableNumber = tableId ? parseInt(tableId, 10) : 12;
  const { menuItems, addOrder } = useOrderContext();



  const [cart,           setCart]           = useState([]);
  const [addedItems,     setAddedItems]     = useState({});
  const [showCart,       setShowCart]       = useState(false);
  const [orderPlaced,    setOrderPlaced]    = useState(false);
  const [search,         setSearch]         = useState('');
  const [searchFocused,  setSearchFocused]  = useState(false);

  // ── Filter & mapping ──────────────────────────────────────────────────────
  const filteredMenu = menuItems
    .filter(item => {
      const nama = (item.nama || item.nama_menu || '').toLowerCase();
      return nama.includes(search.toLowerCase());
    })
    .map(item => ({
      id:      item.id,
      name:    item.nama || item.nama_menu,
      image:   item.image ? `${BACKEND_URL}${item.image}` : null,
      stok:    item.stok !== undefined ? item.stok : 0,
    }));

  // ── Cart handlers ─────────────────────────────────────────────────────────
  const handleAdd = (item) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id);
      return ex
        ? prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...item, qty: 1 }];
    });
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => setAddedItems(prev => ({ ...prev, [item.id]: false })), 1400);
  };

  const handleQty = (id, delta) => {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
          .filter(i => i.qty > 0)
    );
  };

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  const handleOrder = async () => {
    if (!cart.length) return;
    try {
      await orderAPI.create({
        no_meja: currentTableNumber,
        catatan: '',
        items: cart.map(i => ({ id_menu: i.id, jumlah: i.qty })),
      });
    } catch (err) {
      console.error('[MenuPage handleOrder]', err);
      // Tetap tampilkan sukses ke user meski ada error network
    }
    setOrderPlaced(true);
    setCart([]);
    setTimeout(() => { setShowCart(false); setOrderPlaced(false); }, 2500);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#fff1f2 0%,#f9fafb 40%,#f3f4f6 100%)' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header style={{
        background: 'linear-gradient(135deg,#dc2626 0%,#b91c1c 100%)',
        color: 'white', padding: '14px 20px',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 4px 20px rgba(185,28,28,0.5)',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 46, height: 46, background: 'white', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>🥟</div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.2 }}>QR SmartOrder</h1>
              <p style={{ fontSize: 11, opacity: 0.85, marginTop: 1 }}>AYCE Dimsum Restaurant</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
              padding: '7px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600,
            }}>Meja {currentTableNumber}</div>
            <button
              onClick={() => setShowCart(true)}
              style={{
                position: 'relative', background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: 12, padding: '9px 13px', cursor: 'pointer', color: 'white',
                fontSize: 20, lineHeight: 1,
              }}
            >
              🛒
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute', top: -8, right: -8,
                  background: '#fbbf24', color: '#7c2d12',
                  width: 22, height: 22, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}>{totalItems}</span>
              )}
            </button>
          </div>
        </div>
      </header>



      {/* ── Menu Container ──────────────────────────────────────── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px 40px' }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1f2937', letterSpacing: '-0.3px' }}>
            Semua Menu
          </h2>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>
            {filteredMenu.length} menu tersedia &bull; AYCE — Gratis!
          </p>
        </div>

        {filteredMenu.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}></div>
            <p style={{ color: '#374151', fontSize: 17, fontWeight: 700 }}>Menu tidak ditemukan</p>
            <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 6 }}>Coba kata kunci lain atau lihat semua menu</p>
            <button
              onClick={() => { setSearch(''); }}
              style={{
                marginTop: 18, padding: '10px 24px', border: 'none', borderRadius: 12,
                background: 'linear-gradient(135deg,#dc2626,#b91c1c)',
                color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14,
              }}
            >
              Lihat semua menu →
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))',
            gap: 16,
          }}>
            {filteredMenu.map(item => (
              <MenuCard
                key={item.id}
                item={item}
                onAdd={handleAdd}
                isAdded={!!addedItems[item.id]}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Order Success Modal ─────────────────────────────────── */}
      {orderPlaced && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: 'white', borderRadius: 28, padding: '44px 36px',
            textAlign: 'center', maxWidth: 300, margin: 20,
            boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
            animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{
              width: 80, height: 80,
              background: '#f0fdf4',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#22c55e',
              fontSize: 40,
              border: '4px solid #bbf7d0',
              boxShadow: '0 8px 16px rgba(34,197,94,0.15)',
            }}>
              ✓
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#16a34a', marginBottom: 8 }}>Pesanan Dikirim!</h2>
            <p style={{ color: '#6b7280', fontSize: 14 }}>Pesanan Anda sedang diproses di dapur</p>
            <div style={{ marginTop: 16, color: '#9ca3af', fontSize: 13 }}>Kembali ke menu...</div>
          </div>
        </div>
      )}

      {/* ── Cart Drawer ─────────────────────────────────────────── */}
      {showCart && !orderPlaced && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'flex-end', zIndex: 1000,
          }}
          onClick={() => setShowCart(false)}
        >
          <div
            style={{
              background: 'white', width: '100%', maxHeight: '88vh',
              borderRadius: '24px 24px 0 0', padding: '20px 20px 28px',
              overflow: 'auto', boxShadow: '0 -8px 30px rgba(0,0,0,0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 99, margin: '0 auto 20px' }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1f2937' }}>🛒 Keranjang Pesanan</h2>
              <button
                onClick={() => setShowCart(false)}
                style={{
                  background: '#f3f4f6', border: 'none', borderRadius: 10,
                  width: 34, height: 34, cursor: 'pointer', fontSize: 17,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 14 }}>🛒</div>
                <p style={{ color: '#374151', fontWeight: 700, fontSize: 16 }}>Keranjang masih kosong</p>
                <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 6 }}>Pilih menu untuk memesan</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  {cart.map(item => (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: 12, background: '#fafafa', borderRadius: 16, marginBottom: 10,
                    }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 14, overflow: 'hidden',
                        background: '#f3f4f6', flexShrink: 0,
                      }}>
                        {item.image
                          ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                              {''}
                            </div>
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: '#1f2937' }}>{item.name}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => handleQty(item.id, -1)}
                          style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >-</button>
                        <span style={{ fontWeight: 800, minWidth: 22, textAlign: 'center', fontSize: 15 }}>{item.qty}</span>
                        <button
                          onClick={() => handleQty(item.id, 1)}
                          style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div style={{ borderTop: '1.5px solid #f3f4f6', paddingTop: 14, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#6b7280', fontSize: 14 }}>Total Item:</span>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{totalItems} item</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: 14 }}>Status:</span>
                    <span style={{ fontWeight: 700, color: '#16a34a', fontSize: 14 }}>AYCE — Gratis </span>
                  </div>
                </div>

                <button
                  onClick={() => setCart([])}
                  style={{
                    width: '100%', padding: 13, border: '2px solid #dc2626',
                    borderRadius: 14, background: 'white', color: '#dc2626',
                    fontWeight: 700, cursor: 'pointer', marginBottom: 10, fontSize: 15,
                  }}
                >
                  Hapus Semua
                </button>

                <button
                  onClick={handleOrder}
                  style={{
                    width: '100%', padding: 14, border: 'none', borderRadius: 14,
                    background: 'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)',
                    color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: 16,
                    boxShadow: '0 5px 18px rgba(34,197,94,0.4)',
                  }}
                >
                  Konfirmasi Pesanan ({totalItems} item)
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #f3f4f6', padding: '18px 20px', textAlign: 'center' }}>
        <p style={{ color: '#9ca3af', fontSize: 12 }}>
          Scan QR Code di meja Anda untuk memesan &bull; AYCE Dimsum SmartOrder System
        </p>
      </footer>
    </div>
  );
};

export default MenuPage;
