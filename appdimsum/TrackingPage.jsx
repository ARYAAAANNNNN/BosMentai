import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { ChevronLeft, RefreshCcw, Package, ChefHat, Truck, CheckCircle, XCircle } from 'lucide-react';

const TrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const response = await orderAPI.getById(orderId);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (err) {
      console.error('Gagal mengambil status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  // LOGIKA ESTIMASI WAKTU DINAMIS
  const getEstimation = (status) => {
    const s = status?.toLowerCase();
    if (s === 'menunggu konfirmasi') return "Menunggu Antrean";
    if (s === 'terkonfirmasi') return "± 15 Menit";
    if (s === 'diproses' || s === 'cooking') return "± 7 Menit";
    if (s === 'ready' || s === 'siap') return "Siap Disajikan!";
    if (s === 'selesai') return "Pesanan Selesai";
    return "Menghitung...";
  };

  const getStatusIndex = (status) => {
    const s = status?.toLowerCase();
    if (s === 'menunggu konfirmasi') return 0;
    if (s === 'terkonfirmasi' || s === 'diproses' || s === 'cooking') return 1;
    if (s === 'ready' || s === 'siap') return 2;
    if (s === 'selesai') return 3;
    return 0;
  };

  const steps = [
    { label: 'Pesanan Diterima', icon: <Package size={20} /> },
    { label: 'Sedang Dibuat', icon: <ChefHat size={20} /> },
    { label: 'Siap Disajikan', icon: <Truck size={20} /> },
    { label: 'Selesai', icon: <CheckCircle size={20} /> }
  ];

  const currentIdx = order ? getStatusIndex(order.status) : 0;
  const isProcessing = currentIdx >= 1 && currentIdx < 3;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b p-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/menu')} className="p-2 text-gray-400 hover:text-gray-900">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-black text-gray-900">Lacak Pesanan</h1>
        </div>
        <button onClick={fetchStatus} className={`p-2 text-[#D04040] ${loading ? 'animate-spin' : ''}`}>
          <RefreshCcw size={20} />
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* Estimasi Card */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mb-8 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ID PESANAN</p>
            <h3 className="text-lg font-black text-[#D04040]">#ORD-{orderId?.toString().slice(-5)}</h3>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-blue-500">ESTIMASI TUNGGU</p>
            <h3 className="text-xl font-black text-gray-800">
              {order ? getEstimation(order.status) : "..."}
            </h3>
          </div>
        </div>

        {/* Status Visual */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIdx;
            const isActive = idx === currentIdx;
            return (
              <div key={idx} className="flex gap-6 relative">
                {idx < steps.length - 1 && (
                  <div className={`absolute left-6 top-10 w-0.5 h-10 ${isCompleted ? 'bg-green-500' : 'bg-gray-100'}`}></div>
                )}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                  isCompleted ? 'bg-green-100 text-green-600' : 
                  isActive ? 'bg-[#D04040] text-white shadow-lg' : 'bg-gray-50 text-gray-300'
                }`}>
                  {isCompleted ? <CheckCircle size={24} /> : step.icon}
                </div>
                <div className="pt-2">
                  <h4 className={`text-sm font-black ${isActive ? 'text-gray-900' : isCompleted ? 'text-green-600' : 'text-gray-300'}`}>
                    {step.label}
                  </h4>
                  {isActive && <p className="text-[10px] font-bold text-[#D04040] mt-1 animate-pulse uppercase">DIPROSES DAPUR</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Item Summary */}
        <div className="mt-8">
           <h2 className="text-sm font-black text-gray-900 uppercase mb-4">Ringkasan Item</h2>
           <div className="bg-white rounded-[32px] border p-4 space-y-3">
              {order?.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-700">{item.qty}x {item.name}</span>
                  <span className="text-gray-400 font-black">Rp {(item.qty * item.harga_satuan).toLocaleString('id-ID')}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;