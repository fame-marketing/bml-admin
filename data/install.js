const Db = require('./Database'),
  winston = require('../bin/winston')
;

require('dotenv').config();

class Install {

  constructor() {
    this.database = new Db();
    this.tableCreationError = {};
    this.createTables(this.database);
  }

  async createTables(database) {

    this.tableCreationError.tempCheckins = await database.writePool(
    `CREATE TABLE IF NOT EXISTS nn_checkins_temp(
      id              INT AUTO_INCREMENT PRIMARY KEY,
      EventID         VARCHAR(100),
      CheckinDateTime DATETIME,
      CheckinId       VARCHAR(50),
      Location        JSON,
      Reference       TEXT,
      CheckinImageUrl TINYTEXT,
      UserName        VARCHAR(50),
      UserEmail       VARCHAR(100)
    )`
    );

    this.tableCreationError.tempReviews = await database.writePool(
      `CREATE TABLE IF NOT EXISTS nn_reviews_temp (
      id INT AUTO_INCREMENT PRIMARY KEY,
      EventID VARCHAR(100),
      CreatedAt DATETIME,
      ReviewSummary VARCHAR(255),
      ReviewDetail TEXT,
      ReviewRating INT,
      ResponseDate DATETIME,
      CustomerName VARCHAR(50),
      CustomerEmail VARCHAR(100),
      CheckinId VARCHAR(50),
      CheckinDateTime DATETIME,
      Location JSON,
      Reference TEXT,
      CheckinImageUrl TINYTEXT,
      UserName VARCHAR(50),
      UserEmail VARCHAR(100))`
    );

    this.tableCreationError.permCheckins = await database.writePool(
    `CREATE TABLE IF NOT EXISTS nn_checkins_perma (
      id               INT AUTO_INCREMENT PRIMARY KEY,
      EventID          VARCHAR(100) UNIQUE,
      CheckinDateTime  DATETIME,
      CheckinId        VARCHAR(50),
      Reference        TEXT,
      CheckinImageUrl  TINYTEXT,
      UserName         VARCHAR(50),
      UserEmail        VARCHAR(100),
      City             VARCHAR(100),
      State            VARCHAR(25),
      PostalCode       VARCHAR(25),
      Country          VARCHAR(10),
      Street           VARCHAR(125),
      Latitude         DOUBLE(10, 7),
      Longitude        DOUBLE(10, 7)
    )`
    );

    this.tableCreationError.permReviews = await database.writePool(
      `CREATE TABLE IF NOT EXISTS nn_reviews_perma (
        id                  INT AUTO_INCREMENT PRIMARY KEY,
        EventID             VARCHAR(100) UNIQUE,
        CreatedAt           DATETIME,
        ReviewSummary       VARCHAR(255),
        ReviewDetail        TEXT,
        ReviewRating        INT,
        ResponseDate       DATETIME,
        CustomerName        VARCHAR(50),
        CustomerEmail       VARCHAR(100),
        CheckinId           VARCHAR(50),
        CheckinDateTime     DATETIME,
        Reference           TEXT,
        CheckinImageUrl     TINYTEXT,
        UserName            VARCHAR(50),
        UserEmail           VARCHAR(100),
        City                VARCHAR(100),
        State               VARCHAR(25),
        PostalCode          VARCHAR(25),
        Country             VARCHAR(10),
        Street              VARCHAR(125),
        Latitude            DOUBLE(10, 7),
        Longitude           DOUBLE(10, 7)
      )`
    );

    this.tableCreationError.totals = await database.writePool(
      `CREATE TABLE IF NOT EXISTS nn_city_totals (
      City VARCHAR(100) UNIQUE,
      State VARCHAR(25),
      CheckinTotal INT NOT NULL DEFAULT 0,
			ReviewTotal INT NOT NULL DEFAULT 0,
      Created TINYINT(1) DEFAULT 0)`
    );

    process.on('exit', (code) => {
      if (Object.values(this.tableCreationError).includes('error')) {
        winston.error("There has been an error while attempting to create the tables. Check that your database connection settings are correct.");
      } else if (code === 0) {
        winston.info("db tables successfully created.");
      } else {
        winston.error(`process completed but with errors: code - ${code}`);
      }
    });

    process.exit();

  }

}

new Install();
