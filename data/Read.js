const db = require('./db');

class Read {
	
	constructor(data) {
		
		this.data = data;
		this.database = new db.db;
		this.queryBase = "SELECT * FROM ";
		
	}
	
	
}

module.exports = {Read:Read};