require('dotenv').load();
const fs = require('fs');
const mysql = require('../connectors/mysql');

const migrationsDir = './migrations';

module.exports.install = () => {
  data = `
    module.exports.up = () => {
      queries = [
        \`CREATE TABLE migrations (
          id INT(4) NOT NULL AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL
        );\`
      ];

      return queries;
    };

    module.exports.down = () => {
      queries = [
        \`DROP TABLE migrations;\`
      ];

      return queries;
    }
  `;

  fs.writeFileSync('./migrations/1_migrations_table.js', data);
};
