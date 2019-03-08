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

      //await this.migrate();

      resolve();
    });
  };
}

module.exports = { Db2Adapter };

