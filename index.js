require('dotenv').load();
const fs = require('fs');

module.exports.help = () => {
  console.log('Under development');
};

module.exports.install = async () => {
  console.log('Creating migrations structure');

  if(!fs.existsSync('./migrations')) {
      fs.mkdirSync('./migrations');

      console.log('Migrations folder created at ./migrations');
  }

  if(!fs.existsSync(__dirname + '/lib/adapters/' + process.env.database_type + '.js')) {
    throw Error('Adapter for ' + process.env.database_type + ' not found! Please check your database type config on .env.');
  }

  const dbAdapter = require(__dirname + '/lib/adapters/' + process.env.database_type);

  await dbAdapter.install();
};

module.exports.migrate = () => {
  console.log('Under development');
};

module.exports.new = (name) => {
  console.log('Under development');
};

module.exports.refresh = () => {
  console.log('Under development');
};

module.exports.reset = () => {
  console.log('Under development');
};

module.exports.rollback = () => {
  console.log('Under development');
};

