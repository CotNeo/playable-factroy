# MERN To-Do Uygulaması (AI Destekli)

Bu proje, **MERN Stack** (MongoDB, Express.js, React, Node.js) kullanılarak geliştirilmiş, JWT kimlik doğrulamalı, OpenAI destekli öneri sunabilen bir **To-Do Uygulaması**dır. Kullanıcılar, görevlerini yönetebilir, açıklamalar ekleyebilir, resim yükleyebilir ve OpenAI tarafından öneriler alabilirler.

## **👨‍💻 Geliştirici Bilgileri**

Bu proje, **Playable Factory** şirketi Software Engineer Pozisyonu için **Furkan Akar (CotNeo)** tarafından hazırlanmıştır.

- **Geliştirici**: Furkan Akar
- **GitHub**: [@CotNeo](https://github.com/CotNeo)
- **Resmi Web Sitesi**: [cotneo.com](https://cotneo.com)
- **Taklit Edilen Repolar**:
  - [https://github.com/CotNeo/mern-crud](https://github.com/CotNeo/mern-crud)
  - [https://github.com/iam-veeramalla/MERN-docker-compose/tree/compose/mern](https://github.com/iam-veeramalla/MERN-docker-compose/tree/compose/mern)

## **🚀 Proje Geliştirme Süreci**

1. **Gereksinimler Belirlendi**: Proje başlangıcında detaylı gereksinimler belirlendi.
2. **Dosya Yapısı Oluşturuldu**: MERN stack için uygun bir dosya yapısı planlandı ve oluşturuldu.
3. **Geliştirme Süreci**: Proje, Visual Studio Code ortamında geliştirildi ve yaklaşık 6 saat sürdü.
4. **GitHub Copilot Desteği**: Geliştirme sürecinde GitHub Copilot'tan destek alındı.

---

## **📌 Projenin Amacı**
Bu uygulamanın temel hedefleri şunlardır:
- Kullanıcıların görevlerini yönetmelerini sağlamak.
- OpenAI kullanarak görevlerle ilgili öneriler sunmak.
- Kullanıcı giriş ve kimlik doğrulaması yapmak.
- Görevleri **başlık ve açıklamaya göre** arama desteği sunmak.
- Görevlere **resim yükleme desteği** eklemek.

---

## **📂 Proje Dosya Yapısı**
```
mern-todo-app/
│── backend/
│   ├── models/
│   │   ├── Todo.js                  # To-Do modeli (title, description, recommendations, completed, image, user)
│   │   ├── User.js                  # Kullanıcı modeli (JWT kimlik doğrulama için)
│   │   ├── routes/
│   │   │   ├── todoRoutes.js            # To-Do CRUD işlemleri ve OpenAI öneri entegrasyonu
│   │   │   ├── authRoutes.js            # Kullanıcı giriş/kayıt işlemleri
│   │   ├── services/
│   │   │   ├── openaiService.js         # OpenAI API entegrasyonu (GPT'den öneri almak için)
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js        # JWT kimlik doğrulama middleware
│   │   ├── uploads/                     # Kullanıcıların yüklediği resimler burada saklanır
│   │   ├── .env                         # API anahtarları ve çevresel değişkenler (MongoDB, OpenAI, JWT)
│   │   ├── server.js                    # Express sunucusunu başlatan ana dosya
│   │   ├── package.json                 # Backend bağımlılıkları
│   │── frontend/
│   │   ├── public/                      # Statik dosyalar
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── TodoList.tsx         # Ana ToDo görev yönetimi bileşeni
│   │   │   │   ├── Auth.tsx             # Kullanıcı giriş ve kayıt formları bileşeni
│   │   │   │   ├── Navbar.tsx           # Navigasyon bileşeni
│   │   │   ├── services/
│   │   │   │   ├── api.ts               # Backend API ile iletişim için servis
│   │   │   ├── contexts/
│   │   │   │   ├── AuthContext.tsx      # Kimlik doğrulama contexti
│   │   │   ├── pages/
│   │   │   │   ├── Home.tsx             # Ana sayfa
│   │   │   │   ├── Login.tsx            # Giriş sayfası
│   │   │   │   ├── Register.tsx         # Kayıt sayfası
│   │   │   ├── App.tsx                  # Ana uygulama bileşeni
│   │   │   ├── index.tsx                # Uygulama giriş noktası
│   │   ├── package.json                 # Frontend bağımlılıkları
│   │── README.md                        # Proje dökümantasyonu
│   └── README_NEW.md
```

---

## **🔧 Teknolojiler**

### **Backend**
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL veritabanı
- **Mongoose**: MongoDB ODM
- **JWT**: Kimlik doğrulama
- **OpenAI API**: AI önerileri için
- **Multer**: Dosya yükleme işlemleri

### **Frontend**
- **React**: UI kütüphanesi
- **TypeScript**: Tip güvenliği
- **Axios**: HTTP istekleri
- **React Router**: Sayfa yönlendirme
- **Tailwind CSS**: UI tasarımı

---

## **📋 Özellikler**

1. **Kullanıcı Kimlik Doğrulama**
   - JWT tabanlı kimlik doğrulama
   - Kayıt, giriş ve çıkış işlemleri
   
2. **Görev Yönetimi**
   - Görev oluşturma, düzenleme, silme
   - Görevleri tamamlandı olarak işaretleme
   - Başlık ve açıklamaya göre görev arama
   
3. **AI Destekli Öneriler**
   - OpenAI GPT entegrasyonu
   - Görev başlığı ve açıklamasına dayalı öneriler
   - Önerileri yenileme özelliği
   
4. **Dosya Yükleme**
   - Görevlere resim ekleme
   - Dosya boyutu doğrulama
   - Resim önizleme

5. **Kullanıcı Arayüzü**
   - Modern ve duyarlı tasarım
   - Kolay kullanım
   - Gerçek zamanlı bildirimler

---

## **🚀 Kurulum ve Çalıştırma**

### **Gereksinimler**
- Node.js (v14+)
- MongoDB
- OpenAI API anahtarı

### **Backend Kurulumu**
1. Repo'yu klonlayın
2. Backend klasörüne gidin: `cd backend`
3. Bağımlılıkları yükleyin: `npm install`
4. `.env` dosyasını oluşturun:
   ```
   PORT=5001
   NODE_ENV=development
   MONGODB_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret>
   OPENAI_API_KEY=<your_openai_api_key>
   ```
5. Sunucuyu başlatın: `npm run dev`

### **Frontend Kurulumu**
1. Frontend klasörüne gidin: `cd frontend`
2. Bağımlılıkları yükleyin: `npm install`
3. Geliştirme sunucusunu başlatın: `npm start`
4. Tarayıcıda şu adresi açın: `http://localhost:3000`

---

## **🔍 Notlar**

- OpenAI API anahtarı olmadan uygulama çalışır, ancak öneriler yerel olarak üretilir.
- Backend, `backend/uploads` klasörünü otomatik olarak oluşturur.
- Uygulama, MongoDB Atlas veya yerel MongoDB sunucusu ile çalışabilir.

---

## **📝 Lisans**

Bu proje MIT Lisansı altında lisanslanmıştır.

---

Bu uygulama, Playable Factory Software Engineer pozisyonu için teknik değerlendirme amacıyla oluşturulmuştur. 