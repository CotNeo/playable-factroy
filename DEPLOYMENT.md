# Dağıtım Kılavuzu - MERN To-Do Uygulaması

Bu belge, MERN To-Do uygulamasının dağıtımı için adımları ve yapılandırmaları içerir.

## Ön Koşullar

- Node.js (v14+)
- MongoDB (yerel veya Atlas)
- Git
- (Opsiyonel) Docker ve Docker Compose

## Dağıtım Yöntemleri

### 1. Manuel Dağıtım (Standart)

#### Backend ve Frontend'i Birlikte Dağıtma

1. Repo'yu klonlayın
   ```bash
   git clone <repo_url>
   cd mern-todo-app
   ```

2. Frontend build'ini oluşturun
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

3. Backend'i yapılandırın
   ```bash
   cd backend
   npm install
   
   # .env.example dosyasını .env olarak kopyalayın ve düzenleyin
   cp .env.example .env
   nano .env  # veya tercih ettiğiniz metin editörünü kullanın
   ```

4. `.env` dosyasını düzenleyin:
   - `NODE_ENV=production` olarak ayarlayın
   - `MONGODB_URI` değişkenini MongoDB bağlantı bilgilerinizle güncelleyin
   - `JWT_SECRET` için güçlü bir şifre oluşturun
   - `OPENAI_API_KEY` için API anahtarınızı girin (opsiyonel, olmasa da yerel öneriler çalışır)

5. Uygulamayı başlatın
   ```bash
   npm start
   ```

Uygulama artık `http://localhost:5001` adresinde çalışıyor olacaktır.

#### Sadece Backend Dağıtma (Frontend Ayrı Sunucuda)

1. Backend klasörünü kopyalayın ve bağımlılıkları yükleyin
   ```bash
   cd backend
   npm install
   ```

2. `.env.example` dosyasını `.env` olarak kopyalayın ve düzenleyin
   ```bash
   cp .env.example .env
   nano .env
   ```

3. `.env` içinde aşağıdaki değişiklikleri yapın:
   - `CORS_ORIGIN` değişkenini frontend'in URL'si ile ayarlayın
   - MongoDB, JWT ve OpenAI ayarlarını yapın

4. Sunucuyu başlatın
   ```bash
   npm start
   ```

#### Sadece Frontend Dağıtma (Backend Ayrı Sunucuda)

1. Frontend klasörünü kopyalayın ve bağımlılıkları yükleyin
   ```bash
   cd frontend
   npm install
   ```

2. API URL'sini ayarlayın (`.env` dosyası oluşturun)
   ```bash
   echo "REACT_APP_API_URL=https://your-backend-url.com/api" > .env
   ```

3. Production build oluşturun
   ```bash
   npm run build
   ```

4. `build` klasörünü statik dosya sunucunuza kopyalayın
   - Nginx, Apache veya diğer web sunucularını kullanabilirsiniz
   - Veya Netlify, Vercel gibi hosting hizmetlerini kullanabilirsiniz

### 2. Docker ile Dağıtım

#### Docker Compose ile (Tavsiye Edilen)

1. Repo'yu klonlayın
   ```bash
   git clone <repo_url>
   cd mern-todo-app
   ```

2. `docker-compose.yml` dosyasını oluşturun (aşağıdaki Docker Compose bölümüne bakın)

3. `.env` dosyasını oluşturun (backend için)
   ```bash
   cp backend/.env.example backend/.env
   nano backend/.env
   ```

4. Docker Compose ile çalıştırın
   ```bash
   docker-compose up -d
   ```

Uygulama `http://localhost:5001` adresinde çalışmaya başlayacaktır.

## Docker Yapılandırması

### Backend için Dockerfile

Proje kök dizininde bir `Dockerfile-backend` dosyası oluşturun:

```dockerfile
FROM node:16-alpine

WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY backend/package*.json ./
RUN npm install

# Uygulama kodunu kopyala
COPY backend/ ./

# Uploads klasörünü oluştur
RUN mkdir -p uploads

# Port'u aç
EXPOSE 5001

# Sunucuyu başlat
CMD ["npm", "start"]
```

### Frontend için Dockerfile

Proje kök dizininde bir `Dockerfile-frontend` dosyası oluşturun:

```dockerfile
FROM node:16-alpine as build

WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY frontend/package*.json ./
RUN npm install

# Uygulama kodunu kopyala
COPY frontend/ ./

# Production build oluştur
RUN npm run build

# Nginx ile sunmak için
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

Proje kök dizininde bir `docker-compose.yml` dosyası oluşturun:

```yaml
version: '3'

services:
  mongodb:
    image: mongo:latest
    container_name: todo-app-mongodb
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"
    networks:
      - app-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile-backend
    container_name: todo-app-backend
    restart: always
    env_file:
      - backend/.env
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/todo-app
      - NODE_ENV=production
    ports:
      - "5001:5001"
    volumes:
      - ./backend/uploads:/app/uploads
    depends_on:
      - mongodb
    networks:
      - app-network

  frontend:
    build:
      context: .
      dockerfile: Dockerfile-frontend
    container_name: todo-app-frontend
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mongo-data:
```

## PM2 ile Dağıtım

Node.js uygulamalarını process manager ile çalıştırmak daha güvenlidir. PM2 ile dağıtım yapmak için:

1. PM2'yi global olarak yükleyin
   ```bash
   npm install -g pm2
   ```

2. Uygulama için bir `ecosystem.config.js` dosyası oluşturun
   ```bash
   cd backend
   touch ecosystem.config.js
   ```

3. `ecosystem.config.js` dosyasını düzenleyin:
   ```javascript
   module.exports = {
     apps: [
       {
         name: "todo-app",
         script: "server.js",
         instances: "max",
         exec_mode: "cluster",
         env: {
           NODE_ENV: "production",
           PORT: 5001
         }
       }
     ]
   };
   ```

4. PM2 ile uygulamayı başlatın
   ```bash
   pm2 start ecosystem.config.js
   ```

5. (Opsiyonel) Sunucu yeniden başlatıldığında uygulamanın otomatik başlaması için:
   ```bash
   pm2 startup
   pm2 save
   ```

## Nginx ile Ters Proxy Yapılandırması

Production ortamında Nginx ile ters proxy kullanmak performans ve güvenlik açısından önerilir:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # For larger file uploads (if needed)
    client_max_body_size 10M;
}
```

## SSL Yapılandırması (HTTPS)

Certbot ve Let's Encrypt ile ücretsiz SSL sertifikası alabilirsiniz:

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Periyodik Yedekleme

MongoDB'nizdeki verileri düzenli olarak yedeklemek için bir cron job oluşturun:

```bash
# /etc/cron.d/mongodb-backup dosyasını oluşturun
echo "0 0 * * * root mongodump --uri=\"mongodb://localhost:27017/todo-app\" --out=/backup/mongodb/\$(date +\%Y-\%m-\%d)" | sudo tee /etc/cron.d/mongodb-backup
```

Bu, her gece 00:00'da MongoDB veritabanınızın yedeğini alacaktır.

---

Bu belgede soruların veya geliştirmelerin varsa, lütfen iletişime geçin.

Furkan Akar (CotNeo) 