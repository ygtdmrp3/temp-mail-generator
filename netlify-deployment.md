# 🚀 Netlify ile Canlıya Alma Rehberi

## ⚠️ Netlify Kısıtlamaları

Netlify **statik site hosting** yapar, bu yüzden:
- ❌ SMTP sunucusu çalıştıramayız
- ❌ Node.js backend çalıştıramayız
- ❌ Veritabanı çalıştıramayız

## 🎯 Çözüm Seçenekleri

### Seçenek 1: Netlify + Ücretsiz Backend Servisleri

#### 1.1 Render.com (Ücretsiz Backend)
```bash
# Render.com'da ücretsiz hesap oluşturun
# Node.js backend'i deploy edin
# SMTP sunucusu çalıştırın
```

#### 1.2 Railway.app (Ücretsiz Backend)
```bash
# Railway.app'de ücretsiz hesap oluşturun
# Node.js backend'i deploy edin
# SMTP sunucusu çalıştırın
```

#### 1.3 Heroku (Ücretsiz Backend)
```bash
# Heroku'da ücretsiz hesap oluşturun
# Node.js backend'i deploy edin
# SMTP sunucusu çalıştırın
```

### Seçenek 2: Netlify + Ücretsiz Mail API'leri

#### 2.1 Mailgun (Ücretsiz Tier)
```javascript
// Mailgun API kullanımı
const mailgun = require('mailgun-js')({
  apiKey: 'YOUR_MAILGUN_API_KEY',
  domain: 'your-domain.com'
});
```

#### 2.2 SendGrid (Ücretsiz Tier)
```javascript
// SendGrid API kullanımı
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('YOUR_SENDGRID_API_KEY');
```

#### 2.3 Mailtrap (Ücretsiz Tier)
```javascript
// Mailtrap API kullanımı
const mailtrap = require('mailtrap')({
  apiKey: 'YOUR_MAILTRAP_API_KEY'
});
```

## 🔧 Netlify Deployment Adımları

### Adım 1: Netlify Hesabı Oluşturma
1. [netlify.com](https://netlify.com) adresine gidin
2. GitHub ile giriş yapın
3. Yeni site oluşturun

### Adım 2: Proje Yapısını Düzenleme
```
temp-mail-extension/
├── public/                 # Netlify static files
│   ├── index.html         # Ana sayfa
│   ├── manifest.json      # Chrome extension
│   ├── popup.html
│   ├── popup.css
│   ├── popup.js
│   ├── background.js
│   ├── content.js
│   └── icons/
├── server/                # Backend (Render/Railway/Heroku)
│   ├── server.js
│   ├── package.json
│   └── ...
└── netlify.toml          # Netlify config
```

### Adım 3: Netlify Konfigürasyonu
```toml
# netlify.toml
[build]
  publish = "public"
  command = "echo 'Static site build complete'"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.com/api/:splat"
  status = 200

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/json"

[[headers]]
  for = "/*.js"
  [headers.values]
    Content-Type = "application/javascript"

[[headers]]
  for = "/*.css"
  [headers.values]
    Content-Type = "text/css"
```

### Adım 4: Ana Sayfa Oluşturma
```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temp Mail Generator</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        .download-btn {
            background: #4CAF50;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 10px;
        }
        .download-btn:hover {
            background: #45a049;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📧 Temp Mail Generator</h1>
        <p>Geçici e-posta adresleri oluşturun ve gelen e-postaları görüntüleyin.</p>
        
        <h2>🚀 Özellikler</h2>
        <ul>
            <li>✅ Hızlı e-posta oluşturma</li>
            <li>✅ Gerçek e-posta alma</li>
            <li>✅ Otomatik doldurma</li>
            <li>✅ E-posta detayları</li>
            <li>✅ Bildirimler</li>
        </ul>
        
        <h2>📥 Chrome Uzantısını İndirin</h2>
        <a href="/temp-mail-extension.zip" class="download-btn">
            📦 Uzantıyı İndir
        </a>
        
        <h2>🔧 Kurulum</h2>
        <ol>
            <li>Chrome'da <code>chrome://extensions/</code> adresine gidin</li>
            <li>"Geliştirici modu"nu açın</li>
            <li>"Paketlenmemiş öğe yükle" butonuna tıklayın</li>
            <li>İndirdiğiniz klasörü seçin</li>
        </ol>
        
        <h2>📧 Kullanım</h2>
        <ol>
            <li>Uzantıyı açın</li>
            <li>"Yeni E-posta Oluştur" butonuna tıklayın</li>
            <li>Oluşturulan e-posta adresini kopyalayın</li>
            <li>Web sitelerinde kullanın</li>
            <li>"Gelen Kutusunu Yenile" ile e-postaları kontrol edin</li>
        </ol>
    </div>
</body>
</html>
```

## 🚀 Backend Deployment (Render.com)

### Adım 1: Render.com Hesabı
1. [render.com](https://render.com) adresine gidin
2. GitHub ile giriş yapın
3. "New Web Service" seçin

### Adım 2: Backend Deploy
```bash
# GitHub'a projeyi push edin
git add .
git commit -m "Add backend for Netlify deployment"
git push origin main
```

### Adım 3: Render Konfigürasyonu
```yaml
# render.yaml
services:
  - type: web
    name: temp-mail-backend
    env: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: SMTP_PORT
        value: 2525
```

### Adım 4: Environment Variables
```bash
# Render dashboard'da environment variables ekleyin
NODE_ENV=production
PORT=3000
SMTP_PORT=2525
DOMAIN=your-domain.com
```

## 🔧 Chrome Uzantısı Güncelleme

### manifest.json
```json
{
  "host_permissions": [
    "https://your-backend-url.onrender.com/*",
    "https://your-netlify-site.netlify.app/*"
  ]
}
```

### popup.js
```javascript
// Backend URL'ini güncelle
const BACKEND_URL = 'https://your-backend-url.onrender.com';

async tryCustomMailServer(email) {
    try {
        const apiUrl = `${BACKEND_URL}/api/emails/${encodeURIComponent(email)}`;
        // ... rest of the code
    } catch (error) {
        console.error('Backend hatası:', error);
        return [];
    }
}
```

## 📦 Uzantı Paketleme

### Adım 1: ZIP Dosyası Oluşturma
```bash
# Chrome uzantısı dosyalarını ZIP'leyin
zip -r temp-mail-extension.zip manifest.json popup.html popup.css popup.js background.js content.js icons/
```

### Adım 2: Netlify'e Yükleme
```bash
# ZIP dosyasını public/ klasörüne koyun
cp temp-mail-extension.zip public/
```

## ✅ Netlify Deployment Tamamlandı!

### Avantajları:
- ✅ **Ücretsiz hosting**
- ✅ **Otomatik SSL**
- ✅ **CDN desteği**
- ✅ **Git entegrasyonu**
- ✅ **Kolay deployment**

### Dezavantajları:
- ❌ **SMTP sunucusu yok** (backend gerekli)
- ❌ **Veritabanı yok** (backend gerekli)
- ❌ **Backend ayrı servis** gerekli

## 🎯 Sonuç

Netlify ile canlıya alabilirsiniz, ancak:
1. **Backend için ayrı servis** gerekli (Render/Railway/Heroku)
2. **SMTP sunucusu** backend'de çalışacak
3. **Chrome uzantısı** backend'e bağlanacak

Bu şekilde ücretsiz olarak canlıya alabilirsiniz! 🚀 