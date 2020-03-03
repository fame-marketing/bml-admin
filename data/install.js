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

    this.tableCreationError.eventsTemp = await database.writePool(
      `CREATE TABLE IF NOT EXISTS nn_events_temp(
        id                   INT AUTO_INCREMENT PRIMARY KEY,
        EventData            JSON
      )`
    );

    this.tableCreationError.permCheckins = await database.writePool(
    `CREATE TABLE IF NOT EXISTS nn_checkins_perma (
      id                     INT AUTO_INCREMENT PRIMARY KEY,
      EventId                VARCHAR(100) UNIQUE,
      CreatedAt              VARCHAR(30),
      CheckinId              VARCHAR(50),
      CheckinDateTime        VARCHAR(30),
      Reference              TEXT,
      CheckinImageUrl        TINYTEXT,
      UserName               VARCHAR(150),
      UserEmail              VARCHAR(100),
      City                   VARCHAR(100),
      State                  VARCHAR(25),
      PostalCode             VARCHAR(25),
      Country                VARCHAR(10),
      Street                 VARCHAR(125),
      Latitude               DOUBLE(10, 7),
      Longitude              DOUBLE(10, 7)
    )`
    );

    this.tableCreationError.permReviews = await database.writePool(
      `CREATE TABLE IF NOT EXISTS nn_reviews_perma (
        id                  INT AUTO_INCREMENT PRIMARY KEY,
        EventId             VARCHAR(100) UNIQUE,
        CreatedAt           VARCHAR(30),
        ReviewSummary       VARCHAR(255),
        ReviewDetail        TEXT,
        ReviewRating        INT,
        RequestDate         VARCHAR(30),
        ResponseDate        VARCHAR(30),
        CustomerName        VARCHAR(150),
        CustomerEmail       VARCHAR(100),
        CustomerPhone       VARCHAR(100),
        CheckinId           VARCHAR(50),
        CheckinDateTime     VARCHAR(30),
        Reference           TEXT,
        CheckinImageUrl     TINYTEXT,
        UserName            VARCHAR(150),
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
        City                VARCHAR(100) UNIQUE,
        State               VARCHAR(25),
        Url                 VARCHAR(250) DEFAULT NULL,
        CheckinTotal        INT NOT NULL DEFAULT 0,
        ReviewTotal         INT NOT NULL DEFAULT 0,
        Created             TINYINT(1) DEFAULT 0,
        PageCreatedDate     VARCHAR(30),
        Verified            TINYINT(1) DEFAULT 0
      )`
    );

    this.tableCreationError.events = await database.writePool(
      `CREATE TABLE IF NOT EXISTS nn_events (
        EventId              VARCHAR(100) UNIQUE,
        EventTime            VARCHAR(25),
        EventType            VARCHAR(250) DEFAULT NULL
      )`
    );

    this.tableCreationError.settings = await database.writePool(
      `CREATE TABLE IF NOT EXISTS nn_settings (
        id                   INT AUTO_INCREMENT PRIMARY KEY,
        Name                 VARCHAR(100) UNIQUE,
        Value                VARCHAR(25)
      )`
    );

    this.tableCreationError.users = await database.writePool(
      `CREATE TABLE IF NOT EXISTS nn_users (
        id                   INT AUTO_INCREMENT PRIMARY KEY,
        UserName             VARCHAR(100) DEFAULT NULL,
        UserPass             VARCHAR(255) DEFAULT NULL,
        Permissions          VARCHAR(25)
      )`
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
