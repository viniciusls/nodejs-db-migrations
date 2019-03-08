class Db2Connector {
  constructor() {
    require('dotenv').load();

    this.db2 = require('ibm_db');
  }

  createConnection() {
    const Pool = this.db2.Pool;
    const pool = new Pool();

    const connectionString = `database=${process.env.database_name};hostname=${process.env.database_host};port=${process.env.database_port};uid=${process.env.database_user};pwd=${process.env.database_password}`;

    const getConnection = pool.open.bind(pool, connectionString);

    return new Promise((resolve, reject) => {
      getConnection((err, conn) =>
        err ? reject(err) : resolve(conn));
    });
  }
}

module.exports = { Db2Connector };

