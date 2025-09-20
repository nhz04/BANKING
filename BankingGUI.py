import tkinter as tk
from tkinter import PhotoImage, messagebox

accounts = {}




# ---------------- Functions ---------------- #
def create_account():
    acc_no = entry_create_acc_no.get()
    name = entry_create_name.get()
    balance_str = entry_create_balance.get()

    if not acc_no.isdigit() or len(acc_no) != 6:
        messagebox.showerror("Error", "Account number must be 6 digits.")
        return
    if acc_no in accounts:
        messagebox.showerror("Error", "Account already exists.")
        return
    if not name.isalpha():
        messagebox.showerror("Error", "Name must contain only letters.")
        return
    try:
        balance = float(balance_str)
        if balance < 100:
            messagebox.showerror("Error", "Initial balance must be at least 100.")
            return
    except ValueError:
        messagebox.showerror("Error", "Invalid balance amount.")
        return

    accounts[acc_no] = {"name": name, "balance": balance}
    messagebox.showinfo("Success", f"Account {acc_no} created successfully!")
    clear_entries()

    enable_transaction_buttons()
   

def deposit():
    acc_no = entry_trans_acc_no.get()
    if acc_no not in accounts:
        messagebox.showerror("Error", "Account not found.")
        return
    try:
        amount = float(entry_trans_amount.get())
        if amount <= 0:
            messagebox.showerror("Error", "Deposit must be positive.")
            return
        accounts[acc_no]["balance"] += amount
        messagebox.showinfo("Success", f"Deposited {amount:.2f}. New Balance: {accounts[acc_no]['balance']:.2f}")
        clear_entries()
    except ValueError:
        messagebox.showerror("Error", "Invalid amount.")

def withdraw():
    acc_no = entry_trans_acc_no.get()
    if acc_no not in accounts:
        messagebox.showerror("Error", "Account not found.")
        return
    try:
        amount = float(entry_trans_amount.get())
        if amount <= 0:
            messagebox.showerror("Error", "Withdrawal must be positive.")
            return
        if amount > accounts[acc_no]["balance"]:
            messagebox.showerror("Error", "Insufficient funds.")
            return
        accounts[acc_no]["balance"] -= amount
        messagebox.showinfo("Success", f"Withdrew {amount:.2f}. New Balance: {accounts[acc_no]['balance']:.2f}")
        clear_entries()
    except ValueError:
        messagebox.showerror("Error", "Invalid amount.")

def check_balance():
    acc_no = entry_view_acc_no.get()
    if acc_no not in accounts:
        messagebox.showerror("Error", "Account not found.")
        return
    messagebox.showinfo("Balance", f"Current Balance: {accounts[acc_no]['balance']:.2f}")

def view_account():
    acc_no = entry_view_acc_no.get()
    if acc_no not in accounts:
        messagebox.showerror("Error", "Account not found.")
        return
    acc = accounts[acc_no]
    messagebox.showinfo("Account Details",
                        f"Account No: {acc_no}\nName: {acc['name']}\nBalance: {acc['balance']:.2f}")
    

def delete_account():
    acc_no = entry_delete_acc_no.get()
    if acc_no not in accounts:
        messagebox.showerror("Error", "Account not found.")
        return
    confirm = messagebox.askyesno("Confirm", f"Are you sure you want to delete account {acc_no}?")
    if confirm:
        del accounts[acc_no]
        messagebox.showinfo("Success", f"Account {acc_no} deleted.")
        clear_entries()


def clear_entries():
    entry_create_acc_no.delete(0, tk.END)
    entry_create_name.delete(0, tk.END)
    entry_create_balance.delete(0, tk.END)
    entry_trans_acc_no.delete(0, tk.END)
    entry_trans_amount.delete(0, tk.END)
    entry_view_acc_no.delete(0, tk.END)  
    entry_delete_acc_no.delete(0, tk.END) 

def enable_transaction_buttons():
    deposit_btn.config(state="normal")
    withdraw_btn.config(state="normal")
    check_btn.config(state="normal")
    view_btn.config(state="normal")
    delete_btn.config(state="normal")

# ---------------- GUI ---------------- #

root = tk.Tk()
root.title("Banking System")
root.geometry("700x600")   
root.resizable(False, False)  



icon = PhotoImage(file='bank_icon.png')
root.iconphoto(True, icon)

root.grid_columnconfigure(0, weight=1)  
root.grid_columnconfigure(1, weight=2)  


# ---------------- Side Panel ---------------- #
side_panel = tk.Frame(root, bg="#2F4F4F", width=200)
side_panel.grid(row=0, column=0, rowspan=6, sticky="nsew")  
side_panel.grid_propagate(False)  

for i in range(6):
    root.grid_rowconfigure(i, weight=1)


center_frame = tk.Frame(side_panel, bg="#2F4F4F")
center_frame.pack(expand=True)  


welcome_label = tk.Label(
    center_frame,
    text="WELCOME TO 404 FINANCE",
    fg="white",
    bg="#2F4F4F",
    font=("Arial", 18, "bold"),
    wraplength=180,
    justify="center"
)
welcome_label.pack(pady=(0, 5))  


subtext_label = tk.Label(
    center_frame,
    text="Your money, your way",
    fg="white",
    bg="#2F4F4F",
    font=("Arial", 10),
    wraplength=180,
    justify="center"
)
subtext_label.pack(pady=(0, 0))




# ---------------- Main Panel Frames ---------------- #


main_bg = "#FFFFFF"



frame_create = tk.LabelFrame(root, text="Create Account", bg=main_bg, padx=10, pady=10)
frame_create.grid(row=0, column=1, padx=10, pady=5, sticky="nsew")

tk.Label(frame_create, text="Account Number (6 digits):", bg=main_bg, fg="#333333").grid(row=0, column=0, sticky="w")
tk.Label(frame_create, text="Account Holder Name:", bg=main_bg, fg="#333333").grid(row=1, column=0, sticky="w")
tk.Label(frame_create, text="Initial Balance:", bg=main_bg, fg="#333333").grid(row=2, column=0, sticky="w")

entry_create_acc_no = tk.Entry(frame_create)
entry_create_acc_no.grid(row=0, column=1, pady=5)
entry_create_name = tk.Entry(frame_create)
entry_create_name.grid(row=1, column=1, pady=5)
entry_create_balance = tk.Entry(frame_create)
entry_create_balance.grid(row=2, column=1, pady=5)

tk.Button(frame_create, text="Create Account", width=20, bg="#007BFF", fg="white", command=create_account).grid(row=3, column=0, columnspan=2, pady=5)


frame_trans = tk.LabelFrame(root, text="Transactions", bg=main_bg, padx=10, pady=10)
frame_trans.grid(row=1, column=1, padx=10, pady=5, sticky="nsew")

tk.Label(frame_trans, text="Account Number:", bg=main_bg, fg="#333333").grid(row=0, column=0, sticky="w")
tk.Label(frame_trans, text="Amount:", bg=main_bg, fg="#333333").grid(row=1, column=0, sticky="w")

entry_trans_acc_no = tk.Entry(frame_trans)
entry_trans_acc_no.grid(row=0, column=1, pady=5)
entry_trans_amount = tk.Entry(frame_trans)
entry_trans_amount.grid(row=1, column=1, pady=5)

deposit_btn = tk.Button(frame_trans, text="Deposit", width=15, bg="#28A745", fg="white", command=deposit, state="disabled")
deposit_btn.grid(row=2, column=0, pady=5)
withdraw_btn = tk.Button(frame_trans, text="Withdraw", width=15, bg="#E8AF2A", fg="white", command=withdraw, state="disabled")
withdraw_btn.grid(row=2, column=1, pady=5)


frame_view = tk.LabelFrame(root, text="View / Balance", bg=main_bg, padx=10, pady=10)
frame_view.grid(row=2, column=1, padx=10, pady=5, sticky="nsew")

tk.Label(frame_view, text="Account Number:", bg=main_bg, fg="#333333").grid(row=0, column=0, sticky="w")
entry_view_acc_no = tk.Entry(frame_view)
entry_view_acc_no.grid(row=0, column=1, pady=5)

view_btn = tk.Button(frame_view, text="View Account", width=15, bg="#17A2B8", fg="white", command=view_account, state="disabled")
view_btn.grid(row=1, column=0, pady=5)
check_btn = tk.Button(frame_view, text="Check Balance", width=15, bg="#B37BB5", fg="white", command=check_balance, state="disabled")
check_btn.grid(row=1, column=1, pady=5)


frame_delete = tk.LabelFrame(root, text="Delete Account", bg=main_bg, padx=10, pady=10)
frame_delete.grid(row=3, column=1, padx=10, pady=5, sticky="nsew")

tk.Label(frame_delete, text="Account Number:", bg=main_bg, fg="#333333").grid(row=0, column=0, sticky="w")
entry_delete_acc_no = tk.Entry(frame_delete)
entry_delete_acc_no.grid(row=0, column=1, pady=5)

delete_btn = tk.Button(frame_delete, text="Delete Account", width=20, bg="#E50808", fg="white", command=delete_account, state="disabled")
delete_btn.grid(row=1, column=0, columnspan=2, pady=5)


tk.Button(root, text="Exit", width=20, bg="#343A40", fg="white", command=root.quit).grid(row=5, column=1, pady=10)


for i in range(6):
    root.grid_rowconfigure(i, weight=1)
root.grid_columnconfigure(1, weight=1)

root.configure(bg="#F7FAFC")
root.mainloop()





