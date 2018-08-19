var mariadb = require('mariadb');

module.exports = function (config, logger) {
    var pool = mariadb.createPool({
        host: config.host || 'localhost',
        port: config.port || 3306,
        database: config.db,
        user: config.user,
        password: config.password
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

    return {
        appliedMigrations: function appliedMigrations() {
            return ensureMigrationTableExists().then(function () {
                return exec('select * from __migrations__');
            }).then(function (result) {
                return result.map(function (row) { return row.id.toString(); });
            });
        },
        applyMigration: function applyMigration(migration, sql) {
            return exec(sql).then(function (result) {
                logger.log('Applying ' + migration);
                if (config.debug) logger.log(result);
                logger.log('===============================================');
                var values = [migration.match(/^(\d)+/)[0]];
                return exec('insert into __migrations__ (id) values (?)', values);
            });
        },
        rollbackMigration: function rollbackMigration(migration, sql) {
            return exec(sql).then(function (result) {
                logger.log('Reverting ' + migration);
                if (config.debug) logger.log(result);
                logger.log('===============================================');
                var values = [migration.match(/^(\d)+/)[0]];
                return exec('delete from __migrations__ where id = ?', values);
            });
        },
        dispose: function dispose() {
            return pool.end();
        }
    };
};
