import * as mysql from 'mysql2'
import logger from '../bin/winston.js'

export default class Database {

  constructor() {

    this.connectionDetails = {
      connectionLimit: 10,
      host: process.env.DB_HOST,
      port: 3306,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASS
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
      logger.error(err);
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
