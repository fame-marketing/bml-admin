const mysql = require('mysql2'),
			util  = require('util')
;


class Database {

  constructor() {

    this.pool = mysql.createPool({
      connectionLimit: 5,
      host: process.env.dbHost,
      user: process.env.dbUser,
      database: process.env.dbName
    });
    
    this.promisePool = this.pool.promise()
    
    this.resultRows = '';
    
  }
  

	writePool(query,values) {

		this.pool.query(query, values, function (err) {
			if (err) throw err;
		});
		
  }
  
  writePoolQueryOnly(query) {
  	this.pool.query(query, function (err) {
			if (err) throw err;
		})
	}

  async readPool(query) {
  
		const [rows,fields] = await this.promisePool.query(query);

		return rows;
		
  }

}

module.exports = Database;