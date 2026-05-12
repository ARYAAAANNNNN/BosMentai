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

  // 1. SINKRONISASI REFRESH
  // Jika ada ID di localStorage, otomatis buka modal tracking
  useEffect(() => {
    const savedOrderId = localStorage.getItem('activeTrackingOrderId')
    if (savedOrderId) {
      setTrackingOrderId(parseInt(savedOrderId))
      setShowTracking(true)
      // Jika refresh terjadi saat tracking aktif, kita panggil onClose di parent 
      // tapi sebenarnya logic di bawah akan menjaga modal tetap tampil
    }
  }, [])

  const getStepFromStatus = (status) => {
    const s = status?.toLowerCase()
    if (s === 'selesai') return 2
    if (s === 'diproses' || s === 'cooking') return 1
    if (s === 'terkonfirmasi') return 0
    return -1 
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
    if (!cart.length) return
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
        
        setTrackingOrderId(newOrderId)
        localStorage.setItem('activeTrackingOrderId', newOrderId)

        await refreshOrders()
        setShowSentNotification(true)
        clearCart()

        setTimeout(() => {
          setShowSentNotification(false)
          setShowTracking(true)
        }, 1400)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const trackingOrder = orders.find((o) => o.id === trackingOrderId)
  const currentStatus = trackingOrder?.status || 'Menunggu Konfirmasi'
  const trackingStep = getStepFromStatus(currentStatus)

  // 5. LOGIKA CLEANUP
  // Hanya hapus localStorage jika user menekan tombol "Selesai & Tutup"
  // Jangan hapus otomatis di sini agar persistensi terjaga saat refresh di status 'Selesai'

  const progressHeight =
    trackingStep === -1 ? '0%' :
      trackingStep === 0 ? '12%' :
        trackingStep === 1 ? '50%' : '100%';

  // 6. PROTEKSI MODAL & PERSISTENCE
  // Modal WAJIB visible jika showTracking bernilai true (sedang melacak)
  const isCurrentlyTracking = showTracking && trackingOrderId
  const actualVisible = isCurrentlyTracking ? true : visible
  
  // User hanya bisa tutup jika TIDAK sedang tracking atau pesanan SUDAH selesai
  const canClose = !showTracking || currentStatus?.toLowerCase() === 'selesai'

  const handleOverlayClick = () => { if (canClose) onClose() }
  const stopClose = (e) => { e.stopPropagation() }

  // Ganti 'visible' dengan 'actualVisible' untuk memaksa modal muncul jika ada tracking
  if (!actualVisible) return null

  return (
    <div className="cart-overlay" onClick={handleOverlayClick}>
      {showSentNotification ? (
        <div className="order-notification-card" onClick={stopClose}>
          <div className="notification-icon">
            <span className="material-icons">check_circle</span>
          </div>
          <h2 className="notification-title">Pesanan Terkirim!</h2>
          <p className="notification-text">Pesanan Anda telah diterima dapur.</p>
        </div>
      ) : showTracking ? (
        <div className="cart-modal tracking-modal" onClick={stopClose}>
          <div className="tracking-header">
            <h2 className="tracking-title">Lacak Pesanan #{trackingOrderId}</h2>
            {/* Tombol close dihilangkan selama tracking aktif */}
          </div>

          <div className="tracking-status-badge">
            <span className={`status-dot ${currentStatus?.toLowerCase() === 'selesai' ? 'done' : 'pulse'}`}></span>
            {currentStatus}
          </div>

          <div className="tracking-steps" style={{ position: 'relative', marginTop: '32px', paddingLeft: '40px' }}>
            <div style={{ position: 'absolute', left: '14px', top: '10px', bottom: '10px', width: '2px', background: '#E5E7EB', zIndex: 1 }} />
            <div style={{ position: 'absolute', left: '14px', top: '10px', width: '2px', height: progressHeight, background: '#ef4444', zIndex: 2, transition: 'height 0.8s ease' }} />

            {[
              { label: 'Pesanan Dikonfirmasi', subtitle: 'Admin telah menyetujui pesanan Anda' },
              { label: 'Sedang Disiapkan', subtitle: 'Koki sedang meracik hidangan Anda' },
              { label: 'Pesanan Selesai', subtitle: 'Selamat menikmati hidangan kami!' },
            ].map((step, idx) => {
              const isDone = idx < trackingStep
              const isActive = idx === trackingStep
              return (
                <div key={idx} style={{ position: 'relative', marginBottom: idx === 2 ? 0 : 35, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'absolute', left: '-40px', width: '30px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                    <div style={{
                      width: isActive ? '14px' : '10px', height: isActive ? '14px' : '10px', borderRadius: '50%',
                      background: (isDone || isActive) ? '#ef4444' : '#fff',
                      border: (isDone || isActive) ? '3px solid #fff' : '2px solid #E5E7EB',
                      boxShadow: isActive ? '0 0 0 4px rgba(239, 68, 68, 0.2)' : 'none'
                    }} />
                  </div>
                  <div className="tracking-step-info">
                    <h3 style={{ margin: 0, fontSize: '14px', color: (isActive || isDone) ? '#ef4444' : '#9CA3AF' }}>{step.label}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6B7280' }}>{step.subtitle}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {currentStatus?.toLowerCase() === 'selesai' && (
            <button
              className="btn-browse"
              style={{ marginTop: '30px', width: '100%', background: '#10B981' }}
              onClick={() => {
                localStorage.removeItem('activeTrackingOrderId') // Hapus saat benar-benar selesai
                setTrackingOrderId(null)
                setShowTracking(false)
                onClose()
              }}
            >
              Pesanan Selesai & Tutup
            </button>
          )}
        </div>
      ) : (
        <div className="cart-modal" onClick={stopClose}>
          {/* Bagian Keranjang Biasa Tetap Sama */}
          <div className="cart-box">
             <div className="cart-header-main">
               <div className="header-info">
                 <h2 className="cart-title-large">Keranjang Saya</h2>
                 <div className="table-tag">Meja {tableNumber}</div>
               </div>
               <button className="btn-close-circle" onClick={onClose}>
                 <span className="material-icons">close</span>
               </button>
             </div>
             {/* ... rest of cart items ... */}
             <div className="cart-items-container">
                {cart.length > 0 && (
                  <div className="cart-footer-fixed">
                    <button className="btn-confirm-order" onClick={handleConfirm}>
                      Pesan Sekarang
                    </button>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Keranjang