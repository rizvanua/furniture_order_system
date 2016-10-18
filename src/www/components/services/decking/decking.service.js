mainApp.factory('fbDecking', function(Database, fbProducts, fbUser, fbQuotes, $http, fbLoading) {

    var service = {};

    service.PriceDecking = function(decking, params) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                var length = (params.length === undefined || params.length === null || params.length === '') ? null : params.length;

                var dq = Models.Deckings.all().filter('Name', '=', decking.name).and(new persistence.PropertyFilter('Collection', '=', decking.collection))
                    .and(new persistence.PropertyFilter('Length', '=', length)).and(new persistence.PropertyFilter('Distributor', '=', decking.distributor));

                if (params.width !== null) {
                    dq = dq.and(new persistence.PropertyFilter('Width', '=', params.width));
                }

                if (params.color !== null) {
                    dq = dq.and(new persistence.PropertyFilter('Color', '=', params.color));
                }

                dq.list(function(deckings) {
                    deferred.resolve({
                        decking: (deckings.length > 0) ? deckings[deckings.length - 1] : null
                    });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Decking.PriceDecking, { decking: decking, parameters: params }).then(function(data) {
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
                Models.Create(Models.DeckingOrders, order).then(function(order) {
                    fbQuotes.GetDeckingOrderDetails(userId, style2Id, productTypeId, order.id, null, null, null).then(function(orders) {
                        deferred.resolve(orders[0]);
                    });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Decking.AddToOrder, {
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
                Models.DeckingOrders.findBy('id', order.LOrderID, function(odr) {
                    odr.DeckingID = order.DeckingID;
                    odr.Quantity = order.Quantity;
                    odr.PriceEach = order.PriceEach;
                    odr.TotalPrice = order.TotalPrice;
                    Models.Alter(Models.DeckingOrders, odr).then(function(ord) {
                        fbQuotes.GetDeckingOrderDetails(userId, style2Id, productTypeId, order.id, null, null, null).then(function(orders) {
                            deferred.resolve(orders);
                        });
                    });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Decking.UpdateOrder, { order: order, style2Id: style2Id, productTypeId: productTypeId, userId: userId }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    return service;
});
