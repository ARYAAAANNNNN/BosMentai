import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [noMeja, setNoMeja] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/register-customer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ no_meja: noMeja, username, password })
        });
        const data = await response.json();
        if (data.success) {
            // After register, redirect to login
            navigate('/login', { state: { message: 'Registrasi berhasil! Silakan masuk.' } });
        } else {
            setError(data.message || 'Registrasi gagal.');
        }
    } catch (err) {
        setError('Terjadi kesalahan koneksi.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden relative pb-10">
        {/* Red Gradient Header with Wave */}
        <div className="relative h-32 bg-gradient-to-b from-[#C0392B] to-[#E74C3C] flex items-center justify-center overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full">
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-16 w-full">
                <path d="M0.00,49.98 C149.99,150.00 349.82,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" style={{ stroke: 'none', fill: '#ffffff' }}></path>
            </svg>
          </div>
        </div>

        <div className="px-10 -mt-6 relative z-10">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Daftar</h1>
            <p className="text-xs text-gray-500 font-medium">Buat akun untuk mulai memesan</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 text-[10px] p-2 rounded-xl text-center border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Nomor Meja :</label>
              <input
                type="number"
                value={noMeja}
                onChange={(e) => setNoMeja(e.target.value)}
                placeholder="masukkan nomor meja"
                className="w-full bg-gray-100 border-none rounded-2xl py-3.5 px-6 text-sm outline-none focus:ring-2 focus:ring-[#C0392B]/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Username :</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="pilih username"
                className="w-full bg-gray-100 border-none rounded-2xl py-3.5 px-6 text-sm outline-none focus:ring-2 focus:ring-[#C0392B]/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Kata Sandi :</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="buat kata sandi"
                className="w-full bg-gray-100 border-none rounded-2xl py-3.5 px-6 text-sm outline-none focus:ring-2 focus:ring-[#C0392B]/20 transition-all"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#C0392B] hover:bg-[#A93226] text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'MENDAFTAR...' : 'DAFTAR'}
              </button>
            </div>
            
            <div className="text-center mt-4">
                <p className="text-[10px] text-gray-500">
                    Sudah punya akun? <Link to="/login" className="text-[#C0392B] font-bold hover:underline">Masuk di sini</Link>
                </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
