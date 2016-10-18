mainApp.factory('fbMoulding', function(Database, fbProducts, fbUser, fbQuotes, $http, fbLoading) {

    var service = {};

    service.PriceMoulding = function(moulding, params) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                var length = (params.length === undefined || params.length === null || params.length === '') ? null : params.length;
                var width = (params.width === undefined || params.width === null || params.width === '') ? null : params.width;

                Models.Mouldings.all().filter('Distributor', '=', moulding.distributor).and(new persistence.PropertyFilter('Name', '=', moulding.name))
                    .and(new persistence.PropertyFilter('Collection', '=', moulding.collection)).and(new persistence.PropertyFilter('Length', '=', length))
                    .and(new persistence.PropertyFilter('Height', '=', width)).list(function(mouldings) {
                        deferred.resolve({
                            moulding: (mouldings.length > 0) ? mouldings[mouldings.length - 1] : null
                        });
                    });
            });
        } else {
            $http.post(Config.API.Endpoints.Moulding.PriceMoulding, { moulding: moulding, parameters: params }).then(function(data) {
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
                Models.Create(Models.MouldingOrders, order).then(function(order) {
                    fbQuotes.GetMouldingOrderDetails(userId, style2Id, productTypeId, order.id, null, null, null).then(function(orders) {
                        deferred.resolve(orders[0]);
                    });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Moulding.AddToOrder, {
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
                Models.MouldingOrders.findBy('id', order.LOrderID, function(odr) {
                    odr.MouldingID = order.MouldingID;
                    odr.Quantity = order.Quantity;
                    odr.PriceEach = order.PriceEach;
                    odr.TotalPrice = order.TotalPrice;
                    Models.Alter(Models.MouldingOrders, odr).then(function(ord) {
                        fbQuotes.GetMouldingOrderDetails(userId, style2Id, productTypeId, order.id, null, null, null).then(function(orders) {
                            deferred.resolve(orders);
                        });
                    });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Moulding.UpdateOrder, {
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
