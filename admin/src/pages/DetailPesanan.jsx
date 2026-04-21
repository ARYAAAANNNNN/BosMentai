import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from 'react';
import { useOrderContext } from '../context/OrderContext.jsx';

const DetailPesanan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = parseInt(searchParams.get('id')) || 2;
  const { orders, selectedOrder, setSelectedOrder, updateOrderStatus } = useOrderContext();
  const [printing, setPrinting] = useState(false);

  const currentOrder = orders.find(o => o.id === orderId) || selectedOrder;

  useEffect(() => {
    if (orderId && !currentOrder) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setSelectedOrder(order);
      }
    }
  }, [orderId, orders, currentOrder, setSelectedOrder]);

  const handlePrint = () => {
    setPrinting(true);
    window.print();
    setTimeout(() => {
      if (orderId) updateOrderStatus(orderId, 'Diproses');
      setPrinting(false);
      navigate('/admin/orders');
    }, 1000);
  };

  if (!currentOrder) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 print:p-0 print:bg-white">
      {/* Struk Print-Only */}
      <div id="struk" className="bg-white w-full max-w-md mx-auto rounded-xl p-6 shadow-lg print:w-80 print:max-w-none print:shadow-none print:rounded-none print:mx-auto print:p-8 hidden print:block print:page-break-inside-avoid">
        <div className="text-center mb-6 print:mb-4">
          <h1 className="text-2xl font-bold text-red-600 mb-1">BOS MENTAI</h1>
          <p className="text-sm uppercase tracking-wide">Struk Pesanan</p>
        </div>

        {/* Info */}
        <div className="text-sm space-y-2 mb-6 print:mb-4">
          <p><span className="font-bold">No Meja:</span> Meja {currentOrder.meja}</p>
          <p><span className="font-bold">Waktu:</span> {currentOrder.waktu}</p>
          <p><span className="font-bold">Status:</span> {currentOrder.status}</p>
          <div className="border-t border-dashed border-gray-400 pt-4 mt-4">
            <p className="font-bold text-lg text-center">DAFTAR PESANAN</p>
            <div className="space-y-1 mt-2">
              {currentOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span>{item.name}</span>
                  <span>x{item.qty}</span>
                </div>
              )) || []}
            </div>
            <div className="border-t border-dashed border-gray-400 mt-4 pt-2">
              <p className="font-bold text-right text-lg">Total Item: {currentOrder.totalItems || currentOrder.items?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Screen View */}
      <div className="bg-white w-full max-w-2xl rounded-xl p-8 print:hidden shadow-lg">
        {/* Judul */}
        <h1 className="text-center text-2xl font-bold mb-6 text-gray-800">
          Detail Pesanan # {currentOrder.id}
        </h1>

        {/* Info */}
        <div className="text-sm space-y-3 mb-8 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p><span className="font-semibold">Nomor Meja:</span> Meja {currentOrder.meja}</p>
            <p><span className="font-semibold">Waktu:</span> {currentOrder.waktu}</p>
            <p><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-bold ${currentOrder.status === 'Menunggu' ? 'bg-blue-100 text-blue-800' : currentOrder.status === 'Diproses' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{currentOrder.status}</span></p>
          </div>
        </div>

        {/* Daftar Pesanan */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-4">Daftar Pesanan</h2>
          <div className="space-y-3">
            {currentOrder.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">Jumlah: {item.qty}</p>
                </div>
                <span className="text-2xl font-bold text-red-500">{item.qty}</span>
              </div>
            )) || []}
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between text-xl font-bold">
            <span>Total Item</span>
            <span>{currentOrder.totalItems || currentOrder.items?.length || 0}</span>
          </div>
        </div>

        {/* Tombol */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate("/admin/orders")}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all"
          >
            ← Kembali
          </button>
          <button 
            onClick={handlePrint} 
            disabled={printing} 
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            {printing ? 'Mencetak...' : '🖨️ Cetak Struk'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailPesanan;

