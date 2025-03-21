# CI/CD ve Test Otomasyonu Kılavuzu

Bu belge, MERN To-Do uygulaması için CI/CD yapılandırması ve otomatik test süreçlerini açıklar.

## CI/CD Yapılandırması

### GitHub Actions

GitHub Actions kullanarak CI/CD pipeline oluşturmak için aşağıdaki yapılandırmayı kullanabilirsiniz. Bu pipeline:

1. Kodunuzu test eder
2. Docker imajlarını oluşturur
3. İmajları Container Registry'ye gönderir
4. (Opsiyonel) Otomatik deployment yapar

`.github/workflows/main.yml` dosyasını repository'nizde oluşturun:

```yaml
name: MERN To-Do App CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [14.x, 16.x]
        mongodb-version: [4.4]

    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v2
      with:
        node-version: ${{ matrix.node-version }}
        
    - name: Start MongoDB
      uses: supercharge/mongodb-github-action@1.7.0
      with:
        mongodb-version: ${{ matrix.mongodb-version }}
        
    - name: Install backend dependencies
      run: |
        cd backend
        npm ci
        
    - name: Run backend tests
      run: |
        cd backend
        npm test
      env:
        CI: true
        JWT_SECRET: test_jwt_secret
        NODE_ENV: test
        
    - name: Install frontend dependencies
      run: |
        cd frontend
        npm ci
        
    - name: Run frontend tests
      run: |
        cd frontend
        npm test
      env:
        CI: true

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop')
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v1
      
    - name: Login to GitHub Container Registry
      uses: docker/login-action@v1
      with:
        registry: ghcr.io
        username: ${{ github.repository_owner }}
        password: ${{ secrets.GITHUB_TOKEN }}
        
    - name: Build and push backend Docker image
      uses: docker/build-push-action@v2
      with:
        context: .
        file: ./Dockerfile-backend
        push: true
        tags: |
          ghcr.io/${{ github.repository_owner }}/todo-app-backend:latest
          ghcr.io/${{ github.repository_owner }}/todo-app-backend:${{ github.sha }}
          
    - name: Build and push frontend Docker image
      uses: docker/build-push-action@v2
      with:
        context: .
        file: ./Dockerfile-frontend
        push: true
        tags: |
          ghcr.io/${{ github.repository_owner }}/todo-app-frontend:latest
          ghcr.io/${{ github.repository_owner }}/todo-app-frontend:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to production server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USERNAME }}
        key: ${{ secrets.SERVER_SSH_KEY }}
        script: |
          cd /path/to/app
          docker-compose pull
          docker-compose up -d
```

## Otomatik Test Yapılandırması

### Backend Testleri

Backend için test yapılandırması: `backend/package.json` dosyasında test scriptinizi yapılandırın:

```json
{
  "scripts": {
    "test": "jest --forceExit"
  },
  "devDependencies": {
    "jest": "^27.0.6",
    "supertest": "^6.1.3"
  }
}
```

`backend/test` klasörü oluşturun ve test dosyalarınızı ekleyin:

#### API Testi Örneği

`backend/test/todo.test.js`:

```javascript
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Todo = require('../models/Todo');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let token;
let userId;

beforeAll(async () => {
  // Test veritabanı bağlantısı
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  // Test kullanıcısı oluşturma
  await User.deleteMany({});
  const user = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  });
  
  userId = user._id;
  
  // Test token'ı oluşturma
  token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test_jwt_secret', {
    expiresIn: '1h'
  });
});

afterAll(async () => {
  await User.deleteMany({});
  await Todo.deleteMany({});
  await mongoose.connection.close();
});

describe('Todo API Testleri', () => {
  it('Yeni bir todo oluşturabilmeli', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Todo',
        description: 'Bu bir test todo\'sudur'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toEqual('Test Todo');
  });
  
  it('Tüm todoları listeleyebilmeli', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
  
  // Daha fazla test...
});
```

### Frontend Testleri

Frontend için test yapılandırması: `frontend/src/test` klasörü oluşturun:

#### Bileşen Testi Örneği

`frontend/src/test/TodoList.test.tsx`:

```typescript
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import TodoList from '../components/TodoList';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TodoList Component', () => {
  const mockTodos = [
    { _id: '1', title: 'Test Todo 1', description: 'Test Description 1', completed: false, user: '123' },
    { _id: '2', title: 'Test Todo 2', description: 'Test Description 2', completed: true, user: '123' }
  ];

  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({ data: mockTodos });
  });

  it('Todoları yükleyip görüntüleyebilmeli', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TodoList />
        </AuthProvider>
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    });
  });

  it('Todo tamamlandı olarak işaretlenebilmeli', async () => {
    mockedAxios.put.mockResolvedValue({ 
      data: { ...mockTodos[0], completed: true } 
    });
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <TodoList />
        </AuthProvider>
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });
    
    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/todos/1'),
        expect.objectContaining({ completed: true })
      );
    });
  });
  
  // Daha fazla test...
});
```

## Jest Yapılandırması

Her iki alt projede de `jest.config.js` dosyası oluşturun:

### Backend Jest Yapılandırması

`backend/jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageReporters: ['text', 'lcov', 'clover'],
  testTimeout: 10000
};
```

### Frontend Jest Yapılandırması

`frontend/jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/test/__mocks__/fileMock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  testMatch: ['**/test/**/*.test.tsx', '**/test/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
    '!src/react-app-env.d.ts'
  ]
};
```

### Frontend Test Kurulum Dosyası

`frontend/src/test/setupTests.ts`:

```typescript
import '@testing-library/jest-dom';
```

## E2E Testler (Cypress)

End-to-end test için Cypress kullanabilirsiniz:

1. Cypress'i kurun:

```bash
cd frontend
npm install cypress --save-dev
```

2. `frontend/cypress.json` dosyasını oluşturun:

```json
{
  "baseUrl": "http://localhost:3000",
  "viewportWidth": 1280,
  "viewportHeight": 800,
  "video": false
}
```

3. `frontend/cypress/integration/todo.spec.js` dosyasını oluşturun:

```javascript
describe('To-Do Uygulaması Testi', () => {
  beforeEach(() => {
    // Test kullanıcısıyla giriş yapma
    cy.visit('/login');
    cy.get('input[name=email]').type('test@example.com');
    cy.get('input[name=password]').type('password123');
    cy.get('button[type=submit]').click();
    
    // Başarılı girişi bekle
    cy.url().should('include', '/');
  });

  it('Yeni görev ekleyebilmeli', () => {
    const todoTitle = 'Cypress Test Todo';
    
    cy.get('input[placeholder="Görev başlığı"]').type(todoTitle);
    cy.get('textarea[placeholder="Açıklama"]').type('Cypress ile test ediliyor');
    cy.get('button').contains('Ekle').click();
    
    // Yeni görevin listeye eklendiğini kontrol et
    cy.contains(todoTitle).should('be.visible');
  });

  it('Görevi tamamlanmış olarak işaretleyebilmeli', () => {
    // İlk görevi bul ve işaretle
    cy.get('.todo-item').first().within(() => {
      cy.get('input[type=checkbox]').click();
    });
    
    // Tamamlanmış görevlerin stilini kontrol et
    cy.get('.todo-item').first().should('have.class', 'completed');
  });
  
  // Daha fazla test...
});
```

4. E2E test çalıştırma scripti ekleyin (`frontend/package.json`):

```json
{
  "scripts": {
    "e2e": "cypress open",
    "e2e:run": "cypress run"
  }
}
```

## Test ve Dağıtım Stratejisi

### Önerilen Geliştirme İş Akışı

1. **Feature Branch Workflow**:
   - Her yeni özellik için ana repodan bir dal (branch) oluşturun
   - Özellik tamamlandığında pull request açın
   - CI testleri geçtikten sonra kodunuzu ana dala birleştirin

2. **Test Stratejisi**:
   - Birim Testleri: İzole fonksiyonlar ve bileşenler
   - Entegrasyon Testleri: API endpoint'leri ve veri akışı
   - E2E Testleri: Cypress ile tam kullanıcı deneyimi

3. **Dağıtım Stratejisi**:
   - **Development**: Her pull request otomatik olarak test edilir
   - **Staging**: Her main dalı güncellemesi test ortamına dağıtılır
   - **Production**: Manuel onay ile production sunucusuna dağıtılır

## Sürekli İzleme ve Raporlama

1. **Test Kapsamı Raporlama**:
   ```bash
   npm run test -- --coverage
   ```

2. **Entegrasyon ile Kalite İzleme**:
   - SonarQube veya CodeClimate ile kod kalitesi izleme
   - GitHub Actions ile entegre edilir

3. **Performans İzleme**:
   - Lighthouse CI ile frontend performans ölçümleri
   - Backend API yanıt süresi ölçümleri

---

Bu kılavuz, projeniz için sürekli entegrasyon ve test otomasyonu uygulamanıza yardımcı olmak için tasarlanmıştır. İş akışınıza ve gereksinimlerinize göre değişiklikler yapabilirsiniz.

Furkan Akar (CotNeo) 