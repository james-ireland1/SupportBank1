"use strict";
const fs = require('node:fs');
const readlineSync = require('readline-sync');
const log4js = require('log4js');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug' }
    }
});
const logger = log4js.getLogger();
class Accounts {
    constructor() {
        this.people = [];
        this.transactions = [];
    }
    loadCsv(data) {
        let lines = data.split(/\r?\n/);
        logger.debug('Split data into ' + lines.length + ' part(s)');
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
        logger.debug('Creating person: ' + name);
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
        logger.debug(`Adding new transaction: ${date} from: ${nameFrom} to: ${nameTo} ${amount} for ${narrative}`);
        let personFrom;
        personFrom = this.getPerson(nameFrom);
        let personTo;
        personTo = this.getPerson(nameTo);
        let transaction = new Transaction(date, personFrom, personTo, narrative, amount);
        if (transaction.isValid()) {
            personFrom.addTransaction(transaction);
            personTo.addTransaction(transaction);
            this.transactions.push(transaction);
            logger.debug('Successfully added');
        }
        else {
            logger.debug('Transaction skipped');
        }
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
    isValid() {
        if (isNaN(this.amount)) {
            logger.error('Amount is NaN');
            return false;
        }
        else {
            return true;
        }
    }
}
function loadFileSync(path) {
    const data = fs.readFileSync(path, 'utf-8');
    logger.debug('Read data from ' + path);
    return data;
}
function userInteraction(fullAccount) {
    let userInput = readlineSync.question('What would you like to do? ');
    logger.debug(`User asked to ${userInput}`);
    if (userInput == "List All") {
        logger.debug('Listing balances for all people');
        for (let s of fullAccount.listAllPeople()) {
            console.log(s);
        }
    }
    else if (userInput.slice(0, 5) == 'List ') {
        logger.debug(`Listing transactions for ${userInput.slice(5, userInput.length)}`);
        for (let s of fullAccount.listTransactions(userInput.slice(5, userInput.length))) {
            console.log(s);
        }
    }
    else {
        logger.debug('Ending program');
        return false;
    }
    return true;
}
logger.info('Program launched');
const data = loadFileSync('DodgyTransactions2015.csv');
let fullAccount = new Accounts();
fullAccount.loadCsv(data);
while (userInteraction(fullAccount)) { }
//# sourceMappingURL=index.js.map