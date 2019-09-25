/*
 * Literally just creates a connection to a mysql database that can then be accessed from other files.
 */
const mysql = require('mysql');

class db {

  constructor() {

    this.connection = mysql.createConnection({
      host: process.env.dbHost,
      user: process.env.dbUser,
      database: process.env.dbName
    });
    
  }

  createConnection() {
		this.connection.connect((err) => {
			if (err) {
				console.log("Database Connection Issue: " + err.stack);
				return;
			}
		})
	}
	
	endConnection() {
  	this.connection.end((err) => {
  	  if (err) {
        console.log('There was an issue while attempting to end the mysql connection ' + err.code);
      }
		});
	}

	query(query,values) {
    this.connection.query(query, values, function(err,results,fields) {
      if (err) console.log(err);
      if (results) return results;
    });
  }

}

module.exports = {
	db:db
};