import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials, RegisterCredentials } from '../services/api';

interface AuthProps {
  isLogin: boolean;
}

const Auth: React.FC<AuthProps> = ({ isLogin }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [formData, setFormData] = useState<LoginCredentials | RegisterCredentials>({
    email: '',
    password: '',
    ...(isLogin ? {} : { username: '' }),
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isLogin && !('username' in formData)) {
    setFormData(prevData => ({
      ...prevData as RegisterCredentials,
      username: ''
    }));
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData as LoginCredentials);
      } else {
        await register(formData as RegisterCredentials);
      }
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
        err.response?.data?.errors?.[0]?.msg ||
        `Failed to ${isLogin ? 'login' : 'register'}. Please try again.`;
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md relative">
        {/* Background decoration */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-200 rounded-full opacity-50 blur-2xl"></div>
        <div className="absolute -bottom-8 -left-12 w-36 h-36 bg-secondary-200 rounded-full opacity-50 blur-3xl"></div>
        
        {/* Card */}
        <div className="relative bg-white rounded-2xl shadow-card overflow-hidden border border-neutral-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-6 text-white">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 flex items-center justify-center bg-white bg-opacity-20 rounded-full">
                <i className={`fas ${isLogin ? 'fa-unlock' : 'fa-user-plus'} text-xl`}></i>
              </div>
            </div>
            <h2 className="text-2xl font-heading font-bold text-center">
              {isLogin ? 'Welcome Back' : 'Join Us Today'}
            </h2>
            <p className="text-center text-primary-100 mt-1 text-sm">
              {isLogin ? 'Login to manage your tasks' : 'Create an account to get started'}
            </p>
          </div>
          
          {/* Form */}
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded mb-6 text-sm flex items-start">
                <i className="fas fa-exclamation-circle mt-0.5 mr-3 text-red-500"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="block text-neutral-700 text-sm font-medium" htmlFor="username">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-user text-neutral-400"></i>
                    </div>
                    <input
                      id="username"
                      type="text"
                      name="username"
                      className="w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                      placeholder="johndoe"
                      value={(formData as RegisterCredentials).username || ''}
                      onChange={handleChange}
                      required
                      minLength={3}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-neutral-700 text-sm font-medium" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-envelope text-neutral-400"></i>
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className="w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="block text-neutral-700 text-sm font-medium" htmlFor="password">
                    Password
                  </label>
                  {isLogin && (
                    <a href="#" className="text-xs text-primary-600 hover:text-primary-800 transition">
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-neutral-400"></i>
                  </div>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    className="w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                    placeholder={isLogin ? "••••••" : "Create password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
                {!isLogin && (
                  <p className="mt-1.5 text-xs text-neutral-500 flex items-center">
                    <i className="fas fa-info-circle mr-1.5"></i>
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={loading}
              >
                {loading && <i className="fas fa-circle-notch fa-spin mr-2"></i>}
                {loading
                  ? isLogin
                    ? 'Logging in...'
                    : 'Creating account...'
                  : isLogin
                  ? 'Login'
                  : 'Create Account'}
              </button>

              <div className="text-center pt-3">
                <div className="text-neutral-500 text-sm mb-4">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </div>
                
                <a
                  href={isLogin ? "/register" : "/login"}
                  className="inline-flex items-center justify-center w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(isLogin ? '/register' : '/login');
                  }}
                >
                  <i className={`fas ${isLogin ? 'fa-user-plus' : 'fa-sign-in-alt'} mr-2 text-primary-500`}></i>
                  {isLogin ? 'Create an Account' : 'Login'}
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth; 