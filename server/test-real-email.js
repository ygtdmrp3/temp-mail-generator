const nodemailer = require('nodemailer');

// Test e-posta gönderme fonksiyonu
async function sendRealTestEmail(toEmail) {
    try {
        console.log(`Test e-postası gönderiliyor: ${toEmail}`);
        
        // SMTP transporter oluştur (kendi sunucumuz)
        const transporter = nodemailer.createTransporter({
            host: 'localhost',
            port: 2525,
            secure: false,
            ignoreTLS: true,
            tls: {
                rejectUnauthorized: false
            }
        });

        // Test e-postası gönder
        const info = await transporter.sendMail({
            from: 'test@example.com',
            to: toEmail,
            subject: 'Gerçek Test E-postası - SMTP Sunucumuz Çalışıyor!',
            text: `Bu bir gerçek test e-postasıdır. SMTP sunucumuz başarıyla çalışıyor!
            
Gönderen: test@example.com
Alıcı: ${toEmail}
Tarih: ${new Date().toLocaleString('tr-TR')}

Bu e-posta, Chrome uzantımızın kendi SMTP sunucusu tarafından alınmıştır.
Artık gerçek e-postalar alabilirsiniz! 🎉

Test içeriği:
- SMTP sunucusu: localhost:2525
- Veritabanı: SQLite
- Durum: Aktif ve çalışıyor`,
            html: `
                <h2>Gerçek Test E-postası - SMTP Sunucumuz Çalışıyor!</h2>
                <p>Bu bir gerçek test e-postasıdır. SMTP sunucumuz başarıyla çalışıyor!</p>
                <ul>
                    <li><strong>Gönderen:</strong> test@example.com</li>
                    <li><strong>Alıcı:</strong> ${toEmail}</li>
                    <li><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</li>
                </ul>
                <p>Bu e-posta, Chrome uzantımızın kendi SMTP sunucusu tarafından alınmıştır.</p>
                <p><strong>Artık gerçek e-postalar alabilirsiniz! 🎉</strong></p>
                <hr>
                <h3>Test Detayları:</h3>
                <ul>
                    <li><strong>SMTP Sunucusu:</strong> localhost:2525</li>
                    <li><strong>Veritabanı:</strong> SQLite</li>
                    <li><strong>Durum:</strong> Aktif ve çalışıyor</li>
                </ul>
            `
        });

        console.log('✅ Test e-postası başarıyla gönderildi!');
        console.log('Message ID:', info.messageId);
        console.log('Chrome uzantısında "Gelen Kutusunu Yenile" butonuna tıklayın.');
        return true;

    } catch (error) {
        console.error('❌ E-posta gönderme hatası:', error.message);
        console.error('Hata detayları:', error);
        return false;
    }
}

// Komut satırından e-posta adresi al
const email = process.argv[2];

if (!email) {
    console.log('Kullanım: node test-real-email.js <email@domain.com>');
    console.log('Örnek: node test-real-email.js smart_demo_4843@deneme.4bey.com');
    process.exit(1);
}

console.log(`Test e-postası gönderiliyor: ${email}`);
sendRealTestEmail(email).then(success => {
    if (success) {
        console.log('✅ Test tamamlandı!');
    } else {
        console.log('❌ Test başarısız.');
    }
}); 