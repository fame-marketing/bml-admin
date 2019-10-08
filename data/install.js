const Db = require('./Database');

class Install {

  constructor() {
    this.database = new Db();
    this.createTables(this.database);
  }

  async createTables(database) {

    await database.writePool(
        `CREATE TABLE IF NOT EXISTS nn_checkins_temp
         (
             id        INT AUTO_INCREMENT PRIMARY KEY,
             eventID   VARCHAR(100),
             createdAt DATETIME,
             checkinId VARCHAR(50),
             location  JSON,
             reference TEXT,
             image     TINYTEXT,
             userName  VARCHAR(50),
             userEmail VARCHAR(100)
         )`
    );

    await database.writePool(
      `CREATE TABLE IF NOT EXISTS nn_reviews_temp (
      id INT AUTO_INCREMENT PRIMARY KEY,
      eventID VARCHAR(100),
      createdAt DATETIME,
      reviewSummary VARCHAR(255),
      reviewDetail TEXT,
      overallRating INT,
      reviewRequestedDate DATETIME,
      reviewRespondedDate DATETIME,
      reviewerName VARCHAR(50),
      reviewerEmail VARCHAR(100),
      checkinId VARCHAR(50),
      checkinCreatedAt DATETIME,
      location JSON,
      reference TEXT,
      image TINYTEXT,
      userName VARCHAR(50),
      userEmail VARCHAR(100))`
    );

    await database.writePool(
      `CREATE TABLE IF NOT EXISTS nn_customers_temp (
      id INT AUTO_INCREMENT PRIMARY KEY,
      eventID VARCHAR(100),
      createdAt DATETIME,
      reviewSummary VARCHAR(255),
      reviewDetail TEXT,
      overallRating INT,
      reviewRequestedDate DATETIME,
      reviewRespondedDate DATETIME,
      reviewerName VARCHAR(50),
      reviewerEmail VARCHAR(100),
      checkinId VARCHAR(50),
      checkinCreatedAt DATETIME,
      location JSON,
      reference TEXT,
      image TINYTEXT,
      userName VARCHAR(50),
      userEmail VARCHAR(100))`
    );

    await database.writePool(
      `CREATE TABLE IF NOT EXISTS nn_checkins_perma (
      id INT AUTO_INCREMENT PRIMARY KEY,
      eventID VARCHAR(100) UNIQUE,
      createdAt DATETIME,
      checkinId VARCHAR(50),
      reference TEXT,
      image TINYTEXT,
      userName VARCHAR(50),
      userEmail VARCHAR(100),
      city VARCHAR(100),
      state VARCHAR(25),
      postalCode VARCHAR(25),
      country VARCHAR(10),
      street VARCHAR(125),
      latitude DOUBLE(10,7),
      longitude DOUBLE(10,7))`
    );

    await database.writePool(
      `CREATE TABLE IF NOT EXISTS nn_reviews_perma (
			id INT AUTO_INCREMENT PRIMARY KEY,
			eventID VARCHAR(100) UNIQUE,
			createdAt DATETIME,
			reviewSummary VARCHAR(255),
			reviewDetail TEXT,
			overallRating INT,
			reviewRequestedDate DATETIME,
			reviewRespondedDate DATETIME,
			reviewerName VARCHAR(50),
			reviewerEmail VARCHAR(100),
			checkinId VARCHAR(50),
			checkinCreatedAt DATETIME,
			reference TEXT,
			image TINYTEXT,
			userName VARCHAR(50),
			userEmail VARCHAR(100),
			city VARCHAR(100),
			state VARCHAR(25),
			postalCode VARCHAR(25),
			country VARCHAR(10),
			street VARCHAR(125),
			latitude DOUBLE(10,7),
			longitude DOUBLE(10,7))`
		);

    await database.writePool(
      `CREATE TABLE IF NOT EXISTS nn_customers_perma (
       id INT AUTO_INCREMENT PRIMARY KEY,
       eventID VARCHAR(100) UNIQUE,
       createdAt DATETIME,
       reviewSummary VARCHAR(255),
       reviewDetail TEXT,
       overallRating INT,
       reviewRequestedDate DATETIME,
       reviewRespondedDate DATETIME,
       reviewerName VARCHAR(50),
       reviewerEmail VARCHAR(100),
       checkinId VARCHAR(50),
       checkinCreatedAt DATETIME,
       reference TEXT,
       image TINYTEXT,
       userName VARCHAR(50),
       userEmail VARCHAR(100),
       city VARCHAR(100),
       state VARCHAR(25),
       postalCode VARCHAR(25),
       country VARCHAR(10),
       street VARCHAR(125),
       latitude DOUBLE(10,7),
       longitude DOUBLE(10,7))`
    );

    await database.writePool(
      `CREATE TABLE IF NOT EXISTS nn_city_totals (
      city VARCHAR(100) UNIQUE,
      state VARCHAR(25),
      checkinTotal INT,
			reviewTotal INT,
      created TINYINT(1) DEFAULT 0)`
    );

    process.on('exit', (code) => {
      if (code === 0) {
        console.log("db tables successfully created.");
      } else {
        console.log("process completed but with errors: code - " + code);
      }
    });

    process.exit();

  }

}

new Install();