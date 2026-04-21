import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Utensils } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-50"></div>

      <div className="text-center z-10 px-4 max-w-3xl">
        {/* Ikon/Logo Kecil */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#B34949] p-4 rounded-3xl shadow-xl shadow-red-200 rotate-12">
            <Utensils className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Headline Utama */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Bos <span className="text-[#B34949]">Mentai</span> Admin
        </h1>
        
        {/* Sub-headline */}
        <p className="text-lg md:text-xl text-gray-500 mb-12 leading-relaxed font-medium">
          Sistem manajemen restoran nomor satu untuk kendali penuh atas <br className="hidden md:block" /> 
          Pesanan, Menu, dan Analitik dalam satu genggaman.
        </p>

        {/* Tombol Aksi */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="group bg-[#B34949] text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-[#8B2323] transition-all shadow-xl shadow-red-200 flex items-center gap-3 active:scale-95"
          >
            Mulai Sekarang
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            className="border-2 border-gray-200 text-gray-600 px-10 py-5 rounded-full text-lg font-bold hover:bg-gray-50 transition-all active:scale-95"
          >
            Pelajari Fitur
          </button>
        </div>

        {/* Statistik Singkat (Opsional) */}
        <div className="mt-20 grid grid-cols-3 gap-8 border-t border-gray-100 pt-10">
          <div>
            <p className="text-2xl font-bold text-gray-900">100%</p>
            <p className="text-xs text-gray-400 font-bold uppercase">Realtime</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">24/7</p>
            <p className="text-xs text-gray-400 font-bold uppercase">Support</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">Secure</p>
            <p className="text-xs text-gray-400 font-bold uppercase">Database</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;