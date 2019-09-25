const db = require('./db');

class Read {
	
	constructor(table) {
		
		this.database = new db.db;
		
		this.queryBase = "SELECT * FROM " + table;
		this.newNN = this.fetch(this.queryBase);
		
	}
	
	fetch (sql) {
		
		this.database.createConnection();
		
		const results = this.database.query(sql);
		
		this.database.endConnection();
		
	}
	
}

module.exports = Read;