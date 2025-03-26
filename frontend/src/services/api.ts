/**
 * MERN To-Do Uygulaması (AI Destekli) - Geliştirme Ortamı API Servisi
 * 
 * Bu dosya sadece geliştirme ortamı için yapılandırılmıştır.
 * Geliştirici: Furkan Akar (CotNeo) | https://github.com/CotNeo
 */

import axios, { InternalAxiosRequestConfig } from 'axios';

// ============================
// 🔧 Geliştirme Ortamı Ayarları
// ============================

// API endpoint'i doğrudan localhost üzerinden çalışır
const API_URL = 'http://localhost:5001/api'; // Backend'in dev sunucusu

// Görseller ve dosyalar için temel URL
const BASE_URL = 'http://localhost:5001';

// ============================
// 📸 Yardımcı Fonksiyonlar
// ============================

/**
 * Verilen dosya yolu (örneğin: /uploads/image.png) tam URL'ye çevrilir
 */
export const getFullImageUrl = (path?: string): string => {
  if (!path) return '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${normalizedPath}`;
};

/**
 * URL'den sadece dosya adını çeker
 * Örnek: http://localhost:5001/uploads/test.png → test.png
 */
export const getFileNameFromUrl = (url: string): string => {
  if (!url) return '';
  const parts = url.split('/');
  return parts[parts.length - 1];
};

/**
 * Verilen URL'deki dosyayı tarayıcıda indirir
 */
export const downloadFile = async (url: string, fileName?: string): Promise<void> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || getFileNameFromUrl(url);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Dosya indirilemedi:', error);
    alert('Dosya indirme sırasında bir hata oluştu.');
  }
};

// ============================
// 🧠 Tip Tanımlamaları
// ============================

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

// ============================
// 🔌 Axios Instance ve Interceptor
// ============================

// Axios istemcisi oluştur
const apiClient = axios.create({
  baseURL: API_URL,
});

// Tüm isteklere otomatik olarak Bearer Token ekle
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================
// 🚀 API Servisi
// ============================

const apiService = {
  /**
   * Kullanıcı girişi (Login)
   */
  async login(credentials: LoginCredentials): Promise<User> {
    const res = await apiClient.post('/auth/login', credentials);
    if (res.data) {
      localStorage.setItem('user', JSON.stringify(res.data));
    }
    return res.data;
  },

  /**
   * Yeni kullanıcı kaydı (Register)
   */
  async register(credentials: RegisterCredentials): Promise<User> {
    const res = await apiClient.post('/auth/register', credentials);
    if (res.data) {
      localStorage.setItem('user', JSON.stringify(res.data));
    }
    return res.data;
  },

  /**
   * Oturumu sonlandırır
   */
  logout(): void {
    localStorage.removeItem('user');
  },

  /**
   * Tüm görevleri getirir
   */
  async getTodos(): Promise<Todo[]> {
    const res = await apiClient.get('/todos');
    return res.data;
  },

  /**
   * ID ile tek görev getirir
   */
  async getTodoById(id: string): Promise<Todo> {
    const res = await apiClient.get(`/todos/${id}`);
    return res.data;
  },

  /**
   * Yeni görev oluşturur (görsel dahil)
   */
  async createTodo(todoData: CreateTodoData): Promise<Todo> {
    const formData = new FormData();
    formData.append('title', todoData.title);

    if (todoData.description) {
      formData.append('description', todoData.description);
    }

    if (todoData.getRecommendations) {
      formData.append('getRecommendations', 'true');
    }

    if (todoData.image) {
      formData.append('image', todoData.image);
    }

    const res = await apiClient.post('/todos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data;
  },

  /**
   * Mevcut görevi günceller
   */
  async updateTodo(id: string, todoData: UpdateTodoData): Promise<Todo> {
    const formData = new FormData();

    if (todoData.title !== undefined) formData.append('title', todoData.title);
    if (todoData.description !== undefined) formData.append('description', todoData.description);
    if (todoData.completed !== undefined) formData.append('completed', todoData.completed.toString());
    if (todoData.getRecommendations) formData.append('getRecommendations', 'true');
    if (todoData.image) formData.append('image', todoData.image);

    const res = await apiClient.put(`/todos/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data;
  },

  /**
   * Görevi siler
   */
  async deleteTodo(id: string): Promise<void> {
    await apiClient.delete(`/todos/${id}`);
  },

  /**
   * Arama sorgusuna göre görevleri getirir
   */
  async searchTodos(query: string): Promise<Todo[]> {
    const res = await apiClient.get(`/todos/search?query=${query}`);
    return res.data;
  },
};

// ============================
// 📤 Export
// ============================

export default apiService;
