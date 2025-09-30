# 🏦 404 Finance - Go Banking Web Application

A modern, interactive web-based banking system built with Go and featuring a stunning user interface that will make users go "WOW!" 

## ✨ Features

### 🎨 **Beautiful & Interactive UI**
- **Gradient animations** and floating background elements
- **Glass morphism design** with backdrop blur effects
- **Smooth transitions** and hover animations
- **Ripple effects** on card interactions
- **Responsive design** that works on all devices
- **Toast notifications** for user feedback
- **Modal dialogs** for seamless interactions

### 🏛️ **Core Banking Features**
- **Account Creation** with validation (6-digit account numbers, minimum $100 balance)
- **Deposit & Withdrawal** operations with real-time balance updates
- **Balance Inquiry** with detailed account information
- **Transaction History** with timestamps and transaction IDs
- **Account Management** with delete functionality
- **Dashboard** with statistics and quick actions

### 🚀 **Technical Features**
- **RESTful API** built with Gin framework
- **Concurrent operations** with thread-safe data handling
- **Form validation** on both client and server side
- **Keyboard shortcuts** for power users
- **Real-time updates** without page refreshes
- **Loading indicators** and error handling
- **UUID-based** transaction tracking

## 🎯 User Experience Highlights

### **Navigation**
- Clean header with elegant logo
- Section-based navigation (Dashboard, Accounts, Transactions)
- Active state indicators

### **Dashboard**
- Real-time statistics (Total Accounts, Balance, Deposits, Withdrawals)
- Quick action buttons for common operations
- Beautiful stat cards with animated icons

### **Account Management**
- Grid layout showcasing all accounts
- Individual account cards with balance and actions
- One-click deposit/withdraw from account cards
- Account creation with live form validation

### **Transactions**
- Searchable transaction history by account
- Color-coded transaction types (green for deposits, red for withdrawals)
- Detailed transaction information with timestamps

### **Interactions**
- Smooth modal dialogs for all operations
- Auto-focus on form fields for better UX
- Real-time form validation with visual feedback
- Success/error notifications with animations

## 🛠️ Installation & Setup

### Prerequisites
- Go 1.21 or higher
- Git

### Quick Start

1. **Navigate to the project directory:**
   ```powershell
   cd "c:\Users\kinne\Downloads\BANKING\go-banking-web"
   ```

2. **Initialize Go module and install dependencies:**
   ```powershell
   go mod tidy
   ```

3. **Run the application:**
   ```powershell
   go run main.go 
   cd go-banking-web; .\banking-web.exe
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:8080
   ```

## 🎮 Usage Guide

### **Keyboard Shortcuts**
- `Ctrl+N` - Create new account
- `Ctrl+D` - Make deposit
- `Ctrl+W` - Make withdrawal  
- `Ctrl+B` - Check balance
- `Ctrl+1` - Go to Dashboard
- `Ctrl+2` - Go to Accounts
- `Ctrl+3` - Go to Transactions
- `Escape` - Close modals

### **Account Numbers**
- Must be exactly 6 digits
- Only numeric characters allowed
- Automatically validated in real-time

### **Initial Balance**
- Minimum $100 required
- Supports decimal amounts (e.g., 150.50)

### **Names**
- Only letters and spaces allowed
- Automatically validated during typing

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Web interface |
| `POST` | `/api/v1/accounts` | Create account |
| `GET` | `/api/v1/accounts/:accountNo` | Get account details |
| `POST` | `/api/v1/accounts/:accountNo/deposit` | Make deposit |
| `POST` | `/api/v1/accounts/:accountNo/withdraw` | Make withdrawal |
| `DELETE` | `/api/v1/accounts/:accountNo` | Delete account |
| `GET` | `/api/v1/accounts/:accountNo/transactions` | Get transaction history |
| `GET` | `/api/v1/accounts` | Get all accounts |

## 📱 Mobile Responsive

The application is fully responsive and provides an excellent experience on:
- **Desktop computers** (1200px+)
- **Tablets** (768px - 1199px)
- **Mobile phones** (< 768px)

## 🎨 Design Philosophy

### **Color Scheme**
- **Primary**: Purple gradients (#667eea to #764ba2)
- **Success**: Green gradients (#43e97b to #38f9d7)
- **Warning**: Orange gradients (#fa709a to #fee140)
- **Info**: Blue gradients (#4facfe to #00f2fe)
- **Background**: Dynamic animated gradients

### **Typography**
- **Font Family**: Inter (modern, clean sans-serif)
- **Weights**: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### **Animations**
- **Background shapes** floating continuously
- **Card hover effects** with elevation
- **Button press animations** with scale effects
- **Modal slide-in** animations
- **Ripple effects** on interactions

## 🔧 Development Features

### **Data Structure**
```go
type Account struct {
    ID          string    `json:"id"`
    AccountNo   string    `json:"account_no"`
    Name        string    `json:"name"`
    Balance     float64   `json:"balance"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}

type Transaction struct {
    ID        string    `json:"id"`
    AccountNo string    `json:"account_no"`
    Type      string    `json:"type"`
    Amount    float64   `json:"amount"`
    Timestamp time.Time `json:"timestamp"`
    Balance   float64   `json:"balance"`
}
```

### **Thread Safety**
- Uses `sync.RWMutex` for concurrent access to data
- Separate read/write locks for optimal performance

### **Validation**
- **Server-side**: Comprehensive validation with detailed error messages
- **Client-side**: Real-time validation with visual feedback
- **Regex patterns** for data format validation

## 🚀 Production Deployment

For production deployment:

1. **Build the binary:**
   ```powershell
   go build -o banking-web.exe main.go
   ```

2. **Set Gin to release mode:**
   ```go
   gin.SetMode(gin.ReleaseMode)
   ```

3. **Configure reverse proxy** (Nginx recommended)

4. **Set up SSL certificate** for HTTPS

## 🎊 Why Users Will Say "WOW!"

1. **Visual Impact**: Stunning gradient backgrounds with floating animations
2. **Smooth Interactions**: Every click, hover, and transition is beautifully animated
3. **Intuitive Design**: Clean, modern interface that's immediately understandable
4. **Responsive Excellence**: Perfect experience on any device size
5. **Professional Feel**: Glass morphism and modern design trends
6. **Interactive Feedback**: Ripple effects, toast notifications, and loading states
7. **Keyboard Support**: Power user features with shortcuts
8. **Real-time Updates**: No page refreshes needed
9. **Form Intelligence**: Auto-validation and smart input handling
10. **Attention to Detail**: Every pixel is crafted for the best user experience

## 📞 Support

For any issues or questions, please check the browser console for detailed error messages and ensure all dependencies are properly installed.

---

**🏦 404 Finance - Your Money, Your Way!** 💰