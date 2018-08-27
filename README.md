node-sql-migrations
===================

raw SQL migrations for node

### Example

In your project
```js
// migrate.js
var path = require('path');

require('sql-migrations').run({
    // configuration here. See the Configuration section
});
```

### CLI
run `node ./migrate.js` with arguments

---

#### `node ./migrate create migration_name`
will create two migration files (up and down)
```
./migrations/1415860098827_up_migration_name.sql
./migrations/1415860098827_down_migration_name.sql
```

---

#### `node ./migrate migrate`
will run all pending migrations

---

#### `node ./migrate.js rollback`
will rollback the last migration if there is one

### Programmatic API
#### Migrate
In your project
```js
require('sql-migrations').migrate({
    // configuration here. See the Configuration section
}, {
    // optional context for JavaScript (`.js`) migrations
    // usually object with access to models and DAO
});
```
This returns a promise which resolves/rejects whenever the migration is complete.

#### Rollback
In your project
```js
require('sql-migrations').rollback({
    // configuration here. See the Configuration section
}, {
    // optional context for JavaScript (`.js`) migrations
    // usually object with access to models and DAO
});
```
This returns a promise which resolves/rejects whenever the rollback is complete.

### Configuration
Configuration should be specified as below:
```js
var configuration = {
    migrationsDir: path.resolve(__dirname, 'migrations'), // This is the directory that should contain your SQL migrations.
    adapter: 'pg', // Database adapter
    host: 'localhost', // Database host
    port: 5432, // Database port
    db: 'sql_migrations', // Database name
    user: 'dabramov', // Database username
    password: 'password', // Database password
    debug: false, // Show additional info when applying migrations
    // Parameters are optional. If you provide them then any occurrences of the parameter (i.e. FOO) in the SQL scripts will be replaced by the value (i.e. bar).
    parameters: {
        "FOO": "bar"
    }
};
```

You can also swap out the default logger (the `console` object) for another one that supports the log and error methods. You should do this before running any other commands:
```js
require('sql-migrations').setLogger({
    log: function() {},
    error: function() {}
});
```

#### Supported Database Adapters

##### pg
Used with [PostgreSQL](https://www.postgresql.org/) Database. This is the _Default_.

The `pg` adapter depends on [`pg`](https://www.npmjs.com/package/pg) npm package.

##### mariadb
Used with [MariaDB](https://mariadb.org/) Database.

Depends on [`mariadb`](https://www.npmjs.com/package/mariadb) npm package.


### Context
When calling `migrate` and `rollback` programmatically you can specify optional 2nd parameter with
Context for executing your JavaScript (`.js`) migrations.


### Migration files

#### Native SQL migrations
Write raw sql in your migrations. You can also include placeholders which will be substituted.
example
```sql
-- ./migrations/1415860098827_up_migration_name.sql
create table test_table (id bigint, name varchar(255));

```
```sql
-- ./migrations/1415860098827_down_migration_name.sql
drop table test_table;
```

#### JavaScript migrations
You can also write migrations in JavaScript (migration file has to have `.js` extension). If you need some specific context (with access to models and DAO in framework you're using) you have to use Programmatic API and call `migrate` and `rollback` functions with that context as second argument and it will be supplied to each migration.

Example migration.

```javascript
module.exports = function(ctx) {

    // do something with data

};
```