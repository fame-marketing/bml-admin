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

    this.promisePool = this.pool.promise();

  }

  /*
   | @query -- a string containing the query base
   | @values -- an object that will be parsed into the query automatically to populate the db column.
  */
	async writePool(query,values) {

    await this.promisePool.query(query, values);

  }

  /*
   | @query -- a string
   | a non promise version of the db query
  */
  QueryOnly(query) {
  	this.pool.query(query, function (err) {
			if (err) throw err;
		})
	}

  /*
   | @query -- a string
   | a query that is intended to handle read tasks or other types of queries that will have a returned value.
  */
  async readPool(query) {
  
		const [rows,fields] = await this.promisePool.query(query);
		return rows;
		
  }

}

module.exports = Database;