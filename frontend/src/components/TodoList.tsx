/**
 * MERN To-Do Uygulaması (AI Destekli) - TodoList Bileşeni
 * 
 * Bu proje Playable Factory şirketi Software Engineer Pozisyonu için
 * Furkan Akar (CotNeo) tarafından hazırlanmıştır.
 * GitHub: https://github.com/CotNeo
 * Web: https://cotneo.com
 * 
 * TodoList bileşeni, uygulamanın ana işlevselliğini sağlayan görev yönetimi arayüzüdür.
 * Bu proje GitHub Copilot desteğiyle Visual Studio Code ortamında geliştirilmiştir.
 * Referans Repolar:
 * - https://github.com/CotNeo/mern-crud
 * - https://github.com/iam-veeramalla/MERN-docker-compose/tree/compose/mern
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import apiService, { Todo, CreateTodoData, UpdateTodoData, getFullImageUrl, downloadFile, getFileNameFromUrl } from '../services/api';

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Form states
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTodo, setNewTodo] = useState<CreateTodoData>({
    title: '',
    description: '',
    getRecommendations: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateTodoData>({
    title: '',
    description: '',
    completed: false,
    getRecommendations: false
  });

  // Log form visibility changes for debugging
  useEffect(() => {
    console.log('Form görünürlüğü değişti. showAddForm:', showAddForm);
  }, [showAddForm]);

  // Load todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  // Fetch all todos
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTodos();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch todos. Please try again.');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setLoading(true);
    
    if (searchQuery.trim()) {
      // Arama terimini kullanarak arama yap
      apiService.searchTodos(searchQuery)
        .then(data => {
          setTodos(data);
          setError(null); // Hata mesajını temizle
        })
        .catch(err => {
          setError('Görevleri ararken bir hata oluştu. Lütfen tekrar deneyin.');
          console.error('Error searching todos:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Arama terimi yoksa tüm görevleri getir
      fetchTodos();
    }
  };

  // Handle create form input changes
  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTodo({
      ...newTodo,
      [name]: value
    });
  };

  // Handle checkbox change
  const handleCreateCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewTodo({
      ...newTodo,
      [name]: checked
    });
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB maksimum boyut
      
      // Dosya tipini kontrol et
      if (!file.type.startsWith('image/')) {
        setError('Lütfen sadece resim dosyaları yükleyin (JPEG, PNG, GIF, WebP vb.)');
        return;
      }
      
      // Dosya boyutunu kontrol et
      if (file.size > maxSize) {
        setError('Dosya boyutu çok büyük. Lütfen maksimum 5MB boyutunda resim yükleyin.');
        return;
      }
      
      setError(null); // Önceki hataları temizle
      setSelectedFile(file);
    }
  };

  // Create new todo
  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const todoData: CreateTodoData = {
        ...newTodo,
        image: selectedFile || undefined
      };
      
      await apiService.createTodo(todoData);
      
      // Reset form
      setNewTodo({
        title: '',
        description: '',
        getRecommendations: false
      });
      setSelectedFile(null);
      setShowAddForm(false);
      
      // Refresh todos
      fetchTodos();
      
    } catch (err) {
      setError('Failed to create todo. Please try again.');
      console.error('Error creating todo:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete todo
  const handleDeleteTodo = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        setLoading(true);
        await apiService.deleteTodo(id);
        setTodos(todos.filter((todo: Todo) => todo._id !== id));
      } catch (err) {
        setError('Failed to delete todo. Please try again.');
        console.error('Error deleting todo:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Toggle todo completion status
  const handleToggleComplete = async (todo: Todo) => {
    try {
      setLoading(true);
      const updatedTodo = await apiService.updateTodo(todo._id, {
        completed: !todo.completed
      });
      
      setTodos(todos.map((t: Todo) => t._id === todo._id ? updatedTodo : t));
      
    } catch (err) {
      setError('Failed to update todo status. Please try again.');
      console.error('Error updating todo status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize edit form
  const startEditing = (todo: Todo) => {
    setEditingTodoId(todo._id);
    setEditFormData({
      title: todo.title,
      description: todo.description || '',
      completed: todo.completed,
      getRecommendations: false
    });
  };

  // Handle edit form changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Handle edit form checkbox changes
  const handleEditCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: checked
    });
  };

  // Update todo
  const handleUpdateTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!editingTodoId) return;
    
    try {
      setLoading(true);
      
      const updatedTodo = await apiService.updateTodo(editingTodoId, {
        ...editFormData,
        image: selectedFile || undefined
      });
      
      setTodos(todos.map((t: Todo) => t._id === editingTodoId ? updatedTodo : t));
      
      // Reset form
      setEditingTodoId(null);
      setEditFormData({
        title: '',
        description: '',
        completed: false,
        getRecommendations: false
      });
      setSelectedFile(null);
      
    } catch (err) {
      setError('Failed to update todo. Please try again.');
      console.error('Error updating todo:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingTodoId(null);
    setSelectedFile(null);
  };

  // Yardımcı fonksiyon - AI önerilerini göstermek için
  const renderRecommendations = (recommendations: string | null) => {
    if (!recommendations) return null;
    
    // API anahtarı hatası veya yapılandırma sorunu varsa
    if (recommendations.includes('API key') || recommendations.includes('not configured')) {
      return (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-md">
          <h4 className="text-sm font-medium text-yellow-800">AI Önerileri Kullanılamıyor</h4>
          <p className="text-xs text-yellow-700">{recommendations}</p>
        </div>
      );
    }
    
    // Hata durumunda
    if (recommendations.includes("Sorry, I couldn't generate")) {
      return (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-sm font-medium text-red-800">AI Önerileri Alınamadı</h4>
          <p className="text-xs text-red-700">{recommendations}</p>
        </div>
      );
    }
    
    // Önerileri ayrı maddelere bölme
    let recommendationItems: string[] = [];
    
    // Numaralandırılmış öğeleri kontrol et (1., 2., 3. vb)
    if (recommendations.match(/^\d+\.\s/m)) {
      recommendationItems = recommendations.split(/\d+\.\s/).filter(item => item.trim().length > 0);
    } 
    // Tire ile ayrılmış öğeleri kontrol et (-, * vb.)
    else if (recommendations.match(/^[-*]\s/m)) {
      recommendationItems = recommendations.split(/[-*]\s/).filter(item => item.trim().length > 0);
    } 
    // Yeni satır ile ayrılmış öğeler
    else if (recommendations.includes('\n')) {
      recommendationItems = recommendations.split('\n').filter(item => item.trim().length > 0);
    } 
    // Fallback: tüm metni tek bir madde olarak ele al
    else {
      recommendationItems = [recommendations];
    }
    
    return (
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <i className="fas fa-lightbulb text-blue-500"></i>
          <h4 className="text-sm font-semibold text-blue-800">AI Önerileri</h4>
        </div>
        
        <ul className="space-y-2 mt-2">
          {recommendationItems.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="mt-0.5 flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                {index + 1}
              </div>
              <p className="text-sm text-blue-700">{item.trim()}</p>
            </li>
          ))}
        </ul>
        
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-600">Bu görev için AI tarafından önerilmiştir</span>
            <button 
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              onClick={() => window.navigator.clipboard.writeText(recommendationItems.map((item, i) => `${i+1}. ${item.trim()}`).join('\n'))}
            >
              <i className="fas fa-copy"></i>
              <span>Kopyala</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Toggle add form visibility
  const toggleAddForm = () => {
    console.log('Toggle form called, current state:', showAddForm);
    // Form görünür/gizli durumunu değiştir ve hata mesajını temizle
    setShowAddForm(prevState => !prevState);
    setError(null); // Hata mesajını temizle
  };

  return (
    <div className="mt-16 pb-16">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-6 mb-8 shadow-card overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 -mr-12 -mt-12 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white">
            <path d="M11.47 1.72a.75.75 0 011.06 0l3 3a.75.75 0 01-1.06 1.06l-1.72-1.72V7.5h-1.5V4.06L9.53 5.78a.75.75 0 01-1.06-1.06l3-3zM11.25 7.5V15a.75.75 0 001.5 0V7.5h3.75a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9a3 3 0 013-3h3.75z" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white shadow-inner">
              <i className="fas fa-tasks text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-white">Görevlerim</h1>
              <p className="text-primary-100">Görevlerinizi verimli bir şekilde yönetin ve AI önerileri alın</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-neutral-400"></i>
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 shadow-sm"
                placeholder="Görevlerde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                {searchQuery && (
                  <button 
                    onClick={() => {setSearchQuery(''); fetchTodos();}}
                    className="pr-3 text-neutral-400 hover:text-neutral-600"
                    title="Aramayı temizle"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
                <button 
                  onClick={handleSearch}
                  className="pr-3 text-neutral-400 hover:text-neutral-600"
                  title="Ara"
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
            <button
              id="newTaskButton"
              className="bg-white text-primary-600 hover:bg-neutral-100 rounded-lg px-4 py-2.5 font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
              onClick={toggleAddForm}
            >
              <i className={`fas ${showAddForm ? 'fa-minus' : 'fa-plus'}`}></i>
              <span>{showAddForm ? 'İptal' : 'Yeni Görev'}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded mb-6 flex items-start">
          <i className="fas fa-exclamation-circle mt-0.5 mr-3 text-red-500"></i>
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {/* Add Todo Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-card mb-8 overflow-hidden transform transition-all animate-pop">
          <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 border-b border-primary-500/20 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                <i className="fas fa-plus"></i>
              </div>
              <h2 className="text-lg font-heading font-semibold text-neutral-800">Yeni Görev Ekle</h2>
            </div>
            <button 
              type="button" 
              className="text-neutral-500 hover:text-neutral-700"
              onClick={() => setShowAddForm(false)}
              title="Kapat"
              aria-label="Formu kapat"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleCreateTodo} className="p-6">
            <div className="space-y-5">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
                  <i className="fas fa-bookmark text-primary-500 text-xs"></i>
                  Başlık <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-sm"
                  placeholder="Görev ne hakkında?"
                  value={newTodo.title}
                  onChange={handleCreateInputChange}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
                  <i className="fas fa-align-left text-primary-500 text-xs"></i>
                  Açıklama
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-sm"
                  placeholder="Görev hakkında daha fazla detay..."
                  value={newTodo.description}
                  onChange={handleCreateInputChange}
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
                  <i className="fas fa-image text-primary-500 text-xs"></i>
                  Dosya Ekle
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors">
                    <i className="fas fa-paperclip text-neutral-500"></i>
                    <span className="text-sm text-neutral-700">
                      {selectedFile ? selectedFile.name : "Dosya seç"}
                    </span>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  {selectedFile && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg">
                      <i className="fas fa-file"></i>
                      <span className="text-sm truncate max-w-[150px]">{selectedFile.name}</span>
                      <button
                        type="button"
                        className="ml-1 text-primary-500 hover:text-primary-700"
                        onClick={() => setSelectedFile(null)}
                        aria-label="Seçili dosyayı kaldır"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                <input
                  type="checkbox"
                  id="getRecommendations"
                  name="getRecommendations"
                  className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  checked={newTodo.getRecommendations}
                  onChange={handleCreateCheckboxChange}
                />
                <label htmlFor="getRecommendations" className="ml-2 block text-sm text-blue-700 flex items-center gap-2">
                  <i className="fas fa-lightbulb text-blue-500"></i>
                  <span>Bu görev için AI önerileri al</span>
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-600 text-sm font-medium hover:bg-neutral-50 flex items-center gap-1.5"
                onClick={() => setShowAddForm(false)}
              >
                <i className="fas fa-times"></i>
                <span>İptal</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center gap-2 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <i className="fas fa-circle-notch fa-spin"></i>
                ) : (
                  <i className="fas fa-check"></i>
                )}
                <span>Görevi Oluştur</span>
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Todo List */}
      <div className="space-y-6">
        {/* Loading state */}
        {loading && !editingTodoId && todos.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin mb-3 text-primary-500">
              <i className="fas fa-circle-notch text-3xl"></i>
            </div>
            <p className="text-neutral-500">Loading your tasks...</p>
          </div>
        )}
        
        {/* Empty state */}
        {!loading && todos.length === 0 && (
          <div className="text-center py-12 px-4 bg-white rounded-2xl shadow-card">
            <div className="w-24 h-24 mx-auto mb-6 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-300">
              <i className="fas fa-clipboard-list text-5xl"></i>
            </div>
            
            <h3 className="text-xl font-heading font-semibold text-neutral-800 mb-3">
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz görev yok'}
            </h3>
            
            <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
              {searchQuery 
                ? 'Arama kriterlerinize uygun görev bulunamadı. Farklı bir arama terimi deneyin veya tüm görevleri görüntüleyin.'
                : 'Henüz hiç görev oluşturmadınız. İlk görevinizi oluşturarak başlayın!'}
            </p>
            
            {searchQuery ? (
              <button
                className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors bg-primary-50 px-4 py-2 rounded-lg"
                onClick={() => {setSearchQuery(''); fetchTodos();}}
              >
                <i className="fas fa-arrow-left"></i>
                <span>Tüm görevlere dön</span>
              </button>
            ) : (
              <button
                className="inline-flex items-center px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg gap-2 transition-colors shadow-sm"
                onClick={() => setShowAddForm(true)}
              >
                <i className="fas fa-plus"></i>
                <span>İlk Görevinizi Ekleyin</span>
              </button>
            )}
          </div>
        )}
        
        {/* Todo items */}
        {todos.map((todo: Todo) => (
          <div
            key={todo._id}
            className={`bg-white rounded-xl shadow-card overflow-hidden transition-all ${
              todo.completed 
                ? 'border-l-tertiary-500 bg-neutral-50' 
                : 'border-l-primary-500 hover:shadow-lg'
            }`}
          >
            {editingTodoId === todo._id ? (
              <form onSubmit={handleUpdateTodo} className="p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-pencil-alt"></i>
                    </div>
                    <h3 className="text-lg font-medium text-neutral-800">Görevi Düzenle</h3>
                  </div>
                  <button
                    type="button"
                    className="text-neutral-400 hover:text-neutral-600 p-1.5"
                    onClick={cancelEditing}
                    title="Düzenlemeyi iptal et"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-title" className="block text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
                      <i className="fas fa-bookmark text-primary-500 text-xs"></i>
                      Başlık <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-title"
                      name="title"
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-sm"
                      value={editFormData.title}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
                      <i className="fas fa-align-left text-primary-500 text-xs"></i>
                      Açıklama
                    </label>
                    <textarea
                      id="edit-description"
                      name="description"
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-sm"
                      value={editFormData.description}
                      onChange={handleEditInputChange}
                    ></textarea>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center bg-green-50 p-2.5 rounded-lg border border-green-100 flex-1">
                      <input
                        type="checkbox"
                        id="edit-completed"
                        name="completed"
                        className="h-4 w-4 text-tertiary-600 border-neutral-300 rounded focus:ring-tertiary-500"
                        checked={editFormData.completed}
                        onChange={handleEditCheckboxChange}
                      />
                      <label htmlFor="edit-completed" className="ml-2 block text-sm text-green-700 flex items-center gap-1.5">
                        <i className="fas fa-check-circle text-green-500"></i>
                        <span>Tamamlandı olarak işaretle</span>
                      </label>
                    </div>
                    
                    <div className="flex items-center bg-blue-50 p-2.5 rounded-lg border border-blue-100 flex-1">
                      <input
                        type="checkbox"
                        id="edit-getRecommendations"
                        name="getRecommendations"
                        className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                        checked={editFormData.getRecommendations}
                        onChange={handleEditCheckboxChange}
                      />
                      <label htmlFor="edit-getRecommendations" className="ml-2 block text-sm text-blue-700 flex items-center gap-1.5">
                        <i className="fas fa-lightbulb text-blue-500"></i>
                        <span>AI önerilerini yenile</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="edit-image" className="block text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
                      <i className="fas fa-image text-primary-500 text-xs"></i>
                      Dosya Ekle
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="flex items-center gap-2 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors">
                        <i className="fas fa-paperclip text-neutral-500"></i>
                        <span className="text-sm text-neutral-700">
                          {selectedFile ? selectedFile.name : todo.image ? "Dosyayı değiştir" : "Dosya seç"}
                        </span>
                        <input
                          type="file"
                          id="edit-image"
                          name="image"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      {(selectedFile || todo.image) && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg">
                          <i className="fas fa-file"></i>
                          <span className="text-sm truncate max-w-[150px]">{selectedFile ? selectedFile.name : getFileNameFromUrl(todo.image || '')}</span>
                          <button
                            type="button"
                            className="ml-1 text-primary-500 hover:text-primary-700"
                            onClick={() => setSelectedFile(null)}
                            aria-label="Seçili dosyayı kaldır"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-600 text-sm font-medium hover:bg-neutral-50 flex items-center gap-1.5"
                    onClick={cancelEditing}
                  >
                    <i className="fas fa-times"></i>
                    <span>İptal</span>
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center gap-2 shadow-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <i className="fas fa-circle-notch fa-spin"></i>
                    ) : (
                      <i className="fas fa-save"></i>
                    )}
                    <span>Kaydet</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-0">
                <div className="flex items-start">
                  <div className="pt-5 pl-5">
                    <button
                      onClick={() => handleToggleComplete(todo)}
                      className={`w-6 h-6 flex-shrink-0 border rounded-full flex items-center justify-center transition-all ${
                        todo.completed
                          ? 'bg-tertiary-500 text-white border-tertiary-500 scale-110'
                          : 'border-neutral-300 hover:border-primary-500 hover:bg-primary-50'
                      }`}
                    >
                      {todo.completed && <i className="fas fa-check text-xs"></i>}
                    </button>
                  </div>
                  
                  <div className="flex-grow min-w-0 p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        {todo.completed ? (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-tertiary-100 text-tertiary-800 rounded-full">
                            <i className="fas fa-check-circle mr-1"></i>Tamamlandı
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                            <i className="fas fa-clock mr-1"></i>Devam ediyor
                          </span>
                        )}
                        <h3 className={`text-lg font-medium ${todo.completed ? 'line-through text-neutral-500' : 'text-neutral-800'}`}>
                          {todo.title}
                        </h3>
                      </div>
                      <div className="flex gap-1.5 ml-auto">
                        <button
                          onClick={() => startEditing(todo)}
                          className="text-neutral-400 hover:text-primary-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                          title="Görevi düzenle"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteTodo(todo._id)}
                          className="text-neutral-400 hover:text-red-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                          title="Görevi sil"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                    
                    {todo.description && (
                      <div className={`mb-4 text-sm ${todo.completed ? 'text-neutral-500' : 'text-neutral-600'} bg-neutral-50 p-3 rounded-lg border border-neutral-100`}>
                        {todo.description}
                      </div>
                    )}
                    
                    {/* Date and image */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 mb-2 text-xs text-neutral-500">
                      <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 rounded-full">
                        <i className="fas fa-calendar-alt text-neutral-400"></i>
                        <span>{new Date(todo.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {todo.updatedAt !== todo.createdAt && (
                        <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 rounded-full">
                          <i className="fas fa-edit text-neutral-400"></i>
                          <span>Güncellenme: {new Date(todo.updatedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {todo.image && (
                      <div className="mt-4 border-t border-neutral-100 pt-4">
                        <div className="overflow-hidden rounded-lg border border-neutral-200 max-w-[250px] hover:border-primary-400 transition-all shadow-sm hover:shadow">
                          <img 
                            src={getFullImageUrl(todo.image)} 
                            alt={`Attachment for ${todo.title}`} 
                            className="w-full h-auto object-cover hover:opacity-90 transition-opacity cursor-pointer"
                            onClick={() => window.open(getFullImageUrl(todo.image), '_blank')}
                          />
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => window.open(getFullImageUrl(todo.image), '_blank')}
                            className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-sm hover:underline"
                          >
                            <i className="fas fa-external-link-alt"></i>
                            <span>Görüntüle</span>
                          </button>
                          <button
                            onClick={() => todo.image && downloadFile(getFullImageUrl(todo.image), `${todo.title.replace(/\s+/g, '_')}_${getFileNameFromUrl(todo.image)}`)}
                            className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-sm hover:underline"
                          >
                            <i className="fas fa-download"></i>
                            <span>İndir</span>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* AI Recommendations */}
                    {todo.recommendations && renderRecommendations(todo.recommendations)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList; 