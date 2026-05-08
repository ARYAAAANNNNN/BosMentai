import { useState, useEffect } from 'react';
import { X, Clock, QrCode } from 'lucide-react';

const PaymentView = ({ paymentData, onPaid, onClose }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [checking, setChecking] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!paymentData?.expired_at) return;

    const updateTimer = () => {
      const now = Date.now();
      const expiry = new Date(paymentData.expired_at).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('00:00');
        setIsExpired(true);
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [paymentData?.expired_at]);

  const handleConfirmPaid = async () => {
    setChecking(true);
    await onPaid();
    setTimeout(() => setChecking(false), 2000);
  };

  if (!paymentData) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <h2 className="font-black text-gray-900 text-lg">Lanjutkan Pembayaran</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200">
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          <p className="text-xs text-gray-400 font-medium px-5 mb-4">
            Silahkan scan QR di bawah ini untuk melakukan pembayaran
          </p>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock size={14} className={isExpired ? 'text-red-500' : 'text-blue-500'} />
            <span className={`font-mono font-black text-lg ${isExpired ? 'text-red-500' : 'text-gray-800'}`}>
              {isExpired ? 'EXPIRED' : timeLeft}
            </span>
          </div>

          {/* QR Code */}
          <div className="flex justify-center px-5 mb-4">
            <div className="w-52 h-52 bg-gray-50 rounded-2xl border-2 border-gray-100 flex items-center justify-center overflow-hidden p-2">
              {paymentData.qr_url ? (
                <img
                  src={paymentData.qr_url}
                  alt="QRIS Payment"
                  className="w-full h-full object-contain"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300">
                  <QrCode size={64} />
                  <span className="text-xs font-bold">QR Code</span>
                </div>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="text-center mb-4">
            <p className="text-xs text-gray-400 font-medium">Total Pembayaran</p>
            <p className="text-xl font-black text-gray-900">
              Rp {(paymentData.gross_amount || 0).toLocaleString('id-ID')}
            </p>
          </div>

          {/* Payment method icons */}
          <div className="flex items-center justify-center gap-4 mb-5 px-5">
            {['GOPAY', 'OVO', 'DANA'].map(name => (
              <div key={name} className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] font-black text-gray-500 tracking-wider">{name}</span>
              </div>
            ))}
          </div>

          {/* Confirm Button */}
          <div className="px-5 pb-5">
            <button
              onClick={handleConfirmPaid}
              disabled={isExpired || checking}
              className="w-full h-12 bg-[#D04040] hover:bg-[#B03030] active:bg-[#902020] text-white font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengecek Pembayaran...
                </>
              ) : isExpired ? (
                'QR Sudah Expired'
              ) : (
                'Saya Sudah Bayar'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentView;
