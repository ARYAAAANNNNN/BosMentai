import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { incrementQuantity, decrementQuantity } = useCart();

  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition-shadow">
      {/* Gambar Item */}
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info Item */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-800 text-sm truncate">
          {item.name}
        </h4>
        <span className="text-xs text-gray-500 font-medium">{item.category}</span>
      </div>

      {/* Tombol quantity */}
      <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1">
        <button
          onClick={() => decrementQuantity(item.id)}
          className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <span className="w-8 text-center font-bold text-gray-800">
          {item.quantity}
        </span>

        <button
          onClick={() => incrementQuantity(item.id)}
          className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
