import { useState } from 'react';

const MenuCard = ({ item }) => {
  const [isAdded, setIsAdded] = useState(false);
  const isDisabled = item.stok === 0;

  const handleAddToCart = () => {
    if (isDisabled) return;
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Gambar Menu */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badge Kategori */}
        <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
          {item.category}
        </span>
        {/* Overlay saat ditambahkan */}
        {isAdded && (
          <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
            <span className="text-white font-bold text-lg">✓ Ditambahkan!</span>
          </div>
        )}
        {/* Overlay stok habis */}
        {isDisabled && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Stok Habis</span>
          </div>
        )}
      </div>
      
      {/* Info Menu */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-base mb-3 line-clamp-2 min-h-[3rem]">
          {item.name}
        </h3>

        {/* Tombol Pesan */}
        <button
          onClick={handleAddToCart}
          disabled={isDisabled}
          className={`
            w-full font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2
            ${isDisabled 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : isAdded 
                ? 'bg-green-500 text-white' 
                : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-md hover:shadow-lg'
            }
          `}
        >
          {isDisabled ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Stok Habis
            </>
          ) : isAdded ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Ditambahkan
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              + Pesan
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MenuCard;

