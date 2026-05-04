import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { OrderProvider } from './context/OrderContext'
import Dashboard from './pages/Dashboard'
import MenuPage from './pages/MenuPage'
import KitchenPage from './pages/KitchenPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ReviewPage from './pages/ReviewPage'
import TrackingPage from './pages/TrackingPage'

function App() {
  return (
    <OrderProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/tracking/:orderId" element={<TrackingPage />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/menu/:tableId" element={<MenuPage />} />
          <Route path="/kitchen" element={<KitchenPage />} />
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>
      </BrowserRouter>
    </OrderProvider>
  )
}

export default App