import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { OrderProvider } from './context/OrderContext'
import Dashboard from './pages/Dashboard'
import MenuPage from './pages/MenuPage'
import KitchenPage from './pages/KitchenPage'

function App() {
  return (
    <OrderProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/menu/:tableId" element={<MenuPage />} />
          <Route path="/kitchen" element={<KitchenPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </OrderProvider>
  )
}

export default App