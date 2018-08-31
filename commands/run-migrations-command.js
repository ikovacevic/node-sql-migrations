var chalk = require('chalk');
var path = require('path');

module.exports = function (migrationProvider, adapter, logger, config, jsMigrationContext) {
    return adapter.appliedMigrations()
        .then(function (appliedMigrationIds) {
            var migrationsList = migrationProvider.getMigrationsList();
            var pending = getPending(migrationsList, appliedMigrationIds);

            if (pending.length === 0) {
                logger.log('No pending migrations');
                return;
            }

            logger.log('Pending migrations:');
            pending.forEach(function (m) {
                logger.log(chalk.green('>>'), m);
            });

            var migration;
            var migrationProgress = Promise.resolve();
            while (migration = pending.shift()) {
                (function (migration) {
                    migrationProgress = migrationProgress.then(function () {
                        logger.log('');
                        logger.log('===============================================');
                        logger.log('Applying ' + migration);
                        if (migration.endsWith('.js')) {
                            logger.log('-----------------------------------------------');
                            const absolutePath = path.join(config.migrationsDir, migration);
                            const m = require(absolutePath);
                            return m(jsMigrationContext);
                        } else {
                            var sql = migrationProvider.getSql(migration);
                            return adapter.applyMigration(sql);
                        }
                    }).then(function(result) {
                        if (config.debug) {
                            logger.log('-----------------------------------------------');
                            logger.log(result);
                        }
                        return adapter.addMigrationId(migration);
                    });
                })(migration);
            }
            return migrationProgress;
        });
};

function getPending(migrationsList, appliedMigrationIds) {
    var pending = [];
    migrationsList.forEach(function (migration) {
        var id = migration.match(/^(\d+)/)[0];
        if (!~appliedMigrationIds.indexOf(id) && migration.match(/^\d+\_up.*$/)) {
            pending.push(migration);
        }
    });
    return pending;
}
