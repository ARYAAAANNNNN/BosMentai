import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { OrderProvider } from './context/OrderContext'
import { CartProvider } from './context/CartContext'
import Dashboard from './pages/Dashboard'
import MenuPage from './pages/MenuPage'
import KitchenPage from './pages/KitchenPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import TrackingPage from './pages/TrackingPage'
import MonitoringPage from './pages/MonitoringPage'

function App() {
  return (
    <OrderProvider>
      <CartProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tracking/:orderId" element={<TrackingPage />} />
          <Route path="/monitoring/:orderId" element={<MonitoringPage />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/menu/:tableId" element={<MenuPage />} />
          <Route path="/kitchen" element={<KitchenPage />} />
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>
        </BrowserRouter>
      </CartProvider>
    </OrderProvider>
  )
}

export default App