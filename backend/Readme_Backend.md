# Playable Factory - AI Destekli Todo Uygulaması Dokümantasyonu

## 1. Proje Genel Bakış
Bu proje, Playable Factory şirketindeki Software Engineer pozisyonu için hazırlanmış, MERN (MongoDB, Express.js, React.js, Node.js) stack yapısında geliştirilmiş bir todo uygulamasıdır. Yapay zeka destekli öneri sistemleri ve modern web teknolojileri ile geliştirilmiş olan bu uygulama, kullanıcı deneyimini zenginleştirmeyi amaçlamaktadır.

---

## 2. Teknik Altyapı

### 2.1 Backend Teknolojileri
- **Node.js & Express.js**: Web sunucusu ve RESTful API endpointleri.
- **MongoDB**: NoSQL veritabanı.
- **Mongoose**: MongoDB için ODM kütüphanesi.
- **JWT**: Kullanıcı kimlik doğrulama.
- **Multer**: Dosya yükleme işlemleri.
- **OpenAI API**: Yapay zeka destekli akıllı öneriler.

### 2.2 Proje Yapısı
- `controllers/`
- `routes/`
- `models/`
- `middleware/`
- `services/openaiService.js`
- `tests/test-openai.js`

---

## 3. Temel Özellikler

### 3.1 Kullanıcı Yönetimi
- Kullanıcı kaydı ve giriş işlemleri
- JWT tabanlı kimlik doğrulama
- Güvenli parola şifreleme

### 3.2 Todo İşlemleri
- CRUD (oluştur, listele, güncelle, sil)
- Kullanıcıya özel listeleme
- Tarih bazlı sıralama
- Resim yükleme ve yönetme

### 3.3 AI Destekli Özellikler
- Başlık ve açıklamaya göre akıllı öneri oluşturma
- OpenAI API üzerinden öneri üretimi
- Hata durumlarında yerel öneri sistemine geçiş

---

## 4. API Endpoints

### 4.1 Auth Routes
- `POST /api/auth/register` → Yeni kullanıcı oluşturma
- `POST /api/auth/login` → Kullanıcı girişi
- `GET /api/auth/me` → Kullanıcı bilgilerini getirme

### 4.2 Todo Routes
- `GET /api/todos` → Todo listesi
- `POST /api/todos` → Yeni todo oluşturma
- `GET /api/todos/:id` → Tekil todo getir
- `PUT /api/todos/:id` → Todo güncelle
- `DELETE /api/todos/:id` → Todo sil

---

## 5. Güvenlik Özellikleri
- JWT kimlik doğrulama
- Route koruma (middleware)
- Dosya yükleme güvenliği
- Input validasyonu
- Global hata yönetimi

---

## 6. Deployment ve Konfigürasyon
- Vercel ve alternatif cloud servislerle uyumluluk
- `dotenv` ile environment variable yönetimi
- Production ve development ayrımı
- CORS konfigürasyonu

---

## 7. Özel Özellikler
- Resim yükleme ve yönetimi
- OpenAI destekli öneri sistemi
- Otomatik dosya temizleme
- Detaylı loglama

---

## 8. Geliştirme Süreci
- GitHub Copilot kullanımı
- Temiz kod yazımı ve modüler yapı
- Modern JS pratikleri

---

## 9. Performans Optimizasyonları
- Veritabanı sorgularında indeksleme
- Yüklenen dosyalarda optimizasyon
- Loglama ile hata yönetimi
- Bellek ve kaynak kontrolü

---

# OpenAI Entegrasyonu ve AI Destekli Özellikler

## 1. OpenAI Servis Mimarisi

### 1.1 `openaiService.js`
- OpenAI API entegrasyonu
- Başlık ve açıklamaya göre öneri üretme
- Otomatik kategori belirleme
- Hata durumunda local öneri sistemine geçiş

### 1.2 `test-openai.js`
- Servis testleri
- API anahtarı kontrolü
- Hata senaryolarını simüle etme

---

## 2. OpenAI API Entegrasyonu

### 2.1 Konfigürasyon
- OpenAI API anahtarı `.env` dosyasından alınır

### 2.2 API Güvenliği
- Anahtar geçerlilik kontrolü
- Hatalarda fallback sistemi

---

## 3. Öneri Sistemi Özellikleri

### 3.1 Otomatik Kategori Tespiti
Kategori örnekleri:
- İş ve Proje Görevleri
- Toplantılar
- Alışveriş
- Öğrenme
- Fitness
- Kodlama, E-posta, Yazı Yazma, Yemek, Tasarım, Seyahat

### 3.2 Öneri Üretme Süreci
- Başlık ve açıklama analizi
- Kategoriye göre prompt oluşturma
- API çağrısı → response parsing
- Hata durumunda yerel JSON önerilere geçiş

### 3.3 Öneri Formatı
- `title`, `suggestions[]`, `category`

---

## 4. Hata Yönetimi ve Yedekleme

### 4.1 Hata Senaryoları
- API bağlantı hataları
- Geçersiz API key
- Kota aşımı
- Yanıtsız çağrılar

### 4.2 Yerel Öneri Sistemi
- 10-12 öneri/kategori
- Türkçe dilinde
- Rastgele seçim ile öneri döndürme

---

## 5. Test Sistemi

### 5.1 Test Özellikleri
- Environment doğrulaması
- API test çağrısı
- Kapsamlı hata yakalama

### 5.2 Test Çıktıları
- Başarılı öneri listesi
- Fallback çıktısı

---

## 6. Performans Optimizasyonları

### 6.1 API Kullanımı
- Token limiti takibi
- İstek sayısı kontrolü
- Gerekirse response cache mekanizması

### 6.2 Yerel Sistem
- Minimum latency
- API dışı çalışma kabiliyeti

---

## 7. Güvenlik Önlemleri

### 7.1 API Güvenliği
- .env ile gizleme
- Hatalarda key loglamama

### 7.2 Veri Güvenliği
- Response sanitizasyonu
- Input doğrulama

---

## 8. Kullanım Örnekleri

### 8.1 Todo Oluşturma
```json
{
  "title": "Spor Salonu Planı",
  "description": "Bu hafta 4 gün antrenman yapacağım"
}
```

### 8.2 Test Çalıştırma
```bash
node tests/test-openai.js
```

---




