import { CheckCircle2, XCircle, Clock, ChefHat } from 'lucide-react';

const StatusView = ({ status, orderId, onClose }) => {
  // status: 'success' | 'failed' | 'processing'
  const isSuccess = status === 'success';
  const isFailed = status === 'failed';

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 animate-in fade-in duration-300" />

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-in zoom-in duration-300">
        <div className="bg-white rounded-[32px] p-8 max-w-[320px] w-full text-center shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)]">
          {/* Icon */}
          <div className="relative w-20 h-20 mx-auto mb-5">
            {isSuccess && (
              <>
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20" />
                <div className="relative w-20 h-20 bg-green-500 rounded-full flex items-center justify-center border-[6px] border-green-50 shadow-lg">
                  <CheckCircle2 size={40} className="text-white" />
                </div>
              </>
            )}
            {isFailed && (
              <div className="relative w-20 h-20 bg-red-500 rounded-full flex items-center justify-center border-[6px] border-red-50 shadow-lg">
                <XCircle size={40} className="text-white" />
              </div>
            )}
            {!isSuccess && !isFailed && (
              <>
                <div className="absolute inset-0 bg-amber-100 rounded-full animate-ping opacity-20" />
                <div className="relative w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center border-[6px] border-amber-50 shadow-lg">
                  <ChefHat size={40} className="text-white" />
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="font-black text-gray-900 text-xl mb-1.5 tracking-tight">
            {isSuccess ? 'Pesanan Berhasil!' : isFailed ? 'Pesanan Gagal' : 'Sedang Diproses'}
          </h3>

          {/* Subtitle - Error fixed here */}
          <p className="text-sm text-gray-500 font-medium leading-relaxed px-2 mb-2">
            {isSuccess
              ? 'Pesanan Anda sedang diteruskan ke dapur. Mohon ditunggu ya! 🥟'
              : isFailed
              ? 'Pesanan tidak berhasil dikirim. Silakan coba lagi.'
              : 'Menunggu konfirmasi pesanan...'}
          </p>

          {/* Order ID */}
          {orderId && (
            <div className="bg-gray-50 rounded-xl px-3 py-2 mb-4 inline-block">
              <span className="text-[10px] text-gray-400 font-bold">ORDER ID</span>
              <p className="text-xs font-mono font-bold text-gray-600">{orderId}</p>
            </div>
          )}

          {/* Timeline (success only) */}
          {isSuccess && (
            <div className="text-left mt-4 mb-4 px-4">
              <div className="space-y-0">
                {[
                  { label: 'Pesanan dibuat', done: true },
                  { label: 'Pesanan dikonfirmasi', done: true },
                  { label: 'Pesanan sedang diproses', done: false, active: true },
                  { label: 'Pesanan siap', done: false },
                ].map((step, i, arr) => (
                  <div key={i} className="flex gap-3">
                    {/* Container khusus bulatan & garis biar auto center */}
                    <div className="flex flex-col items-center">
                      <div className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        step.done ? 'bg-green-500' : step.active ? 'bg-amber-400 animate-pulse' : 'bg-gray-200'
                      }`}>
                        {step.done && <CheckCircle2 size={12} className="text-white" />}
                        {step.active && <Clock size={10} className="text-white" />}
                      </div>
                      {/* Garis alur dibikin flex-1 biar nyambung sempurna ke bawah */}
                      {i < arr.length - 1 && (
                        <div className={`w-0.5 flex-1 my-1 rounded-full ${step.done ? 'bg-green-300' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    {/* Teks dikasih padding bawah (pb-5) sebagai jarak antar baris */}
                    <div className="pb-5 pt-0.5">
                      <span className={`text-xs font-bold ${
                        step.done ? 'text-green-600' : step.active ? 'text-amber-600' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-all mt-2"
          >
            {isSuccess ? 'Kembali ke Menu' : isFailed ? 'Coba Lagi' : 'Tutup'}
          </button>

          {/* Loading dots */}
          {!isSuccess && !isFailed && (
            <div className="mt-4 flex justify-center">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StatusView;