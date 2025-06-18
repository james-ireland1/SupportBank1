const fs = require('node:fs');
var readlineSync = require('readline-sync');

class Accounts {
    people: Person[];
    constructor () {
        this.people = [];
    }
    addPerson(name: string) {
        this.people.push(new Person(name));
        return this.people[this.people.length-1];
    }
    getPerson(name: string) {
        for (let person of this.people) {
            if (person.name === name) {
                return person;
            }
        }
        return this.addPerson(name);
    }
    addTransaction(date: string, nameFrom: string, nameTo: string, narrative: string, amount: string) {
        let personFrom: Person;
        personFrom = this.getPerson(nameFrom);
        let personTo: Person;
        personTo = this.getPerson(nameTo);
        let transaction: Transaction = new Transaction(date, personFrom, personTo, narrative, amount);
        personFrom.addTransaction(transaction);
        personTo.addTransaction(transaction);
    }
    listAll() {
        let output: string[] = [];
        for (let person of this.people) {
            output.push(person.name + ": " + person.balance);
        }
        return output;
    }
}

class Person {
    name: string;
    balance: number;
    transactions: Transaction[];
    constructor (name: string) {
        this.name = name;
        this.balance = 0;
        this.transactions = [];
    }
    addTransaction(transaction: Transaction) {
        this.transactions.push(transaction);
        if (this.name === transaction.personFrom.name) {
            this.balance -= transaction.amount;
        } else {
            this.balance += transaction.amount;
        }
    }
}

class Transaction {
    date: string;
    personFrom: Person;
    personTo: Person;
    narrative: string;
    amount: number;
    constructor (date: string, personFrom: Person, personTo: Person, narrative: string, amount: string) {
        this.date = date;
        this.personFrom = personFrom;
        this.personTo = personTo;
        this.narrative = narrative;
        this.amount = Number(amount);
    }
}

let fullAccount: Accounts = new Accounts();

fs.readFile('Transactions2014.csv', 'utf8', (err: any, data: string) => {
    if (err) {
        console.error(err);
        return;
    }
    processData(data);
});

function processData(textData: string) {
    let lines: string[] = textData.split(/\r?\n/);
    lines.splice(0,1);
    for (let line of lines) {
        let parts: string[] = line.split(',');
        fullAccount.addTransaction(parts[0],parts[1],parts[2],parts[3],parts[4]);
    }
    console.log(fullAccount);
}



let userInput: string = readlineSync.question('What would you like to do? ');
if (userInput === "List All") {
    for (let s of fullAccount.listAll()) {console.log(s)}
}