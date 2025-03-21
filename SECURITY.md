# Güvenlik Yapılandırması ve Önerileri

Bu belge, MERN To-Do uygulamasını güvenli bir şekilde yapılandırmak ve dağıtmak için öneriler içerir.

## Temel Güvenlik Pratikleri

### 1. Ortam Değişkenleri

- `.env` dosyalarını asla Git repositorysinde saklamayın
- Production ortamında, ortam değişkenlerini doğrudan sunucu konfigürasyonunda saklayın
- Tüm hassas bilgileri (API anahtarları, JWT secretleri, veritabanı şifreleri) ortam değişkenlerinde saklayın

### 2. JWT Güvenliği

- Güçlü ve uzun bir JWT secret kullanın (en az 32 karakter)
- Token süresi sınırlaması ekleyin (örneğin 1 saat)
- Gerekirse yenileme (refresh) token mekanizması ekleyin
- Token'ları güvenli (secure) ve HTTPOnly çerezlerde saklayın

```javascript
// JWT süre sınırlaması örneği (backend/routes/authRoutes.js)
const token = jwt.sign(
  { id: user._id }, 
  process.env.JWT_SECRET, 
  { expiresIn: '1h' }
);
```

### 3. API Güvenliği

- Rate limiting ekleyin
- CORS politikasını doğru yapılandırın
- API anahtarını geçersiz kılma (revocation) mekanizması ekleyin

```javascript
// Rate limiting ekleme örneği (backend/server.js)
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // 15 dakika içinde IP başına 100 istek
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
```

### 4. Veritabanı Güvenliği

- MongoDB kullanıcı kimlik doğrulaması etkinleştirin
- Veritabanını güvenli bir ağ içinde tutun
- MongoDB'yi internete açık hale getirmeyin
- Düzenli yedeklemeler alın

### 5. HTTP Güvenliği

- HTTPS kullanın
- HTTP güvenlik başlıklarını ekleyin (helmet.js ile)

```javascript
// Helmet kullanım örneği (backend/server.js)
const helmet = require('helmet');
app.use(helmet());
```

## SSL Yapılandırması

### Let's Encrypt ile SSL Sertifikası Oluşturma

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Self-Signed Sertifika Oluşturma (Sadece Geliştirme İçin)

```bash
# OpenSSL ile self-signed sertifika oluşturma
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/private.key -out ssl/certificate.crt
```

### Nginx ile SSL Yapılandırması

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL ayarları
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS (15768000 seconds = 6 ay)
    add_header Strict-Transport-Security "max-age=15768000; includeSubDomains" always;
    
    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # For larger file uploads (if needed)
    client_max_body_size 10M;
}

# HTTP'den HTTPS'e yönlendirme
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}
```

## Dosya Yükleme Güvenliği

- Yüklenen dosya tiplerini sınırlayın
- Dosya boyutunu sınırlayın
- Dosya adlarını randomize edin
- Güvenli bir dosya saklama konumu kullanın

```javascript
// Backend dosya yükleme güvenliği örneği (multer)
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Depolama yapılandırması
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    // Rastgele dosya adı oluşturma
    crypto.randomBytes(16, (err, buffer) => {
      if (err) return cb(err);
      const filename = buffer.toString('hex') + path.extname(file.originalname);
      cb(null, filename);
    });
  }
});

// Dosya filtresi
const fileFilter = (req, file, cb) => {
  // İzin verilen dosya tipleri
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Geçersiz dosya tipi. Sadece JPEG, PNG ve GIF dosyaları yüklenebilir.'), false);
  }
};

// Yükleme middleware'i
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});
```

## Üretim Ortamında Güvenli Dağıtım Kontrol Listesi

- [x] Tüm hassas bilgiler ortam değişkenlerinde
- [ ] HTTPS yapılandırıldı
- [ ] Rate limiting etkinleştirildi
- [ ] HTTP güvenlik başlıkları (helmet.js) eklendi
- [ ] MongoDB kimlik doğrulaması etkinleştirildi
- [ ] Dosya yükleme güvenliği yapılandırıldı
- [ ] Güncel NPM paketleri kullanılıyor
- [ ] Periyodik yedekleme sistemi kuruldu
- [ ] İzleme ve loglama sistemi kuruldu

---

Bu belge, güvenlik iyi pratiklerini içermektedir ve sürekli olarak güncellenmelidir. Güvenlik ile ilgili herhangi bir sorunuzu ya da önerinizi lütfen iletişime geçerek paylaşın.

Furkan Akar (CotNeo) 