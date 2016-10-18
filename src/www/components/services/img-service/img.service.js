mainApp.factory('fbImg', function(Database, fbUser) {

    var service = {};

    service.ResolveUrl = function(url) {
        var deferred = Q.defer();

        var newValue = encodeURI(url);
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.ImageDatabase.findBy('ImgUrl', newValue, function(obj) {
                    if (obj === null) {
                        deferred.resolve(Config.UPaths.Base + newValue);
                    } else {
                        deferred.resolve('data:image/png;base64,' + obj.Base64);
                    }
                });
            });
        } else {
            deferred.resolve(Config.UPaths.Base + newValue);
        }

        return deferred.promise;
    };

    return service;

});
