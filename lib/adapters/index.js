const { MysqlAdapter } = require('./mysql');

const classes = {
  MysqlAdapter
};

class DynamicAdapter {
  constructor (className, opts) {
    return new classes[className](opts);
  }
}

module.exports = { DynamicAdapter };
