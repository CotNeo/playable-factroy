/**
 * MERN To-Do Uygulaması (AI Destekli) - API Servisi
 * 
 * Bu proje Playable Factory şirketi Software Engineer Pozisyonu için
 * Furkan Akar (CotNeo) tarafından hazırlanmıştır.
 * GitHub: https://github.com/CotNeo
 * Web: https://cotneo.com
 * 
 * API servisi, frontend'in backend ile iletişimini sağlayan temel servistir.
 * Bu proje GitHub Copilot desteğiyle Visual Studio Code ortamında geliştirilmiştir.
 * Referans Repolar:
 * - https://github.com/CotNeo/mern-crud
 * - https://github.com/iam-veeramalla/MERN-docker-compose/tree/compose/mern
 */

import axios, { InternalAxiosRequestConfig } from 'axios';

// Production'da backend ve frontend aynı sunucuda çalışacağından
// relative path kullanarak API'ye erişebiliriz.
// Geliştirme ortamında çevre değişkeninden veya varsayılan olarak localhost'tan alırız.
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.REACT_APP_VERCEL === '1';

// API URL'i belirleme
const API_URL = isProduction 
  ? (isVercel ? process.env.REACT_APP_BACKEND_URL || 'https://your-vercel-backend-url.vercel.app/api' : '/api')
  : ((window as any).process?.env?.REACT_APP_API_URL || 'http://localhost:5001/api');

// BASE_URL, dosya yolları için temel URL (uploads klasörü için kullanılır)
const BASE_URL = isProduction 
  ? (isVercel ? process.env.REACT_APP_BACKEND_URL || 'https://your-vercel-backend-url.vercel.app' : '') 
  : 'http://localhost:5001'; 

// Dosya yollarını tam URL'ye dönüştürme yardımcı fonksiyonu
export const getFullImageUrl = (path: string | undefined): string => {
  if (!path) return '';
  
  // Eğer path zaten tam URL içeriyorsa (http:// veya https://)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Vercel deployment'ında dosya uploading desteği olmadığından, 
  // placeholder görsel URL'i kullanıyoruz
  if (isVercel && isProduction) {
    return 'https://via.placeholder.com/300?text=Image+Not+Available+in+Demo';
  }
  
  // Path'in başında slash olduğundan emin olalım
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Tam URL oluştur
  return `${BASE_URL}${normalizedPath}`;
};

// Dosya adını URL'den çıkaran yardımcı fonksiyon
export const getFileNameFromUrl = (url: string): string => {
  if (!url) return '';
  
  // URL'nin son kısmını alıyoruz (dosya adı)
  const parts = url.split('/');
  return parts[parts.length - 1];
};

// Dosya indirme yardımcı fonksiyonu
export const downloadFile = async (url: string, fileName?: string): Promise<void> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    // İndirme bağlantısı oluştur
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || getFileNameFromUrl(url);
    
    // Belgeye ekle, tıkla ve kaldır
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // URL kaynağını temizle
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Dosya indirme hatası:', error);
    alert('Dosya indirilemedi. Lütfen tekrar deneyin.');
  }
};

// Types
export interface User {
  _id: string;
  username: string;
  email: string;
  token: string;
}

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  image?: string;
  recommendations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  getRecommendations?: boolean;
  image?: File;
}

export interface UpdateTodoData {
  title?: string;
  description?: string;
  completed?: boolean;
  getRecommendations?: boolean;
  image?: File;
}

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
});

// Add authorization header interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// API Service Object with methods for interacting with backend
const apiService = {
  // Auth methods
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    const response = await apiClient.post('/auth/register', credentials);
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('user');
  },

  // Todo methods
  async getTodos(): Promise<Todo[]> {
    const response = await apiClient.get('/todos');
    return response.data;
  },

  async getTodoById(id: string): Promise<Todo> {
    const response = await apiClient.get(`/todos/${id}`);
    return response.data;
  },

  async createTodo(todoData: CreateTodoData): Promise<Todo> {
    // Use FormData for file uploads
    const formData = new FormData();
    formData.append('title', todoData.title);
    
    if (todoData.description) {
      formData.append('description', todoData.description);
    }
    
    if (todoData.getRecommendations) {
      formData.append('getRecommendations', 'true');
    }
    
    // Vercel'de dosya yükleme işlemi geçici olarak devre dışı
    if (todoData.image && !(isVercel && isProduction)) {
      formData.append('image', todoData.image);
    }

    const response = await apiClient.post('/todos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  async updateTodo(id: string, todoData: UpdateTodoData): Promise<Todo> {
    // Use FormData for file uploads
    const formData = new FormData();
    
    if (todoData.title !== undefined) {
      formData.append('title', todoData.title);
    }
    
    if (todoData.description !== undefined) {
      formData.append('description', todoData.description);
    }
    
    if (todoData.completed !== undefined) {
      formData.append('completed', todoData.completed.toString());
    }
    
    if (todoData.getRecommendations) {
      formData.append('getRecommendations', 'true');
    }
    
    // Vercel'de dosya yükleme işlemi geçici olarak devre dışı
    if (todoData.image && !(isVercel && isProduction)) {
      formData.append('image', todoData.image);
    }

    const response = await apiClient.put(`/todos/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  async deleteTodo(id: string): Promise<void> {
    await apiClient.delete(`/todos/${id}`);
  },

  async searchTodos(query: string): Promise<Todo[]> {
    const response = await apiClient.get(`/todos/search?query=${query}`);
    return response.data;
  },
};

export default apiService; 