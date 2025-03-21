/**
 * MERN To-Do Uygulaması (AI Destekli) - Ana Sayfa Bileşeni
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

import React from 'react';
import TodoList from '../components/TodoList';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="mx-auto max-w-5xl">
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-neutral-800">
          Welcome back, <span className="text-primary-600">{user?.username || 'User'}</span>!
        </h1>
        <p className="text-neutral-500 mt-2">
          Start organizing your day with our AI-powered task management system.
        </p>
      </div>
      
      {/* Main Content */}
      <TodoList />
    </div>
  );
};

export default Home; 