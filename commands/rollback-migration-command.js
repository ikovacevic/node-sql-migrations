const path = require('path');

module.exports = function (migrationProvider, adapter, logger, config, jsMigrationContext) {

    let migration;

    return adapter.appliedMigrations().then(function (ids) {
        var lastAppliedMigrationId = ids[ids.length - 1];

        if (!lastAppliedMigrationId) {
            logger.log('Nothing to rollback');
            return
        }

        migration = migrationProvider.getMigrationsList().find(function (migration) {
            var baseName = migration.match(/^(\d+)_down/);
            if (baseName && baseName[1] == lastAppliedMigrationId) {
                return true
            }
            return false;
        });

        if (!migration) {
            throw new Error('Can\'t find migration with id ', lastAppliedMigrationId);
        }

        logger.log('')
        logger.log('===============================================');
        logger.log('Reverting ' + migration);
        if (migration.endsWith('.js')) {
            logger.log('-----------------------------------------------');
            const absolutePath = path.join(config.migrationsDir, migration);
            const m = require(absolutePath);
            return Promise.resolve(m(jsMigrationContext));
        } else {
            var sql = migrationProvider.getSql(migration);
            return adapter.rollbackMigration(sql);
        }
    }).then(function(result) {
        if (config.debug) {
            logger.log('-----------------------------------------------');
            logger.log(result);
        }
        return adapter.deleteMigrationId(migration);
    });
};
