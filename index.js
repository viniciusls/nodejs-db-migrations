require('dotenv').load();
const fs = require('fs');

const dbAdapterPath = __dirname + '/lib/adapters/' + process.env.database_type;

module.exports.help = () => {
  console.log('Under development');
};

module.exports.install = async () => {
  console.log('Creating migrations structure');

  if(!fs.existsSync('./migrations')) {
      fs.mkdirSync('./migrations');

      console.log('Migrations folder created at ./migrations');
  }

  if(!fs.existsSync(`${dbAdapterPath}.js`)) {
    throw Error('Adapter for ' + process.env.database_type + ' not found! Please check your database type config on .env.');
  }

  const dbAdapter = require(dbAdapterPath);

  await dbAdapter.install();
};

module.exports.migrate = async () => {
  if(!fs.existsSync(`${dbAdapterPath}.js`)) {
    throw Error('Adapter for ' + process.env.database_type + ' not found! Please check your database type config on .env.');
  }

  const dbAdapter = require(dbAdapterPath);

  await dbAdapter.migrate();
};

module.exports.new = async (name) => {
  if(!fs.existsSync(`${dbAdapterPath}.js`)) {
    throw Error('Adapter for ' + process.env.database_type + ' not found! Please check your database type config on .env.');
  }

  const dbAdapter = require(dbAdapterPath);

  await dbAdapter.new(name);
};

module.exports.refresh = async () => {
  if(!fs.existsSync(`${dbAdapterPath}.js`)) {
    throw Error('Adapter for ' + process.env.database_type + ' not found! Please check your database type config on .env.');
  }

  const dbAdapter = require(dbAdapterPath);

  await dbAdapter.refresh();
};

module.exports.reset = async () => {
  console.log('Rolling back all migrations');

  if(!fs.existsSync(`${dbAdapterPath}.js`)) {
    throw Error('Adapter for ' + process.env.database_type + ' not found! Please check your database type config on .env.');
  }

  const dbAdapter = require(dbAdapterPath);

  await dbAdapter.reset();
};

module.exports.rollback = async () => {
  console.log('Rolling back last migration');

  if(!fs.existsSync(`${dbAdapterPath}.js`)) {
    throw Error('Adapter for ' + process.env.database_type + ' not found! Please check your database type config on .env.');
  }

  const dbAdapter = require(dbAdapterPath);

  await dbAdapter.rollback();
};

