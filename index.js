class DbMigrations {
  constructor() {
    require('dotenv').load();

    this.fs = require('fs');

    const dbAdapterType = process.env.database_type;

    if (!dbAdapterType) {
      throw Error('Adapter not defined in .env');
    }

    // TODO: Find a way to instantiate dynamically the adapter class w/out the switch
    // this.dbAdapterPath = __dirname + '/lib/adapters/' + dbAdapterType;
    //
    // this.dbAdapter = require(this.dbAdapterPath);
    //
    // const dbAdapterClassName = dbAdapterType.charAt(0).toUpperCase() + dbAdapterType.slice(1) + 'Adapter';
    //
    // this.dbAdapter = new dbAdapterClassName();
    //
    // if (!this.fs.existsSync(`${this.dbAdapterPath}.js`)) {
    //   throw Error('Adapter for ' + process.env.database_type + ' not found! Please check your database type config on .env.');
    // }

    switch (dbAdapterType.toLowerCase()) {
      case 'mysql':
        const { MysqlAdapter } = require(__dirname + '/lib/adapters/' + dbAdapterType);

        this.dbAdapter = new MysqlAdapter();

        break;
      case 'db2':
        break;
      default:
        throw Error('Adapter not found. Check the database_type on .env');
    }
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

