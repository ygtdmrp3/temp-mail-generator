const { Resend } = require('resend');

class EmailService {
    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY || 're_AtY4tC5B_LcUqy9p3PGrafDsrT55YCaBY');
        this.domain = process.env.EMAIL_DOMAIN || 'deneme.4bey.com';
    }

    async sendEmail(to, subject, text, html) {
        try {
            const result = await this.resend.emails.send({
                from: `noreply@${this.domain}`,
                to: [to],
                subject: subject,
                text: text,
                html: html
            });
            console.log('Email sent:', result.data?.id);
            return result;
        } catch (error) {
            console.error('Email sending error:', error);
            throw error;
        }
    }

    async checkInbox(email) {
        try {
            // Veritabanından gerçek email'leri kontrol et
            const realEmails = await this.getRealEmailsFromDatabase(email);
            
            if (realEmails.length > 0) {
                console.log(`Found ${realEmails.length} real emails for ${email}`);
                return realEmails;
            } else {
                console.log(`No real emails found for ${email}`);
                return []; // Boş array döndür
            }
        } catch (error) {
            console.error('Email fetch error:', error);
            return []; // Hata durumunda da boş array döndür
        }
    }

    async getRealEmailsFromDatabase(email) {
        return new Promise((resolve) => {
            const sqlite3 = require('sqlite3').verbose();
            const db = new sqlite3.Database('emails.db');
            db.all(
                'SELECT * FROM emails WHERE to_address = ? ORDER BY received_at DESC LIMIT 10',
                [email],
                (err, rows) => {
                    if (err) {
                        console.error('Database error:', err);
                        resolve([]);
                    } else {
                        const emails = rows.map(row => ({
                            id: `real_${row.id}`,
                            from: row.from_address,
                            to: row.to_address,
                            subject: row.subject,
                            body: row.body,
                            html_body: row.html_body,
                            received_at: row.received_at,
                            read: row.read === 1
                        }));
                        resolve(emails);
                    }
                }
            );
        });
    }

    processResendEmails(emails, targetEmail) {
        return emails
            .filter(email => email.to.includes(targetEmail))
            .map(email => ({
                id: `real_${email.id}`,
                from: email.from,
                to: targetEmail,
                subject: email.subject || 'No Subject',
                body: email.text || '',
                html_body: email.html || '',
                received_at: email.created_at,
                read: false
            }));
    }

    // Test e-posta gönderme fonksiyonu kaldırıldı

    // Test e-postaları kaldırıldı - sadece gerçek e-postalar gösteriliyor
}

module.exports = EmailService; 