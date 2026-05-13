import { useState } from 'react';
import { useCart } from '../context/CartContext';

const MenuCard = ({ item, onAdd }) => {
  const [isAdded, setIsAdded] = useState(false);
  const { getStockStatus } = useCart();

  // 1. Ambil Nama (Cek semua kemungkinan nama kolom)
  const namaMenu = item.nama_menu || item.name || item.nama || "Menu";

  // 2. Ambil Stok (Pastikan angka, bukan undefined)
  const stokMurni = Number(item.stok ?? item.stock ?? 0);
  const isHabis = stokMurni <= 0;

  // 3. FIX GAMBAR (Ini alasan kenapa gambar lu ilang tadi)
  // Kita cek image, gambar, foto, atau photo.
  const fotoMenu = item.image || item.gambar || item.foto || item.photo || '/placeholder.png';

  // 4. Harga (Cek price atau harga)
  const hargaMenu = Number(item.price || item.harga || 0);

  // Ambil label warna stok (>20 hijau, 5-20 oranye, <5 merah)
  const statusStok = getStockStatus ? getStockStatus(stokMurni) : {
    label: stokMurni > 20 ? "Tersedia" : stokMurni >= 5 ? "Menipis" : "Hampir Habis",
    color: stokMurni > 20 ? "#16a34a" : stokMurni >= 5 ? "#d97706" : "#ef4444"
  };

  const handleAddToCart = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isHabis) return;

    setIsAdded(true);
    if (onAdd) onAdd(item);
    
    // Efek tombol berhasil
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div 
      onClick={!isHabis ? handleAddToCart : undefined}
      className={`w-full bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-gray-100 transition-all duration-300 
      ${isHabis ? 'opacity-75 grayscale' : 'hover:shadow-md cursor-pointer'}`}
    >
      
      {/* Container Gambar */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
        <img
          src={fotoMenu}
          alt={namaMenu}
          className={`w-full h-full object-cover transition-transform duration-700 ${!isHabis && 'hover:scale-110'}`}
          onError={(e) => { 
            // Kalau link gambar rusak, pake placeholder biar gak ilang box-nya
            e.target.src = 'https://via.placeholder.com/300?text=Gambar+Menu'; 
          }}
          loading="lazy"
        />
        
        {isHabis && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-30">
            <span className="bg-white text-black font-black text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Konten Text */}
      <div className="px-4 pt-3 pb-5 flex flex-col gap-1">
        {/* Harga */}
        <p className="text-[16px] font-black text-gray-900">
          Rp {hargaMenu.toLocaleString('id-ID')}
        </p>

        {/* Nama Menu */}
        <p className="text-[13px] font-semibold text-gray-600 leading-tight line-clamp-2 min-h-[34px]">
          {namaMenu}
        </p>

        {/* Status Stok */}
        <p 
          className="text-[10px] font-bold mt-1" 
          style={{ color: isHabis ? '#ef4444' : statusStok.color }}
        >
          {isHabis ? "Stok Habis" : `${statusStok.label} : ${stokMurni}`}
        </p>

        <div className="mt-3">
          {isHabis ? (
            <div className="w-full h-[42px] rounded-xl font-bold text-[13px] bg-gray-100 text-gray-400 flex items-center justify-center cursor-not-allowed border border-gray-200">
              Habis
            </div>
          ) : (
            <button
              type="button"
              className={`w-full h-[42px] rounded-xl font-bold text-[13px] transition-all flex items-center justify-center text-white shadow-sm
                ${isAdded ? 'bg-green-600' : 'bg-[#D34848] active:scale-95 hover:bg-red-700'}`}
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