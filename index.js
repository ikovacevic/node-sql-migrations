var MigrationProvider = require('./migration-provider');
var createMigrationCommand = require('./commands/create-migration-command');
var runMigrationsCommand = require('./commands/run-migrations-command')
var rollbackMigrationCommand = require('./commands/rollback-migration-command');

var LOGGER = console;
var DB_ADAPTER;

function getAdapter(config) {
    if (!DB_ADAPTER) {
        var adapterName = config.adapter || 'pg'; // set 'pg' as default adapter for backward compatibility
        var adapter = require('./adapters/' + adapterName);
        DB_ADAPTER = adapter(config, LOGGER);
    }
    return DB_ADAPTER;
}

function migrate(config, jsMigrationsContext) {
    var migrationProvider = MigrationProvider(config);
    var adapter = getAdapter(config);
    return runMigrationsCommand(migrationProvider, adapter, LOGGER, config, jsMigrationsContext).then(function () {
        return adapter.dispose();
    }, function (error) {
        function rethrowOriginalError() {
            throw error;
        }
        return adapter.dispose().then(rethrowOriginalError, rethrowOriginalError);
    });
}

function rollback(config, jsMigrationsContext) {
    var migrationProvider = MigrationProvider(config);
    var adapter = getAdapter(config);
    return rollbackMigrationCommand(migrationProvider, adapter, LOGGER, config, jsMigrationsContext).then(function () {
        return adapter.dispose();
    }, function (error) {
        function rethrowOriginalError() {
            throw error;
        }
        return adapter.dispose().then(rethrowOriginalError, rethrowOriginalError);
    });
}

module.exports = {
    setLogger: function (logger) {
        LOGGER = logger;
    },
    migrate: migrate,
    rollback: rollback,
    run: function (config) {
        var args = process.argv.slice(2);

        switch (args[0]) {
            case 'create':
                createMigrationCommand(config, LOGGER, args[1]);
                break;
            case 'migrate':
                migrate(config).then(onCliSuccess, onCliError);
                break;
            case 'rollback':
                rollback(config).then(onCliSuccess, onCliError);
                break;
            default:
                LOGGER.log('exit');
        }

        function onCliSuccess() {
            LOGGER.log('done');
            process.exit();
        }

        function onCliError(error) {
            LOGGER.error('ERROR:', error);
            process.exit(1);
        }
    }
};
