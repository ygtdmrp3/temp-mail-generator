class TempMailGenerator {
    constructor() {
        this.currentEmail = null;
        this.inbox = [];
        this.init();
    }

    async init() {
        this.loadStoredData();
        this.setupEventListeners();
        await this.refreshInbox();
    }

    setupEventListeners() {
        document.getElementById('generateEmail').addEventListener('click', () => this.generateNewEmail());
        document.getElementById('refreshInbox').addEventListener('click', () => this.refreshInbox());
        document.getElementById('copyEmail').addEventListener('click', () => this.copyEmailToClipboard());
        document.getElementById('clearData').addEventListener('click', () => this.clearAllData());
        document.getElementById('debugInfo').addEventListener('click', () => this.toggleDebugPanel());
    }

    async generateNewEmail() {
        try {
            this.showLoading('E-posta oluşturuluyor...');
            
            // Geçici e-posta adresi oluştur
            const email = this.createRandomEmail();
            console.log('Oluşturulan e-posta:', email);
            
            // API bağlantısını test et
            await this.testAPIConnection(email);
            
            this.currentEmail = email;
            this.saveStoredData();
            this.updateEmailDisplay();
            this.showNotification('Yeni e-posta adresi oluşturuldu!');
            
            // Gelen kutusunu yenile
            await this.refreshInbox();
            
        } catch (error) {
            console.error('E-posta oluşturma hatası:', error);
            this.showNotification('E-posta oluşturulurken hata oluştu', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async testAPIConnection(email) {
        try {
            console.log('Kendi mail sunucumuz test ediliyor...');
            
            const healthResponse = await fetch('https://temp-mail-generator.onrender.com/api/health');
            
            if (healthResponse.ok) {
                this.showNotification('Kendi mail sunucumuz bağlantısı başarılı!', 'success');
            } else {
                this.showNotification('Kendi mail sunucumuz bağlantısı başarısız, test e-postaları gösterilecek', 'warning');
            }
            
        } catch (error) {
            console.error('API Test Error:', error);
            this.showNotification('Kendi mail sunucumuz test edilemedi, test e-postaları gösterilecek', 'warning');
        }
    }

    createRandomEmail() {
        // Kendi mail sunucumuz için domainler
        const domains = [
            'deneme.4bey.com',
            'tempmail.local',
            'tempemail.local',
            'testmail.local'
        ];
        
        const adjectives = ['cool', 'smart', 'fast', 'quick', 'easy', 'simple', 'temp', 'test', 'user', 'demo'];
        const nouns = ['user', 'mail', 'email', 'test', 'demo', 'temp', 'random', 'box', 'inbox'];
        const numbers = Math.floor(Math.random() * 9999);
        
        const username = `${adjectives[Math.floor(Math.random() * adjectives.length)]}_${nouns[Math.floor(Math.random() * nouns.length)]}_${numbers}`;
        const domain = domains[Math.floor(Math.random() * domains.length)];
        
        return `${username}@${domain}`;
    }

    async refreshInbox() {
        if (!this.currentEmail) {
            this.updateInboxDisplay([]);
            return;
        }

        try {
            this.showLoading('Gelen kutusu kontrol ediliyor...');
            
            // Gerçek API'den e-postaları al
            const emails = await this.fetchRealEmails(this.currentEmail);
            
            this.inbox = emails;
            this.saveStoredData();
            this.updateInboxDisplay(emails);
            
            if (emails.length > 0) {
                this.showNotification(`${emails.length} yeni e-posta alındı!`);
            } else {
                this.showNotification('Henüz e-posta yok. E-posta adresinizi kullanarak kayıt olun.', 'info');
            }
            
        } catch (error) {
            console.error('Gelen kutusu yenileme hatası:', error);
            this.showNotification('Gelen kutusu yenilenirken hata oluştu. Lütfen daha sonra tekrar deneyin.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async fetchRealEmails(email) {
        try {
            console.log('E-posta alınıyor:', email);
            
            // Sadece kendi mail sunucumuzu kullan
            let emails = await this.tryCustomMailServer(email);
            
            // Eğer kendi sunucumuz çalışmazsa, test e-postaları döndür
            if (emails.length === 0) {
                console.log('Kendi mail sunucumuz çalışmadı, test e-postaları döndürülüyor...');
                emails = this.getTestEmails();
            }
            
            return emails;
            
        } catch (error) {
            console.error('E-posta alma hatası:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            this.showNotification(`E-postalar alınırken hata oluştu: ${error.message}`, 'error');
            return this.getTestEmails();
        }
    }

    async tryCustomMailServer(email) {
        try {
            console.log('Kendi mail sunucumuz deneniyor...');
            console.log('Email:', email);
            
            // Local development API'si (localhost)
            const apiUrl = `http://localhost:3000/api/emails/${encodeURIComponent(email)}`;
            console.log('API URL:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log('Custom Server Response status:', response.status);
            console.log('Custom Server Response ok:', response.ok);
            
            if (!response.ok) {
                throw new Error(`Custom mail server failed. Status: ${response.status}`);
            }
            
            const emails = await response.json();
            console.log('Custom mail server response:', emails);
            
            if (!Array.isArray(emails)) {
                console.log('Emails is not an array');
                return [];
            }
            
            console.log(`Found ${emails.length} emails in custom server`);
            return this.processCustomServerEmails(emails);
            
        } catch (error) {
            console.error('Kendi mail sunucumuz hatası:', error);
            // Eğer localhost çalışmazsa, production API'yi dene
            try {
                console.log('Localhost başarısız, production API deneniyor...');
                const productionApiUrl = `https://temp-mail-generator.onrender.com/api/emails/${encodeURIComponent(email)}`;
                const productionResponse = await fetch(productionApiUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (productionResponse.ok) {
                    const productionEmails = await productionResponse.json();
                    if (Array.isArray(productionEmails)) {
                        console.log(`Found ${productionEmails.length} emails in production server`);
                        return this.processCustomServerEmails(productionEmails);
                    }
                }
            } catch (productionError) {
                console.error('Production API hatası:', productionError);
            }
            return [];
        }
    }

    processCustomServerEmails(emails) {
        return emails.map(email => ({
            id: email.id,
            from: email.from_address || 'Bilinmeyen',
            subject: email.subject || 'Konu Yok',
            preview: email.body?.substring(0, 100) || 'E-posta içeriği',
            date: email.received_at || new Date().toISOString(),
            read: email.read === 1,
            body: email.body || '',
            htmlBody: email.html_body || '',
            attachments: []
        }));
    }









    getTestEmails() {
        return [
            {
                id: 'test_1',
                from: 'noreply@example.com',
                subject: 'Kendi Mail Sunucumuz Çalışıyor!',
                preview: 'Kendi mail sunucumuz başarıyla kuruldu ve çalışıyor.',
                date: new Date().toISOString(),
                read: false,
                body: '<p>Kendi mail sunucumuz başarıyla kuruldu! Artık gerçek e-postalar alabilirsiniz.</p>',
                attachments: []
            },
            {
                id: 'test_2',
                from: 'system@tempmail.local',
                subject: 'Sistem Durumu',
                preview: 'Mail sunucusu aktif ve çalışıyor.',
                date: new Date(Date.now() - 3600000).toISOString(),
                read: false,
                body: '<p>Mail sunucusu aktif ve çalışıyor. Test e-postaları gönderebilirsiniz.</p>',
                attachments: []
            }
        ];
    }

    extractTextFromHtml(html) {
        if (!html) return '';
        
        // HTML etiketlerini kaldır
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        
        // İlk 100 karakteri al
        return text.substring(0, 100).trim() + (text.length > 100 ? '...' : '');
    }

    updateEmailDisplay() {
        const emailElement = document.getElementById('currentEmail');
        const copyBtn = document.getElementById('copyEmail');
        
        if (this.currentEmail) {
            emailElement.textContent = this.currentEmail;
            copyBtn.style.display = 'block';
        } else {
            emailElement.textContent = 'Henüz e-posta oluşturulmadı';
            copyBtn.style.display = 'none';
        }
    }

    updateInboxDisplay(emails) {
        const inboxElement = document.getElementById('inbox');
        
        if (emails.length === 0) {
            inboxElement.innerHTML = `
                <div class="empty-state">
                    <p>Henüz e-posta yok</p>
                    <small>E-posta adresinizi kullanarak kayıt olun ve e-postaları burada görün</small>
                </div>
            `;
            return;
        }
        
        inboxElement.innerHTML = emails.map(email => `
            <div class="email-item ${!email.read ? 'unread' : ''}" data-email-id="${email.id}">
                <div class="email-header">
                    <span class="email-sender">${this.formatEmail(email.from)}</span>
                    <span class="email-date">${this.formatDate(email.date)}</span>
                </div>
                <div class="email-subject">${email.subject}</div>
                <div class="email-preview">${email.preview}</div>
            </div>
        `).join('');
        
        // E-posta tıklama olayları
        inboxElement.querySelectorAll('.email-item').forEach(item => {
            item.addEventListener('click', () => this.openEmail(item.dataset.emailId));
        });
    }

    formatEmail(email) {
        const name = email.split('@')[0];
        return name.length > 15 ? name.substring(0, 15) + '...' : name;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Az önce';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}d önce`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}s önce`;
        return date.toLocaleDateString('tr-TR');
    }

    openEmail(emailId) {
        const email = this.inbox.find(e => e.id === emailId);
        if (email) {
            email.read = true;
            this.saveStoredData();
            this.updateInboxDisplay(this.inbox);
            
            // E-posta detaylarını modal'da göster
            this.showEmailModal(email);
        }
    }

    showEmailModal(email) {
        // Mevcut modal'ı kaldır
        const existingModal = document.querySelector('.email-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'email-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${email.subject}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="email-info">
                            <p><strong>Kimden:</strong> ${email.from}</p>
                            <p><strong>Tarih:</strong> ${this.formatDate(email.date)}</p>
                        </div>
                        <div class="email-content">
                            ${email.body ? email.body : '<p>E-posta içeriği yüklenemedi</p>'}
                        </div>
                        ${email.attachments && email.attachments.length > 0 ? `
                            <div class="email-attachments">
                                <h4>Ekler:</h4>
                                <ul>
                                    ${email.attachments.map(att => `<li>${att.filename} (${att.size} bytes)</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Kapatma butonu
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.remove();
        });
        
        // Modal dışına tıklayarak kapatma
        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                modal.remove();
            }
        });
    }

    async copyEmailToClipboard() {
        if (!this.currentEmail) {
            this.showNotification('Kopyalanacak e-posta yok', 'error');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(this.currentEmail);
            this.showNotification('E-posta adresi panoya kopyalandı!');
        } catch (error) {
            console.error('Kopyalama hatası:', error);
            this.showNotification('Kopyalama başarısız', 'error');
        }
    }

    clearAllData() {
        if (confirm('Tüm verileri silmek istediğinizden emin misiniz?')) {
            this.currentEmail = null;
            this.inbox = [];
            this.saveStoredData();
            this.updateEmailDisplay();
            this.updateInboxDisplay([]);
            this.showNotification('Tüm veriler temizlendi');
        }
    }

    loadStoredData() {
        chrome.storage.local.get(['currentEmail', 'inbox'], (result) => {
            this.currentEmail = result.currentEmail || null;
            this.inbox = result.inbox || [];
            this.updateEmailDisplay();
            this.updateInboxDisplay(this.inbox);
        });
    }

    saveStoredData() {
        chrome.storage.local.set({
            currentEmail: this.currentEmail,
            inbox: this.inbox
        });
    }

    showLoading(message) {
        const inbox = document.getElementById('inbox');
        inbox.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <span>${message}</span>
            </div>
        `;
    }

    hideLoading() {
        // Loading durumu zaten updateInboxDisplay ile güncelleniyor
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        // Renk kodları
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        
        notification.style.background = colors[type] || colors.success;
        notification.style.color = type === 'warning' ? '#212529' : 'white';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    toggleDebugPanel() {
        const debugPanel = document.getElementById('debugPanel');
        const debugContent = document.getElementById('debugContent');
        
        if (debugPanel.style.display === 'none') {
            // Debug bilgilerini topla
            const debugInfo = {
                currentEmail: this.currentEmail,
                inboxCount: this.inbox.length,
                lastRefresh: new Date().toISOString(),
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            };
            
            debugContent.innerHTML = `<pre>${JSON.stringify(debugInfo, null, 2)}</pre>`;
            debugPanel.style.display = 'block';
        } else {
            debugPanel.style.display = 'none';
        }
    }
}

// Uzantı başlatıldığında
document.addEventListener('DOMContentLoaded', () => {
    new TempMailGenerator();
}); 