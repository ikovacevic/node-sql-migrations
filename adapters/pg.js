var pg = require('pg');

module.exports = function (config, logger) {
    var pool = new pg.Pool({
        host: config.host || 'localhost',
        port: config.port || 5432,
        database: config.db,
        user: config.user,
        password: config.password
    });

    function getMigrationIdFromMigrationName(migrationName) {
        return migrationName && migrationName.match(/^(\d)+/)[0];
    }

    function exec(query, values) {
        return pool.query(query, values).catch(function (err) {
            //add the sql line number to the error output if available
            if (err && err.position) {
                err.sql_line = (query.substring(0, err.position).match(/\n/g) || []).length + 1;
            }
            throw err;
        });
    }

    function ensureMigrationTableExists() {
        return exec('create table if not exists "__migrations__" (id bigint PRIMARY KEY)');
    }

    return {
        addMigrationId: function(migrationName) {
            const migrationId = getMigrationIdFromMigrationName(migrationName);
            return exec('insert into __migrations__ (id) values ($1)', [migrationId]);
        },
        deleteMigrationId: function(migrationName) {
            const migrationId = getMigrationIdFromMigrationName(migrationName);
            return exec('delete from __migrations__ where id = $1', [migrationId]);
        },
        appliedMigrations: function appliedMigrations() {
            return ensureMigrationTableExists().then(function () {
                return exec('select * from __migrations__');
            }).then(function (result) {
                return result.rows.map(function (row) { return row.id; });
            });
        },
        applyMigration: exec,
        rollbackMigration: exec,
        dispose: function dispose() {
            return pool.end();
        }
    };
};
