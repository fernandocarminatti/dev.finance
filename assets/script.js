//===== Modal Object =====

const modal = {
    openOrClose(){
        document.querySelector('.modal-overlay').classList.toggle('js-active')
    }
}

//===== Local Storage  =====

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finance:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    },
}

//===== Transactions List =====

const transactionsList = []

//===== Transactions Blocks | Incomes, Expenses, Total =====

const transactionMix = {
    all: Storage.get(),

    add(newTransaction) {
        transactionMix.all.push(newTransaction)

        runApp.reload()
    },

    remove(index){
        transactionMix.all.splice(index, 1)
        
        runApp.reload()
    },

    incomes() {
        let income = 0
        transactionMix.all.forEach((newTransaction) => {
            if (newTransaction.amount > 0) {
                income += newTransaction.amount;
            }
        })
        return income
    },

    expenses() {
        let expense = 0
        transactionMix.all.forEach((newTransaction) => {
            if (newTransaction.amount < 0) {
                expense += newTransaction.amount;
            }
        })
        return expense
    },

    walletTotal(){
        return this.incomes() + this.expenses()
    }
}

//===== Transactions to HTML(DOM) =====

const transactionsView = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction (transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = transactionsView.innerHTMLTransactions(transaction, index)
        
        transactionsView.transactionsContainer.appendChild(tr)
    
    },

    innerHTMLTransactions(transaction, index){
        const CheckIncome = transaction.amount > 0 ? "income" : "expense";

        const newAmount = Utils.formatCurrency(transaction.amount)

        const ToHTML = `
            <td class="description"><strong>${transaction.description}</strong></td>
            <td class="amount ${CheckIncome}"><strong> ${newAmount}</strong></td>
            <td class="date">${transaction.date}</td>
            <td>
                <a class="rem-link" href="#">
                <img onclick= transactionMix.remove(${index}) class="remove-icon" src="assets/minus.svg" alt="Remove Transaction">
                </a>
            </td>
        `
        return ToHTML
    },

    updateBalance() {

        document.querySelector('.inc-money').innerHTML = Utils.formatCurrency(transactionMix.incomes())

        document.querySelector('.exp-money').innerHTML = Utils.formatCurrency(transactionMix.expenses())
        document.querySelector('.total-money').innerHTML = Utils.formatCurrency(transactionMix.walletTotal())

    },

    clearList() {
        transactionsView.transactionsContainer.innerHTML = ""
    }
}

//===== Currency Conversion =====

const Utils = {
    formatAmount(value){
        value = Number(value) * 100

        return value
    },

    formatDate(date){
        const splitDate = date.split("-")

        return `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`
     },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "- " : "";
        
        value = String(value).replace(/\D/g, "");

        value = Number(value) / 100;

        value = value.toLocaleString("pt-BR", { style: "currency", currency:"BRL"})

        return signal + value;
    }
}

//===== Form Submit  =====

const Form = {
    description: document.querySelector('input#input-desc'),
    amount: document.querySelector('input#input-number'),
    date: document.querySelector('input#input-date'),

    getValues(){
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

    validateFields(){
        const { description, amount, date } = Form.getValues();

        if( description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos!")
        }
    },

    formatValues(){
        let { description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return { 
            description,
            amount,
            date
         }
    },

    clearForm(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields();
            const newTransaction = Form.formatValues()
            transactionMix.add(newTransaction)
            Form.clearForm()
            modal.openOrClose()
        }   catch (error) {
            alert(error.message)
        }
    },
}

//===== Run App  =====

const runApp = {
    init(){
        transactionMix.all.forEach( (transaction, index) => {
            transactionsView.addTransaction(transaction, index)
        })

        transactionsView.updateBalance()

        Storage.set(transactionMix.all)
    },
    
    reload(){
        transactionsView.clearList()
        runApp.init()
    }
}

runApp.init()