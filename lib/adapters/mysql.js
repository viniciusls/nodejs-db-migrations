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

  run();
};

module.exports.run = () => {
  if(!fs.existsSync(migrationsDir)) {
    throw Error('Migrations folder not found. Please run `db-migrations install` before trying this!');
  }

  const connection = mysql.createConnection();

  connection.query('SELECT name FROM migrations ORDER BY id DESC LIMIT 1', function (error, results) {
    if (error) throw error;

    const id = 0;
    if (results.length === 1) {
      id = parseInt(results[0].name.split('_')[0]);
    }

    if (id === 'NaN') {
      throw Error('Ops! Something went wrong while searching for the last migration id');
    }

    const migrationsFiles = fs.readdirSync(migrationsDir);

    migrationsFiles = migrationsFiles.map((migrationFile) => {
      const fileId = parseInt(migrationFile.split('_')[0]);

      return fileId > id;
    });

    // const migrationFile = migrationsFiles.find(file => file.indexOf(`${id}_`) >= 0);

    migrationsFiles.forEach((migrationFile) => {
      const migration = require(`${migrationsDir}/${migrationFile}`);

      const queries = migration.run();

      queries.forEach((query) => {
        connection.query(query, function (error, results) {
          if (error) throw error;

          console.log(`${query} executed. Result: ${results}`);
        });
      });
    });

    console.log('Migrations executed successfully.')

    connection.end();
  });
};
