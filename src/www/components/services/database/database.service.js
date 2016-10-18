mainApp.factory('Database', function() {

    var service = {};

    var ready = false;

    var syncWait = Q.defer();

    service.init = function() {
        service.initSQL();
    };

    service.initSQL = function() {
        try {
            persistence.store.websql.config(persistence, 'fasterbids', 'Fasterbids DB', 5 * 1024 * 1024 * 1024);

            persistence.debug = false;

            persistence.schemaSync(function(tx) {
                console.log(persistence.db.implementation);
                if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
                    syncWait.resolve();
                }
            });
        } catch (err) {
            Config.API.setMode(Config.API.Modes.ONLINE);
        }
    };

    service.ready = function() {
        return syncWait.promise;
    };

    return service;
});
