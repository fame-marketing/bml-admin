const mysql = require('mysql2'),
  winston = require('../bin/winston')
;

class Database {

  constructor() {

    this.connectionDetails = {
      connectionLimit: 10,
      host: process.env.dbHost,
      user: process.env.dbUser,
      database: process.env.dbName,
      password: process.env.dbPass
    };

    this.mainStdPool = this.getStdPool();
    this.mainPromisePool = this.getPromisePool();

  }

  getStdPool() {
    return mysql.createPool(this.connectionDetails);
  }

  getPromisePool() {
    const pool =  this.getStdPool();
    return pool.promise();
  }

  /*
   | @query -- a string containing the query base
   | @values -- an object that will be parsed into the query automatically to populate the db column.
  */
  async writePool(query, values, pool = this.mainPromisePool) {
    try {
      const [rows, fields] = await pool.query(query, values);
      return rows;
    } catch (err) {
      winston.error(err);
      return "error";
    }
  }

  /*
   | @query -- a string
   | a non promise version of the db query
  */
  QueryOnly(query) {
    this.mainStdPool.query(query, function (err, rows, fields) {
      if (err) throw err;
    })
  }

  /*
   | @query -- a string
   | a query that is intended to handle read tasks or other types of queries that will have a returned value.
  */
  async readPool(query) {

    const [rows, fields] = await this.mainPromisePool.query(query);
    return rows;

  }

}

module.exports = Database;
