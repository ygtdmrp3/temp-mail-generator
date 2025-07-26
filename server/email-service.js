const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.setupTransporter();
    }

    setupTransporter() {
        // Gmail SMTP kullanarak test edelim
        this.transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASS || 'your-app-password'
            }
        });
    }

    async sendEmail(to, subject, text, html) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to: to,
                subject: subject,
                text: text,
                html: html
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', result.messageId);
            return result;
        } catch (error) {
            console.error('Email sending error:', error);
            throw error;
        }
    }

    async checkInbox(email) {
        // Bu fonksiyon external email service'den email'leri çekecek
        // Şimdilik test email'leri döndürelim
        return this.getTestEmails(email);
    }

    getTestEmails(email) {
        const now = new Date();
        return [
            {
                id: `test_${Date.now()}_1`,
                from: 'noreply@kick.com',
                to: email,
                subject: 'Kick.com Doğrulama Kodu',
                body: 'Doğrulama kodunuz: 123456',
                html_body: '<p>Doğrulama kodunuz: <strong>123456</strong></p>',
                received_at: now.toISOString(),
                read: false
            },
            {
                id: `test_${Date.now()}_2`,
                from: 'system@tempmail.local',
                to: email,
                subject: 'Test Email',
                body: 'Bu bir test email\'idir.',
                html_body: '<p>Bu bir test email\'idir.</p>',
                received_at: new Date(now.getTime() - 60000).toISOString(),
                read: false
            }
        ];
    }
}

module.exports = EmailService; 