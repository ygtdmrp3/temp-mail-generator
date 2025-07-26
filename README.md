# 📧 Temp Mail Generator Chrome Uzantısı

Temp-mail.org benzeri bir Chrome uzantısı. Geçici e-posta adresleri oluşturur ve gelen e-postaları görüntüler.

## ✨ Özellikler

- 🚀 **Hızlı E-posta Oluşturma**: Tek tıkla geçici e-posta adresi oluşturun
- 📋 **Kolay Kopyalama**: E-posta adresini panoya kopyalayın
- 🏠 **Kendi Mail Sunucusu**: Tamamen kontrol edilebilir mail sistemi
- 📥 **Gerçek E-posta Alma**: Mail.tm API'si ve kendi sunucumuz ile gerçek e-postalar alın
- 🎯 **Otomatik Doldurma**: Web sayfalarındaki e-posta alanlarını otomatik doldurun
- 🔄 **Otomatik Yenileme**: Gelen kutusu otomatik olarak yenilenir
- 💾 **Veri Saklama**: E-posta adresleri ve e-postalar yerel olarak saklanır
- 📧 **E-posta Detayları**: E-postaları modal'da detaylı görüntüleyin
- 🔔 **Bildirimler**: Yeni e-posta geldiğinde bildirim alın
- 🛠️ **SMTP Sunucusu**: Kendi mail sunucunuz ile tam kontrol

## 🛠️ Kurulum

### 1. Mail Sunucusunu Başlatın

```bash
# Server klasörüne gidin
cd server

# Bağımlılıkları yükleyin
npm install

# Mail sunucusunu başlatın
npm start
```

Sunucu başladıktan sonra:
- **SMTP Sunucusu**: `localhost:2525`
- **API Sunucusu**: `http://localhost:3000`

### 2. Chrome Uzantısını Yükleyin

1. Bu projeyi bilgisayarınıza indirin
2. Chrome tarayıcınızı açın
3. Adres çubuğuna `chrome://extensions/` yazın
4. Sağ üst köşedeki "Geliştirici modu"nu açın
5. "Paketlenmemiş öğe yükle" butonuna tıklayın
6. Proje klasörünü seçin

## 📁 Dosya Yapısı

```
temp-mail-generator/
├── manifest.json          # Uzantı konfigürasyonu
├── popup.html             # Ana arayüz
├── popup.css              # Arayüz stilleri
├── popup.js               # Arayüz fonksiyonları
├── background.js          # Arka plan işlemleri
├── content.js             # Web sayfası entegrasyonu
├── icons/                 # Uzantı ikonları
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # Bu dosya
```

## 🎮 Kullanım

### Ana Arayüz
- **Yeni E-posta Oluştur**: Yeni bir geçici e-posta adresi oluşturur
- **Gelen Kutusunu Yenile**: Gelen e-postaları kontrol eder
- **Kopyala**: Mevcut e-posta adresini panoya kopyalar
- **Tüm Verileri Temizle**: Tüm verileri siler

### Web Sayfası Entegrasyonu
- E-posta alanlarına odaklandığınızda geçici e-posta önerisi görünür
- E-posta alanına sağ tıklayarak menü açabilirsiniz:
  - **Yeni Geçici E-posta Oluştur**: Yeni e-posta oluşturur ve alanı doldurur
  - **Mevcut E-postayı Kopyala**: Mevcut e-postayı panoya kopyalar
  - **E-postayı Doldur**: Mevcut e-postayı alana doldurur

## 🔧 Geliştirme

### Kendi Mail Sunucumuz

Bu uzantı artık **kendi mail sunucumuzu** kullanarak gerçek e-postalar alır. Desteklenen domainler:

- tempmail.local
- tempemail.local
- testmail.local

### API Endpoints

```javascript
// E-posta listesi alma
const apiUrl = `http://localhost:3000/api/emails/${email}`;

// E-posta detayı alma
const detailUrl = `http://localhost:3000/api/email/${emailId}`;

// Sunucu durumu kontrol
const healthUrl = `http://localhost:3000/api/health`;
```

### Test E-postası Gönderme

```bash
# Test e-postası gönder
node test-email.js test@tempmail.local
```

### SMTP Sunucusu

Kendi SMTP sunucumuz `localhost:2525` portunda çalışır ve tüm e-postaları SQLite veritabanında saklar.

## 🚀 Gelecek Özellikler

- [x] ✅ Gerçek temp-mail API entegrasyonu (1secmail.com)
- [ ] E-posta filtreleme ve arama
- [ ] E-posta şablonları
- [ ] Otomatik e-posta silme
- [ ] Çoklu e-posta adresi desteği
- [x] ✅ E-posta bildirimleri
- [ ] Dark mode desteği
- [ ] E-posta eklerini indirme
- [ ] E-posta yanıtlama
- [ ] E-posta iletme

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Bu projeyi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## ⚠️ Uyarı

Bu uzantı **1secmail.com API'si** kullanarak gerçek e-postalar alır. Kullanım koşullarına uygun olarak kullanın.

---

**Not**: Bu uzantı artık gerçek e-postalar alabilir! 1secmail.com servisini kullanarak geçici e-posta adresleri oluşturur ve gelen e-postaları görüntüler. 