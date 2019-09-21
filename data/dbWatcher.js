const db = require('./db')
			reader = require('./Read');
;

class dbWatcher {
	
	constructor() {
		this.database = new db.db;
		this.reader = new reader.Read;
	}
	
	checkDb(table) {
		this.reader(table);
	}
	
}

module.exports = dbWatcher.constructor;