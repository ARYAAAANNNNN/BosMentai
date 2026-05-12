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
      if (order) setSelectedOrder(order);
    }
  }, [orderId, orders, currentOrder, setSelectedOrder]);

  const tax = (currentOrder?.totalHarga || 0) * 0.1;
  const grandTotal = (currentOrder?.totalHarga || 0) + tax;

  // Fungsi untuk mencetak ke printer thermal
  const handlePrint = () => {
    setPrinting(true);
    const printWindow = window.open('', 'PRINT', 'height=600,width=400');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Struk</title>
          <style>
            @page { size: 58mm auto; margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 48mm; 
              margin: 0 auto; 
              padding: 2mm 0; 
              font-size: 11px; 
              line-height: 1.1; 
              color: #000; 
            }
            .text-center { text-align: center; }
            .flex-between { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
            .divider { margin: 4px 0; border-top: 1px dashed #000; }
            .item-name { font-weight: bold; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <div class="bold" style="font-size: 13px;">BOS MENTAI</div>
            <div>Jl. Raya Mentai No. 123</div>
            <div>0812-3456-7890</div>
          </div>

          <div class="divider"></div>

          <div class="flex-between">
            <span>NO: #ORD-${currentOrder.id}</span>
            <span>MEJA: ${currentOrder.meja}</span>
          </div>
          <div>WAKTU: ${currentOrder.waktu?.split(' ')[1] || ''}</div>

          <div class="divider"></div>
          <div class="text-center bold">DETAIL PESANAN</div>
          <div class="divider"></div>

          ${currentOrder.items?.map(item => `
            <div style="margin-bottom: 4px;">
              <div class="item-name">${item.name.toUpperCase()}</div>
              <div class="flex-between">
                <span>${item.qty} x ${item.harga?.toLocaleString('id-ID')}</span>
                <span>${(item.qty * (item.harga || 0)).toLocaleString('id-ID')}</span>
              </div>
            </div>
          `).join('')}

          <div class="divider"></div>

          <div class="flex-between">
            <span>Subtotal</span>
            <span>${(currentOrder.totalHarga || 0).toLocaleString('id-ID')}</span>
          </div>
          <div class="flex-between">
            <span>Pajak (10%)</span>
            <span>${tax.toLocaleString('id-ID')}</span>
          </div>
          <div class="flex-between bold">
            <span>TOTAL</span>
            <span>Rp ${grandTotal.toLocaleString('id-ID')}</span>
          </div>

          <div class="divider"></div>

          <div class="text-center" style="margin-top: 5px;">
            <div class="bold">TERIMA KASIH!</div>
            <div>Selamat Menikmati</div>
          </div>
          
          <script>
            setTimeout(function() {
              window.focus();
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();

    setTimeout(() => {
      if (orderId) updateOrderStatus(orderId, 'Diproses');
      setPrinting(false);
      navigate('/admin/orders');
    }, 1000);
  };

  if (!currentOrder) {
    return <div className="min-h-screen flex items-center justify-center font-bold">Memuat Data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      
      {/* UI CARD UTAMA */}
      <div className="bg-white w-full max-w-xl rounded-3xl p-8 shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Order #ORD-{currentOrder.id}</h1>
            <p className="text-sm text-gray-500">{currentOrder.waktu}</p>
          </div>
          <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold">
            {currentOrder.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Meja</p>
                <p className="text-xl font-black text-[#C0392B]">{currentOrder.meja}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Total Bayar</p>
                <p className="text-xl font-black text-gray-800">Rp {grandTotal.toLocaleString('id-ID')}</p>
            </div>
        </div>

        <div className="space-y-3 mb-8">
          {currentOrder.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-3">
              <div className="flex gap-3">
                <span className="font-bold text-[#C0392B]">{item.qty}x</span>
                <span className="font-medium text-gray-700">{item.name}</span>
              </div>
              <span className="font-bold">{(item.qty * (item.harga || 0)).toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate("/admin/orders")} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
            Kembali
          </button>
          <button onClick={handlePrint} disabled={printing} className="flex-[2] bg-[#C0392B] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-[#A93226] transition-all disabled:opacity-50">
            {printing ? 'Proses...' : 'Cetak Struk & Selesai'}
          </button>
        </div>
      </div>

      {/* PRATINJAU STRUK REALISTIS */}
      <div className="flex flex-col items-center">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Live Preview Struk</h3>
        <div className="bg-gray-800 p-8 rounded-[40px] shadow-2xl">
          <div className="bg-white w-[58mm] p-4 shadow-inner text-black font-mono text-[10px] leading-tight relative">
            {/* Efek Potongan Kertas Atas */}
            <div className="absolute top-0 left-0 w-full h-1 bg-repeat-x" style={{backgroundImage: 'linear-gradient(45deg, transparent 33.333%, #gray-800 33.333%, #gray-800 66.666%, transparent 66.666%), linear-gradient(-45deg, transparent 33.333%, #gray-800 33.333%, #gray-800 66.666%, transparent 66.666%)', backgroundSize: '4px 8px'}}></div>
            
            <div className="text-center">
              <div className="font-bold text-[12px]">BOS MENTAI</div>
              <div>Jl. Raya Mentai No. 123</div>
              <div>0812-3456-7890</div>
            </div>

            <div className="border-t border-dashed border-black my-2"></div>

            <div className="flex justify-between">
              <span>NO: #ORD-{currentOrder.id}</span>
              <span>MEJA: {currentOrder.meja}</span>
            </div>
            <div>WAKTU: {currentOrder.waktu?.split(' ')[1]}</div>

            <div className="border-t border-dashed border-black my-2"></div>
            <div className="text-center font-bold">DETAIL PESANAN</div>
            <div className="border-t border-dashed border-black my-2"></div>

            {currentOrder.items?.map((item, i) => (
              <div key={i} className="mb-2">
                <div className="font-bold">{item.name.toUpperCase()}</div>
                <div className="flex justify-between">
                  <span>{item.qty} x {item.harga?.toLocaleString('id-ID')}</span>
                  <span>{(item.qty * (item.harga || 0)).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}

            <div className="border-t border-dashed border-black my-2"></div>

            <div className="flex justify-between"><span>Subtotal</span><span>{(currentOrder.totalHarga || 0).toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between"><span>Pajak (10%)</span><span>{tax.toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between font-bold"><span>TOTAL</span><span>Rp {grandTotal.toLocaleString('id-ID')}</span></div>

            <div className="border-t border-dashed border-black my-2"></div>

            <div className="text-center mt-2">
              <div className="font-bold">TERIMA KASIH!</div>
              <div>Selamat Menikmati</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPesanan;