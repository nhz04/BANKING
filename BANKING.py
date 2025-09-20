account = {}

def create_account() :
    acc_no = input("Enter account number: ")

    if not acc_no.isdigit() or len(acc_no) != 6 :
        print("Account number must be a 6-digit number.")
        return
    if acc_no in account :
        print("Account already exists.")
        return
    
    name = input("Enter account holder name: ")
    if not name.isalpha() :
        print("Name must contain only alphabetic characters.")
        return
    
    try :
        initial_deposit = float(input("Enter initial deposit amount: "))
        if initial_deposit < 0 :
            print("Initial deposit cannot be negative.")
            return
    except ValueError :
        print("Invalid amount. Please enter a numeric value.")
        return

    account[acc_no] = {'name': name, 'balance': initial_deposit}
    print("Account created successfully.")    
 

def deposit() :
    acc_no = input("Enter account number: ")
    if acc_no not in account :
        print("Account does not exist.")
        return
    amount = float(input("Enter amount to deposit: "))
    if amount <= 0 :
        print("Deposit amount must be positive.")
        return
    account[acc_no]['balance'] += amount
    print(f"Deposited {amount}. New balance is {account[acc_no]['balance']}.")

def withdraw() :
    acc_no = input("Enter account number: ")
    if acc_no not in account :
        print("Account does not exist.")
        return
    amount = float(input("Enter amount to withdraw: "))
    if amount <= 0 :
        print("Withdrawal amount must be positive.")
        return
    if amount > account[acc_no]['balance'] :
        print("Insufficient balance.")
        return
    account[acc_no]['balance'] -= amount
    print(f"Withdrew {amount}. New balance is {account[acc_no]['balance']}.")

def check_balance() :
    acc_no = input("Enter account number: ")
    if acc_no not in account :
        print("Account does not exist.")
        return
    print(f"Account balance is {account[acc_no]['balance']}.")     

def update_account() :
    acc_no = input("Enter account number: ")
    if acc_no not in account :
        print("Account does not exist.")
        return
    new_name = input("Enter new account holder name: ")
    account[acc_no]['name'] = new_name
    print("Account updated successfully.")

def delete_account() :
    acc_no = input("Enter account number: ")
    if acc_no not in account :
        print("Account does not exist.")
        return
    del account[acc_no]
    print("Account deleted successfully.")  


def main() :
    while True :
        print("\n1. Create Account")
        print("2. Deposit")
        print("3. Withdraw")
        print("4. Check Balance")
        print("5. Update Account")
        print("6. Delete Account")
        print("7. Exit")
        choice = input("Enter your choice: ")
        if choice == '1' :
            create_account()
        elif choice == '2' :
            deposit()
        elif choice == '3' :
            withdraw()
        elif choice == '4' :
            check_balance()
        elif choice == '5' :
            update_account()
        elif choice == '6' :
            delete_account()
        elif choice == '7' :
            print("Exiting...")
            break
        else :
            print("Invalid choice. Please try again.")   

if __name__ == "__main__" :
    main()               
     