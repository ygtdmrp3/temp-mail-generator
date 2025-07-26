// Background service worker
chrome.runtime.onInstalled.addListener(() => {
    console.log('Temp Mail Generator uzantısı yüklendi');
});

// Popup açıldığında
chrome.action.onClicked.addListener((tab) => {
    console.log('Popup açıldı');
});

// Mesaj dinleyicisi
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'generateEmail') {
        // E-posta oluşturma işlemi
        const email = generateRandomEmail();
        sendResponse({ success: true, email: email });
    } else if (request.action === 'fetchEmails') {
        // Gerçek API'den e-postaları al
        fetchRealEmails(request.email).then(emails => {
            sendResponse({ success: true, emails: emails });
        }).catch(error => {
            sendResponse({ success: false, error: error.message });
        });
        return true; // Async response için gerekli
    }
});

function generateRandomEmail() {
    // 1secmail.com API'si için geçerli domainler
    const domains = [
        '1secmail.com',
        '1secmail.org',
        '1secmail.net',
        'kzccv.com',
        'qiott.com',
        'uuf.me',
        'emailnode.com',
        'jnpayy.com',
        'laafd.com',
        'emlpro.com',
        'emltmp.com',
        'tmpeml.com',
        'tmpbox.net',
        'tmpmail.org',
        'tmpmail.net',
        'tmpeml.com',
        'tmpbox.org',
        'tmpmail.com',
        'tmpeml.org',
        'tmpbox.com'
    ];
    
    const adjectives = ['cool', 'smart', 'fast', 'quick', 'easy', 'simple', 'temp', 'test', 'user', 'demo'];
    const nouns = ['user', 'mail', 'email', 'test', 'demo', 'temp', 'random', 'box', 'inbox'];
    const numbers = Math.floor(Math.random() * 9999);
    
    const username = `${adjectives[Math.floor(Math.random() * adjectives.length)]}_${nouns[Math.floor(Math.random() * nouns.length)]}_${numbers}`;
    const domain = domains[Math.floor(Math.random() * domains.length)];
    
    return `${username}@${domain}`;
}

async function fetchRealEmails(email) {
    try {
        console.log('Background: E-posta alınıyor:', email);
        
        // E-posta adresini parçala
        const [username, domain] = email.split('@');
        
        // 1secmail.com API'si
        const apiUrl = `https://www.1secmail.com/api/v1/?action=getMessages&login=${encodeURIComponent(username)}&domain=${encodeURIComponent(domain)}`;
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        });
        
        if (!response.ok) {
            console.log('Background: API response not ok:', response.status);
            return [];
        }
        
        const emails = await response.json();
        
        if (!Array.isArray(emails)) {
            console.log('Background: Emails is not an array');
            return [];
        }
        
        console.log('Background: Found', emails.length, 'emails');
        
        // Sadece temel bilgileri döndür (background'da detay almaya gerek yok)
        const basicEmails = emails.map(email => ({
            id: email.id,
            from: email.from || 'Bilinmeyen',
            subject: email.subject || 'Konu Yok',
            preview: 'E-posta alındı',
            date: email.date || new Date().toISOString(),
            read: false,
            body: '',
            attachments: []
        }));
        
        return basicEmails.sort((a, b) => new Date(b.date) - new Date(a.date));
        
    } catch (error) {
        console.error('Background: E-posta alma hatası:', error);
        return [];
    }
}

function extractTextFromHtml(html) {
    if (!html) return '';
    
    // HTML etiketlerini kaldır (basit yöntem)
    const text = html.replace(/<[^>]*>/g, '');
    
    // İlk 100 karakteri al
    return text.substring(0, 100).trim() + (text.length > 100 ? '...' : '');
}

// Periyodik olarak gelen kutusunu kontrol et
setInterval(async () => {
    chrome.storage.local.get(['currentEmail'], async (result) => {
        if (result.currentEmail) {
            try {
                // Gerçek API'den e-postaları kontrol et
                const emails = await fetchRealEmails(result.currentEmail);
                if (emails.length > 0) {
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'icons/icon48.png',
                        title: 'Yeni E-posta',
                        message: `${emails.length} yeni e-posta alındı`
                    });
                }
            } catch (error) {
                console.error('Periyodik kontrol hatası:', error);
            }
        }
    });
}, 300000); // 5 dakikada bir kontrol et 