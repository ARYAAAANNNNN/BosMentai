import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/menu');
  }, [navigate]);

  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f0f0f0'}}>
      Loading menu...
    </div>
  );
};

export default Dashboard;
