mainApp.factory('fbSkylight', function(Database, fbProducts, fbUser, fbQuotes, $http, fbLoading) {

    var service = {};

    service.GetBlinds = function(distributor, type) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                var blinds = Models.SkylightBlinds.all().filter('Distributor', '=', distributor).and(new persistence.PropertyFilter('Type', '=', type)).list(function(blinds) {
                    deferred.resolve(blinds);
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Skylight.GetBlinds, { distributor: distributor, type: type }).then(function(blinds) {
                deferred.resolve(blinds.data);
            }, function() {
                deferred.reject();
            });
        }
        return deferred.promise;
    };

    service.PriceSkylight = function(skylight, params) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                var sq = Models.Skylights.all().filter('Name', '=', skylight.name).and(new persistence.PropertyFilter('Distributor', '=', skylight.distributor));

                if (skylight.collection !== null && skylight.collection !== '') {
                    sq = sq.and(new persistence.PropertyFilter('Collection', '=', skylight.collection));
                }

                if (params.width !== null && params.width !== '') {
                    sq = sq.and(new persistence.PropertyFilter('Width', '=', params.width));
                }

                if (params.height !== null && params.height !== '') {
                    sq = sq.and(new persistence.PropertyFilter('Height', '=', params.height));
                }

                if (params.glassType !== null && params.glassType !== '') {
                    sq = sq.and(new persistence.PropertyFilter('GlassType', '=', params.glassType));
                }

                if (params.glassColor !== null && params.glassColor !== '') {
                    sq = sq.and(new persistence.PropertyFilter('GlassColor', '=', params.glassColor));
                }

                if (params.dimension !== null && params.dimension !== '') {
                    sq = sq.and(new persistence.PropertyFilter('Dimension', '=', params.dimension));
                }

                if (params.operatorType !== null && params.operatorType !== '') {
                    sq = sq.and(new persistence.PropertyFilter('OperatorType', '=', params.operatorType));
                }

                if (params.finish !== null && params.finish !== '') {
                    sq = sq.and(new persistence.PropertyFilter('Finish', '=', params.finish));
                }

                if (params.qtyPriceDiscount !== null && params.qtyPriceDiscount !== '') {
                    sq = sq.and(new persistence.PropertyFilter('QtyPriceDiscount', '=', params.qtyPriceDiscount));
                }

                if (params.color !== null && params.color !== '') {
                    sq = sq.and(new persistence.PropertyFilter('Color', '=', params.color));
                }

                if (params.thickness !== null && params.thickness !== '') {
                    sq = sq.and(new persistence.PropertyFilter('Thickness', '=', params.thickness));
                }

                sq.list(function(skylights) {
                    deferred.resolve({
                        skylight: (skylights.length > 0) ? skylights[skylights.length - 1] : null
                    });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Skylight.PriceSkylight, { skylight: skylight, parameters: params }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.AddToOrder = function(order, style2Id, productTypeId, userId) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.Create(Models.SkylightOrders, order).then(function(order) {
                    fbQuotes.GetSkylightOrderDetails(userId, style2Id, productTypeId, order.id, null, null, null).then(function(orders) {
                        deferred.resolve(orders[0]);
                    });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Skylight.AddToOrder, {
                order: order,
                style2Id: style2Id,
                productTypeId: productTypeId,
                userId: userId
            }).then(function(data) {
                deferred.resolve(data.data.Data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.UpdateOrder = function(order, style2Id, productTypeId, userId) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.SkylightOrders.findBy('id', order.LOrderID, function(odr) {
                    odr.SkylightID = order.SkylightID;
                    odr.Quantity = order.Quantity;
                    odr.PriceEach = order.PriceEach;
                    odr.TotalPrice = order.TotalPrice;
                    odr.SkylightBlindID = order.SkylightBlindID;
                    Models.Alter(Models.SkylightOrders, odr).then(function(ord) {
                        fbQuotes.GetSkylightOrderDetails(userId, style2Id, productTypeId, order.id, null, null, null).then(function(orders) {
                            deferred.resolve(orders);
                        });
                    });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Skylight.UpdateOrder, {
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
