class Db2Adapter {
  constructor() {
    require('dotenv').load();

    this.fs = require('fs');

    const { Db2Connector } = require('../connectors/db2');
    this.db2 = new Db2Connector();

    this.migrationsDir = `${process.cwd()}/migrations`;
  }
}

module.exports = { Db2Adapter };

