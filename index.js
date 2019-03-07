class DbMigrations {
  constructor() {
    require('dotenv').load();

    this.fs = require('fs');

    const dbAdapterType = process.env.database_type;

    if (!dbAdapterType) {
      throw Error('Adapter not defined in .env');
    }

    this.dbAdapterPath = __dirname + '/lib/adapters/' + dbAdapterType;

    if (!this.fs.existsSync(`${this.dbAdapterPath}.js`)) {
      throw Error('Adapter for ' + process.env.database_type + ' not found! Please check your database type config on .env.');
    }

    const dbAdapterClassName = dbAdapterType.charAt(0).toUpperCase() + dbAdapterType.toLowerCase().slice(1) + 'Adapter';

    const dbAdapterClass = require(this.dbAdapterPath)[dbAdapterClassName];

    this.dbAdapter = new dbAdapterClass();
  }

  help() {
    console.log('You can ask for help typing -h or --help or, if it doesn\'t help, you can open an issue on GitHub or send an email to vinicius.ls@live.com.');
  };

  async install() {
    console.log('Creating migrations structure');

    if (!this.fs.existsSync('./migrations')) {
      this.fs.mkdirSync('./migrations');

      console.log('Migrations folder created at ./migrations');
    }

    await this.dbAdapter.install();
  };

  async migrate() {
    await this.dbAdapter.migrate();
  };

  async new(name) {
    await this.dbAdapter.new(name);
  };

  async refresh() {
    await this.dbAdapter.refresh();
  };

  async reset() {
    console.log('Rolling back all migrations');

    await this.dbAdapter.reset();
  };

  async rollback() {
    console.log('Rolling back last migration');

    await this.dbAdapter.rollback();
  };
}

module.exports = { DbMigrations };

