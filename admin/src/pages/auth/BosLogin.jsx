import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';

const BosLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [step, setStep] = useState('login'); // 'login', 'loading', 'success'
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Cek kredensial boss
    if (credentials.username === 'boss' && credentials.password === 'dimsum123') {
      // MULAI ALUR GAMBAR 2 (Memuat)
      setStep('loading'); 

      setTimeout(() => {
        // MASUK KE GAMBAR 3 (Selesai)
        setStep('success'); 
        
        localStorage.setItem('isAuth', 'true');

        // PINDAH KE DASHBOARD
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }, 2000);
    } else {
      alert('Username atau Password Bos salah!');
    }
  };

  // TAMPILAN GAMBAR 2: MEMUAT ...
  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <h1 className="text-4xl font-bold text-gray-900 animate-pulse tracking-tighter">
          Memuat ...
        </h1>
      </div>
    );
  }

  // TAMPILAN GAMBAR 3: SELESAI
  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-20 h-20 bg-[#D94343] rounded-full flex items-center justify-center shadow-lg mb-4 shadow-red-100">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Selesai</h2>
      </div>
    );
  }

  // TAMPILAN GAMBAR 1: FORM LOGIN
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col items-center pb-12">
        
        {/* Banner Merah Melengkung */}
        <div className="w-[120%] h-40 bg-gradient-to-r from-[#8B2323] to-[#FF5F5F] rounded-b-[100%] -translate-y-10 mb-4"></div>

        <div className="w-full max-w-md px-10 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Masuk</h1>
          <p className="text-gray-400 text-xs mb-8">Masuk untuk melanjutkan pesanan Anda</p>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Email :</label>
              <input
                type="text"
                className="w-full mt-1 p-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                placeholder="boss"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Kata Sandi :</label>
              <input
                type="password"
                className="w-full mt-1 p-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                placeholder="............"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
              <p className="text-[10px] text-right mt-2 text-gray-300 cursor-pointer">Lupa Kata Sandi?</p>
            </div>

            <div className="pt-6 flex justify-center">
              <button 
                type="submit" 
                className="bg-[#B34949] text-white px-16 py-2 rounded-full font-bold text-xs tracking-widest hover:bg-[#8B2323] transition-all shadow-md"
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

export default BosLogin;