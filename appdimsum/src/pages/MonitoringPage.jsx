import React from 'react';
import { Clock, CheckCircle2, ChefHat, Bike, Receipt, ChevronRight, MessageCircle } from 'lucide-react';

/**
 * MonitoringPage
 * @param {Object} props
 * @param {String} props.orderId - ID Pesanan (misal: #ORD-12345)
 * @param {String} props.status - Status saat ini ('pending', 'cooking', 'delivery', 'done')
 * @param {Number} props.estimatedTime - Estimasi waktu (menit)
 */
const MonitoringPage = ({ 
  orderId = "#ORD-00000", 
  status = "cooking", 
  estimatedTime = 15 
}) => {
  
  const steps = [
    { 
      id: 'pending', 
      label: 'Pesanan Diterima', 
      desc: 'Pesanan sudah masuk ke sistem kami.', 
      icon: Receipt,
      isDone: ['pending', 'cooking', 'delivery', 'done'].includes(status)
    },
    { 
      id: 'cooking', 
      label: 'Sedang Dibuat', 
      desc: 'Dapur sedang menyiapkan dimsum lezatmu.', 
      icon: ChefHat,
      isDone: ['cooking', 'delivery', 'done'].includes(status)
    },
    { 
      id: 'delivery', 
      label: 'Pesanan Diantar', 
      desc: 'Pelayan sedang menuju ke mejamu.', 
      icon: Bike,
      isDone: ['delivery', 'done'].includes(status)
    },
    { 
      id: 'done', 
      label: 'Selesai', 
      desc: 'Selamat menikmati Bos Mentai!', 
      icon: CheckCircle2,
      isDone: status === 'done'
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      <main className="flex-1 max-w-md mx-auto w-full px-6 py-8">
        {/* Header Status */}
        <div className="text-center mb-10">
          <div className="bg-[#7A1B1B]/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-[#7A1B1B]/10 rounded-full animate-ping duration-[2000ms]"></div>
            <Clock size={32} className="text-[#7A1B1B] relative z-10" />
          </div>
          <h1 className="text-2xl font-black text-gray-800">Status Pesanan</h1>
          <p className="text-sm text-gray-400 mt-1">ID: <span className="font-bold text-gray-600">{orderId}</span></p>
        </div>

        {/* Estimation Card */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-sm text-amber-500">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Estimasi Tunggu</p>
              <p className="text-sm font-black text-gray-800">{estimatedTime} Menit</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </div>

        {/* Progress Tracker (Vertical) */}
        <div className="relative pl-2">
          {steps.map((step, index) => {
            const isActive = step.id === status;
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.id} className="relative flex gap-6 pb-10 group">
                {/* Vertical Line */}
                {!isLast && (
                  <div className={`absolute left-5 top-10 w-0.5 h-[calc(100%-10px)] ${
                    step.isDone && steps[index+1].isDone ? 'bg-[#7A1B1B]' : 'bg-gray-100'
                  }`} />
                )}

                {/* Icon Circle */}
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
                  step.isDone 
                    ? 'bg-[#7A1B1B] border-[#7A1B1B]/20 text-white shadow-lg shadow-[#7A1B1B]/30' 
                    : 'bg-white border-gray-50 text-gray-300'
                }`}>
                  <step.icon size={18} strokeWidth={isActive ? 3 : 2} className={isActive ? 'animate-pulse' : ''} />
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <h4 className={`text-sm font-bold transition-colors ${
                    step.isDone ? 'text-gray-800' : 'text-gray-300'
                  }`}>
                    {step.label}
                  </h4>
                  <p className={`text-xs mt-0.5 transition-colors leading-relaxed ${
                    step.isDone ? 'text-gray-500' : 'text-gray-300'
                  }`}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer Support */}
      <footer className="p-6">
        <button className="w-full py-4 border-2 border-gray-100 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
          <MessageCircle size={20} className="text-[#7A1B1B]" />
          Butuh bantuan? Hubungi Kasir
        </button>
      </footer>
    </div>
  );
};

export default MonitoringPage;
