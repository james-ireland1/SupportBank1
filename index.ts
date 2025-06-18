const fs = require('node:fs');
var readlineSync = require('readline-sync');

class Accounts { //a list of records for every person
    people: Person[];
    constructor () {
        this.people = [];
    }
    addPerson(name: string) { //create a record for a person with the name given
        this.people.push(new Person(name));
        return this.people[this.people.length-1];
    }
    getPerson(name: string) { //find the record for a person with the name given, or create a new record if one doesn't exist
        for (let person of this.people) {
            if (person.name === name) {
                return person;
            }
        }
        return this.addPerson(name);
    }
    addTransaction(date: string, nameFrom: string, nameTo: string, narrative: string, amount: string) { //take the raw text for a transaction and associate it with the relevant people
        let personFrom: Person;
        personFrom = this.getPerson(nameFrom);
        let personTo: Person;
        personTo = this.getPerson(nameTo);
        let transaction: Transaction = new Transaction(date, personFrom, personTo, narrative, amount);
        personFrom.addTransaction(transaction);
        personTo.addTransaction(transaction);
    }
    listAll() { //output the list of people's names matched to their balance
        let output: string[] = [];
        for (let person of this.people) {
            output.push(person.name + ": " + person.balance);
        }
        return output;
    }
}

class Person { //a record for an individual, including their name, balance and list of transactions
    name: string;
    balance: number;
    transactions: Transaction[];
    constructor (name: string) {
        this.name = name;
        this.balance = 0;
        this.transactions = [];
    }
    addTransaction(transaction: Transaction) { //take a transaction, adjust the balance, and add the transaction to the list
        this.transactions.push(transaction);
        if (this.name === transaction.personFrom.name) {
            this.balance -= transaction.amount;
        } else {
            this.balance += transaction.amount;
        }
        this.balance = Math.round(this.balance*100)/100;
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

function loadFile(path: string) {
    fs.readFile(path, 'utf8', (err: any, data: string) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(data);
        let fullAccount: Accounts = processData(data);
        userInteraction(fullAccount);
    });
}

function processData(textData: string) {
    let output: Accounts = new Accounts();
    let lines: string[] = textData.split(/\r?\n/);
    lines.splice(0,1);
    for (let line of lines) {
        let parts: string[] = line.split(',');
        if (parts.length < 5) {continue;}
        output.addTransaction(parts[0],parts[1],parts[2],parts[3],parts[4]);
    }
    return output;
}

function userInteraction(fullAccount: Accounts) {
    let userInput: string = readlineSync.question('What would you like to do? ');
    if (userInput == "List All") {
        for (let s of fullAccount.listAll()) {console.log(s)}
    }
}

loadFile('Transactions2014.csv');