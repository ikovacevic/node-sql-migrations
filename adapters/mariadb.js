var mariadb = require('mariadb');

module.exports = function (config, logger) {
    var pool = mariadb.createPool({
        host: config.host || 'localhost',
        port: config.port || 3306,
        database: config.db,
        user: config.user,
        password: config.password,
        multipleStatements: true
    });

    var emptyRegExp = /^\s*$/;

    function exec(query, values) {
        if (emptyRegExp.exec(query)) {
            return Promise.resolve([]);
        } else {
            return pool.getConnection().then(function(conn) {
                return conn.query(query, values);
            });
        }
    }

    function ensureMigrationTableExists() {
        return exec('create table if not exists __migrations__ (id bigint PRIMARY KEY)');
    }

    function getMigrationIdFromMigrationName(migrationName) {
        return migrationName && migrationName.match(/^(\d)+/)[0];
    }

    return {
        addMigrationId: function(migrationName) {
            const migrationId = getMigrationIdFromMigrationName(migrationName);
            return exec('insert into __migrations__ (id) values (?)', [migrationId]);
        },
        deleteMigrationId: function(migrationName) {
            const migrationId = getMigrationIdFromMigrationName(migrationName);
            return exec('delete from __migrations__ where id = ?', [migrationId]);
        },
        appliedMigrations: function appliedMigrations() {
            return ensureMigrationTableExists().then(function () {
                return exec('select * from __migrations__');
            }).then(function (result) {
                return result.map(function (row) { return row.id.toString(); });
            });
        },
        applyMigration: exec,
        rollbackMigration: exec,
        dispose: function dispose() {
            return pool.end();
        }
    };
};
