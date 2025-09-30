// App State
let currentSection = 'dashboard';
let currentTransactionType = '';
let accounts = [];
let transactions = [];

// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadDashboardData();
    setupEventListeners();
    addInteractiveAnimations();
});

// Add interactive animations
function addInteractiveAnimations() {
    // Add floating animation to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in-up');
    });

    // Add staggered animations to action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach((btn, index) => {
        btn.style.animationDelay = `${0.3 + index * 0.1}s`;
        btn.classList.add('fade-in-up');
    });

    // Add counter animation to stats
    animateCounters();
}

// Animate counter numbers
function animateCounters() {
    const counters = [
        { element: document.getElementById('total-accounts'), target: 0, prefix: '', suffix: '' },
        { element: document.getElementById('total-balance'), target: 0, prefix: '₱', suffix: '' },
        { element: document.getElementById('total-deposits'), target: 0, prefix: '₱', suffix: '' },
        { element: document.getElementById('total-withdrawals'), target: 0, prefix: '₱', suffix: '' }
    ];

    counters.forEach(counter => {
        if (counter.element) {
            animateCounter(counter.element, counter.target, counter.prefix, counter.suffix);
        }
    });
}

function animateCounter(element, target, prefix = '', suffix = '') {
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (prefix === '₱') {
            element.textContent = `${prefix}${current.toFixed(2)}`;
        } else {
            element.textContent = `${prefix}${Math.floor(current)}${suffix}`;
        }
    }, 16);
}

// Initialize Application
function initializeApp() {
    // Set active section
    showSection('dashboard');
    
    // Load accounts
    loadAccounts();
    
    // Setup form validation
    setupFormValidation();
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
        });
    });

    // Forms
    document.getElementById('create-account-form').addEventListener('submit', handleCreateAccount);
    document.getElementById('transaction-form').addEventListener('submit', handleTransaction);
    document.getElementById('balance-form').addEventListener('submit', handleCheckBalance);

    // Modal close on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Navigation Functions
function showSection(sectionName) {
    // Update nav links
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionName) {
            link.classList.add('active');
        }
    });

    // Update sections
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(`${sectionName}-section`).classList.add('active');
    currentSection = sectionName;

    // Load section-specific data
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'accounts':
            loadAccounts();
            break;
        case 'transactions':
            // Transactions load on demand
            break;
    }
}

// API Functions
async function apiCall(url, options = {}) {
    showLoading();
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'An error occurred');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    } finally {
        hideLoading();
    }
}

// Account Management
async function loadAccounts() {
    try {
        const response = await apiCall('/api/v1/accounts');
        accounts = response.accounts || [];
        console.log('Loaded accounts:', accounts.length);
        renderAccounts();
    } catch (error) {
        showToast('Failed to load accounts', 'error');
        console.error('Error loading accounts:', error);
    }
}

function renderAccounts() {
    const accountsGrid = document.getElementById('accounts-grid');
    
    if (accounts.length === 0) {
        accountsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-plus"></i>
                <h3>No Accounts Yet</h3>
                <p>Create your first account to get started</p>
                <button class="btn btn-primary" onclick="showCreateAccountModal()">
                    <i class="fas fa-plus"></i> Create Account
                </button>
            </div>
        `;
        return;
    }

    accountsGrid.innerHTML = accounts.map(account => `
        <div class="account-card" data-account="${account.account_no}">
            <div class="account-header">
                <div class="account-info">
                    <h3>${account.name}</h3>
                    <p>Account #${account.account_no}</p>
                    <small>Created: ${formatDate(account.created_at)}</small>
                </div>
                <div class="account-balance">
                    <div class="balance-amount" data-balance="${account.balance}">₱${formatLargeNumber(account.balance, true)}</div>
                    <div class="balance-label">Current Balance</div>
                </div>
            </div>
            <div class="account-actions">
                <button class="btn btn-success btn-sm" onclick="quickDeposit('${account.account_no}')">
                    <i class="fas fa-plus"></i> Deposit
                </button>
                <button class="btn btn-warning btn-sm" onclick="quickWithdraw('${account.account_no}')">
                    <i class="fas fa-minus"></i> Withdraw
                </button>
                <button class="btn btn-primary btn-sm" onclick="viewTransactions('${account.account_no}')">
                    <i class="fas fa-list"></i> History
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteAccount('${account.account_no}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
    
    // Apply responsive classes to balance amounts
    accounts.forEach(account => {
        const balanceElement = document.querySelector(`[data-balance="${account.balance}"]`);
        if (balanceElement) {
            addResponsiveClass(balanceElement, account.balance);
        }
    });
}

async function handleCreateAccount(e) {
    e.preventDefault();
    
    const accountNo = document.getElementById('account-no').value;
    const name = document.getElementById('account-name').value;
    const initialBalance = parseFloat(document.getElementById('initial-balance').value);

    try {
        const response = await apiCall('/api/v1/accounts', {
            method: 'POST',
            body: JSON.stringify({
                account_no: accountNo,
                name: name,
                initial_balance: initialBalance
            })
        });

        showToast(response.message, 'success');
        closeModal('create-account-modal');
        await loadAccounts();
        await updateDashboardStats(); // Update dashboard stats after creating account
        
        // If we're on the dashboard, force a refresh
        if (currentSection === 'dashboard') {
            showSection('dashboard');
        }
        
        document.getElementById('create-account-form').reset();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function deleteAccount(accountNo) {
    if (!confirm(`Are you sure you want to delete account ${accountNo}?`)) {
        return;
    }

    try {
        const response = await apiCall(`/api/v1/accounts/${accountNo}`, {
            method: 'DELETE'
        });

        showToast(response.message, 'success');
        await loadAccounts();
        await updateDashboardStats(); // Update dashboard stats after deleting account
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Transaction Management
async function handleTransaction(e) {
    e.preventDefault();
    
    const accountNo = document.getElementById('trans-account-no').value;
    const amount = parseFloat(document.getElementById('trans-amount').value);

    try {
        const endpoint = `/api/v1/accounts/${accountNo}/${currentTransactionType}`;
        const response = await apiCall(endpoint, {
            method: 'POST',
            body: JSON.stringify({ amount })
        });

        showToast(response.message, 'success');
        closeModal('transaction-modal');
        await loadAccounts();
        await updateDashboardStats(); // Update dashboard stats after transaction
        
        // If we're on the dashboard, force a refresh
        if (currentSection === 'dashboard') {
            showSection('dashboard');
        }
        
        document.getElementById('transaction-form').reset();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function quickDeposit(accountNo) {
    document.getElementById('trans-account-no').value = accountNo;
    showTransactionModal('deposit');
}

function quickWithdraw(accountNo) {
    document.getElementById('trans-account-no').value = accountNo;
    showTransactionModal('withdraw');
}

async function handleCheckBalance(e) {
    e.preventDefault();
    
    const accountNo = document.getElementById('balance-account-no').value;

    try {
        const response = await apiCall(`/api/v1/accounts/${accountNo}`);
        const account = response.account;
        
        document.getElementById('balance-result').innerHTML = `
            <h3>Account Balance</h3>
            <div class="amount">₱${formatLargeNumber(account.balance, true)}</div>
            <div class="account-details">
                ${account.name} • Account #${account.account_no}
            </div>
        `;
        
        document.getElementById('balance-result').style.display = 'block';
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Transaction History
async function loadTransactions() {
    const accountNo = document.getElementById('transaction-account').value;
    
    if (!accountNo) {
        showToast('Please enter an account number', 'error');
        return;
    }

    try {
        const response = await apiCall(`/api/v1/accounts/${accountNo}/transactions`);
        transactions = response.transactions || [];
        renderTransactions();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function renderTransactions() {
    const container = document.getElementById('transactions-container');
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exchange-alt"></i>
                <h3>No Transactions Found</h3>
                <p>No transactions found for this account</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <table class="transactions-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Balance</th>
                    <th>Transaction ID</th>
                </tr>
            </thead>
            <tbody>
                ${transactions.map(transaction => `
                    <tr>
                        <td>${formatDateTime(transaction.timestamp)}</td>
                        <td>
                            <span class="transaction-type ${transaction.type}">
                                <i class="fas fa-arrow-${transaction.type === 'deposit' ? 'up' : 'down'}"></i>
                                ${transaction.type}
                            </span>
                        </td>
                        <td>₱${formatLargeNumber(transaction.amount, true)}</td>
                        <td>₱${formatLargeNumber(transaction.balance, true)}</td>
                        <td><small>${transaction.id.substring(0, 8)}...</small></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function viewTransactions(accountNo) {
    document.getElementById('transaction-account').value = accountNo;
    showSection('transactions');
    loadTransactions();
}

// Dashboard
async function loadDashboardData() {
    console.log('Loading dashboard data...');
    await loadAccounts();
    await updateDashboardStats();
    console.log('Dashboard data loaded successfully');
}

async function updateDashboardStats() {
    console.log('Updating dashboard stats with', accounts.length, 'accounts');
    
    const totalAccounts = accounts.length;
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    
    console.log('Total accounts:', totalAccounts, 'Total balance:', totalBalance);
    
    // Update account and balance stats immediately
    const accountsElement = document.getElementById('total-accounts');
    const balanceElement = document.getElementById('total-balance');
    
    if (accountsElement) {
        accountsElement.textContent = totalAccounts.toString();
        addResponsiveClass(accountsElement, totalAccounts);
    }
    if (balanceElement) {
        balanceElement.textContent = formatSmartCurrency(totalBalance);
        addResponsiveClass(balanceElement, totalBalance);
    }
    
    // Calculate deposits and withdrawals from all transactions
    await calculateTotalTransactions();
}

// Calculate total deposits and withdrawals across all accounts
async function calculateTotalTransactions() {
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    
    console.log('Starting to calculate total transactions for', accounts.length, 'accounts');
    
    try {
        // Get transactions for each account
        for (const account of accounts) {
            console.log(`Loading transactions for account ${account.account_no}`);
            try {
                const response = await fetch(`/api/v1/accounts/${account.account_no}/transactions`);
                if (!response.ok) {
                    console.warn(`Failed to fetch transactions for ${account.account_no}: ${response.status}`);
                    continue;
                }
                
                const data = await response.json();
                const accountTransactions = data.transactions || [];
                
                console.log(`Found ${accountTransactions.length} transactions for account ${account.account_no}`);
                
                // Calculate deposits and withdrawals for this account
                accountTransactions.forEach(transaction => {
                    if (transaction.type === 'deposit') {
                        totalDeposits += transaction.amount;
                        console.log(`Added deposit: ₱${transaction.amount}, Total deposits now: ₱${totalDeposits}`);
                    } else if (transaction.type === 'withdraw') {
                        totalWithdrawals += transaction.amount;
                        console.log(`Added withdrawal: ₱${transaction.amount}, Total withdrawals now: ₱${totalWithdrawals}`);
                    }
                });
            } catch (error) {
                console.warn(`Failed to load transactions for account ${account.account_no}:`, error);
            }
        }
        
        console.log(`Final totals - Deposits: ₱${totalDeposits}, Withdrawals: ₱${totalWithdrawals}`);
        
        // Update the UI with calculated totals immediately
        const depositsElement = document.getElementById('total-deposits');
        const withdrawalsElement = document.getElementById('total-withdrawals');
        
        if (depositsElement) {
            depositsElement.textContent = formatSmartCurrency(totalDeposits);
            addResponsiveClass(depositsElement, totalDeposits);
        }
        if (withdrawalsElement) {
            withdrawalsElement.textContent = formatSmartCurrency(totalWithdrawals);
            addResponsiveClass(withdrawalsElement, totalWithdrawals);
        }
        
    } catch (error) {
        console.error('Error calculating total transactions:', error);
        // Fallback to showing 0 for both
        const depositsElement = document.getElementById('total-deposits');
        const withdrawalsElement = document.getElementById('total-withdrawals');
        
        if (depositsElement) {
            depositsElement.textContent = '₱0.00';
            addResponsiveClass(depositsElement, 0);
        }
        if (withdrawalsElement) {
            withdrawalsElement.textContent = '₱0.00';
            addResponsiveClass(withdrawalsElement, 0);
        }
    }
}

function animateCounterUpdate(element, newTarget, prefix = '', suffix = '') {
    const currentText = element.textContent.replace(/[₱,]/g, '');
    const currentValue = parseFloat(currentText) || 0;
    const target = newTarget;
    const duration = 1000;
    const increment = (target - currentValue) / (duration / 16);
    let current = currentValue;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
            current = target;
            clearInterval(timer);
        }
        
        if (prefix === '₱') {
            element.textContent = `${prefix}${current.toFixed(2)}`;
        } else {
            element.textContent = `${prefix}${Math.floor(current)}${suffix}`;
        }
    }, 16);
}

// Modal Functions
function showCreateAccountModal() {
    showModal('create-account-modal');
    document.getElementById('account-no').focus();
}

function showTransactionModal(type) {
    currentTransactionType = type;
    const modal = document.getElementById('transaction-modal');
    const title = document.getElementById('transaction-modal-title');
    const submitBtn = document.getElementById('transaction-submit-btn');
    
    if (type === 'deposit') {
        title.innerHTML = '<i class="fas fa-arrow-up"></i> Make Deposit';
        submitBtn.textContent = 'Deposit';
        submitBtn.className = 'btn btn-success';
    } else {
        title.innerHTML = '<i class="fas fa-arrow-down"></i> Make Withdrawal';
        submitBtn.textContent = 'Withdraw';
        submitBtn.className = 'btn btn-warning';
    }
    
    showModal('transaction-modal');
    document.getElementById('trans-account-no').focus();
}

function showBalanceModal() {
    showModal('balance-modal');
    document.getElementById('balance-result').style.display = 'none';
    document.getElementById('balance-account-no').focus();
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        closeModal(modal.id);
    });
}

// Form Validation
function setupFormValidation() {
    // Account number validation
    document.getElementById('account-no').addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '').substring(0, 6);
    });

    document.getElementById('trans-account-no').addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '').substring(0, 6);
    });

    document.getElementById('balance-account-no').addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '').substring(0, 6);
    });

    // Name validation
    document.getElementById('account-name').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
    });

    // Amount validation
    document.getElementById('initial-balance').addEventListener('input', function(e) {
        if (this.value < 0) this.value = 0;
    });

    document.getElementById('trans-amount').addEventListener('input', function(e) {
        if (this.value < 0) this.value = 0;
    });
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon i');
    
    // Update content
    toastMessage.textContent = message;
    
    // Update style
    toast.className = `toast ${type}`;
    
    // Update icon
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle';
    } else {
        toastIcon.className = 'fas fa-exclamation-circle';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Auto hide
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// Loading
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Utility Functions
function formatCurrency(amount) {
    return amount.toFixed(2);
}

function formatLargeNumber(amount, showFullPrecision = false) {
    const num = Math.abs(amount);
    
    // For very large numbers, use compact notation
    if (num >= 1000000000) {
        return (amount / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'M';
    } else if (num >= 10000) {
        return (amount / 1000).toFixed(1) + 'K';
    } else if (showFullPrecision) {
        return formatCurrency(amount);
    } else {
        return Math.round(amount).toLocaleString();
    }
}

function formatSmartCurrency(amount, prefix = '₱') {
    const num = Math.abs(amount);
    
    // Determine if we should use compact notation based on number size
    if (num >= 10000) {
        return prefix + formatLargeNumber(amount, false);
    } else {
        return prefix + formatCurrency(amount);
    }
}

function addResponsiveClass(element, amount) {
    if (!element) return;
    
    // Remove existing classes
    element.classList.remove('large-number', 'very-large-number');
    
    const num = Math.abs(amount);
    
    // Add appropriate class based on number size
    if (num >= 1000000) {
        element.classList.add('very-large-number');
    } else if (num >= 10000) {
        element.classList.add('large-number');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'n':
                e.preventDefault();
                showCreateAccountModal();
                break;
            case 'd':
                e.preventDefault();
                showTransactionModal('deposit');
                break;
            case 'w':
                e.preventDefault();
                showTransactionModal('withdraw');
                break;
            case 'b':
                e.preventDefault();
                showBalanceModal();
                break;
            case '1':
                e.preventDefault();
                showSection('dashboard');
                break;
            case '2':
                e.preventDefault();
                showSection('accounts');
                break;
            case '3':
                e.preventDefault();
                showSection('transactions');
                break;
        }
    }
});

// Add some visual feedback for interactions
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
        const btn = e.target.classList.contains('btn') ? e.target : e.target.closest('.btn');
        
        // Add ripple effect
        const ripple = document.createElement('span');
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');
        
        btn.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
        
        // Button press animation
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 150);
    }
});

// Enhanced card interactions
document.addEventListener('click', function(e) {
    if (e.target.closest('.stat-card')) {
        const card = e.target.closest('.stat-card');
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 200);
        
        // Add floating class for continuous animation
        card.classList.add('floating');
        setTimeout(() => {
            card.classList.remove('floating');
        }, 3000);
    }
});

// Add parallax effect to background shapes
document.addEventListener('mousemove', function(e) {
    const shapes = document.querySelectorAll('.shape');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.5;
        const x = (mouseX - 0.5) * speed * 20;
        const y = (mouseY - 0.5) * speed * 20;
        
        shape.style.transform = `translate(${x}px, ${y}px) scale(${1 + mouseX * 0.1})`;
    });
});

// Add scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.hasAttribute('data-animated')) {
            entry.target.classList.add('fade-in-up');
            entry.target.setAttribute('data-animated', 'true');
            // Stop observing this element since we only want to animate it once
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.querySelectorAll('.stat-card, .action-btn, .account-card').forEach(el => {
    observer.observe(el);
});

// Add ripple effect to cards
document.addEventListener('click', function(e) {
    if (e.target.closest('.stat-card') || e.target.closest('.account-card')) {
        const card = e.target.closest('.stat-card') || e.target.closest('.account-card');
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(197, 48, 48, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        
        card.style.position = 'relative';
        card.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);