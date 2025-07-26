# 🚀 Canlıya Alma Rehberi

## 📋 Gereksinimler

### Sunucu Gereksinimleri:
- **VPS/Cloud Server** (DigitalOcean, AWS, Vultr, vb.)
- **Domain** (örn: tempmail.com)
- **SSL Sertifikası** (Let's Encrypt ücretsiz)
- **Node.js 18+** ve **npm**

### Önerilen VPS:
- **RAM**: 2GB minimum
- **CPU**: 1 vCPU minimum
- **Disk**: 20GB minimum
- **OS**: Ubuntu 22.04 LTS

## 🔧 Adım 1: Sunucu Kurulumu

### 1.1 VPS Oluşturma
```bash
# DigitalOcean, AWS, Vultr vb. platformdan VPS oluşturun
# Ubuntu 22.04 LTS seçin
# SSH key ekleyin
```

### 1.2 Sunucuya Bağlanma
```bash
ssh root@your-server-ip
```

### 1.3 Sistem Güncellemesi
```bash
apt update && apt upgrade -y
```

### 1.4 Node.js Kurulumu
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
```

### 1.5 PM2 Kurulumu (Process Manager)
```bash
npm install -g pm2
```

## 🌍 Adım 2: Domain ve DNS Ayarları

### 2.1 Domain Satın Alma
- tempmail.com, tempemail.net vb. domain satın alın
- DNS yönetimi için domain sağlayıcınızın panelini kullanın

### 2.2 DNS Kayıtları
```
A Record: tempmail.com → YOUR-SERVER-IP
A Record: *.tempmail.com → YOUR-SERVER-IP
MX Record: tempmail.com → tempmail.com (Priority: 10)
```

### 2.3 Mail Sunucusu Ayarları
```
TXT Record: tempmail.com → "v=spf1 a mx ~all"
TXT Record: _dmarc.tempmail.com → "v=DMARC1; p=none; rua=mailto:admin@tempmail.com"
```

## 📦 Adım 3: Uygulama Kurulumu

### 3.1 Proje Kopyalama
```bash
cd /var/www
git clone https://github.com/your-username/temp-mail-server.git
cd temp-mail-server
```

### 3.2 Bağımlılıkları Yükleme
```bash
npm install
```

### 3.3 Environment Variables
```bash
nano .env
```

```env
NODE_ENV=production
PORT=3000
SMTP_PORT=2525
DOMAIN=tempmail.com
DB_PATH=/var/www/temp-mail-server/emails.db
```

## 🔒 Adım 4: SSL Sertifikası

### 4.1 Certbot Kurulumu
```bash
apt install certbot python3-certbot-nginx -y
```

### 4.2 Nginx Kurulumu
```bash
apt install nginx -y
```

### 4.3 Nginx Konfigürasyonu
```bash
nano /etc/nginx/sites-available/tempmail.com
```

```nginx
server {
    listen 80;
    server_name tempmail.com *.tempmail.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4.4 Site Aktifleştirme
```bash
ln -s /etc/nginx/sites-available/tempmail.com /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 4.5 SSL Sertifikası Alma
```bash
certbot --nginx -d tempmail.com -d *.tempmail.com
```

## 🚀 Adım 5: Uygulamayı Başlatma

### 5.1 PM2 ile Başlatma
```bash
cd /var/www/temp-mail-server
pm2 start server.js --name "temp-mail-server"
pm2 startup
pm2 save
```

### 5.2 Otomatik Başlatma
```bash
systemctl enable pm2-root
```

## 🔧 Adım 6: Chrome Uzantısı Güncelleme

### 6.1 Manifest.json Güncelleme
```json
{
  "host_permissions": [
    "https://tempmail.com/*"
  ]
}
```

### 6.2 popup.js Güncelleme
```javascript
// Kendi mail sunucumuz API'si
const apiUrl = `https://tempmail.com/api/emails/${encodeURIComponent(email)}`;
```

## 📧 Adım 7: Mail Sunucusu Testi

### 7.1 SMTP Testi
```bash
telnet tempmail.com 2525
```

### 7.2 API Testi
```bash
curl https://tempmail.com/api/health
```

### 7.3 Test E-postası Gönderme
```bash
node test-email.js test@tempmail.com
```

## 🔍 Adım 8: Monitoring ve Logs

### 8.1 PM2 Monitoring
```bash
pm2 monit
pm2 logs temp-mail-server
```

### 8.2 Nginx Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🛡️ Adım 9: Güvenlik

### 9.1 Firewall Ayarları
```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 2525
ufw enable
```

### 9.2 Fail2ban Kurulumu
```bash
apt install fail2ban -y
systemctl enable fail2ban
systemctl start fail2ban
```

## 📊 Adım 10: Backup

### 10.1 Otomatik Backup Scripti
```bash
nano /var/www/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /var/www/temp-mail-server/emails.db /backup/emails_$DATE.db
find /backup -name "emails_*.db" -mtime +7 -delete
```

### 10.2 Cron Job
```bash
crontab -e
# Her gün saat 02:00'de backup al
0 2 * * * /var/www/backup.sh
```

## ✅ Canlıya Alma Tamamlandı!

Artık sisteminiz canlıda ve şu özelliklere sahip:

- ✅ **Gerçek Domain**: tempmail.com
- ✅ **SSL Sertifikası**: Güvenli bağlantı
- ✅ **SMTP Sunucusu**: Gerçek e-posta alma
- ✅ **API Sunucusu**: Chrome uzantısı entegrasyonu
- ✅ **Otomatik Başlatma**: Sunucu yeniden başlatıldığında
- ✅ **Monitoring**: PM2 ile sürekli izleme
- ✅ **Backup**: Otomatik veri yedekleme

## 🎯 Kullanım

1. **Chrome uzantısını güncelleyin**
2. **Yeni e-posta oluşturun**: test@tempmail.com
3. **Web sitelerinde kullanın**: Herhangi bir sitede kayıt olun
4. **E-postaları alın**: Chrome uzantısında görüntüleyin

Artık istediğiniz yerden gerçek e-postalar alabilirsiniz! 🎉 