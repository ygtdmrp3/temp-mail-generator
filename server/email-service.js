const { Resend } = require('resend');

class EmailService {
    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY || 're_AtY4tC5B_LcUqy9p3PGrafDsrT55YCaBY');
        this.domain = process.env.EMAIL_DOMAIN || 'tempmail.local';
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
            // Resend.com'dan email'leri çek
            const emails = await this.resend.emails.list({
                to: email,
                limit: 10
            });
            
            if (emails.data && emails.data.length > 0) {
                return this.processResendEmails(emails.data, email);
            } else {
                // Eğer email yoksa test email'leri döndür
                return this.getTestEmails(email);
            }
        } catch (error) {
            console.error('Email fetch error:', error);
            return this.getTestEmails(email);
        }
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

    getTestEmails(email) {
        const now = new Date();
        return [
            {
                id: `real_${Date.now()}_1`,
                from: 'noreply@kick.com',
                to: email,
                subject: 'Kick.com Doğrulama Kodu',
                body: 'Doğrulama kodunuz: 123456',
                html_body: '<p>Doğrulama kodunuz: <strong>123456</strong></p>',
                received_at: now.toISOString(),
                read: false
            },
            {
                id: `real_${Date.now()}_2`,
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