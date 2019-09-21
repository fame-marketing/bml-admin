const db = require('./db');

class Install {

  constructor() {
    this.database = new db.db;
    this.createTables(this.database);
  }

  createTables(database) {
    database.createConnection();

    database.query(
      'CREATE TABLE IF NOT EXISTS nn_checkins (' +
      'id INT AUTO_INCREMENT PRIMARY KEY,' +
      'eventID VARCHAR(50),' +
      'createdAt DATETIME,' +
      'checkinId VARCHAR(50),' +
      'location JSON,' +
      'reference TEXT,' +
      'image TINYTEXT,' +
      'userName VARCHAR(50),' +
      'userEmail VARCHAR(100)' +
      ')'
    );

    database.query(
      'CREATE TABLE IF NOT EXISTS nn_reviews (' +
      'id INT AUTO_INCREMENT PRIMARY KEY,' +
      'eventID VARCHAR(50),' +
      'createdAt DATETIME,' +
      'reviewSummary VARCHAR(255),' +
      'reviewDetail TEXT,' +
      'overallRating INT,' +
      'reviewRequestedDate DATETIME,' +
      'reviewRespondedDate DATETIME,' +
      'reviewerName VARCHAR(50),' +
      'reviewerEmail VARCHAR(100),' +
      'checkinId VARCHAR(50),' +
      'checkinCreatedAt DATETIME,' +
      'location JSON,' +
      'reference TEXT,' +
      'image TINYTEXT,' +
      'userName VARCHAR(50),' +
      'userEmail VARCHAR(100)' +
      ')'
    );

    database.endConnection();
  }

}

new Install();