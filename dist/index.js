"use strict";
const fs = require('node:fs');
var readlineSync = require('readline-sync');
class Accounts {
    constructor() {
        this.people = [];
        this.transactions = [];
    }
    loadCsv(data) {
        let lines = data.split(/\r?\n/);
        lines.splice(0, 1); //remove the first row
        for (let line of lines) {
            let parts = line.split(',');
            if (parts.length < 5) {
                continue;
            }
            this.addTransaction(parts[0], parts[1], parts[2], parts[3], parts[4]);
        }
        return this;
    }
    addPerson(name) {
        this.people.push(new Person(name));
        return this.people[this.people.length - 1];
    }
    getPerson(name) {
        for (let person of this.people) {
            if (person.name === name) {
                return person;
            }
        }
        return this.addPerson(name);
    }
    addTransaction(date, nameFrom, nameTo, narrative, amount) {
        let personFrom;
        personFrom = this.getPerson(nameFrom);
        let personTo;
        personTo = this.getPerson(nameTo);
        let transaction = new Transaction(date, personFrom, personTo, narrative, amount);
        personFrom.addTransaction(transaction);
        personTo.addTransaction(transaction);
        this.transactions.push(transaction);
    }
    listAllPeople() {
        let output = [];
        for (let person of this.people) {
            output.push(person.name + ": " + person.balance);
        }
        return output;
    }
    listTransactions(name) {
        let person;
        person = this.getPerson(name);
        let output = [];
        output.push('Displaying transactions for ' + person.name);
        if (person.transactions.length < 1) {
            output.push('No transactions found.');
        }
        for (let t of person.transactions) {
            output.push(t.date + ' ' + t.personFrom.name + ' paid ' + t.personTo.name + ' ' + t.amount + ' for ' + t.narrative);
        }
        return output;
    }
}
class Person {
    constructor(name) {
        this.name = name;
        this.balance = 0;
        this.transactions = [];
    }
    addTransaction(transaction) {
        this.transactions.push(transaction);
        if (this.name === transaction.personFrom.name) {
            this.balance -= transaction.amount;
        }
        else {
            this.balance += transaction.amount;
        }
        this.balance = Math.round(this.balance * 100) / 100;
    }
}
class Transaction {
    constructor(date, personFrom, personTo, narrative, amount) {
        this.date = date;
        this.personFrom = personFrom;
        this.personTo = personTo;
        this.narrative = narrative;
        this.amount = Number(amount);
    }
}
function loadFile(path) {
    fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(data);
        let fullAccount = new Accounts();
        fullAccount.loadCsv(data);
        while (userInteraction(fullAccount)) {
        }
    });
}
function loadFileSync(path) {
    const data = fs.readFileSync(path, 'utf-8');
    return data;
}
function userInteraction(fullAccount) {
    let userInput = readlineSync.question('What would you like to do? ');
    if (userInput == "List All") {
        for (let s of fullAccount.listAllPeople()) {
            console.log(s);
        }
    }
    else if (userInput.slice(0, 5) == 'List ') {
        for (let s of fullAccount.listTransactions(userInput.slice(5, userInput.length))) {
            console.log(s);
        }
    }
    else {
        return false;
    }
    return true;
}
//loadFile('Transactions2014.csv');
const data = loadFileSync('Transactions2014.csv');
let fullAccount = new Accounts();
fullAccount.loadCsv(data);
while (userInteraction(fullAccount)) { }
//# sourceMappingURL=index.js.map