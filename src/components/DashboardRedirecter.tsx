import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardRedirector = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Check the user's role and navigate accordingly
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'counsellor') {
        navigate('/counsellor/dashboard', { replace: true });
      } else {
        // Default for students is to stay on a student-specific dashboard page
        // For this example, let's assume '/student-dashboard' is the final destination
        navigate('/student-dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  // Render a loading state while the redirect is happening
  return (
    <div className="p-8">
      <p>Loading your dashboard...</p>
    </div>
  );
};

export default DashboardRedirector;