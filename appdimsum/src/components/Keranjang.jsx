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
    getTotalItems,
    tableNumber,
  } = useCart()

  const { orders, addOrder } = useOrderContext()
  const [showSentNotification, setShowSentNotification] = useState(false)
  const [showTracking, setShowTracking] = useState(false)
  const [trackingOrderId, setTrackingOrderId] = useState(null)
  const [trackingStep, setTrackingStep] = useState(0)

  useEffect(() => {
    if (!showTracking) return

    setTrackingStep(0)
    const timers = [
      setTimeout(() => setTrackingStep(1), 1500),
      setTimeout(() => setTrackingStep(2), 3200),
    ]

    return () => timers.forEach(clearTimeout)
  }, [showTracking])

  if (!visible) return null

  const getPriceValue = (item) => {
    if (typeof item.priceValue === 'number') return item.priceValue
    if (typeof item.price === 'string') {
      return parseInt(item.price.replace(/\D/g, ''), 10) || 0
    }
    return 0
  }

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
        const newOrderId = response.data?.id || response.id_pesanan || response.id || null
        if (!newOrderId) {
          console.error('Order API returned missing ID:', response)
          alert('Gagal mengirim pesanan: response ID tidak ditemukan')
          return
        }

        setTrackingOrderId(newOrderId)
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
      console.error('Error creating order:', error)
      alert('Terjadi kesalahan saat mengirim pesanan')
    }
  }

  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()
  const formattedTotalPrice = `Rp ${Math.max(0, totalPrice).toLocaleString('id-ID')}`
  const trackingOrder = orders.find(o => o.id === trackingOrderId)
  const currentStatus = trackingOrder?.status || 'Menunggu'
  const progressHeight = trackingStep === 0 ? '26%' : trackingStep === 1 ? '62%' : '100%'
  const canClose = !showSentNotification && (!showTracking || currentStatus === 'Selesai')

  const handleOverlayClick = () => {
    if (canClose) onClose()
  }

  const stopClose = (e) => {
    e.stopPropagation()
  }

  return (
    <div className="cart-overlay" onClick={handleOverlayClick}>
      {showSentNotification ? (
        <div className="order-notification-card" onClick={stopClose}>
          <div className="notification-icon">
            <span className="material-icons">check</span>
          </div>
          <h2 className="notification-title">Pesanan Dikirim</h2>
          <p className="notification-text">Mohon tunggu, pesanan anda segera diproses</p>
          <p className="notification-small">Lacak pesanan anda...</p>
        </div>
      ) : showTracking ? (
        <div className="cart-modal tracking-modal" onClick={stopClose}>
          <div className="tracking-header">
            <h2 className="tracking-title">Lacak pesanan anda</h2>
          </div>
          <div className="tracking-steps">
            <div className="tracking-rail" />
            <div className="tracking-progress" style={{ height: progressHeight }} />
            {[
              {
                label: 'Pesanan Telah Dikonfirmasi',
                subtitle: '(Pesanan sedang diproses)',
              },
              {
                label: 'Pesanan sudah siap',
                subtitle: '(Pesanan akan diantarkan)',
              },
              {
                label: 'Pesanan selesai',
                subtitle: '(Pesanan telah disajikan)',
              },
            ].map((step, idx) => {
              const isDone = idx < trackingStep
              const isActive = idx === trackingStep

              return (
                <div key={idx} className="tracking-step">
                  <div className="tracking-step-info">
                    <h3 className={`tracking-step-title ${isActive || isDone ? 'active-text' : ''}`}>
                      {step.label}
                    </h3>
                    <p className="tracking-step-desc">{step.subtitle}</p>
                  </div>
                  <div className="tracking-marker-box">
                    <span className={`tracking-circle ${isDone || isActive ? 'active' : ''}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="cart-modal" onClick={stopClose}>
          <button type="button" className="cart-close" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
          <div className="cart-box">
            <div className="cart-header">
              <div>
                <p className="cart-title">Keranjang Pesanan</p>
                <p className="cart-subtitle">
                  {cart.length ? `${totalItems} item dipilih` : 'Tidak ada pesanan saat ini'}
                </p>
              </div>
              <button className="cart-clear" onClick={clearCart} disabled={!cart.length}>
                Hapus Semua
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <span className="material-icons">shopping_cart</span>
                <p>Keranjang kosong</p>
                <small>Pilih menu terlebih dahulu untuk menambahkan pesanan.</small>
              </div>
            ) : (
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} className="cart-item-image" />
                    <div className="cart-item-details">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">Rp {getPriceValue(item).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="quantity-control">
                      <button type="button" onClick={() => decrementQuantity(item.id)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => incrementQuantity(item.id)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="cart-summary">
              <div className="summary-label">Total Pembayaran</div>
              <div className="summary-value">{formattedTotalPrice}</div>
            </div>

            <button className="confirm-btn" onClick={handleConfirm} disabled={!cart.length}>
              Konfirmasi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Keranjang
