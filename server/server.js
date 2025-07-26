const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const EmailService = require('./email-service');
const SMTPServer = require('smtp-server');
const { simpleParser } = require('mailparser');

const app = express();
const PORT = 3000;
const SMTP_PORT = 2525;

// Middleware
app.use(cors({
    origin: ['chrome-extension://*', 'https://temp-mail-generator.netlify.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Database setup
const db = new sqlite3.Database('emails.db');

// Create tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS emails (
        id TEXT PRIMARY KEY,
        from_address TEXT,
        to_address TEXT,
        subject TEXT,
        body TEXT,
        html_body TEXT,
        received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        read BOOLEAN DEFAULT 0
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS domains (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain TEXT UNIQUE,
        active BOOLEAN DEFAULT 1
    )`);
});

// Insert default domains
const defaultDomains = ['deneme.4bey.com', 'tempmail.local', 'tempemail.local', 'testmail.local'];
defaultDomains.forEach(domain => {
    db.run('INSERT OR IGNORE INTO domains (domain) VALUES (?)', [domain]);
});

// Initialize Email Service
const emailService = new EmailService();

// SMTP Server setup
const smtpServer = new SMTPServer({
    secure: false,
    authOptional: true,
    onData(stream, session, callback) {
        let mailData = '';
        
        stream.on('data', (chunk) => {
            mailData += chunk;
        });
        
        stream.on('end', async () => {
            try {
                const parsed = await simpleParser(mailData);
                const emailId = uuidv4();
                
                console.log(`Received email: ${parsed.subject} to ${parsed.to.text}`);
                
                // Store email in database
                db.run(
                    'INSERT INTO emails (id, from_address, to_address, subject, body, html_body) VALUES (?, ?, ?, ?, ?, ?)',
                    [
                        emailId,
                        parsed.from.text,
                        parsed.to.text,
                        parsed.subject || 'No Subject',
                        parsed.text || '',
                        parsed.html || ''
                    ],
                    (err) => {
                        if (err) {
                            console.error('Database error storing email:', err);
                        } else {
                            console.log(`Email stored: ${emailId} to ${parsed.to.text}`);
                        }
                    }
                );
                
                callback();
            } catch (error) {
                console.error('Email parsing error:', error);
                callback();
            }
        });
    },
    onRcptTo(address, session, callback) {
        // Accept all emails for our domains
        const allowedDomains = ['deneme.4bey.com', 'tempmail.local', 'tempemail.local', 'testmail.local'];
        const domain = address.address.split('@')[1];
        
        if (allowedDomains.includes(domain)) {
            callback();
        } else {
            callback(new Error('Domain not allowed'));
        }
    }
});

// Start SMTP server
smtpServer.listen(SMTP_PORT, () => {
    console.log(`SMTP Server running on port ${SMTP_PORT}`);
});

// API Routes
app.get('/api/domains', (req, res) => {
    db.all('SELECT domain FROM domains WHERE active = 1', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows.map(row => row.domain));
        }
    });
});

app.get('/api/emails/:email', async (req, res) => {
    const email = req.params.email;
    
    try {
        // Önce veritabanından email'leri kontrol et
        db.all(
            'SELECT * FROM emails WHERE to_address = ? ORDER BY received_at DESC',
            [email],
            async (err, rows) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    // Eğer veritabanında email yoksa, email service'den al
                    if (rows.length === 0) {
                        const serviceEmails = await emailService.checkInbox(email);
                        res.json(serviceEmails);
                    } else {
                        res.json(rows);
                    }
                }
            }
        );
    } catch (error) {
        console.error('Email fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
});

app.get('/api/email/:id', (req, res) => {
    const emailId = req.params.id;
    
    db.get('SELECT * FROM emails WHERE id = ?', [emailId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ error: 'Email not found' });
        } else {
            // Mark as read
            db.run('UPDATE emails SET read = 1 WHERE id = ?', [emailId]);
            res.json(row);
        }
    });
});

app.post('/api/domains', (req, res) => {
    const { domain } = req.body;
    
    if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
    }
    
    db.run('INSERT INTO domains (domain) VALUES (?)', [domain], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, domain });
        }
    });
});

app.delete('/api/emails/:email', (req, res) => {
    const email = req.params.email;
    
    db.run('DELETE FROM emails WHERE to_address = ?', [email], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ deleted: this.changes });
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Webhook endpoint for Resend.com
app.post('/api/webhook', (req, res) => {
    try {
        const { type, data } = req.body;
        
        if (type === 'email.delivered') {
            const email = data;
            const emailId = uuidv4();
            
            // Store email in database
            db.run(
                'INSERT INTO emails (id, from_address, to_address, subject, body, html_body) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    emailId,
                    email.from,
                    email.to[0],
                    email.subject || 'No Subject',
                    email.text || '',
                    email.html || ''
                ],
                (err) => {
                    if (err) {
                        console.error('Database error:', err);
                    } else {
                        console.log(`Email stored via webhook: ${emailId} to ${email.to[0]}`);
                    }
                }
            );
        }
        
        res.json({ status: 'OK' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}`);
    console.log(`Available domains: ${defaultDomains.join(', ')}`);
    console.log(`API: http://localhost:${PORT}`);
    console.log(`Email Service: Active`);
}); 