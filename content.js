// Content script - web sayfalarında çalışır
console.log('Temp Mail Generator content script yüklendi');

// E-posta alanlarını otomatik doldur
function autoFillEmailFields() {
    const emailInputs = document.querySelectorAll('input[type="email"], input[name*="email"], input[id*="email"]');
    
    emailInputs.forEach(input => {
        // E-posta alanına sağ tık menüsü ekle
        input.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showEmailMenu(e, input);
        });
        
        // E-posta alanına focus olduğunda öneri göster
        input.addEventListener('focus', () => {
            showEmailSuggestion(input);
        });
    });
}

// E-posta önerisi göster
function showEmailSuggestion(input) {
    // Mevcut e-posta adresini al
    chrome.storage.local.get(['currentEmail'], (result) => {
        if (result.currentEmail && !input.value) {
            // Tooltip oluştur
            const tooltip = document.createElement('div');
            tooltip.className = 'temp-mail-tooltip';
            tooltip.innerHTML = `
                <div class="tooltip-content">
                    <span>Geçici e-posta kullan: ${result.currentEmail}</span>
                    <button class="use-temp-email">Kullan</button>
                </div>
            `;
            
            tooltip.style.cssText = `
                position: absolute;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                z-index: 10000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                max-width: 300px;
            `;
            
            const rect = input.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.bottom + 5) + 'px';
            
            document.body.appendChild(tooltip);
            
            // Kullan butonuna tıklama
            tooltip.querySelector('.use-temp-email').addEventListener('click', () => {
                input.value = result.currentEmail;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                tooltip.remove();
            });
            
            // 5 saniye sonra tooltip'i kaldır
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.remove();
                }
            }, 5000);
        }
    });
}

// Sağ tık menüsü göster
function showEmailMenu(event, input) {
    const menu = document.createElement('div');
    menu.className = 'temp-mail-context-menu';
    menu.innerHTML = `
        <div class="menu-item" data-action="generate">Yeni Geçici E-posta Oluştur</div>
        <div class="menu-item" data-action="copy">Mevcut E-postayı Kopyala</div>
        <div class="menu-item" data-action="fill">E-postayı Doldur</div>
    `;
    
    menu.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #ccc;
        border-radius: 6px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        font-size: 12px;
        min-width: 200px;
    `;
    
    menu.style.left = event.clientX + 'px';
    menu.style.top = event.clientY + 'px';
    
    document.body.appendChild(menu);
    
    // Menü öğelerine tıklama
    menu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        
        switch (action) {
            case 'generate':
                generateNewEmail().then(email => {
                    input.value = email;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                });
                break;
            case 'copy':
                chrome.storage.local.get(['currentEmail'], (result) => {
                    if (result.currentEmail) {
                        navigator.clipboard.writeText(result.currentEmail);
                        showNotification('E-posta kopyalandı!');
                    }
                });
                break;
            case 'fill':
                chrome.storage.local.get(['currentEmail'], (result) => {
                    if (result.currentEmail) {
                        input.value = result.currentEmail;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                });
                break;
        }
        
        menu.remove();
    });
    
    // Menü dışına tıklandığında kapat
    document.addEventListener('click', () => menu.remove(), { once: true });
}

// Yeni e-posta oluştur
async function generateNewEmail() {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'generateEmail' }, (response) => {
            if (response.success) {
                chrome.storage.local.set({ currentEmail: response.email });
                resolve(response.email);
            }
        });
    });
}

// Bildirim göster
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 10px 15px;
        border-radius: 6px;
        font-size: 12px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// CSS animasyonu ekle
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .temp-mail-tooltip .tooltip-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .temp-mail-tooltip .use-temp-email {
        background: #007bff;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
    }
    
    .temp-mail-context-menu .menu-item {
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
    }
    
    .temp-mail-context-menu .menu-item:last-child {
        border-bottom: none;
    }
    
    .temp-mail-context-menu .menu-item:hover {
        background: #f8f9fa;
    }
`;
document.head.appendChild(style);

// Sayfa yüklendiğinde çalıştır
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoFillEmailFields);
} else {
    autoFillEmailFields();
}

// Dinamik içerik için MutationObserver
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const emailInputs = node.querySelectorAll('input[type="email"], input[name*="email"], input[id*="email"]');
                    emailInputs.forEach(input => {
                        input.addEventListener('contextmenu', (e) => {
                            e.preventDefault();
                            showEmailMenu(e, input);
                        });
                        
                        input.addEventListener('focus', () => {
                            showEmailSuggestion(input);
                        });
                    });
                }
            });
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
}); 