mainApp.factory('fbManufacturers', function($rootScope, $q, fbLoading, $http, Database) {

    var service = {};

    var mfs = null;

    service.getAll = function() {
        var deferred = Q.defer();

        if (mfs === null) {
            if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
                Database.ready().then(function() {
                    Models.Manufacturers.all().list(function(manufacturers) {
                        mfs = manufacturers;
                        deferred.resolve(manufacturers);
                    });
                });
            } else {				
                $http.post(Config.API.Endpoints.Manufacturers.getAll, {}).then(function(data) {
                    mfs = data.data;
                    deferred.resolve(data.data);
                }, function() {
                    deferred.reject();
                });
            }
        } else {
            deferred.resolve(mfs);
        }


        return deferred.promise;
    };

    service.getAvailableStyles = function(manufacturerId, productTypeId) {

        var deferred = Q.defer();

        var res = {};

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.Manufacturers.findBy('ManufacturerID', manufacturerId, function(mf) {
                    Models.LuStyles2.all().filter('ProductTypeID', '=', productTypeId).list(function(styles2List) {
                        var pWait = [];
                        styles2List.forEach(function(style2) {
                            pWait.push((function() {
                                var deferred = Q.defer();
                                var pWait = [];
                                Models.LuStyleManufacturer.all().filter('ManufacturerID', '=', manufacturerId).list(function(stylesManufacturers) {
                                    stylesManufacturers.forEach(function(styleManufacturer) {
                                        pWait.push((function(styleManufacturer) {
                                            var deferred = Q.defer();
                                            Models.LuStyles.findBy('StyleID', Number(styleManufacturer.StyleID), function(style) {
                                                if (style.Styles2ID === style2.Styles2ID) {
                                                    if (!res.hasOwnProperty(style2.Styles2ID.toString())) {
                                                        res[style2.Styles2ID.toString()] = [];
                                                    }
                                                    res[style2.Styles2ID.toString()].push(style);
                                                }
                                                deferred.resolve();
                                            });
                                            return deferred.promise;
                                        })(styleManufacturer));
                                    });
                                    Q.allSettled(pWait).then(function(results) {
                                        deferred.resolve();
                                    });
                                });
                                return deferred.promise;
                            })());
                        });
                        Q.allSettled(pWait).then(function(results) {
                            deferred.resolve(res);
                        });
                    });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Manufacturers.GetAvailableStyles, { manufacturerId: Number(manufacturerId), productTypeId: productTypeId }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;

    };

    return service;

});
