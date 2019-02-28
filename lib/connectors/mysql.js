require('dotenv').load();
const mysql = require('mysql');

module.exports.createConnection = () => {
  const connection = mysql.createConnection({
    host: process.env.database.host,
    port: process.env.database.port,
    user: process.env.database.user,
    password: process.env.database.password,
    database: process.env.database.name
  });

  connection.connect();

  return connection;
}
