import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [step, setStep] = useState('idle'); // idle, loading, success
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setStep('loading');

    // Simulasi proses pendaftaran sesuai alur gambar
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        navigate('/login'); // Setelah daftar, arahkan ke Login
      }, 1500);
    }, 2000);
  };

  // --- TAMPILAN 2: MEMUAT (Animasi Loading) ---
  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <h1 className="text-4xl font-bold text-gray-900 animate-pulse tracking-tighter">
          Membuat Akun ...
        </h1>
      </div>
    );
  }

  // --- TAMPILAN 3: SELESAI (Berhasil) ---
  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white transition-all duration-500">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg mb-6 animate-bounce">
          <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Pendaftaran Berhasil!</h2>
        <p className="text-gray-500 mt-2 font-medium">Silakan login dengan akun baru Anda.</p>
      </div>
    );
  }

  // --- TAMPILAN 1: FORM DAFTAR ---
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col items-center pb-12 relative">
        
        {/* Header Merah Melengkung (Identik dengan Login) */}
        <div className="w-[130%] h-44 bg-gradient-to-r from-[#8B2323] to-[#FF5F5F] rounded-b-[100%] -translate-y-12 mb-4 shadow-md"></div>

        <div className="w-full max-w-md px-10 text-center z-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Akun</h1>
          <p className="text-gray-500 text-sm mb-8 font-medium italic">
            Lengkapi data untuk jadi bagian Bos Mentai
          </p>

          <form onSubmit={handleRegister} className="space-y-4 text-left">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Nama Lengkap :</label>
              <input 
                type="text" 
                placeholder="Masukkan nama Anda" 
                className="w-full mt-1 p-3 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 border-none transition-all" 
                required 
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Email :</label>
              <input 
                type="email" 
                placeholder="contoh@gmail.com" 
                className="w-full mt-1 p-3 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 border-none transition-all" 
                required 
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Kata Sandi :</label>
              <input 
                type="password" 
                placeholder="............" 
                className="w-full mt-1 p-3 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 border-none transition-all" 
                required 
              />
            </div>

            <div className="pt-6 flex flex-col items-center gap-4">
              <button 
                type="submit" 
                className="bg-[#B34949] text-white px-20 py-3 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg tracking-widest shadow-red-100"
              >
                DAFTAR SEKARANG
              </button>
              
              <Link to="/login" className="text-xs text-gray-400 hover:text-red-600 transition-colors">
                Sudah punya akun? <span className="font-bold border-b border-gray-300">Masuk di sini</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;