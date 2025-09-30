import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // 1. Import Toaster

// Import all your components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import StudentDashboard from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import CounsellorDashboard from './components/CounsellorDashboard';
import { ResourcesSection } from './components/ResourcesSection';
import { RelaxationSection } from './components/RelaxationSection';
import { AIChat } from './components/AIChat';
import { PeerForum } from './components/PeerForum';
import { CounselorDirectory } from './components/CounselorDirectory';
import Games from './components/Games';
import Redeem from './components/Redeem';

// Context Providers and Hooks
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// This component decides which "homepage" to show
const MainDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'counsellor') {
        navigate('/counsellor/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  // If the user's role is 'student', show their dashboard as the homepage
  if (user.role === 'student') {
    return <StudentDashboard />;
  }

  // Fallback while admin/counsellor are being redirected
  return <div>Loading...</div>;
};

function AppShell() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <>
      {/* 2. Add the Toaster component here */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 6000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
        {!isLogin && <Header />}
        <main className="flex-grow">
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainDashboard />} />
              
              {/* Dashboard Routes */}
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/counsellor/dashboard" element={<CounsellorDashboard />} />
              
              {/* Page Routes */}
              <Route path="/resources" element={<ResourcesSection />} />
              <Route path="/relaxation" element={<RelaxationSection />} />
              <Route path="/ai-support" element={<AIChat />} />
              <Route path="/peer-forum" element={<PeerForum />} />
              <Route path="/counselors" element={<CounselorDirectory />} />
              <Route path="/games" element={<Games />} />
              <Route path="/redeem" element={<Redeem />} />
            </Route>
          </Routes>
        </main>
        {!isLogin && <Footer />}
      </div>
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AppShell />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;