const mysql = require('mysql'),
      updateHandler = require('../controller/updateHandler')
;


class Database {

  constructor() {

    this.pool = mysql.createPool({
      connectionLimit: 5,
      host: process.env.dbHost,
      user: process.env.dbUser,
      database: process.env.dbName
    });
    
  }

	writePool(query,values) {

    this.pool.getConnection(function(e,con) {
      if (e) throw e;

      con.query(query, values, function(err,results,fields) {
        if (err) console.log(err);
        if (results) return results;
      });

    })
  }

  readPool(query) {

    this.pool.getConnection(function(e,con) {
      if (e) throw e;

      con.query(query, function(e,res) {

        con.release();
        if (e) throw e;

        if (res.length !== 0) {
          new updateHandler(res);
        }

      })
    })
  }

}

module.exports = Database;