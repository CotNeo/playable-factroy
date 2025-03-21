/**
 * MERN To-Do Uygulaması (AI Destekli)
 * 
 * Bu proje Playable Factory şirketi Software Engineer Pozisyonu için
 * Furkan Akar (CotNeo) tarafından hazırlanmıştır.
 * GitHub: https://github.com/CotNeo
 * Web: https://cotneo.com
 * 
 * Bu proje GitHub Copilot desteğiyle Visual Studio Code ortamında geliştirilmiştir.
 * Referans Repolar:
 * - https://github.com/CotNeo/mern-crud
 * - https://github.com/iam-veeramalla/MERN-docker-compose/tree/compose/mern
 */

import React, { Suspense } from 'react';
import { 
  BrowserRouter as Router, 
  Route, 
  Routes, 
  Navigate
} from 'react-router-dom';

// Components
import Navbar from './components/Navbar';

// Auth Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages - Doğrudan içeri alma yerine dinamik olarak import edelim
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));

// Loading Component
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center">
    <div className="animate-float">
      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-neutral-500 font-medium">Loading...</p>
  </div>
);

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  // Future flags to suppress warnings
  const routerOptions = {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  };

  return (
    <Router {...routerOptions}>
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-12">
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* 404 Page */}
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
                  <div className="w-24 h-24 text-neutral-200 mb-6">
                    <i className="fas fa-compass text-6xl"></i>
                  </div>
                  <h1 className="text-3xl font-heading font-bold text-neutral-800 mb-2">Page Not Found</h1>
                  <p className="text-neutral-500 mb-8 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
                  <a href="/" className="btn btn-primary btn-lg">
                    Go to Home
                  </a>
                </div>
              } />
            </Routes>
          </Suspense>
        </main>
        
        <footer className="py-6 bg-white border-t border-neutral-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-neutral-500 text-sm mb-4 sm:mb-0">
                &copy; {new Date().getFullYear()} TaskMaster AI. All rights reserved.
              </p>
              <div className="flex space-x-4">
                <a href="https://github.com/CotNeo" className="text-neutral-500 hover:text-primary-600 transition-colors" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-github"></i>
                </a>
                <a href="https://www.linkedin.com/in/furkanaliakar" className="text-neutral-500 hover:text-primary-600 transition-colors" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="https://cotneo.com" className="text-neutral-500 hover:text-primary-600 transition-colors" target="_blank" rel="noopener noreferrer">
                  <i className="fas fa-globe"></i>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App; 