mainApp.factory('fbProducts', function(Database, fbUser, $http, fbLoading) {

    var service = {};

    service.GetProductMetaTree = function() {

        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {

                var stylesList = {};
                var styles2List = {};
                var products = [];

                (function() {

                    var deferred = Q.defer();

                    Models.LuProductTypes.all().list(function(pTypes) {

                        products = pTypes;

                        var pWait = [];

                        pTypes.forEach(function(pType) {

                            pWait.push((function() {

                                var deferred = Q.defer();

                                Models.LuStyles2.all().filter('ProductTypeID', '=', pType.ProductTypeID).order("SortOrder", true).list(function(styles2) {

                                    styles2List[pType.ProductTypeID.toString()] = styles2;

                                    var pWait = [];

                                    styles2.forEach(function(style2) {

                                        pWait.push((function() {

                                            var deferred = Q.defer();

                                            Models.LuStyles.all().filter('Styles2ID', '=', style2.Styles2ID).order("SortOrder", true).list(function(styles) {

                                                var pWait = [];

                                                styles.forEach(function(oStyle) {
                                                    pWait.push((function() {
                                                        var deferred = Q.defer();

                                                        Models.LuStyles2.findBy('Styles2ID', oStyle.Styles2ID, function(oStyle2) {
                                                            oStyle.Styles2 = oStyle2;
                                                            deferred.resolve();
                                                        });

                                                        return deferred.promise;
                                                    })());
                                                });

                                                Q.allSettled(pWait).then(function(results) {
                                                    stylesList[style2.Styles2ID.toString()] = styles;
                                                    deferred.resolve();
                                                });

                                            });

                                            return deferred.promise;

                                        })());

                                    });

                                    Q.allSettled(pWait).then(function(results) {
                                        deferred.resolve();
                                    });

                                });

                                return deferred.promise;

                            })());

                        });

                        Q.allSettled(pWait).then(function(results) {
                            deferred.resolve();
                        });

                    });

                    return deferred.promise;

                })().then(function() {
                    deferred.resolve({
                        styles2: styles2List,
                        styles: stylesList,
                        products: products
                    });
                });

            });
        } else {
            $http.post(Config.API.Endpoints.Products.GetProductMetaTree, {}).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;

    };

    service.GetAllProductTypes = function() {

        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.LuProductTypes.all().order('SortOrder', true).list(function(pTypes) {
                    deferred.resolve(pTypes);
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Products.GetAllProductTypes, {}).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;

    };

    return service;

});
