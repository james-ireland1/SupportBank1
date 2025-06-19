const fs = require('node:fs');
const readlineSync = require('readline-sync');
const log4js = require('log4js');

log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});

const logger = log4js.getLogger();

class Accounts { //a list of records for every person and every transaction
    people: Person[];
    transactions: Transaction[];
    constructor () {
        this.people = [];
        this.transactions = [];
    }
    loadData(data: string, filetype: string) {
        if (filetype === 'csv') {this.loadCsv(data)}
        else if (filetype === 'json') {this.loadJson(data)}
        return this;
    }
    loadCsv(data: string) { //take raw text from a csv file and process the transactions
        let lines: string[] = data.split(/\r?\n/);
        logger.debug('Split data into '+lines.length+' part(s)');
        lines.splice(0,1); //remove the first row
        for (let line of lines) {
            let parts: string[] = line.split(',');
            if (parts.length < 5) {continue;}
            this.addTransaction(parts[0],parts[1],parts[2],parts[3],parts[4]);
        }
        return this;
    }
    loadJson(data: string) {
        let parsedData = JSON.parse(data);
        logger.debug(`Loading JSON. ${parsedData.length} entries found`);
        for (let entry of parsedData) {
            this.addTransaction(entry.Date, entry.FromAccount, entry.ToAccount, entry.Narrative, entry.Amount);
        }
        return this;
    }
    addPerson(name: string) { //create a record for a person with the name given
        logger.debug('Creating person: '+name);
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
        logger.debug(`Adding new transaction: ${date} from: ${nameFrom} to: ${nameTo} ${amount} for ${narrative}`);
        let personFrom: Person;
        personFrom = this.getPerson(nameFrom);
        let personTo: Person;
        personTo = this.getPerson(nameTo);
        let transaction: Transaction = new Transaction(date, personFrom, personTo, narrative, amount);
        if (transaction.isValid()) {
            personFrom.addTransaction(transaction);
            personTo.addTransaction(transaction);
            this.transactions.push(transaction);
            logger.debug('Successfully added');
        } else {logger.debug('Transaction skipped')}
    }
    listAllPeople() { //output the list of people's names matched to their balance
        let output: string[] = [];
        for (let person of this.people) {
            output.push(person.name + ": " + person.balance);
        }
        return output;
    }
    listTransactions(name: string) { //output the list of transactions for a person with the given name
        let person: Person;
        person = this.getPerson(name);
        let output: string[] = [];
        output.push('Displaying transactions for '+person.name);
        if (person.transactions.length < 1) {output.push('No transactions found.')}
        for (let t of person.transactions) {
            output.push(t.date + ' ' + t.personFrom.name + ' paid ' + t.personTo.name + ' ' + t.amount + ' for ' + t.narrative);
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
    isValid() {
        if (isNaN(this.amount)) {
            logger.error('Amount is NaN');
            return false
        } else {return true}
    }
}

function loadFileSync(path: string) {
    const data: string = fs.readFileSync(path, 'utf-8');
    logger.debug('Read data from '+path);
    return data;
}

function loadAndMergeFile(filename: string, accounts: Accounts) {
    const parts: string[] = filename.split('.');
    const filetype: string = parts[parts.length-1];
    const data: string = loadFileSync(filename);
    accounts.loadData(data, filetype);
}

function userInteraction(fullAccount: Accounts) {
    let userInput: string = readlineSync.question('What would you like to do? ');
    logger.debug(`User asked to ${userInput}`);
    if (userInput == "List All") {
        logger.debug('Listing balances for all people');
        for (let s of fullAccount.listAllPeople()) {console.log(s)}
    } else if (userInput.slice(0,5) == 'List ') {
        const name: string = userInput.slice(5, userInput.length);
        logger.debug(`Listing transactions for ${name}`);
        for (let s of fullAccount.listTransactions(name)) {
            console.log(s)
        }
    } else if (userInput.slice(0,12) == 'Import File ') {
        const filename: string = userInput.slice(12,userInput.length);
        logger.debug(`Importing content from ${filename}`);
        loadAndMergeFile(filename, fullAccount);
    } else {
        logger.debug('Ending program');
        return false;
    }
    return true;
}


logger.info('Program launched');


let fullAccount: Accounts = new Accounts();

while (userInteraction(fullAccount)) {}