class Db2Adapter {
  constructor() {
    require('dotenv').load();

    this.fs = require('fs');

    const { Db2Connector } = require('../connectors/db2');
    this.db2 = new Db2Connector();

    this.migrationsDir = `${process.cwd()}/migrations`;
  }

  install() {
    return new Promise(async (resolve, reject) => {
      const migrationFile = `${this.migrationsDir}/1_migrations_table.js`;
      if (!this.fs.existsSync(migrationFile)) {
        const data = `module.exports.up = () => {
  const queries = [
    \`CREATE TABLE migrations (
      id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name VARCHAR(255) NOT NULL,
      PRIMARY KEY(id)
    );\`
  ];

  return queries;
};

module.exports.down = () => {
  const queries = [
    \`DROP TABLE migrations;\`
  ];

  return queries;
}
  `;

        this.fs.writeFileSync(migrationFile, data);

        console.log(`Migration file created at ${migrationFile}`);
      } else {
        console.log(`Migration already exists at ${migrationFile}`);
      }

      console.log('Running initial migration');

      await this.migrate();

      resolve();
    });
  };

  migrate() {
    return new Promise(async (resolve, reject) => {
      if (!this.fs.existsSync(this.migrationsDir)) {
        reject('Migrations folder not found. Please run `db-migrations install` before trying this!');
      }

      const connection = await this.db2.createConnection();

      connection.query('SELECT name FROM migrations ORDER BY id DESC LIMIT 1', (error, results) => {
        if (error && error.sqlcode !== -204) {
          reject(error);

          return;
        }

        let id = 0;
        if (results.length > 0) {
          id = parseInt(results[0].name.split('_')[0]);
        }

        if (id === 'NaN') {
          reject('Ops! Something went wrong while searching for the last migration id');
        }

        let migrationsFiles = [];
        if (id === 0) {
          migrationsFiles = ['1_migrations_table.js'];
        } else {
          migrationsFiles = this.fs.readdirSync(this.migrationsDir);

          migrationsFiles = migrationsFiles.map((migrationFile) => {
            const fileId = parseInt(migrationFile.split('_')[0]);

            return fileId > id;
          });
        }

        connection.beginTransaction((err) => {
          migrationsFiles.forEach((migrationFile) => {
            if (!this.fs.existsSync(`${this.migrationsDir}/${migrationFile}`)) {
              reject(`Ops! Something went wrong while trying to find ${this.migrationsDir}/${migrationFile}`);

              return;
            }

            const migration = require(`${this.migrationsDir}/${migrationFile}`);

            console.log(`Running ${this.migrationsDir}/${migrationFile} migration`);

            const queries = migration.up();

            queries.forEach((query) => {
              let results = connection.querySync(query);

              if (results && results.sqlcode) {
                return connection.rollbackTransaction(() => {
                  reject(results.message);
                });
              }

              console.log(`${query} executed. Result: Affected rows = ${results.affectedRows}.`);
            });

            let results = connection.querySync('INSERT INTO migrations(name) VALUES(?)', [migrationFile]);

            if (results && results.sqlcode) {
              return connection.rollbackTransaction(() => {
                reject(results.message);
              });
            }

            console.log(`Migration ${this.migrationsDir}/${migrationFile} executed`);
          });

          connection.commitTransaction((err) => {
            if (err) {
              return connection.rollbackTransaction(function () {
                reject(err);
              });
            }

            console.log('Migrations executed successfully.')

            connection.closeSync();

            resolve();
          });
        });
      });
    });
  };
}

module.exports = { Db2Adapter };

