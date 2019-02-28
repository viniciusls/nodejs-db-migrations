require('dotenv').load();
const mysql = require('mysql');

module.exports.createConnection = () => {
  const connection = mysql.createConnection({
    host: process.env.database_host,
    port: process.env.database_port,
    user: process.env.database_user,
    password: process.env.database_password,
    database: process.env.database_name
  });

  connection.connect();

  return connection;
}
