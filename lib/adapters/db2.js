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

  new(name) {
    return new Promise((resolve, reject) => {
      if (!this.fs.existsSync(this.migrationsDir)) {
        reject('Migrations folder not found. Please run `db-migrations install` before trying this!');
      }

      const data = `module.exports.up = () => {
  const queries = [];

  return queries;
};

module.exports.down = () => {
  const queries = [];

  return queries;
}
    `;

      let migrationsFiles = this.fs.readdirSync(this.migrationsDir);

      migrationsFiles = migrationsFiles.sort((a, b) => {
        const aId = parseInt(a.split('_')[0]);
        const bId = parseInt(b.split('_')[0]);

        return aId > bId;
      });

      let id = migrationsFiles[migrationsFiles.length - 1];

      id = parseInt(id.split('_')[0]);

      if (id === 'NaN') {
        reject('Ops! Something went wrong while searching for the last migration id');
      }

      const migrationFile = `${this.migrationsDir}/${id + 1}_${name}.js`;
      if (this.fs.existsSync(migrationFile)) {
        reject('Ops! Something went wrong while trying to create the new migration. Check if the name is unique!')
      }

      this.fs.writeFileSync(migrationFile, data);

      console.log(`Migration file created at ${migrationFile}`);

      resolve();
    });
  };

  async refresh() {
    await this.rollback();

    await this.migrate();
  };

  reset() {
    return new Promise((resolve, reject) => {
      if (!this.fs.existsSync(this.migrationsDir)) {
        reject('Migrations folder not found. Please run `db-migrations install` before trying this!');
      }

      const connection = this.db2.createConnection();

      connection.query('SELECT id, name FROM migrations ORDER BY id DESC', (error, results) => {
        if (error) {
          reject(error);
        }

        connection.beginTransaction((err) => {
          results.forEach(async (result) => {
            const migrationId = result.id;
            const migrationFile = result.name;

            await this._revert(migrationId, migrationFile, connection);
          });

          connection.commitTransaction((err) => {
            if (err) {
              return connection.rollbackTransaction(function () {
                reject(err);
              });
            }

            console.log('Last migration rolled back successfully.')

            connection.closeSync();

            resolve();
          });
        });
      });
    });
  };

  rollback() {
    return new Promise((resolve, reject) => {
      if (!this.fs.existsSync(this.migrationsDir)) {
        reject('Migrations folder not found. Please run `db-migrations install` before trying this!');
      }

      const connection = this.db2.createConnection();

      connection.query('SELECT id, name FROM migrations ORDER BY id DESC LIMIT 1', (error, results) => {
        if (error) {
          reject(error);
        }

        connection.beginTransaction(async (err) => {
          const migrationId = results[0].id;
          const migrationFile = results[0].name;

          await this._revert(migrationId, migrationFile, connection);

          connection.commitTransaction((err) => {
            if (err) {
              return connection.rollbackTransaction(function () {
                reject(err);
              });
            }

            console.log('Last migration rolled back successfully.');

            connection.closeSync();

            resolve();
          });
        });
      });
    });
  };

  async _revert(migrationId, migrationFile, connection = null) {
    if (!this.fs.existsSync(`${this.migrationsDir}/${migrationFile}`)) {
      throw Error(`Ops! Something went wrong while trying to find ${this.migrationsDir}/${migrationFile}`);
    }

    const migration = require(`${this.migrationsDir}/${migrationFile}`);

    console.log(`Rolling back #${migrationId} - ${this.migrationsDir}/${migrationFile} migration`);

    const queries = migration.down();

    if (!connection) {
      connection = this.db2.createConnection();
    }

    queries.forEach((query) => {
      let results = connection.querySync(query);

      if (results && results.sqlcode) {
        return connection.rollbackTransaction(() => {
          throw Error(results.message);
        });
      }

      console.log(`${query} executed. Result: Affected rows = ${results.affectedRows}.`);
    });

    if (migrationId > 1) { // the first one executed is the migrations table creation itself, so in rollback it'll delete the table
      let results = connection.querySync('DELETE FROM migrations WHERE id = ?', [migrationId]);

      if (results && results.sqlcode) {
        return connection.rollbackTransaction(() => {
          throw Error(results.message);
        });
      }

      console.log(`Migration #${migrationId} - ${this.migrationsDir}/${migrationFile} rolled back`);
    }
  }
}

module.exports = { Db2Adapter };

