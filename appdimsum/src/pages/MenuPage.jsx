import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { menuAPI, getImageUrl } from '../services/api'
import './MenuPage.css'

function MenuPage() {
  const { tableId } = useParams()
  const [activeCategory, setActiveCategory] = useState('semua')
  const [searchTerm, setSearchTerm] = useState('')
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [notification, setNotification] = useState('')
  const [loading, setLoading] = useState(true)

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

  const categories = [
    { id: 'semua', name: 'Semua' },
    { id: 'dimsum', name: 'Dimsum' },
    { id: 'goreng', name: 'Goreng' },
    { id: 'minuman', name: 'Minuman' },
    { id: 'dessert', name: 'Dessert' }
  ]

  const categoryMap = {
    semua: ['all'],
    dimsum: ['siomai', 'hakau', 'xiao long bao', 'dumpling'],
    goreng: ['cakwe'],
    minuman: ['es teh', 'es jeruk'],
    dessert: ['puding']
  }

  const normalizeMenu = (item) => {
    const name = item.nama_menu || item.nama || item.name || ''
    const rawPrice = item.price ?? item.harga ?? 0
    const price = typeof rawPrice === 'number'
      ? `Rp ${rawPrice.toLocaleString('id-ID')}`
      : rawPrice || 'Rp 0'
    return {
      id: item.id_menu || item.id,
      name,
      price,
      availability: item.availability ?? item.stok ?? 0,
      category: item.category || item.kategori || '',
      image: getImageUrl(item.image || item.gambar),
    }
  }

  const normalizedMenu = menuItems.map(normalizeMenu)

  const filteredMenu = normalizedMenu.filter(item => {
    const itemName = item.name.toLowerCase()
    const matchesCategory = activeCategory === 'semua' ||
      categoryMap[activeCategory].some(keyword => itemName.includes(keyword))
    const matchesSearch = itemName.includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (item) => {
    setCart(prev => [...prev, item])
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
            <div className="logo"><span>QR</span></div>
            <div className="brand">
              <div className="brand-name">QR SmartOrder</div>
              <div className="restaurant-name">AYCE Dimsum Restaurant</div>
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
          <div className="cart-icon" onClick={() => showNotification(cart.length ? 'Lihat keranjang Anda di fitur selanjutnya' : 'Keranjang belanja Anda kosong')}>
            <span className="material-icons">shopping_cart</span>
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
                  <button className="order-btn" onClick={() => addToCart(item)}>
                    <span className="material-icons">add</span>
                    Pesan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default MenuPage
