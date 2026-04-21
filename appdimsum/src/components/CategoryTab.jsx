import { categories } from '../data/menuData';

const CategoryTab = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="bg-white shadow-md sticky top-[68px] z-40">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex overflow-x-auto scrollbar-hide py-3 gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm
                ${activeCategory === category 
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md transform scale-105' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryTab;
