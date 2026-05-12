import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useOrderContext } from '../context/OrderContext'
import { orderAPI } from '../services/api'

const Keranjang = ({ visible, onClose }) => {
  const navigate = useNavigate()
  const {
    cart,
    clearCart,
    incrementQuantity,
    decrementQuantity,
    getTotalPrice,
    getTotalItems,
    tableNumber,
  } = useCart()

  const { refreshOrders } = useOrderContext()
  const [loading, setLoading] = useState(false)

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

    setLoading(true)
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
          throw new Error('ID Pesanan tidak ditemukan')
        }

        if (refreshOrders) await refreshOrders()
        
        clearCart()
        onClose()
        navigate(`/tracking/${newOrderId}`)
      } else {
        alert('Gagal mengirim pesanan: ' + (response.message || 'Error tidak diketahui'))
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Terjadi kesalahan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()
  const formattedTotalPrice = `Rp ${Math.max(0, totalPrice).toLocaleString('id-ID')}`

  const handleOverlayClick = () => {
    onClose()
  }

  const stopClose = (e) => {
    e.stopPropagation()
  }

  return (
    <div className="cart-overlay" onClick={handleOverlayClick}>
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

          <button 
            className="confirm-btn" 
            onClick={handleConfirm} 
            disabled={!cart.length || loading}
          >
            {loading ? 'Mengirim...' : 'Konfirmasi'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Keranjang
