# Email Testing Guide

## Problem
Gerçek e-postalar düşmüyor çünkü SMTP sunucusu eksikti. Şimdi düzeltildi!

## Çözüm
1. SMTP sunucusu eklendi (port 2525)
2. Gerçek e-postaları alıp veritabanına kaydediyor
3. Test e-postaları gönderebiliyoruz

## Test Adımları

### 1. Sunucuyu Başlat
```bash
cd server
npm install
npm start
```

Sunucu başladığında şu mesajları görmelisiniz:
- `API Server running on port 3000`
- `SMTP Server running on port 2525`

### 2. Test E-postası Gönder
```bash
# Yeni terminal açın
cd server
node test-real-email.js smart_demo_4843@deneme.4bey.com
```

### 3. Chrome Uzantısında Kontrol Et
1. Chrome uzantısını açın
2. "Gelen Kutusunu Yenile" butonuna tıklayın
3. Gerçek e-postayı görmelisiniz!

## Hata Ayıklama

### Eğer e-postalar hala gelmiyorsa:

1. **Sunucu çalışıyor mu?**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **SMTP sunucusu çalışıyor mu?**
   ```bash
   telnet localhost 2525
   ```

3. **Veritabanında e-postalar var mı?**
   ```bash
   sqlite3 emails.db "SELECT * FROM emails;"
   ```

4. **Test e-postası gönder**
   ```bash
   node test-real-email.js test@deneme.4bey.com
   ```

## Beklenen Sonuç
- SMTP sunucusu port 2525'te çalışıyor
- E-postalar SQLite veritabanına kaydediliyor
- Chrome uzantısı gerçek e-postaları gösteriyor
- "No real emails found" hatası artık gelmiyor

## Sorun Giderme

### Port 2525 kullanımda
```bash
# Windows
netstat -ano | findstr :2525
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :2525
kill -9 <PID>
```

### Veritabanı hatası
```bash
rm emails.db
npm start
```

### CORS hatası
Chrome uzantısında `chrome://extensions/` adresine gidin ve uzantıyı yeniden yükleyin. 