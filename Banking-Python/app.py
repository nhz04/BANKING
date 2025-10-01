from flask import Flask, jsonify, render_template, request, redirect, url_for, flash
from datetime import datetime

app = Flask(__name__)
app.secret_key = "supersecretkey"  


accounts = {}
transactions = []


def calculate_stats():
    total_accounts = len(accounts)
    total_balance = sum(acc["balance"] for acc in accounts.values())
    total_deposit = sum(t["amount"] for t in transactions if t["type"] == "deposit")
    total_withdrawal = sum(t["amount"] for t in transactions if t["type"] == "withdraw")
    return total_accounts, total_balance, total_deposit, total_withdrawal



# ---------------- ROUTES ---------------- #
@app.route("/")
def dashboard():
    total_accounts, total_balance, total_deposit, total_withdrawal = calculate_stats()
    return render_template(
        "dashboard.html",
        active_page="dashboard",
        total_accounts=total_accounts,
        total_balance=total_balance,
        total_deposit=total_deposit,
        total_withdrawal=total_withdrawal
    )

@app.route("/accounts")
def accounts_page():
    return render_template("accounts.html", active_page="accounts", accounts=accounts)

@app.route("/transactions")
def transactions_page():
    return render_template("transactions.html", active_page="transactions", transactions=transactions)



# ---------------- ACCOUNT ACTIONS ---------------- #


@app.route("/create_account", methods=["POST"])
def create_account():
    acc_no = request.form["acc_no"]
    name = request.form["name"]
    balance = request.form["balance"]

    if not acc_no.isdigit() or len(acc_no) != 6:
        flash("Account number must be 6 digits.", "error")
    elif acc_no in accounts:
        flash("Account already exists.", "error")
    elif not name.replace(" ", "").isalpha():
        flash("Name must only contain letters.", "error")
    else:
        try:
            balance = float(balance)
            if balance < 100:
                flash("Initial balance must be at least ₱100.", "error")
            else:
                accounts[acc_no] = {
                    "name": name,
                    "balance": balance,
                    "created_at": datetime.now()  
                }

                transactions.append({
                    "acc_no": acc_no,
                    "type": "deposit",
                    "amount": balance,
                    "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S") 
                })

                flash(f"Account {acc_no} created successfully!", "success")
        except ValueError:
            flash("Invalid balance amount.", "error")

    return redirect(request.referrer or url_for('dashboard'))


@app.route("/deposit", methods=["POST"])
def deposit():
    acc_no = request.form["acc_no"]
    amount = request.form["amount"]

    if acc_no not in accounts:
        flash("Account not found.", "error")
    else:
        try:
            amount = float(amount)
            if amount <= 0:
                flash("Deposit must be positive.", "error")
            else:
                accounts[acc_no]["balance"] += amount
                transactions.append({"acc_no": acc_no, "type": "deposit", "amount": amount})
                flash(f"Deposited ₱{amount:.2f} into {acc_no}.", "success")
        except ValueError:
            flash("Invalid deposit amount.", "error")

    return redirect(request.referrer or url_for('dashboard'))

@app.route("/withdraw", methods=["POST"])
def withdraw():
    acc_no = request.form["acc_no"]
    amount = request.form["amount"]

    if acc_no not in accounts:
        flash("Account not found.", "error")
    else:
        try:
            amount = float(amount)
            if amount <= 0:
                flash("Withdrawal must be positive.", "error")
            elif amount > accounts[acc_no]["balance"]:
                flash("Insufficient funds.", "error")
            else:
                accounts[acc_no]["balance"] -= amount
                transactions.append({"acc_no": acc_no, "type": "withdraw", "amount": amount})
                flash(f"Withdrew ₱{amount:.2f} from {acc_no}.", "success")
        except ValueError:
            flash("Invalid withdrawal amount.", "error")

 
    return redirect(request.referrer or url_for('dashboard'))


@app.route("/check_balance", methods=["POST"])
def check_balance():
    acc_no = request.form.get("acc_no")

    if acc_no not in accounts:
        return jsonify({"success": False, "message": "Account not found."})
    
    balance = accounts[acc_no]["balance"]
    return jsonify({"success": True, "acc_no": acc_no, "balance": balance})



@app.route("/delete_account/<acc_no>", methods=["POST"])
def delete_account(acc_no):
    if acc_no in accounts:
        del accounts[acc_no]

      
        global transactions
        transactions = [t for t in transactions if t["acc_no"] != acc_no]

        flash(f"Account {acc_no} has been deleted.", "success")
    else:
        flash("Account not found.", "error")
    return redirect(url_for("accounts_page"))




@app.route("/get_transactions")
def get_transactions():
    acc_no = request.args.get("acc_no")  # Get from URL query
    acc_transactions = []

    if acc_no in accounts:
        acc_transactions = [
            {
                "date": t.get("date", datetime.now().strftime("%Y-%m-%d")),
                "type": t["type"].capitalize(),
                "amount": t["amount"],
                "balance": accounts[acc_no]["balance"],  
                "txn_id": t.get("txn_id", f"TXN{idx+1:03}")  
            }
            for idx, t in enumerate(transactions) if t["acc_no"] == acc_no
        ]

    return render_template(
        "transactions.html", 
        acc_no=acc_no, 
        transactions=acc_transactions
    )



if __name__ == "__main__":
    app.run(debug=True)
