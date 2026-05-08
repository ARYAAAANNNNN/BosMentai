import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // In a real app, you would call your API here
    // For now, let's simulate a login or use the authAPI if it exists
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('customer_token', data.token);
            localStorage.setItem('no_meja', data.no_meja);
            navigate('/menu');
        } else {
            setError(data.message || 'Login gagal. Cek username dan password.');
        }
    } catch (err) {
        setError('Terjadi kesalahan koneksi.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden relative pb-12">
        {/* Red Gradient Header with Wave */}
        <div className="relative h-48 bg-gradient-to-b from-[#C0392B] to-[#E74C3C] flex items-center justify-center overflow-hidden">
          {/* Logo Container */}
          <div className="relative z-20 w-24 h-24 bg-white rounded-full p-1 shadow-xl border-4 border-white/20 overflow-hidden">
            <img 
              src="/images/logo-bosmentai.jpg" 
              alt="Bos Mentai Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Subtle Wave Effect */}
          <div className="absolute bottom-0 left-0 w-full z-10">
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-20 w-full">
                <path d="M0.00,49.98 C149.99,150.00 349.82,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" style={{ stroke: 'none', fill: '#ffffff' }}></path>
            </svg>
          </div>
        </div>

        <div className="px-10 -mt-8 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Masuk</h1>
            <p className="text-sm text-gray-500 font-medium">Masuk untuk melanjutkan pesanan Anda</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 text-xs p-3 rounded-xl text-center border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Username :</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="masukkan username"
                className="w-full bg-gray-100 border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-[#C0392B]/20 transition-all"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Kata Sandi :</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="............"
                className="w-full bg-gray-100 border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-[#C0392B]/20 transition-all"
                required
              />
              <div className="text-right mt-2">
                <button type="button" className="text-[10px] text-gray-400 hover:text-gray-600 font-medium italic">
                  Lupa Kata Sandi?
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-[#C0392B] hover:bg-[#A93226] text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
              >
                MASUK
              </button>
            </div>
            
            <div className="text-center mt-6">
                <p className="text-xs text-gray-500">
                    Belum punya akun? <Link to="/register" className="text-[#C0392B] font-bold hover:underline">Daftar Sekarang</Link>
                </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
