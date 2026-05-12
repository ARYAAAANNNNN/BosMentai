import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useOrderContext } from '../context/OrderContext'
import { orderAPI } from '../services/api'

const Keranjang = ({ visible, onClose }) => {
  const {
    cart,
    clearCart,
    incrementQuantity,
    decrementQuantity,
    getTotalPrice,
    tableNumber,
  } = useCart()

  const { orders, refreshOrders } = useOrderContext()

  const [showSentNotification, setShowSentNotification] = useState(false)
  const [showTracking, setShowTracking] = useState(false)
  const [trackingOrderId, setTrackingOrderId] = useState(null)

  // 1. Sinkronisasi dengan LocalStorage saat refresh (Hanya load ID, jangan langsung tampilkan)
  useEffect(() => {
    const savedOrderId = localStorage.getItem('activeTrackingOrderId')
    if (savedOrderId) {
      setTrackingOrderId(parseInt(savedOrderId))
    }
  }, [])

  // 2. Auto Refresh Data Pesanan (Dihapus karena sudah ada polling global di OrderContext)
  // Ini mencegah request berlebih yang menyebabkan error 429

  // 3. Mapping Status ke Step (Disesuaikan dengan status di Orders.jsx)
  const getStepFromStatus = (status) => {
    if (status === 'Selesai') return 2
    if (status === 'Diproses') return 1
    if (status === 'Terkonfirmasi') return 0
    return -1 // Menunggu Konfirmasi
  }

  const getPriceValue = (item) => {
    if (typeof item.priceValue === 'number') return item.priceValue
    if (typeof item.price === 'string') {
      return parseInt(item.price.replace(/\D/g, ''), 10) || 0
    }
    return 0
  }

  // 4. Handle Konfirmasi Pesanan
  const handleConfirm = async () => {
    if (!cart.length) {
      alert('Keranjang kosong')
      return
    }

    try {
      const orderData = {
        no_meja: tableNumber,
        catatan: '',
        items: cart.map(item => ({
          id_menu: item.id,
          jumlah: item.quantity,
          harga_satuan: item.priceValue || 0,
        })),
      }

      const response = await orderAPI.create(orderData)

      if (response.success) {
        const newOrderId = response.data?.id || response.id_pesanan || response.id
        
        if (!newOrderId) {
          alert('Gagal mengirim pesanan: response ID tidak ditemukan')
          return
        }

        // Simpan ID ke state dan localStorage
        setTrackingOrderId(newOrderId)
        localStorage.setItem('activeTrackingOrderId', newOrderId)
        
        await refreshOrders()
        setShowSentNotification(true)
        clearCart()

        setTimeout(() => {
          setShowSentNotification(false)
          setShowTracking(true)
        }, 1400)
      } else {
        alert('Gagal mengirim pesanan: ' + (response.message || 'Unknown error'))
      }
    } catch (error) {
      alert('Gagal mengirim pesanan: ' + error.message)
    }
  }

  const totalPrice = getTotalPrice()
  const formattedTotalPrice = `Rp ${Math.max(0, totalPrice).toLocaleString('id-ID')}`

  // 5. Logika Tracking
  const trackingOrder = orders.find((o) => o.id === trackingOrderId)
  const currentStatus = trackingOrder?.status || 'Menunggu Konfirmasi'
  const trackingStep = getStepFromStatus(currentStatus)

  // Jika pesanan selesai, bersihkan localStorage agar bisa pesan baru nanti
  if (currentStatus === 'Selesai' && trackingOrderId) {
    localStorage.removeItem('activeTrackingOrderId')
  }

  const progressHeight =
    trackingStep === -1 ? '0%' :
    trackingStep === 0  ? '12%' : 
    trackingStep === 1  ? '50%' : '100%';

  // 6. Proteksi Modal (Tidak bisa diclose jika belum selesai)
  // User hanya bisa tutup jika: 
  // - Sedang di keranjang biasa (bukan tracking)
  // - ATAU Pesanan sudah berstatus 'Selesai'
  const canClose = !showTracking || currentStatus === 'Selesai'

  const handleOverlayClick = () => { if (canClose) onClose() }
  const stopClose = (e) => { e.stopPropagation() }

  if (!visible) return null

  return (
    <div className="cart-overlay" onClick={handleOverlayClick}>
      {showSentNotification ? (
        <div className="order-notification-card" onClick={stopClose}>
          <div className="notification-icon">
            <span className="material-icons">check_circle</span>
          </div>
          <h2 className="notification-title">Pesanan Terkirim!</h2>
          <p className="notification-text">Pesanan Anda telah kami terima dan sedang diteruskan ke dapur.</p>
          <div className="loading-dots"><span>.</span><span>.</span><span>.</span></div>
        </div>
      ) : showTracking ? (
        <div className="cart-modal tracking-modal" onClick={stopClose}>
          <div className="tracking-header">
            <h2 className="tracking-title">Lacak Pesanan</h2>
            <div className="flex gap-2">
              {cart.length > 0 && (
                <button className="close-mini-btn" onClick={() => setShowTracking(false)} title="Kembali ke Keranjang">
                  <span className="material-icons">shopping_cart</span>
                </button>
              )}
              <button className="close-mini-btn" onClick={onClose}>
                <span className="material-icons">close</span>
              </button>
            </div>
          </div>

          <div className="tracking-status-badge">
            <span className={`status-dot ${currentStatus === 'Selesai' ? 'done' : 'pulse'}`}></span>
            {currentStatus}
          </div>

          <div className="tracking-steps" style={{ position: 'relative', marginTop: '32px', paddingLeft: '40px' }}>
            {/* GARIS DASAR */}
            <div style={{
              position: 'absolute', left: '14px', top: '10px', bottom: '10px',
              width: '2px', background: '#E5E7EB', zIndex: 1
            }} />

            {/* GARIS PROGRESS */}
            <div style={{
              position: 'absolute', left: '14px', top: '10px', width: '2px',
              height: progressHeight, background: '#ef4444', zIndex: 2,
              transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />

            {[
              { label: 'Pesanan Dikonfirmasi', subtitle: 'Admin telah menyetujui pesanan Anda' },
              { label: 'Sedang Disiapkan', subtitle: 'Koki sedang meracik hidangan Anda' },
              { label: 'Pesanan Selesai', subtitle: 'Selamat menikmati hidangan kami!' },
            ].map((step, idx) => {
              const isDone = idx < trackingStep
              const isActive = idx === trackingStep

              return (
                <div key={idx} style={{ position: 'relative', marginBottom: idx === 2 ? 0 : 35, display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    position: 'absolute', left: '-40px', width: '30px', height: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3
                  }}>
                    <div style={{
                      width: isActive ? '14px' : '10px',
                      height: isActive ? '14px' : '10px',
                      borderRadius: '50%',
                      background: (isDone || isActive) ? '#ef4444' : '#fff',
                      border: (isDone || isActive) ? '3px solid #fff' : '2px solid #E5E7EB',
                      boxShadow: isActive ? '0 0 0 4px rgba(239, 68, 68, 0.2)' : 'none',
                      transition: 'all 0.3s ease'
                    }} />
                  </div>

                  <div className="tracking-step-info" style={{ textAlign: 'left' }}>
                    <h3 className={`tracking-step-title ${(isActive || isDone) ? 'active-text' : ''}`} 
                        style={{ margin: 0, fontSize: '14px', fontWeight: (isActive || isDone) ? '700' : '500' }}>
                      {step.label}
                    </h3>
                    <p className="tracking-step-desc" style={{ margin: '4px 0 0', fontSize: '12px', color: '#6B7280' }}>
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {trackingStep === -1 && (
            <div className="pending-notice" style={{ 
                textAlign: 'left', display: 'flex', alignItems: 'center', 
                gap: '8px', marginTop: '30px', padding: '12px', 
                background: '#FEF3C7', borderRadius: '8px', color: '#92400E', fontSize: '12px' 
            }}>
              <span className="material-icons" style={{ fontSize: '18px' }}>hourglass_empty</span>
              <p style={{ margin: 0, fontWeight: '600' }}>Menunggu konfirmasi kasir...</p>
            </div>
          )}

          {currentStatus === 'Selesai' && (
            <button 
              className="btn-browse" 
              style={{ marginTop: '30px', width: '100%' }}
              onClick={() => {
                setTrackingOrderId(null)
                setShowTracking(false)
                onClose()
              }}
            >
              Selesai & Tutup
            </button>
          )}
        </div>
      ) : (
        <div className="cart-modal" onClick={stopClose}>
          <div className="cart-box">
            <div className="cart-header-main">
              <div className="header-info">
                <h2 className="cart-title-large">Keranjang Saya</h2>
                <div className="flex gap-2 items-center">
                  <div className="table-tag">Meja {tableNumber}</div>
                  {trackingOrderId && (
                    <button 
                      className="tracking-pill-btn" 
                      onClick={() => setShowTracking(true)}
                    >
                      <span className="material-icons">radar</span>
                      Lacak Pesanan
                    </button>
                  )}
                </div>
              </div>
              <button className="btn-close-circle" onClick={onClose}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="cart-items-container">
              {cart.length === 0 ? (
                <div className="empty-cart-state">
                  <div className="empty-icon">🛒</div>
                  <p className="empty-title">Keranjang Kosong</p>
                  <p className="empty-desc">Belum ada menu yang dipilih nih. Yuk pilih menu favoritmu!</p>
                  <button className="btn-browse" onClick={onClose}>Lihat Menu</button>
                </div>
              ) : (
                <>
                  <div className="items-scroll">
                    {cart.map(item => (
                      <div key={item.id} className="cart-item-card">
                        <div className="item-img-box">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="item-details">
                          <p className="item-name">{item.name}</p>
                          <p className="item-price">Rp {getPriceValue(item).toLocaleString('id-ID')}</p>
                        </div>
                        <div className="item-actions">
                          <div className="qty-stepper">
                            <button onClick={() => decrementQuantity(item.id)}>−</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => incrementQuantity(item.id)}>+</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cart-footer-fixed">
                    <div className="summary-row">
                      <span className="label">Total Pembayaran</span>
                      <span className="value">{formattedTotalPrice}</span>
                    </div>
                    <button className="btn-confirm-order" onClick={handleConfirm}>
                      Pesan Sekarang
                      <span className="material-icons">chevron_right</span>
                    </button>
                    <button className="btn-clear-all" onClick={clearCart}>Hapus Semua</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .status-dot.pulse {
          animation: pulse-red 2s infinite;
        }
        @keyframes pulse-red {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .active-text { color: #ef4444; }
      `}</style>
    </div>
  )
}

export default Keranjang;