mainApp.factory('fbRawGlass', function(Database, fbProducts, fbUser, fbQuotes, $http, fbLoading) {

    var service = {};

    service.GetGlassAddOns = function(distributor, style) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                var blinds = Models.RawGlassAddOns.all().filter('Distributor', '=', distributor).list(function(addOns) {
                    deferred.resolve(addOns);
                });
            });
        } else {
            $http.post(Config.API.Endpoints.RawGlass.GetAddOns, { distributor: distributor, style: style }).then(function(addOns) {
                deferred.resolve(addOns.data);
            }, function() {
                deferred.reject();
            });
        }
        return deferred.promise;
    };

    service.PriceGlass = function(rawGlass, params) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                var sq = Models.RawGlass.all().filter('Name', '=', rawGlass.name).and(new persistence.PropertyFilter('Distributor', '=', rawGlass.distributor));

            if (rawGlass.collection !== null && rawGlass.collection !== '') {
                sq = sq.and(new persistence.PropertyFilter('Collection', '=', rawGlass.collection));
            }

                if (params.glassThickness !== null && params.glassThickness !== '' && params.glassThickness !== undefined) {
                    sq = sq.and(new persistence.PropertyFilter('GlassThickness', '=', params.glassThickness));
                }

                if (params.glassType !== null && params.glassType !== '' && params.glassType !== undefined) {
                    sq = sq.and(new persistence.PropertyFilter('GlassType', '=', params.glassType));
                }

                if (params.glassType2 !== null && params.glassType2 !== '' && params.glassType2 !== undefined) {
                    sq = sq.and(new persistence.PropertyFilter('GlassType2', '=', params.glassType2));
                }

                sq.list(function(glasses) {
                    deferred.resolve({
                        rawGlass: (glasses.length > 0) ? glasses[glasses.length - 1] : null
                    });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.RawGlass.PriceGlass, { glass: rawGlass, parameters: params }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.AddToOrder = function(order, style2Id, productTypeId, userId, addOns) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Models.Create(Models.RawGlassOrders, order).then(function(order) {
                service.AddGlassAddOns(addOns, order).then(function() {
                    fbQuotes.GetRawGlassDetails(userId, style2Id, productTypeId, order.id, null, null, null).then(function(orders) {
                        deferred.resolve(orders[0]);
                    });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.RawGlass.AddToOrder, {
                order: order,
                style2Id: style2Id,
                productTypeId: productTypeId,
                userId: userId,
                accessories: addOns
            }).then(function(data) {
                deferred.resolve(data.data.Data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.AddGlassAddOns = function(addOns, order) {
        var deferred = Q.defer();
        if (addOns.length > 0) {
            var pWait = [];
            addOns.forEach(function(acc) {
                pWait.push((function() {
                    var defer = Q.defer();
                    oAcc = {
                        LOrderID: order.id,
                        AddOnID: acc.AddOnID,
                        Price: acc.Price
                    };
                    Models.Create(Models.RawGlassOrderAddOns, oAcc).then(function() {
                        defer.resolve();
                    });
                    return defer.promise;
                })());
            });
            Q.allSettled(pWait).then(function() {
                deferred.resolve();
            });

        } else {
            deferred.resolve();
        }
        return deferred.promise;
    };

    service.UpdateOrder = function(order, style2Id, productTypeId, userId) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.RawGlassOrders.findBy('id', order.LOrderID, function(odr) {
                    odr.RawGlassID = order.SkylightID;
                    odr.Quantity = order.Quantity;
                    odr.PriceEach = order.PriceEach;
                    odr.TotalPrice = order.TotalPrice;
                    Models.Alter(Models.RawGlassOrders, odr).then(function(ord) {
                        fbQuotes.GetRawGlassOrderDetails(userId, style2Id, productTypeId, order.id, null, null, null).then(function(orders) {
                            deferred.resolve(orders);
                        });
                    });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.RawGlass.UpdateOrder, {
                order: order,
                style2Id: style2Id,
                productTypeId: productTypeId,
                userId: userId
            }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }
        return deferred.promise;
    };

    return service;
});
