const fs = require('fs');
      mysql = require('mysql2'),
			csv = require('fast-csv'),
			db = require('./Database');
			database = new db()
			;
   
   
let stream = fs.createReadStream('path_to_file'); //create a page that allows file upload
let dataArray = [];
const table = ''; //make this change based on event from data
const sql = `INSERT INTO ${table} SET ?`;
let writeData = csv.parse()
									 .on("data" , (data) => {
									 		dataArray.push(data);
									 })
									 .on("end", () => {
									 		dataArray.shift();
										  database.writePool(sql, dataArray);
									 });