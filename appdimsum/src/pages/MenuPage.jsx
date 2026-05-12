import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { menuAPI, getImageUrl } from '../services/api'
import { useCart } from '../context/CartContext'
import Keranjang from '../components/Keranjang'
import './MenuPage.css'

function MenuPage() {
  const { tableId } = useParams()
  const { addToCart, getTotalItems } = useCart()
  const [activeCategory, setActiveCategory] = useState('semua')
  const [searchTerm, setSearchTerm] = useState('')
  const [menuItems, setMenuItems] = useState([])
  const [notification, setNotification] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    let mounted = true

    const fetchMenus = async () => {
      try {
        const response = await menuAPI.getAll()
        const items = response?.data || response
        if (mounted && Array.isArray(items)) {
          setMenuItems(items)
        }
      } catch (error) {
        console.error('Gagal mengambil menu dari backend:', error)
        if (mounted) setNotification('Gagal terhubung ke backend menu')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchMenus()
    return () => { mounted = false }
  }, [])

  const normalizeMenu = (item) => {
    const name = item.nama_menu || item.nama || item.name || ''
    const rawPrice = item.price ?? item.harga ?? 0
    const priceValue = typeof rawPrice === 'number'
      ? rawPrice
      : parseInt(String(rawPrice).replace(/\D/g, ''), 10) || 0
    const price = `Rp ${priceValue.toLocaleString('id-ID')}`
    return {
      id: item.id_menu || item.id,
      name,
      price,
      priceValue,
      availability: item.availability ?? item.stok ?? 0,
      category: item.category || item.kategori || item.nama_kategori || '',
      id_kategori: item.id_kategori ? String(item.id_kategori) : '',
      image: getImageUrl(item.image || item.gambar),
    }
  }

  const normalizedMenu = menuItems.map(normalizeMenu)

  const categories = [
    { id: 'semua', name: 'Semua' },
    ...normalizedMenu.reduce((acc, item) => {
      if (!item.category) return acc
      const categoryId = item.id_kategori || item.category.toLowerCase().replace(/\s+/g, '-')
      if (!acc.some(category => category.id === categoryId)) {
        acc.push({ id: categoryId, name: item.category })
      }
      return acc
    }, []),
  ]

  const filteredMenu = normalizedMenu.filter(item => {
    const itemName = item.name.toLowerCase()
    const matchesCategory = activeCategory === 'semua' || item.id_kategori === activeCategory
    const matchesSearch = itemName.includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getPriceValue = (item) => {
    if (typeof item.priceValue === 'number') return item.priceValue
    if (typeof item.price === 'string') {
      return parseInt(item.price.replace(/\D/g, ''), 10) || 0
    }
    return 0
  }

  const addToCartHandler = (item) => {
    const itemWithPrice = {
      ...item,
      priceValue: getPriceValue(item)
    }
    addToCart(itemWithPrice)
    showNotification(`${item.name} ditambahkan ke keranjang`)
  }

  const showNotification = (message) => {
    setNotification(message)
    setTimeout(() => setNotification(''), 3000)
  }

  const tableNumber = tableId || '12'

  return (
    <div className="app">
      {notification && (
        <div className="notification">{notification}</div>
      )}

      <nav className="navbar">
        <div className="nav-left">
          <div className="logo-container">
            <div className="logo"><span>BM</span></div>
            <div className="brand">
              <div className="brand-name">Bos Mentai</div>
              <div className="restaurant-name">Premium Dimsum & Mentai</div>
            </div>
          </div>
        </div>
        <div className="nav-right">
          <div className="search-bar">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="mau makan apa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="table-indicator">
            <span className="material-icons">table_restaurant</span>
            <span>Meja {tableNumber}</span>
          </div>
          <div className="cart-icon" onClick={() => setShowCart(true)}>
            <span className="material-icons">shopping_cart</span>
            {getTotalItems() > 0 && (
              <span className="cart-badge">{getTotalItems()}</span>
            )}
          </div>
        </div>
      </nav>

      <div className="category-menu">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <main className="main-content">
        <div className="page-grid">
          <section className="menu-section">
            <div className="menu-header">
              <h2>{activeCategory === 'semua' ? 'Semua Menu' : categories.find(c => c.id === activeCategory)?.name}</h2>
              <span className="menu-count">{filteredMenu.length} menu tersedia.</span>
            </div>

            {loading ? (
              <div className="menu-grid" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '220px' }}>
                <p style={{ color: '#666' }}>Memuat menu...</p>
              </div>
            ) : (
              <div className="menu-grid">
                {filteredMenu.map(item => (
                  <div key={item.id} className="menu-card">
                    <img src={item.image} alt={item.name} className="menu-image" />
                    <div className="menu-info">
                      <div className="menu-price">{item.price}</div>
                      <div className="menu-name">{item.name}</div>
                      <div className="menu-availability">Tersedia : {item.availability}</div>
                      <button className="order-btn" onClick={() => addToCartHandler(item)}>
                        <span className="material-icons">add</span>
                        Pesan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <Keranjang visible={showCart} onClose={() => setShowCart(false)} />
        </div>
      </main>
    </div>
  )
}

export default MenuPage
