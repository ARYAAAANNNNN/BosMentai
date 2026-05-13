import { useState } from 'react';

const MenuCard = ({ item, onAdd }) => {
  const [isAdded, setIsAdded] = useState(false);

  // 1. Validasi Stok (Konversi paksa ke Number)
  const stokMurni = Number(item.stok || 0);
  const isHabis = stokMurni <= 0;

  const handleAddToCart = (e) => {
    // PROTEKSI UTAMA: Hentikan penyebaran event klik ke parent/pembungkus
    if (e && e.stopPropagation) e.stopPropagation();
    
    // Jika habis, jangan lakukan apa-apa
    if (isHabis) return;

    setIsAdded(true);
    if (onAdd) onAdd(item);
    
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div 
      onClick={(e) => isHabis && e.stopPropagation()} // Kunci klik pada seluruh kartu jika habis
      className={`w-full bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-gray-100 transition-all duration-300 
      ${isHabis ? 'opacity-60 grayscale pointer-events-none' : 'hover:shadow-md cursor-pointer'}`}
    >
      
      {/* Gambar */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
        <img
          src={item.image}
          alt={item.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${!isHabis && 'hover:scale-105'}`}
          loading="lazy"
        />
        
        {isHabis && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-30">
            <span className="bg-white/90 text-black font-black text-[10px] px-3 py-1.5 rounded-full uppercase">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Konten */}
      <div className="px-3 pt-3 pb-4 flex flex-col gap-1">
        <p className="text-[15px] font-black text-gray-900 leading-tight">
          Rp {(item.price || item.harga || 0).toLocaleString('id-ID')}
        </p>

        <p className="text-[12px] font-semibold text-gray-600 leading-tight line-clamp-2 min-h-[32px]">
          {item.name || item.nama_menu}
        </p>

        <p className={`text-[10px] font-bold ${isHabis ? 'text-red-500' : 'text-gray-400'}`}>
          Tersedia : {stokMurni}
        </p>

        <div className="mt-2">
          {/* TOMBOL DINAMIS */}
          {isHabis ? (
            /* Jika Habis: Render DIV Abu-abu (Bukan Button) tanpa fungsi klik */
            <div className="w-full h-[42px] rounded-xl font-bold text-[13px] bg-gray-300 text-gray-500 flex items-center justify-center cursor-not-allowed border border-gray-200 shadow-none">
              Habis
            </div>
          ) : (
            /* Jika Ada Stok: Render Button Aktif */
            <button
              type="button"
              onClick={handleAddToCart}
              className={`
                w-full h-[42px] rounded-xl font-bold text-[13px] transition-all duration-200 flex items-center justify-center
                ${isAdded 
                  ? 'bg-green-600 text-white' 
                  : 'bg-[#D34848] text-white active:scale-95 hover:bg-red-700'
                }
              `}
            >
              {isAdded ? '✓ Berhasil' : '+ Pesan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;