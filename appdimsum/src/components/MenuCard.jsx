import { useState } from 'react';

const MenuCard = ({ item, onAdd }) => {
  const [isAdded, setIsAdded] = useState(false);
  const isDisabled = item.stok === 0;

  const handleAddToCart = () => {
    if (isDisabled) return;
    setIsAdded(true);
    if (onAdd) onAdd(item);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className={`w-full bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col border border-gray-100 ${isDisabled ? 'grayscale opacity-70' : ''}`}>
      
      {/* Gambar — kotak penuh */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Overlay saat ditambahkan */}
        {isAdded && (
          <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {/* Overlay stok habis */}
        {isDisabled && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-xs bg-black/50 px-3 py-1 rounded-full">Stok Habis</span>
          </div>
        )}
      </div>

      {/* Info Menu */}
      <div className="px-3 pt-3 pb-4 flex flex-col gap-1">
        {/* Harga */}
        <p className="text-[15px] font-black text-gray-900 leading-tight">
          Rp {(item.price || item.harga || 0).toLocaleString('id-ID')}
        </p>

        {/* Nama Menu */}
        <p className="text-[12px] font-semibold text-gray-600 leading-tight line-clamp-2">
          {item.name || item.nama_menu}
        </p>

        {/* Stok */}
        <p className="text-[10px] text-gray-400 font-medium">
          Tersedia: {item.stok ?? '—'}
        </p>

        {/* Tombol Pesan */}
        <div className="mt-2 flex justify-center">
          <button
            onClick={handleAddToCart}
            disabled={isDisabled}
            className={`
              px-5 h-[30px] rounded-lg font-bold text-[11px] tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5
              ${isDisabled
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isAdded
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-[#D34848] text-white hover:bg-red-700 active:scale-95 shadow-sm hover:shadow-md'
              }
            `}
          >
            {isDisabled ? 'Habis' : isAdded ? '✓ Ditambahkan' : '+ Pesan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
