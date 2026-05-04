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

  const tax = (currentOrder.totalHarga || 0) * 0.1;
  const grandTotal = (currentOrder.totalHarga || 0) + tax;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 print:p-0 print:bg-white">
      {/* Struk Print-Only (Thermal Style) */}
      <div id="struk" className="bg-white w-full max-w-md mx-auto rounded-xl p-8 shadow-lg print:w-[80mm] print:max-w-none print:shadow-none print:rounded-none print:mx-auto print:p-4 hidden print:block print:page-break-inside-avoid font-mono text-[10pt]">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold uppercase mb-1">BOS MENTAI</h1>
          <p className="text-[8pt]">Jl. Raya Mentai No. 123</p>
          <p className="text-[8pt]">Telp: 0812-3456-7890</p>
        </div>
        
        <div className="border-t border-dashed border-black my-2"></div>

        {/* Info */}
        <div className="text-[8pt] space-y-1 mb-2">
          <div className="flex justify-between">
            <span>NO: #ORD-{currentOrder.id}</span>
            <span>MEJA: {currentOrder.meja}</span>
          </div>
          <p>WAKTU: {currentOrder.waktu}</p>
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        {/* Daftar Pesanan */}
        <div className="space-y-1 mb-2">
          {currentOrder.items?.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex justify-between font-bold">
                <span>{item.name}</span>
              </div>
              <div className="flex justify-between text-[8pt]">
                <span>{item.qty} x {item.harga?.toLocaleString('id-ID')}</span>
                <span>{(item.qty * (item.harga || 0)).toLocaleString('id-ID')}</span>
              </div>
            </div>
          )) || []}
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        {/* Totals */}
        <div className="space-y-1 text-[9pt]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rp {(currentOrder.totalHarga || 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Pajak (10%)</span>
            <span>Rp {tax.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between font-bold text-[11pt] mt-1 border-t border-dashed border-black pt-1">
            <span>TOTAL</span>
            <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-black my-4"></div>
        <div className="text-center text-[8pt] italic">
          <p>Terima Kasih</p>
          <p>Selamat Menikmati!</p>
        </div>
      </div>

      {/* Screen View */}
      <div className="bg-white w-full max-w-2xl rounded-[32px] p-10 print:hidden shadow-2xl shadow-gray-200 border border-gray-100">
        {/* Judul */}
        <div className="flex justify-between items-start mb-8">
            <div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">
                Detail Pesanan #ORD-{currentOrder.id}
                </h1>
                <p className="text-sm text-gray-400 font-medium italic">Diproses pada {currentOrder.waktu}</p>
            </div>
            <span className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest ${currentOrder.status === 'Menunggu' ? 'bg-blue-50 text-blue-600' : currentOrder.status === 'Diproses' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>{currentOrder.status}</span>
        </div>

        <div className="bg-[#C0392B] p-6 rounded-3xl text-white flex justify-between items-center mb-8 shadow-lg shadow-red-100">
            <div>
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">Nomor Meja</p>
                <h3 className="text-2xl font-black italic">Meja {currentOrder.meja}</h3>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">Total Bill</p>
                <h3 className="text-2xl font-black">Rp {grandTotal.toLocaleString('id-ID')}</h3>
            </div>
        </div>

        {/* Daftar Pesanan */}
        <div className="mb-8">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 ml-1">Daftar Item</h2>
          <div className="space-y-3">
            {currentOrder.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white hover:border-[#C0392B]/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#C0392B] text-white rounded-xl flex items-center justify-center font-black text-sm">
                    {item.qty}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-400 font-medium">Rp {item.harga?.toLocaleString('id-ID')} / item</p>
                  </div>
                </div>
                <p className="font-black text-gray-900">Rp {(item.qty * (item.harga || 0)).toLocaleString('id-ID')}</p>
              </div>
            )) || []}
          </div>
        </div>

        {/* Tombol */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/admin/orders")}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 py-4 px-6 rounded-2xl font-bold transition-all active:scale-95"
          >
            ← Kembali
          </button>
          <button 
            onClick={handlePrint} 
            disabled={printing} 
            className="flex-[2] bg-[#C0392B] hover:bg-[#A93226] disabled:opacity-50 text-white py-4 px-6 rounded-2xl font-bold shadow-xl shadow-red-100 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {printing ? 'Mencetak...' : '🖨️ Cetak Struk & Proses'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailPesanan;
