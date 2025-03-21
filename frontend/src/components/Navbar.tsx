import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav 
      className={`fixed w-full z-20 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-card backdrop-blur-lg bg-opacity-90' 
          : 'bg-primary-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center gap-2"
            >
              <i className={`fas fa-check-circle text-2xl ${isScrolled ? 'text-primary-600' : 'text-white'}`}></i>
              <span className={`text-xl font-heading font-bold ${isScrolled ? 'text-primary-700' : 'text-white'}`}>
                TaskMaster AI
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <div className={`py-1 px-3 rounded-full ${
                  isScrolled ? 'bg-primary-50 text-primary-700' : 'bg-primary-700 bg-opacity-20 text-white'
                }`}>
                  <span className="text-sm font-medium flex items-center gap-2">
                    <i className="fas fa-user"></i>
                    {user.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isScrolled 
                      ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200' 
                      : 'text-white hover:bg-primary-700 hover:bg-opacity-20'
                  }`}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isScrolled 
                      ? 'text-neutral-600 hover:text-primary-600' 
                      : 'text-white hover:bg-primary-700 hover:bg-opacity-20'
                  }`}
                >
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isScrolled 
                      ? 'bg-primary-600 text-white hover:bg-primary-700' 
                      : 'bg-white text-primary-600 hover:bg-neutral-100'
                  }`}
                >
                  <i className="fas fa-user-plus"></i>
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className={`inline-flex items-center justify-center p-2 rounded-lg focus:outline-none ${
                isScrolled 
                  ? 'text-neutral-600 hover:bg-neutral-100' 
                  : 'text-white hover:bg-primary-700 hover:bg-opacity-20'
              }`}
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <i className={isMenuOpen ? "fas fa-times text-xl" : "fas fa-bars text-xl"}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute w-full bg-white shadow-md pt-2 pb-3 px-4 rounded-b-xl animate-pop">
          <div className="space-y-2">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 p-2 bg-primary-50 text-primary-700 rounded-lg">
                  <i className="fas fa-user-circle text-xl"></i>
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  <i className="fas fa-sign-out-alt w-6 text-primary-500"></i>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg font-medium text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-sign-in-alt w-6 text-primary-500"></i>
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg font-medium text-white bg-primary-600 hover:bg-primary-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-user-plus w-6"></i>
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 