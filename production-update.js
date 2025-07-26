// Production için Chrome uzantısı güncelleme scripti

// 1. manifest.json güncelleme
const manifestUpdate = {
    "host_permissions": [
        "https://tempmail.com/*"  // Canlı domain
    ]
};

// 2. popup.js güncelleme
const popupUpdate = `
    async tryCustomMailServer(email) {
        try {
            console.log('Kendi mail sunucumuz deneniyor...');
            console.log('Email:', email);
            
            // Canlı mail sunucumuz API'si
            const apiUrl = \`https://tempmail.com/api/emails/\${encodeURIComponent(email)}\`;
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
                throw new Error(\`Custom mail server failed. Status: \${response.status}\`);
            }
            
            const emails = await response.json();
            console.log('Custom mail server response:', emails);
            
            if (!Array.isArray(emails)) {
                console.log('Emails is not an array');
                return [];
            }
            
            console.log(\`Found \${emails.length} emails in custom server\`);
            return this.processCustomServerEmails(emails);
            
        } catch (error) {
            console.error('Kendi mail sunucumuz hatası:', error);
            return [];
        }
    }

    async testAPIConnection(email) {
        try {
            console.log('Kendi mail sunucumuz test ediliyor...');
            
            const healthResponse = await fetch('https://tempmail.com/api/health');
            
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
`;

// 3. createRandomEmail güncelleme
const emailUpdate = `
    createRandomEmail() {
        // Canlı mail sunucumuz için domainler
        const domains = [
            'tempmail.com',
            'tempemail.net',
            'testmail.com'
        ];
        
        const adjectives = ['cool', 'smart', 'fast', 'quick', 'easy', 'simple', 'temp', 'test', 'user', 'demo'];
        const nouns = ['user', 'mail', 'email', 'test', 'demo', 'temp', 'random', 'box', 'inbox'];
        const numbers = Math.floor(Math.random() * 9999);
        
        const username = \`\${adjectives[Math.floor(Math.random() * adjectives.length)]}_\${nouns[Math.floor(Math.random() * nouns.length)]}_\${numbers}\`;
        const domain = domains[Math.floor(Math.random() * domains.length)];
        
        return \`\${username}@\${domain}\`;
    }
`;

console.log('Production güncellemeleri hazır!');
console.log('1. manifest.json host_permissions güncelle');
console.log('2. popup.js API URL\'lerini güncelle');
console.log('3. createRandomEmail domainlerini güncelle'); 