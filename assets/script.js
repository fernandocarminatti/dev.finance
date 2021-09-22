//===== Modal Object =====

const modal = {
    openOrClose(){
        document.querySelector('.modal-overlay').classList.toggle('js-active')
    },
    editOpenOrClose(){
        document.querySelector('.edit-modal-overlay').classList.toggle('js-active')
    }
}

//===== Local Storage  =====

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
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

    reAdd(newTransaction, index) {
        transactionMix.all.splice(index, 1)
        transactionMix.all.splice(index, 0, newTransaction)
        runApp.reload()
    },

    remove(index){
        transactionMix.all.splice(index, 1)
        
        runApp.reload()
    },

    editTransaction(index){
        modal.editOpenOrClose()
        Form.editValues(index)
        let edit = document.querySelector('#edit-btn')
        edit.addEventListener('click', () => Form.reSubmit(index), {once: true})
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
        return tr
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
                <svg onclick=transactionMix.editTransaction(${index}) class="edit-icon alt="Edit Transaction" focusable="false" viewBox="0 0 24 24" aria-hidden="true" role="presentation"><path d="M16.84,2.73C16.45,2.73 16.07,2.88 15.77,3.17L13.65,5.29L18.95,10.6L21.07,8.5C21.67,7.89 21.67,6.94 21.07,6.36L17.9,3.17C17.6,2.88 17.22,2.73 16.84,2.73M12.94,6L4.84,14.11L7.4,14.39L7.58,16.68L9.86,16.85L10.15,19.41L18.25,11.3M4.25,15.04L2.5,21.73L9.2,19.94L8.96,17.78L6.65,17.61L6.47,15.29"></path></svg>
                </a>
                <img onclick=transactionMix.remove(${index}) class="remove-icon" src="assets/minus.svg" alt="Remove Transaction">
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

        return Math.round(value)
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
    ISODate: document.querySelector('input#input-date'),
    newIndex: 0,

    editValues(index){
        return {
            description: document.querySelector('input#input-desc-edit').value = transactionMix.all[index].description,
            amount: document.querySelector('input#input-number-edit').value = transactionMix.all[index].amount / 100,
            date: document.querySelector('input#input-date-edit').value = transactionMix.all[index].ISODate,
        }
    },

    readValues(){
        return{
            description: document.querySelector('input#input-desc-edit').value,
            amount: document.querySelector('input#input-number-edit').value,
            date: document.querySelector('input#input-date-edit').value,
            ISODate: document.querySelector('input#input-date-edit').value
        }
    },
    
    reValidateFields(){
        const { description, amount, date, ISODate } = Form.readValues();

        if( description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos!")
        }
    },

    reFormatValues(){
        let { description, amount, date, ISODate } = Form.readValues();

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return { 
            description,
            amount,
            date,
            ISODate
         }
    },

    getValues(){
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
            ISODate: Form.date.value
        }
    },

    validateFields(){
        const { description, amount, date, ISODate } = Form.getValues();

        if( description.trim() === "" || amount.trim() === "" || date.trim() === "" || ISODate.trim() === "" ) {
            throw new Error("Por favor, preencha todos os campos!")
        }
    },

    formatValues(){
        let { description, amount, date, ISODate } = Form.getValues();

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return { 
            description,
            amount,
            date,
            ISODate
         }
    },

    clearForm(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
        Form.ISODate.value = ""

        document.querySelector('input#input-desc-edit').value = ""
        document.querySelector('input#input-number-edit').value = ""
        document.querySelector('input#input-date-edit').value = ""
        document.querySelector('input#input-date-edit').value = ""
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

    reSubmit(index){

        try {
            Form.reValidateFields();
            const newTransaction = Form.reFormatValues()
            transactionMix.reAdd(newTransaction, index)
            Form.clearForm()
            modal.editOpenOrClose()
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