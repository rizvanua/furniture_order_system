mainApp.factory('fbSiding', function(Database, fbProducts, fbUser, fbQuotes, $http, fbLoading) {

    var service = {};

    service.PriceSiding = function(siding, params) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                var length = (params.length === undefined || params.length === null || params.length === '') ? null : params.length;

                var sq = Models.Sidings.all().filter('Name', '=', siding.name).and(new persistence.PropertyFilter('Collection', '=', siding.collection))
                    .and(new persistence.PropertyFilter('Length', '=', length)).and(new persistence.PropertyFilter('Distributor', '=', siding.distributor));

                if (params.width !== null) {
                    sq = sq.and(new persistence.PropertyFilter('Width', '=', params.width));
                }

                if (params.color !== null) {
                    sq = sq.and(new persistence.PropertyFilter('Color', '=', params.color));
                }

                sq.list(function(sidings) {
                    deferred.resolve({
                        siding: (sidings.length > 0) ? sidings[sidings.length - 1] : null
                    });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Siding.PriceSiding, { siding: siding, parameters: params }).then(function(data) {
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
                Models.Create(Models.SidingOrders, order).then(function(order) {
                    fbQuotes.GetSidingOrderDetails(userId, style2Id, productTypeId, order.id, null, null, null).then(function(orders) {
                        deferred.resolve(orders[0]);
                    });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Siding.AddToOrder, { order: order, style2Id: style2Id, productTypeId: productTypeId, userId: userId }).then(function(data) {
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
                Models.SidingOrders.findBy('id', order.LOrderID, function(odr) {
                    odr.SidingID = order.SidingID;
                    odr.Quantity = order.Quantity;
                    odr.PriceEach = order.PriceEach;
                    odr.TotalPrice = order.TotalPrice;
                    Models.Alter(Models.SidingOrders, odr).then(function(ord) {
                        fbQuotes.GetSidingOrderDetails(userId, style2Id, productTypeId, order.id, null, null, null).then(function(orders) {
                            deferred.resolve(orders);
                        });
                    });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Siding.UpdateOrder, { order: order, style2Id: style2Id, productTypeId: productTypeId, userId: userId }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    return service;
});
