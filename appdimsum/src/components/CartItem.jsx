import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { incrementQuantity, decrementQuantity } = useCart();

  return (
    <div className="flex items-center gap-4 group">
      {/* Gambar Item */}
      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Info Item */}
      <div className="flex-1 min-w-0">
        <h4 className="font-extrabold text-gray-900 text-sm truncate mb-0.5">
          {item.name}
        </h4>
        <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-gray-100 text-[10px] text-gray-500 font-bold rounded-md uppercase tracking-wider">{item.category || 'Dimsum'}</span>
        </div>
      </div>

      {/* Tombol quantity */}
      <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-1.5 border border-gray-100">
        <button
          onClick={() => decrementQuantity(item.id)}
          className="w-8 h-8 rounded-xl bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center justify-center transition-all shadow-sm active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
          </svg>
        </button>

        <span className="w-6 text-center font-black text-gray-900 text-sm">
          {item.quantity}
        </span>

        <button
          onClick={() => incrementQuantity(item.id)}
          className="w-8 h-8 rounded-xl bg-[#D04040] hover:bg-[#b83838] text-white flex items-center justify-center transition-all shadow-md shadow-red-100 active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
