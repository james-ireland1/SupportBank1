"use strict";
const fs = require('node:fs');
var readlineSync = require('readline-sync');
class Accounts {
    constructor() {
        this.people = [];
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
    }
    listAll() {
        let output = [];
        for (let person of this.people) {
            output.push(person.name + ": " + person.balance);
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
let fullAccount = new Accounts();
fs.readFile('Transactions2014.csv', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    processData(data);
});
function processData(textData) {
    let lines = textData.split(/\r?\n/);
    lines.splice(0, 1);
    for (let line of lines) {
        let parts = line.split(',');
        fullAccount.addTransaction(parts[0], parts[1], parts[2], parts[3], parts[4]);
    }
    console.log(fullAccount);
}
let userInput = readlineSync.question('What would you like to do? ');
if (userInput === "List All") {
    for (let s of fullAccount.listAll()) {
        console.log(s);
    }
}
//# sourceMappingURL=index.js.map