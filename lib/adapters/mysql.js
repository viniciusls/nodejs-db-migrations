require('dotenv').load();
const fs = require('fs');
const mysql = require('../connectors/mysql');

const migrationsDir = `${process.cwd()}/migrations`;

module.exports.install = () => {
  data = `module.exports.up = () => {
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

  const migrationFile = `${migrationsDir}/1_migrations_table.js`;
  if(!fs.existsSync(migrationFile)) {
    fs.writeFileSync(migrationFile, data);
  }

  console.log(`Migration file created at ${migrationFile}`);

  console.log('Running initial migration');

  this.migrate();
};

module.exports.migrate = () => {
  if(!fs.existsSync(migrationsDir)) {
    throw Error('Migrations folder not found. Please run `db-migrations install` before trying this!');
  }

  const connection = mysql.createConnection();

  connection.query('SELECT name FROM migrations ORDER BY id DESC LIMIT 1', function (error, results) {
    if (error && error.code !== 'ER_NO_SUCH_TABLE') {
      throw error;
    }

    let id = 0;
    if (results) {
      id = parseInt(results[0].name.split('_')[0]);
    }

    if (id === 'NaN') {
      throw Error('Ops! Something went wrong while searching for the last migration id');
    }

    let migrationsFiles = [];
    if (id === 0) {
      migrationsFiles = ['1_migrations_table.js'];
    } else {
      migrationsFiles = fs.readdirSync(migrationsDir);

      migrationsFiles = migrationsFiles.map((migrationFile) => {
        const fileId = parseInt(migrationFile.split('_')[0]);

        return fileId > id;
      });
    }

    connection.beginTransaction((err) => {
      migrationsFiles.forEach((migrationFile) => {
        if(!fs.existsSync(`${migrationsDir}/${migrationFile}`)) {
          throw Error(`Ops! Something went wrong while trying to find ${migrationsDir}/${migrationFile}`);
        }

        const migration = require(`${migrationsDir}/${migrationFile}`);

        console.log(`Running ${migrationsDir}/${migrationFile} migration`);

        const queries = migration.up();

        queries.forEach((query) => {
          connection.query(query, (error, results) => {
            if (error) {
              return connection.rollback(() => {
                throw error;
              });
            }

            console.log(`${query} executed. Result: Affected rows = ${results.affectedRows}.`);
          });
        });

        connection.query('INSERT INTO migrations SET name = ?', migrationFile, (error, results, fields) => {
          if (error) {
            return connection.rollback(() => {
              throw error;
            });
          }

          console.log(`Migration ${migrationsDir}/${migrationFile} executed`);
        });
      });

      connection.commit((err) => {
        if (err) {
          return connection.rollback(function() {
            throw err;
          });
        }

        console.log('Migrations executed successfully.')

        connection.end();
      });
    });
  });
};

module.exports.refresh = async () => {
  await this.rollback();

  // TODO: IMPORTANT: THIS WILL BE REPLACE FOR PROMISE ONCE I REFACTORY EVERYTHING TO USE PROMISES, IT'S JUST A MOCK
  setTimeout(async () => {
    await this.migrate();
  }, 3000);
};

module.exports.reset = () => {
  if(!fs.existsSync(migrationsDir)) {
    throw Error('Migrations folder not found. Please run `db-migrations install` before trying this!');
  }

  const connection = mysql.createConnection();

  connection.query('SELECT id, name FROM migrations ORDER BY id DESC', function (error, results) {
    if (error) {
      throw error;
    }

    connection.beginTransaction((err) => {
      results.forEach((result) => {
        const migrationId = result.id;
        const migrationFile = result.name;

        if(!fs.existsSync(`${migrationsDir}/${migrationFile}`)) {
          throw Error(`Ops! Something went wrong while trying to find ${migrationsDir}/${migrationFile}`);
        }

        const migration = require(`${migrationsDir}/${migrationFile}`);

        console.log(`Rolling back #${migrationId} - ${migrationsDir}/${migrationFile} migration`);

        const queries = migration.down();

        queries.forEach((query) => {
          connection.query(query, (error, results) => {
            if (error) {
              return connection.rollback(() => {
                throw error;
              });
            }

            console.log(`${query} executed. Result: Affected rows = ${results.affectedRows}.`);
          });
        });

        if (migrationId > 1) { // the first one executed is the migrations table creation itself, so in rollback it'll delete the table
          connection.query('DELETE FROM migrations WHERE id = ?', migrationId, (error, results, fields) => {
            if (error) {
              return connection.rollback(() => {
                throw error;
              });
            }

            console.log(`Migration #${migrationId} - ${migrationsDir}/${migrationFile} rolled back`);
          });
        }
      });

      connection.commit((err) => {
        if (err) {
          return connection.rollback(function() {
            throw err;
          });
        }

        console.log('Last migration rolled back successfully.')

        connection.end();
      });
    });
  });
}

module.exports.rollback = () => {
  if(!fs.existsSync(migrationsDir)) {
    throw Error('Migrations folder not found. Please run `db-migrations install` before trying this!');
  }

  const connection = mysql.createConnection();

  connection.query('SELECT id, name FROM migrations ORDER BY id DESC LIMIT 1', function (error, results) {
    if (error) {
      throw error;
    }

    connection.beginTransaction((err) => {
      const migrationId = results[0].id;
      const migrationFile = results[0].name;

      if(!fs.existsSync(`${migrationsDir}/${migrationFile}`)) {
        throw Error(`Ops! Something went wrong while trying to find ${migrationsDir}/${migrationFile}`);
      }

      const migration = require(`${migrationsDir}/${migrationFile}`);

      console.log(`Rolling back #${migrationId} - ${migrationsDir}/${migrationFile} migration`);

      const queries = migration.down();

      queries.forEach((query) => {
        connection.query(query, (error, results) => {
          if (error) {
            return connection.rollback(() => {
              throw error;
            });
          }

          console.log(`${query} executed. Result: Affected rows = ${results.affectedRows}.`);
        });
      });

      if (migrationId > 1) {  // the first one executed is the migrations table creation itself, so in rollback it'll delete the table
        connection.query('DELETE FROM migrations WHERE id = ?', migrationId, (error, results, fields) => {
          if (error) {
            return connection.rollback(() => {
              throw error;
            });
          }

          console.log(`Migration #${migrationId} - ${migrationsDir}/${migrationFile} rolled back`);
        });
      }

      connection.commit((err) => {
        if (err) {
          return connection.rollback(function() {
            throw err;
          });
        }

        console.log('Last migration rolled back successfully.')

        connection.end();
      });
    });
  });
}
