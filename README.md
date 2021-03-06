# nodejs-db-migrations
![GitHub](https://img.shields.io/github/license/viniciusls/nodejs-db-migrations.svg)
![npm](https://img.shields.io/npm/v/nodejs-db-migrations.svg)
![node](https://img.shields.io/node/v/nodejs-db-migrations.svg)
![GitHub commit activity](https://img.shields.io/github/commit-activity/w/viniciusls/nodejs-db-migrations.svg)
![GitHub contributors](https://img.shields.io/github/contributors/viniciusls/nodejs-db-migrations.svg)

NodeJS package to generate and run database migrations

## Summary
- [Getting started](https://github.com/viniciusls/nodejs-db-migrations#getting-started)
- [Supported databases](https://github.com/viniciusls/nodejs-db-migrations#supported-databases)
- [Available methods](https://github.com/viniciusls/nodejs-db-migrations#available-methods)
  - [help](https://github.com/viniciusls/nodejs-db-migrations#help)
  - [install](https://github.com/viniciusls/nodejs-db-migrations#install)
  - [migrate](https://github.com/viniciusls/nodejs-db-migrations#migrate)
  - [new](https://github.com/viniciusls/nodejs-db-migrations#new)
  - [refresh](https://github.com/viniciusls/nodejs-db-migrations#refresh)
  - [reset](https://github.com/viniciusls/nodejs-db-migrations#reset)
  - [rollback](https://github.com/viniciusls/nodejs-db-migrations#rollback)
  - [version](https://github.com/viniciusls/nodejs-db-migrations#version)
- [Contributing](https://github.com/viniciusls/nodejs-db-migrations#contributing)
- [Need help](https://github.com/viniciusls/nodejs-db-migrations#need-help)

## Getting started

## Supported databases

Currently `nodejs-db-migrations` support the following databases:

- MySQL;
- DB2 (coming soon);

If you want to help us adding new databases support, you can start creating an adapter and a connector for that database inside `./lib/adapters` and `./lib/connectors`, respectively, with the name of the desired database and following the structure used in `mysql.js` adapter and connector, for example.

## Available methods

### help

Show all commands and options available and its descriptions.

### install

Create the package needed migrations and execute then

### migrate

Execute pending migration(s)

### new(name : string [optional])

Create a new migration. If a name is specified the migrate will follow the convention `<generated_id>_<name>.js`

### refresh

Rollback all the database and re-run all the migrations

### reset

Rollback all migrations executed

### rollback

Rollback the last migration executed

### version

Show the current package version

## Contributing

## Need help?
If you need more help, feel free to open an issue here or send an email to [vinicius.ls@live.com](mailto:vinicius.ls@live.com).
