import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { ChevronLeft, RefreshCcw, Package, ChefHat, Truck, CheckCircle, XCircle, Lock } from 'lucide-react';

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
      console.error('Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const getStatusIndex = (status) => {
    // Menyesuaikan dengan status dari admin: Menunggu Konfirmasi, Terkonfirmasi, Diproses, Selesai
    const statuses = ['Menunggu Konfirmasi', 'Terkonfirmasi', 'Diproses', 'Selesai'];
    const idx = statuses.indexOf(status);
    return idx !== -1 ? idx : 0;
  };

  const steps = [
    { label: 'Pesanan Diterima', icon: <Package size={20} /> },
    { label: 'Dikonfirmasi', icon: <CheckCircle size={20} /> },
    { label: 'Sedang Dibuat', icon: <ChefHat size={20} /> },
    { label: 'Selesai', icon: <CheckCircle size={20} /> }
  ];

  const currentIdx = order ? getStatusIndex(order.status) : 0;
  const isFinished = order?.status === 'Selesai';
  const isProcessing = currentIdx >= 1 && !isFinished;

  // --- LOGIKA ESTIMASI WAKTU ---
  const calculateEstimation = () => {
    if (!order?.items) return "15-20";
    const totalQty = order.items.reduce((acc, item) => acc + item.qty, 0);
    const minTime = totalQty * 3;
    const maxTime = totalQty * 5;
    return `${minTime}-${maxTime}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
            {/* FITUR: Tombol kembali hanya muncul jika pesanan sudah Selesai */}
            {isFinished ? (
              <button onClick={() => navigate('/menu')} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <ChevronLeft size={24} />
              </button>
            ) : (
              <div className="p-2 text-gray-300 cursor-not-allowed group relative">
                <Lock size={20} />
                <span className="absolute left-0 top-10 w-40 bg-black text-white text-[8px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Selesaikan pesanan untuk kembali
                </span>
              </div>
            )}
            <h1 className="text-lg font-black text-gray-900">Status Pesanan</h1>
        </div>
        <button onClick={fetchStatus} className={`p-2 text-[#D04040] ${loading ? 'animate-spin' : ''}`}>
            <RefreshCcw size={20} />
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* ID Card */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mb-8 flex justify-between items-center">
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ID PESANAN</p>
                <h3 className="text-lg font-black text-[#D04040]">#ORD-{orderId?.toString().padStart(5, '0')}</h3>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ESTIMASI</p>
                {/* FITUR: Menampilkan estimasi dinamis */}
                <h3 className="text-lg font-black text-gray-800">
                  {isFinished ? "0" : calculateEstimation()} Menit
                </h3>
            </div>
        </div>

        {/* Tracking Steps */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D04040]/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <div className="relative z-10 space-y-8">
                {steps.map((step, idx) => {
                    const isCompleted = idx < currentIdx;
                    const isActive = idx === currentIdx;

                    return (
                        <div key={idx} className="flex gap-6 relative">
                            {idx < steps.length - 1 && (
                                <div className={`absolute left-6 top-10 w-0.5 h-10 ${isCompleted ? 'bg-green-500' : 'bg-gray-100'}`}></div>
                            )}

                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                                isCompleted ? 'bg-green-100 text-green-600' : 
                                isActive ? 'bg-[#D04040] text-white shadow-xl shadow-red-200 scale-110' : 
                                'bg-gray-50 text-gray-300'
                            }`}>
                                {isCompleted ? <CheckCircle size={24} /> : step.icon}
                            </div>

                            <div className="pt-2">
                                <h4 className={`text-sm font-black transition-colors duration-500 ${
                                    isActive ? 'text-gray-900' : isCompleted ? 'text-green-600' : 'text-gray-300'
                                }`}>
                                    {step.label}
                                </h4>
                                {isActive && !isFinished && (
                                    <p className="text-[10px] font-bold text-[#D04040] mt-1 animate-pulse uppercase tracking-widest">
                                        SEDANG DIPROSES
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
            {isFinished ? (
                <button 
                    onClick={() => navigate('/menu')}
                    className="w-full bg-[#D04040] text-white py-5 rounded-[28px] font-black shadow-xl shadow-red-100 active:scale-95 transition-all"
                >
                    PESAN LAGI?
                </button>
            ) : (
                <div className="text-center p-4 bg-gray-100 rounded-2xl border border-dashed border-gray-300">
                   <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                     Mohon tunggu, tim kami sedang menyiapkan pesanan Anda
                   </p>
                </div>
            )}
            
            <p className="text-center text-[10px] text-gray-400 font-medium px-10">
                {isProcessing 
                    ? 'Pesanan tidak dapat dibatalkan karena sedang diproses.' 
                    : isFinished ? 'Terima kasih telah memesan di Bos Mentai!' : 'Menunggu konfirmasi admin untuk mulai memasak.'}
            </p>
        </div>

        {/* Order Items Summary */}
        <div className="mt-12">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest ml-1 mb-4">Item yang Dipesan</h2>
            <div className="bg-white rounded-[32px] border border-gray-100 p-4 space-y-4">
                {order?.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center px-2">
                        <div className="flex gap-3 items-center">
                            <span className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-400">
                                {item.qty}x
                            </span>
                            <span className="text-xs font-bold text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-xs font-black text-gray-400">Rp {(item.qty * item.harga_satuan).toLocaleString('id-ID')}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;