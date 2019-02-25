const program = require('commander');

program
  .version('0.0.1')
  .description('NodeJS package to generate and run database migrations');

program
  .command('help')
  .alias('h')
  .description('Help')
  .action(() => {
    console.log('Under development');
  });

program
  .command('migrate')
  .alias('m')
  .description('Execute pending migration(s)')
  .action(() => {
    console.log('Under development');
  });

program
  .command('refresh')
  .alias('rf')
  .description('Rollback all the database and re-run all the migrations')
  .action(() => {
    console.log('Under development');
  });

program
  .command('reset')
  .alias('re')
  .description('Rollback all migrations executed')
  .action(() => {
    console.log('Under development');
  });

program
  .command('rollback')
  .alias('r')
  .description('Rollback the last migration executed')
  .action(() => {
    console.log('Under development');
  });

program.parse(process.argv);
