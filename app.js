// Global state management
let currentAmount = 0;
let selectedRecipient = null;
let transferMemo = '';

// Screen navigation
function goToScreen(screenId) {
    // Remove active class from all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Add active class to target screen
    document.getElementById(screenId).classList.add('active');
    
    // Update time when navigating
    updateTime();
}

// Update time display
function updateTime() {
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                      now.getMinutes().toString().padStart(2, '0');
    
    document.querySelectorAll('.time').forEach(timeElement => {
        timeElement.textContent = timeString;
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Set up quick transfer button
    document.getElementById('quick-transfer-btn').addEventListener('click', function() {
        goToScreen('recipient-screen');
    });
    
    // Initialize time
    updateTime();
    setInterval(updateTime, 60000); // Update every minute
    
    // Add search functionality
    setupSearch();
    
    // Setup memo input
    setupMemoInput();
});

// Recipient selection
function selectRecipient(name, bank, account) {
    selectedRecipient = {
        name: name,
        bank: bank,
        account: account,
        avatar: name.charAt(0)
    };
    
    // Update amount screen with selected recipient
    document.getElementById('selected-name').textContent = name;
    document.getElementById('selected-account').textContent = bank + ' ' + account;
    document.getElementById('selected-avatar').textContent = name.charAt(0);
    
    // Navigate to amount screen
    goToScreen('amount-screen');
}

// Search functionality
function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const recipients = document.querySelectorAll('.recipient-item');
            
            recipients.forEach(recipient => {
                const name = recipient.querySelector('.recipient-name').textContent.toLowerCase();
                const bank = recipient.querySelector('.recipient-bank').textContent.toLowerCase();
                
                if (name.includes(searchTerm) || bank.includes(searchTerm)) {
                    recipient.style.display = 'flex';
                } else {
                    recipient.style.display = 'none';
                }
            });
        });
    }
}

// Amount input functions
function inputNumber(num) {
    if (currentAmount === 0) {
        currentAmount = parseInt(num);
    } else {
        currentAmount = currentAmount * 10 + parseInt(num);
    }
    
    updateAmountDisplay();
    validateAmount();
}

function deleteNumber() {
    currentAmount = Math.floor(currentAmount / 10);
    updateAmountDisplay();
    validateAmount();
}

function addAmount(amount) {
    currentAmount += amount;
    updateAmountDisplay();
    validateAmount();
}

function updateAmountDisplay() {
    const amountElement = document.getElementById('amount-display');
    if (amountElement) {
        amountElement.textContent = currentAmount.toLocaleString();
    }
}

function validateAmount() {
    const nextBtn = document.getElementById('next-btn');
    const maxAmount = 50000; // Single transfer limit
    const available = 168520; // Available balance
    
    if (currentAmount > 0 && currentAmount <= maxAmount && currentAmount <= available) {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
    } else {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.5';
    }
    
    // Show warning if amount exceeds limits
    if (currentAmount > maxAmount) {
        showAmountWarning('單筆轉帳限額為 NT$50,000');
    } else if (currentAmount > available) {
        showAmountWarning('餘額不足');
    } else {
        hideAmountWarning();
    }
}

function showAmountWarning(message) {
    let warningElement = document.querySelector('.amount-warning');
    if (!warningElement) {
        warningElement = document.createElement('div');
        warningElement.className = 'amount-warning';
        warningElement.style.cssText = `
            color: var(--cathay-warning);
            font-size: 14px;
            text-align: center;
            margin-top: 8px;
            padding: 8px;
            background: rgba(255, 107, 53, 0.1);
            border-radius: 8px;
        `;
        document.querySelector('.amount-input-section').appendChild(warningElement);
    }
    warningElement.textContent = message;
}

function hideAmountWarning() {
    const warningElement = document.querySelector('.amount-warning');
    if (warningElement) {
        warningElement.remove();
    }
}

// Memo input setup
function setupMemoInput() {
    const memoInput = document.getElementById('memo-input');
    if (memoInput) {
        memoInput.addEventListener('input', function(e) {
            transferMemo = e.target.value;
        });
    }
}

// Authentication functions
function startFaceId() {
    // Update auth screen with transfer details
    updateAuthScreen();
    
    // Show loading state
    document.getElementById('face-id-container').classList.add('hidden');
    document.getElementById('auth-loading').classList.remove('hidden');
    
    // Simulate authentication process
    setTimeout(() => {
        document.getElementById('auth-loading').classList.add('hidden');
        document.getElementById('auth-success').classList.remove('hidden');
        
        // Auto-proceed to success screen after showing success
        setTimeout(() => {
            proceedToSuccess();
        }, 1500);
    }, 2000);
}

function updateAuthScreen() {
    if (selectedRecipient) {
        document.getElementById('auth-recipient').textContent = selectedRecipient.name;
        document.getElementById('auth-account').textContent = 
            selectedRecipient.bank + ' ' + selectedRecipient.account;
    }
    document.getElementById('auth-amount').textContent = 'NT$' + currentAmount.toLocaleString();
}

function proceedToSuccess() {
    updateSuccessScreen();
    goToScreen('success-screen');
}

function updateSuccessScreen() {
    if (selectedRecipient) {
        document.getElementById('success-recipient').textContent = selectedRecipient.name;
        document.getElementById('success-account').textContent = 
            selectedRecipient.bank + ' ' + selectedRecipient.account;
    }
    document.getElementById('success-amount').textContent = 'NT$' + currentAmount.toLocaleString();
}

// Success screen functions
function shareTransaction() {
    // Simulate sharing functionality
    if (navigator.share) {
        navigator.share({
            title: '轉帳成功',
            text: `成功轉帳 NT$${currentAmount.toLocaleString()} 給 ${selectedRecipient?.name || '收款人'}`,
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback for browsers that don't support Web Share API
        const shareText = `轉帳成功！\n收款人：${selectedRecipient?.name || '收款人'}\n金額：NT$${currentAmount.toLocaleString()}\n時間：${new Date().toLocaleString('zh-TW')}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
                showToast('交易明細已複製到剪貼簿');
            });
        } else {
            // Further fallback
            const textArea = document.createElement('textarea');
            textArea.value = shareText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('交易明細已複製到剪貼簿');
        }
    }
}

function showToast(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--cathay-text);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 100);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Reset app state when returning to home
function resetAppState() {
    currentAmount = 0;
    selectedRecipient = null;
    transferMemo = '';
    
    // Reset UI elements
    updateAmountDisplay();
    
    const memoInput = document.getElementById('memo-input');
    if (memoInput) {
        memoInput.value = '';
    }
    
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.5';
    }
    
    // Reset auth screen
    document.getElementById('face-id-container').classList.remove('hidden');
    document.getElementById('auth-loading').classList.add('hidden');
    document.getElementById('auth-success').classList.add('hidden');
    
    hideAmountWarning();
}

// Enhanced navigation with state management
function goToScreen(screenId) {
    // Handle special cases
    if (screenId === 'home-screen') {
        resetAppState();
    }
    
    // Remove active class from all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Add active class to target screen
    document.getElementById(screenId).classList.add('active');
    
    // Update time when navigating
    updateTime();
    
    // Screen-specific setup
    if (screenId === 'amount-screen' && selectedRecipient) {
        // Ensure recipient info is displayed
        document.getElementById('selected-name').textContent = selectedRecipient.name;
        document.getElementById('selected-account').textContent = 
            selectedRecipient.bank + ' ' + selectedRecipient.account;
        document.getElementById('selected-avatar').textContent = selectedRecipient.avatar;
    }
}

// Keyboard support
document.addEventListener('keydown', function(e) {
    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen) return;
    
    const screenId = activeScreen.id;
    
    // Handle keyboard input on amount screen
    if (screenId === 'amount-screen') {
        if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            inputNumber(e.key);
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            deleteNumber();
        } else if (e.key === 'Enter') {
            const nextBtn = document.getElementById('next-btn');
            if (!nextBtn.disabled) {
                e.preventDefault();
                goToScreen('auth-screen');
            }
        }
    }
    
    // Handle escape key to go back
    if (e.key === 'Escape') {
        const backBtn = activeScreen.querySelector('.back-btn');
        if (backBtn) {
            e.preventDefault();
            backBtn.click();
        }
    }
});

// Add touch feedback for mobile
document.addEventListener('touchstart', function(e) {
    if (e.target.classList.contains('btn') || 
        e.target.classList.contains('key') || 
        e.target.classList.contains('recipient-item') ||
        e.target.classList.contains('quick-transfer-card')) {
        e.target.style.transform = 'scale(0.98)';
    }
});

document.addEventListener('touchend', function(e) {
    if (e.target.classList.contains('btn') || 
        e.target.classList.contains('key') || 
        e.target.classList.contains('recipient-item') ||
        e.target.classList.contains('quick-transfer-card')) {
        setTimeout(() => {
            e.target.style.transform = '';
        }, 150);
    }
});

// Add loading states for better UX
function showLoading() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    loadingOverlay.appendChild(spinner);
    
    document.body.appendChild(loadingOverlay);
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        document.body.removeChild(loadingOverlay);
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showToast('發生錯誤，請稍後再試');
});

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function initializeApp() {
    console.log('Cathay CUBE Transfer App initialized');
    updateTime();
    
    // Add any additional initialization here
    if ('serviceWorker' in navigator) {
        // Register service worker for PWA functionality (optional)
        // navigator.serviceWorker.register('/sw.js');
    }
}