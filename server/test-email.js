const nodemailer = require('nodemailer');

// Test e-posta gönderme fonksiyonu
async function sendTestEmail(toEmail) {
    try {
        // SMTP transporter oluştur (kendi sunucumuz)
        const transporter = nodemailer.createTransporter({
            host: 'localhost',
            port: 2525,
            secure: false,
            ignoreTLS: true
        });

        // Test e-postası gönder
        const info = await transporter.sendMail({
            from: 'test@example.com',
            to: toEmail,
            subject: 'Test E-postası - Kendi Mail Sunucumuz',
            text: `Bu bir test e-postasıdır. Kendi mail sunucumuz çalışıyor!
            
Gönderen: test@example.com
Alıcı: ${toEmail}
Tarih: ${new Date().toLocaleString('tr-TR')}

Bu e-posta, Chrome uzantımızın kendi mail sunucusu tarafından alınmıştır.
Gerçek e-postalar artık çalışıyor! 🎉`,
            html: `
                <h2>Test E-postası - Kendi Mail Sunucumuz</h2>
                <p>Bu bir test e-postasıdır. Kendi mail sunucumuz çalışıyor!</p>
                <ul>
                    <li><strong>Gönderen:</strong> test@example.com</li>
                    <li><strong>Alıcı:</strong> ${toEmail}</li>
                    <li><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</li>
                </ul>
                <p>Bu e-posta, Chrome uzantımızın kendi mail sunucusu tarafından alınmıştır.</p>
                <p><strong>Gerçek e-postalar artık çalışıyor! 🎉</strong></p>
            `
        });

        console.log('Test e-postası gönderildi:', info.messageId);
        return true;

    } catch (error) {
        console.error('E-posta gönderme hatası:', error);
        return false;
    }
}

// Komut satırından e-posta adresi al
const email = process.argv[2];

if (!email) {
    console.log('Kullanım: node test-email.js <email@domain.com>');
    console.log('Örnek: node test-email.js test@deneme.4bey.com');
    process.exit(1);
}

console.log(`Test e-postası gönderiliyor: ${email}`);
sendTestEmail(email).then(success => {
    if (success) {
        console.log('✅ Test e-postası başarıyla gönderildi!');
        console.log('Chrome uzantısında "Gelen Kutusunu Yenile" butonuna tıklayın.');
    } else {
        console.log('❌ Test e-postası gönderilemedi.');
    }
}); 