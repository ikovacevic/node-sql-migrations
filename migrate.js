var path = require('path');

require('./').run({
    migrationsDir: path.resolve(__dirname, 'migrations'),
    adapter: 'pg',
    user: 'dabramov',
    host: 'localhost',
    db: 'sql_migrations',
    password: 'pgpassword',
    port: 5432,
    debug: false
});
