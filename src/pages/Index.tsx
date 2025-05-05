
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to landing page only when explicitly on the /index route
    if (window.location.pathname === '/index') {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse-purple p-4 rounded-full">
        <div className="text-primary/50">Loading...</div>
      </div>
    </div>
  );
};

export default Index;
