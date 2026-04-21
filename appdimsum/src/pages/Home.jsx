import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white', padding: '20px'}}>
      {/* Hero */}
      <div style={{maxWidth: '600px'}}>
        <div style={{fontSize: '80px', marginBottom: '20px'}}>🥟</div>
        <h1 style={{fontSize: '48px', fontWeight: 'bold', marginBottom: '16px', textShadow: '0 4px 8px rgba(0,0,0,0.3)'}}>QR SmartOrder</h1>
        <p style={{fontSize: '24px', marginBottom: '32px', opacity: '0.9'}}>AYCE Dimsum Restaurant</p>
        <p style={{fontSize: '18px', marginBottom: '40px', opacity: '0.8'}}>Scan QR di meja untuk memesan dimsum favoritmu! Semua gratis (All You Can Eat)</p>
        
        {/* CTA Button */}
        <button 
          onClick={() => navigate('/menu')}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold',
            padding: '20px 40px',
            border: 'none',
            borderRadius: '50px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
          }}
        >
          🚀 Mulai Pesan Sekarang
        </button>
      </div>
      
      {/* Footer */}
      <div style={{position: 'fixed', bottom: '20px', fontSize: '14px', opacity: '0.7'}}>
        📱 Meja 12 • AYCE Dimsum SmartOrder System
      </div>
    </div>
  );
};

export default Home;
