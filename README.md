# MERN To-Do Uygulaması (AI Destekli)

Bu proje, **MERN Stack** (MongoDB, Express.js, React, Node.js) kullanılarak geliştirilmiş, JWT kimlik doğrulamalı, OpenAI destekli öneri sunabilen bir **To-Do Uygulaması**dır. Kullanıcılar, görevlerini yönetebilir, açıklamalar ekleyebilir, resim yükleyebilir ve OpenAI tarafından öneriler alabilirler.

## **👨‍💻 Geliştirici Bilgileri**

Bu proje, **Playable Factory** Şirketi Software Engineer Pozisyonu için **Furkan Akar (CotNeo)** tarafından hazırlanmıştır.

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
├── backend/
│   ├── config/                      # Cloudinary konfigürasyonu
│   ├── models/
│   │   ├── Todo.js                # To-Do modeli
│   │   ├── User.js                # Kullanıcı modeli
│   ├── routes/
│   │   ├── todoRoutes.js         # To-Do CRUD + OpenAI entegrasyonu
│   │   ├── authRoutes.js         # Kullanıcı auth işlemleri
│   ├── services/
│   │   ├── openaiService.js      # OpenAI API entegrasyonu
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT middleware
│   ├── uploads/                  # Yüklenen görsellerin tutulduğu klasör
│   ├── .env                      # Çevresel değişkenler
│   ├── server.js                 # Sunucuyu başlatan dosya
│   ├── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TodoList.tsx     # To-Do bileseni
│   │   │   ├── Auth.tsx         # Login/Register bileseni
│   │   │   ├── Navbar.tsx       # Navbar
│   │   ├── services/
│   │   │   ├── api.ts           # API servisleri
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx  # Auth context
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   ├── App.tsx
│   │   ├── index.tsx
│   ├── package.json
├── README.md
```

---

## **🔧 Teknolojiler**

### **Backend**
- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **JWT**
- **OpenAI API**
- **Multer** + **Cloudinary**

### **Frontend**
- **React** + **TypeScript**
- **Axios**
- **React Router**
- **Tailwind CSS**

---

## **📋 Özellikler**

1. **JWT Kimlik Doğrulama**
2. **CRUD Görev Yönetimi**
3. **OpenAI Destekli Öneriler**
4. **Dosya / Resim Yükleme**
5. **Responsive Arayüz**

---

## **🚀 Dağıtım**

- **Live Backend (Render):** [https://todo-backend-oxw7.onrender.com/](https://todo-backend-oxw7.onrender.com/)
- **Live Frontend (Vercel):** [https://todo-frontend-icmrcffq2-cotneos-projects.vercel.app/login](https://todo-frontend-icmrcffq2-cotneos-projects.vercel.app/login)

---

## **📆 Kurulum**

### **Gereksinimler**
- Node.js (v14+)
- MongoDB Atlas
- OpenAI API Key

### **Backend**
```bash
cd backend
npm install
# .env dosyasını oluşturun
PORT=5001
NODE_ENV=development
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
OPENAI_API_KEY=<your_openai_api_key>
CLOUDINARY_CLOUD_NAME=<cloudinary_name>
CLOUDINARY_API_KEY=<cloudinary_api_key>
CLOUDINARY_API_SECRET=<cloudinary_api_secret>

npm run dev
```

### **Frontend**
```bash
cd frontend
npm install
npm start
```

Tarayıcıda şu adresi açarak test edebilirsiniz:
[http://localhost:3000](http://localhost:3000)

---

## **🔍 Notlar**

- OpenAI API anahtarı yoksa, öneriler yerine yerel metin döner.
- `uploads/` klasörü sunucu tarafında otomatik oluşur.
- MongoDB Atlas veya yerel MongoDB desteklenir.

---

## **📝 Lisans**

MIT Lisansı

---

Bu uygulama, **Playable Factory Software Engineer** pozisyonu için teknik değerlendirme amacıyla oluşturulmuştur.

