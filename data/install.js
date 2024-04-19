const Db = require('./Database'),
  winston = require('../bin/winston'),
  Spinner = require('cli-spinner').Spinner
;

require('dotenv').config();

class Install {

  constructor() {
    this.database = new Database();
    this.tableCreationError = {};

    process.on('exit', (code) => {
      if (code === 0) {
        process.stdout.write("db tables successfully created.");
        process.stdout.write('\n');
        logger.info("db tables successfully created.");
      } else {
        logger.error(`process completed but with errors: code - ${code}`);
      }
    });

    this.createTables(this.database);
  }

  async createTables(database) {

    try {

      const spinner = new Spinner('Creating Db Tables.');
      spinner.setSpinnerString(0);
      spinner.start();

      const pool = database.getPromisePool();

      await Promise.all([
        database.writePool(
          `CREATE TABLE IF NOT EXISTS nn_events_temp(
              id                   INT AUTO_INCREMENT PRIMARY KEY,
              EventData            JSON
            )`, null, pool
        ),

        database.writePool(
          `CREATE TABLE IF NOT EXISTS nn_checkins (
            id                     INT AUTO_INCREMENT PRIMARY KEY,
            EventId                VARCHAR(100) UNIQUE,
            CreatedAt              DATETIME,
            CheckinId              VARCHAR(50),
            CheckinDateTime        DATETIME,
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
          )`, null, pool
        ),

        database.writePool(
          `CREATE TABLE IF NOT EXISTS nn_reviews (
            id                  INT AUTO_INCREMENT PRIMARY KEY,
            EventId             VARCHAR(100) UNIQUE,
            CreatedAt           DATETIME,
            ReviewSummary       VARCHAR(255),
            ReviewDetail        TEXT,
            ReviewRating        INT,
            RequestDate         DATETIME,
            ResponseDate        DATETIME,
            CustomerName        VARCHAR(150),
            CustomerEmail       VARCHAR(100),
            CustomerPhone       VARCHAR(100),
            CheckinId           VARCHAR(50),
            CheckinDateTime     DATETIME,
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
          )`, null, pool
        ),

        database.writePool(
          `CREATE TABLE IF NOT EXISTS nn_city_totals (
            City                VARCHAR(100) UNIQUE,
            State               VARCHAR(25),
            Url                 VARCHAR(250) DEFAULT NULL,
            CheckinTotal        INT NOT NULL DEFAULT 0,
            ReviewTotal         INT NOT NULL DEFAULT 0,
            Created             TINYINT(1) DEFAULT 0,
            PageCreatedDate     DATETIME,
            Verified            TINYINT(1) DEFAULT 0
          )`, null, pool
        ),

        database.writePool(
          `CREATE TABLE IF NOT EXISTS nn_events (
            EventId              VARCHAR(100) UNIQUE,
            EventTime            DATETIME,
            EventType            VARCHAR(250) DEFAULT NULL
          )`, null, pool
        ),

        database.writePool(
          `CREATE TABLE IF NOT EXISTS nn_settings (
            id                   INT AUTO_INCREMENT PRIMARY KEY,
            Name                 VARCHAR(100) UNIQUE,
            Value                VARCHAR(25)
          )`, null, pool
        ),

        database.writePool(
          `CREATE TABLE IF NOT EXISTS nn_users (
            id                   INT AUTO_INCREMENT PRIMARY KEY,
            UserName             VARCHAR(100) DEFAULT NULL,
            UserPass             VARCHAR(255) DEFAULT NULL,
            Permissions          VARCHAR(25)
          )`, null, pool
        ),

        database.writePool(
          `CREATE TABLE IF NOT EXISTS form_submissions (
            id               INT AUTO_INCREMENT PRIMARY KEY,
            SubmissionDate   DATETIME,
            Name             VARCHAR(100) DEFAULT NULL,
            Phone            VARCHAR(255) DEFAULT NULL,
            Email            VARCHAR(255) DEFAULT NULL,
            DogName          VARCHAR(255) DEFAULT NULL,
            City             VARCHAR(255) DEFAULT NULL,
            Consent          TINYINT(1) DEFAULT 0,
            SpamScore        DOUBLE(3,1) DEFAULT NULL
          )`, null, pool
        )
      ]);

      spinner.stop();

      pool.end(() => {
        process.exitCode = 0;
      });

    } catch(err) {
      logger.error(err);
    }

  }

}

new Install();
