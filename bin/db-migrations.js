const db_migrations = require('../index');
const program = require('commander');

program
  .version('0.0.1')
  .description('NodeJS package to generate and run database migrations');

program
  .command('help')
  .alias('h')
  .description('Help')
  .action(() => {
    db_migrations.help();
  });

program
  .command('install')
  .alias('i')
  .description('Create the package needed migrations and execute then')
  .action(() => {
    db_migrations.install();
  });

program
  .command('migrate')
  .alias('m')
  .description('Execute pending migration(s)')
  .action(() => {
    db_migrations.migrate();
  });

program
  .command('new [name]')
  .alias('n')
  .description('Create a new migration. If a name is specified the migrate will follow the convention <generated_id>_<name>')
  .action((name) => {
    db_migrations.new(name);
  });

program
  .command('refresh')
  .alias('rf')
  .description('Rollback all the database and re-run all the migrations')
  .action(() => {
    db_migrations.refresh();
  });

program
  .command('reset')
  .alias('re')
  .description('Rollback all migrations executed')
  .action(() => {
    db_migrations.reset();
  });

program
  .command('rollback')
  .alias('r')
  .description('Rollback the last migration executed')
  .action(() => {
    db_migrations.rollback();
  });

program.parse(process.argv);
