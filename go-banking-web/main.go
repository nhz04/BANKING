package main

import (
	"fmt"
	"math"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Account represents a bank account
type Account struct {
	ID          string    `json:"id"`
	AccountNo   string    `json:"account_no"`
	Name        string    `json:"name"`
	Balance     float64   `json:"balance"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Transaction represents a transaction
type Transaction struct {
	ID        string    `json:"id"`
	AccountNo string    `json:"account_no"`
	Type      string    `json:"type"` // "deposit", "withdraw"
	Amount    float64   `json:"amount"`
	Timestamp time.Time `json:"timestamp"`
	Balance   float64   `json:"balance"`
}

// BankingService handles all banking operations
type BankingService struct {
	accounts     map[string]*Account
	transactions []Transaction
	mutex        sync.RWMutex
}

// NewBankingService creates a new banking service
func NewBankingService() *BankingService {
	return &BankingService{
		accounts:     make(map[string]*Account),
		transactions: make([]Transaction, 0),
	}
}

// CreateAccount creates a new account
func (bs *BankingService) CreateAccount(accountNo, name string, initialBalance float64) (*Account, error) {
	bs.mutex.Lock()
	defer bs.mutex.Unlock()

	// Validate account number
	if len(accountNo) != 6 {
		return nil, fmt.Errorf("account number must be 6 digits")
	}
	
	accountNoRegex := regexp.MustCompile(`^\d{6}$`)
	if !accountNoRegex.MatchString(accountNo) {
		return nil, fmt.Errorf("account number must contain only digits")
	}

	// Check if account already exists
	if _, exists := bs.accounts[accountNo]; exists {
		return nil, fmt.Errorf("account already exists")
	}

	// Validate name
	nameRegex := regexp.MustCompile(`^[a-zA-Z\s]+$`)
	if !nameRegex.MatchString(name) {
		return nil, fmt.Errorf("name must contain only letters and spaces")
	}

	// Validate initial balance
	if initialBalance < 100 {
		return nil, fmt.Errorf("initial balance must be at least $100")
	}

	account := &Account{
		ID:        uuid.New().String(),
		AccountNo: accountNo,
		Name:      strings.TrimSpace(name),
		Balance:   math.Round(initialBalance*100) / 100,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	bs.accounts[accountNo] = account

	// Create initial transaction
	transaction := Transaction{
		ID:        uuid.New().String(),
		AccountNo: accountNo,
		Type:      "deposit",
		Amount:    initialBalance,
		Timestamp: time.Now(),
		Balance:   initialBalance,
	}
	bs.transactions = append(bs.transactions, transaction)

	return account, nil
}

// GetAccount retrieves an account
func (bs *BankingService) GetAccount(accountNo string) (*Account, error) {
	bs.mutex.RLock()
	defer bs.mutex.RUnlock()

	account, exists := bs.accounts[accountNo]
	if !exists {
		return nil, fmt.Errorf("account not found")
	}

	return account, nil
}

// Deposit adds money to an account
func (bs *BankingService) Deposit(accountNo string, amount float64) (*Account, error) {
	bs.mutex.Lock()
	defer bs.mutex.Unlock()

	account, exists := bs.accounts[accountNo]
	if !exists {
		return nil, fmt.Errorf("account not found")
	}

	if amount <= 0 {
		return nil, fmt.Errorf("deposit amount must be positive")
	}

	account.Balance = math.Round((account.Balance+amount)*100) / 100
	account.UpdatedAt = time.Now()

	// Record transaction
	transaction := Transaction{
		ID:        uuid.New().String(),
		AccountNo: accountNo,
		Type:      "deposit",
		Amount:    amount,
		Timestamp: time.Now(),
		Balance:   account.Balance,
	}
	bs.transactions = append(bs.transactions, transaction)

	return account, nil
}

// Withdraw removes money from an account
func (bs *BankingService) Withdraw(accountNo string, amount float64) (*Account, error) {
	bs.mutex.Lock()
	defer bs.mutex.Unlock()

	account, exists := bs.accounts[accountNo]
	if !exists {
		return nil, fmt.Errorf("account not found")
	}

	if amount <= 0 {
		return nil, fmt.Errorf("withdrawal amount must be positive")
	}

	if amount > account.Balance {
		return nil, fmt.Errorf("insufficient funds")
	}

	account.Balance = math.Round((account.Balance-amount)*100) / 100
	account.UpdatedAt = time.Now()

	// Record transaction
	transaction := Transaction{
		ID:        uuid.New().String(),
		AccountNo: accountNo,
		Type:      "withdraw",
		Amount:    amount,
		Timestamp: time.Now(),
		Balance:   account.Balance,
	}
	bs.transactions = append(bs.transactions, transaction)

	return account, nil
}

// DeleteAccount removes an account
func (bs *BankingService) DeleteAccount(accountNo string) error {
	bs.mutex.Lock()
	defer bs.mutex.Unlock()

	if _, exists := bs.accounts[accountNo]; !exists {
		return fmt.Errorf("account not found")
	}

	delete(bs.accounts, accountNo)
	return nil
}

// GetTransactions retrieves transactions for an account
func (bs *BankingService) GetTransactions(accountNo string) ([]Transaction, error) {
	bs.mutex.RLock()
	defer bs.mutex.RUnlock()

	if _, exists := bs.accounts[accountNo]; !exists {
		return nil, fmt.Errorf("account not found")
	}

	var accountTransactions []Transaction
	for _, transaction := range bs.transactions {
		if transaction.AccountNo == accountNo {
			accountTransactions = append(accountTransactions, transaction)
		}
	}

	// Reverse to show latest first
	for i, j := 0, len(accountTransactions)-1; i < j; i, j = i+1, j-1 {
		accountTransactions[i], accountTransactions[j] = accountTransactions[j], accountTransactions[i]
	}

	return accountTransactions, nil
}

// GetAllAccounts returns all accounts
func (bs *BankingService) GetAllAccounts() []*Account {
	bs.mutex.RLock()
	defer bs.mutex.RUnlock()

	accounts := make([]*Account, 0, len(bs.accounts))
	for _, account := range bs.accounts {
		accounts = append(accounts, account)
	}

	return accounts
}

var bankingService = NewBankingService()

func main() {
	// Set Gin to release mode for production
	gin.SetMode(gin.ReleaseMode)

	r := gin.Default()

	// Serve static files
	r.Static("/static", "./static")
	r.LoadHTMLGlob("templates/*")

	// Routes
	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{
			"title": "404 Finance - Your Money, Your Way",
		})
	})

	// API Routes
	api := r.Group("/api/v1")
	{
		api.POST("/accounts", createAccountHandler)
		api.GET("/accounts/:accountNo", getAccountHandler)
		api.POST("/accounts/:accountNo/deposit", depositHandler)
		api.POST("/accounts/:accountNo/withdraw", withdrawHandler)
		api.DELETE("/accounts/:accountNo", deleteAccountHandler)
		api.GET("/accounts/:accountNo/transactions", getTransactionsHandler)
		api.GET("/accounts", getAllAccountsHandler)
	}

	fmt.Println("🏦 404 Finance Banking System")
	fmt.Println("🌐 Server starting on http://localhost:8080")
	fmt.Println("💰 Your money, your way!")
	
	r.Run(":8080")
}

// HTTP Handlers

func createAccountHandler(c *gin.Context) {
	var req struct {
		AccountNo      string  `json:"account_no" binding:"required"`
		Name           string  `json:"name" binding:"required"`
		InitialBalance float64 `json:"initial_balance" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	account, err := bankingService.CreateAccount(req.AccountNo, req.Name, req.InitialBalance)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Account created successfully",
		"account": account,
	})
}

func getAccountHandler(c *gin.Context) {
	accountNo := c.Param("accountNo")
	
	account, err := bankingService.GetAccount(accountNo)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"account": account,
	})
}

func depositHandler(c *gin.Context) {
	accountNo := c.Param("accountNo")
	
	var req struct {
		Amount float64 `json:"amount" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount"})
		return
	}

	account, err := bankingService.Deposit(accountNo, req.Amount)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Deposited $%.2f successfully", req.Amount),
		"account": account,
	})
}

func withdrawHandler(c *gin.Context) {
	accountNo := c.Param("accountNo")
	
	var req struct {
		Amount float64 `json:"amount" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount"})
		return
	}

	account, err := bankingService.Withdraw(accountNo, req.Amount)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Withdrew $%.2f successfully", req.Amount),
		"account": account,
	})
}

func deleteAccountHandler(c *gin.Context) {
	accountNo := c.Param("accountNo")
	
	err := bankingService.DeleteAccount(accountNo)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Account deleted successfully",
	})
}

func getTransactionsHandler(c *gin.Context) {
	accountNo := c.Param("accountNo")
	
	transactions, err := bankingService.GetTransactions(accountNo)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"transactions": transactions,
	})
}

func getAllAccountsHandler(c *gin.Context) {
	accounts := bankingService.GetAllAccounts()
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"accounts": accounts,
	})
}