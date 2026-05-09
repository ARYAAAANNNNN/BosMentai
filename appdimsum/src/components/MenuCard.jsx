import { useState } from 'react';

const MenuCard = ({ item }) => {
  const [isAdded, setIsAdded] = useState(false);
  const isDisabled = item.stok === 0;

  const handleAddToCart = () => {
    if (isDisabled) return;
    setIsAdded(true);
    // Logika add to cart sebenarnya biasanya dilempar ke parent via props onAdd
    // tapi di sini kita simulasikan feedback-nya
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className={`w-full max-w-[200px] h-full sm:h-[300px] mx-auto bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col border border-gray-50 ${isDisabled ? 'grayscale' : ''}`}>
      {/* Gambar Menu */}
      <div className="relative aspect-square sm:aspect-auto sm:h-[160px] w-full shrink-0 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        {/* Badge Kategori */}
        <span className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
          {item.category}
        </span>
        {/* Overlay saat ditambahkan */}
        {isAdded && (
          <div className="absolute inset-0 bg-green-500/80 backdrop-blur-[3px] flex items-center justify-center animate-in zoom-in duration-300">
            <div className="bg-white p-3 rounded-full shadow-2xl scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
        {/* Overlay stok habis */}
        {isDisabled && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white font-black text-[10px] uppercase tracking-widest bg-black/60 px-4 py-1.5 rounded-full border border-white/20 shadow-xl">Stok Habis</span>
          </div>
        )}
      </div>
      
      {/* Info Menu */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Bos Mentai</p>
          <h3 className="font-black text-gray-900 text-[13px] sm:text-[14px] leading-tight line-clamp-2">
            {item.name}
          </h3>
        </div>

        {/* Harga & Tombol Pesan */}
        <div className="mt-auto pt-2">
          <div className="mb-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Mulai Dari</p>
            <p className="text-lg font-black text-[#D34848]">
              Rp {(item.price || item.harga || 0).toLocaleString('id-ID')}
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isDisabled}
            className={`
              w-full h-[38px] sm:h-[42px] rounded-xl font-black text-[11px] sm:text-[12px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2
              ${isDisabled 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : isAdded 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-200 scale-95' 
                  : 'bg-[#D34848] text-white hover:bg-red-700 hover:shadow-xl shadow-red-100 active:scale-95'
              }
            `}
          >
          {isDisabled ? (
            'Sold Out'
          ) : isAdded ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Berhasil
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
              Pesan
            </>
          )}
        </button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;

