import { useState, useEffect } from "react"
import { useOrderContext } from "../context/OrderContext"

const KitchenPage = () => {
  const { orders, updateOrderStatus, deleteOrder } = useOrderContext()
  const [localOrders, setLocalOrders] = useState(orders)

  useEffect(() => {
    setLocalOrders(orders)
  }, [orders])

  const handleDelete = (orderId) => {
    if (window.confirm("Hapus order ini?")) {
      deleteOrder(orderId)
    }
  }

  return (
    <div>
      <h1>Kitchen Dashboard</h1>
      <p>Total Pesanan: {orders.length}</p>

      {orders.length === 0 ? (
        <p>Tidak ada pesanan</p>
      ) : orders.map((order) => (
        <div key={order.id}>
          <h3>Meja {order.tableNumber}</h3>
          <p>Status: {order.status}</p>

          {order.status === "Menunggu" && (
            <button onClick={() => updateOrderStatus(order.id, "Diproses")}>
              Mulai Masak
            </button>
          )}

          {order.status === "Diproses" && (
            <button onClick={() => updateOrderStatus(order.id, "ready")}>
              Siap Diantar
            </button>
          )}

          {order.status === "ready" && (
            <button onClick={() => updateOrderStatus(order.id, "Selesai")}>{
              'Selesaikan Pesanan'
            }</button>
          )}

          {order.status === "Selesai" && (
            <button onClick={() => handleDelete(order.id)}>
              Hapus
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export default KitchenPage