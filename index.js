class DbMigrations {
  constructor() {
    require('dotenv').load();

    this.fs = require('fs');

    this.dbAdapterPath = __dirname + '/lib/adapters/' + process.env.database_type;

    this.dbAdapter = require(this.dbAdapterPath);
  }

  help() {
    console.log('Under development');
  };

  async install() {
    console.log('Creating migrations structure');

    if (!this.fs.existsSync('./migrations')) {
      this.fs.mkdirSync('./migrations');

      console.log('Migrations folder created at ./migrations');
    }

    if (!this.fs.existsSync(`${this.dbAdapterPath}.js`)) {
      throw Error('Adapter for ' + process.env.database_type + ' not found! Please check your database type config on .env.');
    }
    
    await this.dbAdapter.install();
  };

  async migrate() {
    if (!this.fs.existsSync(`${this.dbAdapterPath}.js`)) {
      throw Error('Adapter for ' + process.env.database_type + ' not found! Please check your database type config on .env.');
    }

    await this.dbAdapter.migrate();
  };

  async new(name) {
    if (!this.fs.existsSync(`${this.dbAdapterPath}.js`)) {
      throw Error('Adapter for ' + process.env.database_type + ' not found! Please check your database type config on .env.');
    }

    await this.dbAdapter.new(name);
  };

  async refresh() {
    if (!this.fs.existsSync(`${this.dbAdapterPath}.js`)) {
      throw Error('Adapter for ' + process.env.database_type + ' not found! Please check your database type config on .env.');
    }

    await this.dbAdapter.refresh();
  };

  async reset() {
    console.log('Rolling back all migrations');

    if (!this.fs.existsSync(`${this.dbAdapterPath}.js`)) {
      throw Error('Adapter for ' + process.env.database_type + ' not found! Please check your database type config on .env.');
    }

    await this.dbAdapter.reset();
  };

  async rollback() {
    console.log('Rolling back last migration');

    if (!this.fs.existsSync(`${this.dbAdapterPath}.js`)) {
      throw Error('Adapter for ' + process.env.database_type + ' not found! Please check your database type config on .env.');
    }

    await this.dbAdapter.rollback();
  };
}

module.exports = { DbMigrations };

