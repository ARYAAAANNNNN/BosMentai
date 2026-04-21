import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle submit form login
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulasi proses loading 2 detik
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);

      // Pindah ke halaman admin setelah animasi selesai
      setTimeout(() => {
        setIsSuccess(false);
        navigate('/admin');
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-sm overflow-hidden relative">

        {/* Tampilan loading dan berhasil login */}
        {(isLoading || isSuccess) && (
          <div className="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center">
            {isLoading ? (
              <h1 className="text-4xl font-black text-black">Memuat ...</h1>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-[72px] h-[72px] bg-[#B34949] rounded-full flex items-center justify-center mb-3">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl font-black text-black">Selesai</h1>
              </div>
            )}
          </div>
        )}

        {/* Header gelombang merah */}
        <div style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 800 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full block">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7a1f1f" />
                <stop offset="100%" stopColor="#e05050" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="800" height="80" fill="url(#grad)" />
            <path d="M0,45 C150,80 300,15 500,48 C640,72 720,28 800,42 L800,0 L0,0 Z" fill="url(#grad)" />
            <path d="M0,52 C150,88 300,22 500,55 C640,78 720,36 800,50 L800,80 L0,80 Z" fill="#ffffff" />
          </svg>
        </div>

        {/* Area form login */}
        <div className="px-16 pt-4 pb-16 text-center">
          <h2 className="text-3xl font-bold text-[#1A202C] mb-2">Masuk</h2>
          <p className="text-gray-500 text-sm mb-10">Masuk untuk melanjutkan pesanan Anda</p>

          <form onSubmit={handleLogin} className="text-left">

            {/* Input email */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email :</label>
              <input
                type="email"
                placeholder="abc@gmail.com"
                className="w-full px-4 py-3 bg-[#F0F2F5] border border-gray-200 rounded-lg text-gray-500 outline-none text-sm placeholder-gray-400"
                required
              />
            </div>

            {/* Input kata sandi dengan tombol show/hide */}
            <div className="mb-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kata Sandi :</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="............"
                  className="w-full px-4 py-3 pr-11 bg-[#F0F2F5] border border-gray-200 rounded-lg text-gray-600 outline-none text-sm placeholder-gray-400"
                  required
                />
                {/* Tombol mata untuk show/hide password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    // Mata terbuka - password sedang kelihatan
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    // Mata tertutup - password sedang tersembunyi
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-right mt-2">
                <span className="text-xs text-gray-400 cursor-pointer hover:text-[#B34949] transition-colors">
                  Lupa Kata Sandi?
                </span>
              </div>
            </div>

            {/* Tombol masuk */}
            <div className="flex justify-center mt-10">
              <button
                type="submit"
                className="bg-[#B34949] hover:bg-[#922f2f] text-white font-bold px-16 py-3 rounded-full uppercase tracking-widest text-sm transition-colors duration-200"
              >
                MASUK
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;