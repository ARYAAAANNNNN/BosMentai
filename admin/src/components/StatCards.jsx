import React from 'react';
import { Users, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react'; // Asumsi icons dari lucide-react atau ganti sesuai project

const StatCards = () => {
  return (
    <div className="flex gap-8 mb-12"> {/* Container with gap-8 for lega spacing */}
      {/* Kartu 1: Merah - e.g. Total Pesanan */}
      <div className="flex-1 min-w-0 p-6 bg-red-50 border border-red-100 rounded-2xl shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md">
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
          <ShoppingBag className="w-6 h-6 text-red-600" />
        </div>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-4xl font-bold text-gray-900">156</span>
        </div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Pesanan</p>
      </div>

      {/* Kartu 2: e.g. Pelanggan */}
      <div className="flex-1 min-w-0 p-6 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md">
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-4xl font-bold text-gray-900">89</span>
        </div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pelanggan</p>
      </div>

      {/* Kartu 3: Hijau - Pendapatan with fixes */}
      <div className="flex-1 min-w-0 p-6 bg-green-50 border border-green-100 rounded-2xl shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md relative">
        <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
          <DollarSign className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-3xl font-bold text-gray-900 tracking-tighter">Rp 2.350.000</span>
        </div>
        <hr className="w-full border-t border-green-200 my-4" /> {/* Divider full width */}
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pendapatan</p>
      </div>

      {/* Kartu 4: e.g. Trending */}
      <div className="flex-1 min-w-0 p-6 bg-purple-50 border border-purple-100 rounded-2xl shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md">
        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
          <TrendingUp className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-4xl font-bold text-gray-900">+12%</span>
        </div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pertumbuhan</p>
      </div>
    </div>
  );
};

export default StatCards;

