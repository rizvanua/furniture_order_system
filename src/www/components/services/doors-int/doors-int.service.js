mainApp.factory('fbIntDoors', function(Database, fbProducts, fbUser, fbQuotes, $http, fbLoading) {

    var service = {};

    service.PriceDoor = function(door, params) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.Doors.all().filter('Distributor', '=', door.distributor).and(new persistence.PropertyFilter('Deleted', '=', false))
                    .and(new persistence.PropertyFilter('width', '=', params.width)).and(new persistence.PropertyFilter('height', '=', params.height))
                    .and(new persistence.PropertyFilter('name', '=', door.name)).and(new persistence.PropertyFilter('type', '=', params.type))
                    .and(new persistence.PropertyFilter('core', '=', params.core)).and(new persistence.PropertyFilter('collection', '=', door.collection)).list(function(doors) {
                        Models.Jambs.all().filter('height', '=', params.height).and(new persistence.PropertyFilter('jambType', '=', params.jambType))
                            .and(new persistence.PropertyFilter('type', '=', params.type)).and(new persistence.PropertyFilter('width', '=', params.jambWidth))
                            .and(new persistence.PropertyFilter('specialGroup', '=', params.specialGroup)).and(new persistence.PropertyFilter('fireRating', '=', params.fireRating)).list(function(jambs) {
                                deferred.resolve({
                                    door: (doors.length > 0) ? doors[0] : null,
                                    jamb: (jambs.length > 0) ? jambs[0] : null
                                });
                            });
                    });
            });
        } else {
            $http.post(Config.API.Endpoints.IntDoors.PriceDoor, { door: door, parameters: params }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.GetJambTree = function(fireRating, specialGroup, manufacturerId) {

        fireRating = fireRating !== undefined ? fireRating : "";
        specialGroup = specialGroup !== undefined ? specialGroup : "";

        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                var qJamb = Models.JambFilters.all().filter('manufacturerID', '=', manufacturerId).and(new persistence.PropertyFilter('fireRating', '=', fireRating));
                var qGroup = qJamb.and(new persistence.PropertyFilter('specialGroup', '=', specialGroup));

                qGroup.order('JambFiltersID', false).list(function(jambGroup) {
                    if (jambGroup.length > 0) {
                        deferred.resolve(JSON.parse(jambGroup[0].filters));
                    } else {
                        qJamb.order('JambFiltersID', false).list(function(jambs) {
                            if (jambs.length > 0) {
                                deferred.resolve(JSON.parse(jambs[0].filters));
                            } else {
                                deferred.resolve([]);
                            }
                        });
                    }
                });
            });
        } else {
            $http.post(Config.API.Endpoints.IntDoors.GetJambTree, { fireRating: fireRating, specialGroup: specialGroup, manufacturerId: manufacturerId }).then(function(data) {
                deferred.resolve(JSON.parse(data.data));
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.GetDefaults = function(style, manufacturer, type, collection, name) {
        var deferred = Q.defer();

        var res = [];
        var jamb = {};

        name = (name === undefined || name === null) ? "" : name;

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.DoorDefaults.all().and(new persistence.OrFilter(new persistence.PropertyFilter('Collection', '=', ''), new persistence.PropertyFilter('Collection', '=', collection)))
                    .and(new persistence.OrFilter(new persistence.PropertyFilter('Name', '=', ''), new persistence.PropertyFilter('Name', '=', name)))
                    .and(new persistence.OrFilter(new persistence.PropertyFilter('Type', '=', ''), new persistence.PropertyFilter('Type', '=', type))).list(function(dDefs) {
                        var pWait = [];
                        dDefs.forEach(function(dDef) {
                            pWait.push((function() {
                                var deferred = Q.defer();
                                Models.Manufacturers.findBy('ManufacturerID', dDef.MfID, function(mfg) {
                                    dDef.Manufacturer = mfg;
                                    Models.LuStyles.findBy('StyleID', dDef.StyleID, function(style) {
                                        dDef.Style = style;
                                        deferred.resolve();
                                    });
                                });
                                return deferred.promise;
                            })());
                        });
                        Q.allSettled(pWait).then(function() {
                            dDefs = _.filter(dDefs, function(dDef) {
                                return (dDef.Style === null || dDef.Style.Style.toLowerCase() === style.toLowerCase()) && (dDef.Manufacturer.name === manufacturer);
                            });
                            var pWait = [];
                            dDefs.forEach(function(dDef) {
                                if (dDef.DefaultAccessory !== "") {
                                    var accNames = dDef.DefaultAccessory.split('|');
                                    accNames.forEach(function(accName) {
                                        pWait.push((function() {
                                            var deferred = Q.defer();
                                            Models.Accessories.all().filter('AccessoryName', '=', accName).and(new persistence.PropertyFilter('Distributor', '=', dDef.Manufacturer.name)).list(function(acc) {
                                                if (acc !== null) {
                                                    acc.forEach(function(currentAcc) {
                                                        res.push(currentAcc);
                                                    });
                                                }
                                                deferred.resolve();
                                            });
                                            return deferred.promise;
                                        })());
                                    });
                                }
                                if (dDef.DefaultJamb !== "") {
                                    jamb.jambType = dDef.DefaultJamb;
                                }

                            });
                            Q.allSettled(pWait).then(function() {
                                deferred.resolve({
                                    accessories: res,
                                    jamb: jamb
                                });
                            });
                        });
                    });
            });
        } else {
            $http.post(Config.API.Endpoints.IntDoors.GetDefaults, {
                collection: collection,
                manufacturer: manufacturer,
                name: name,
                style: style,
                type: type
            }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.GetAccessories = function(params) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                if ((params.type === undefined || params.type === null) && params.accessoryType === "Jamb") {
                    params.type = "Single";
                }

                params.fireRating = params.fireRating !== undefined && params.fireRating !== "" ? params.fireRating : '';

                var accQ = Models.Accessories.all().filter('AccessoryType', '=', params.accessoryType).and(new persistence.PropertyFilter('Distributor', '=', params.distributor))
                    .and(new persistence.PropertyFilter('FireRating', '=', params.fireRating));

                if (params.type !== null) {
                    accQ = accQ.and(new persistence.OrFilter(new persistence.PropertyFilter('Type', '=', ''), new persistence.PropertyFilter('Type', '=', params.type)));
                }

                if (params.height !== null) {
                    accQ = accQ.and(new persistence.OrFilter(new persistence.PropertyFilter('Height', '=', ''), new persistence.PropertyFilter('Height', '=', params.height)));
                }

                if (params.jambType !== null) {
                    accQ = accQ.and(new persistence.OrFilter(new persistence.PropertyFilter('JambType', '=', ''), new persistence.PropertyFilter('JambType', '=', params.jambType)));
                }

                accQ = accQ.order('AccessoryName', true);

                accQ.list(function(accs) {
                    accs = _.filter(accs, function(acc) {
                        return acc.AccessoryName === "" || acc.AccessoryName.indexOf(params.accessoryName) > -1;
                    });
                    deferred.resolve(accs);
                });
            });
        } else {
            $http.post(Config.API.Endpoints.IntDoors.GetAccessories, { exteriorOrderAccessorySearch: params }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.GetHingeTypes = function(distributor, doorType, fireRating, specialGroup) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                if (distributor !== undefined && distributor !== null && distributor !== '') {
                    Models.Accessories.all().filter('AccessoryType', '=', 'Hinge').and(new persistence.PropertyFilter('Distributor', '=', distributor))
                        .and(new persistence.PropertyFilter('Type', '=', doorType))
                        //    .and(new persistence.PropertyFilter('SpecialGroup','=',specialGroup))
                        .and(new persistence.PropertyFilter('FireRating', '=', fireRating)).list(function(accs) {
                            deferred.resolve(_.uniq(_.pluck(accs, 'AccessoryName')));
                        });
                } else {
                    Models.Accessories.all().filter('AccessoryType', '=', 'Hinge').and(new persistence.PropertyFilter('Type', '=', doorType)).list(function(accs) {
                        deferred.resolve(_.uniq(_.pluck(accs, 'AccessoryName')));
                    });
                }
            });
        } else {
            $http.post(Config.API.Endpoints.IntDoors.GetHingeTypes, {
                distributor: distributor,
                doorType: doorType,
                fireRating: fireRating,
                specialGroup: specialGroup
            }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.GetHingeColors = function(distributor, hingeName, doorType,specialGroup,fireRating) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                if (distributor !== undefined && distributor !== null && distributor !== '') {
                    Models.Accessories.all().filter('AccessoryType', '=', 'Hinge').and(new persistence.PropertyFilter('Distributor', '=', distributor))
                        .and(new persistence.PropertyFilter('Type', '=', doorType)).and(new persistence.PropertyFilter('AccessoryName', '=', hingeName)).list(function(accs) {
                            deferred.resolve(accs);
                        });
                } else {
                    Models.Accessories.all().filter('AccessoryType', '=', 'Hinge').and(new persistence.PropertyFilter('Type', '=', doorType))
                        .and(new persistence.PropertyFilter('AccessoryName', '=', hingeName)).list(function(accs) {
                            deferred.resolve(accs);
                        });
                }
            });
        } else {
            $http.post(Config.API.Endpoints.IntDoors.GetHingeColors, { distributor: distributor, hingeName: hingeName, doorType: doorType,specialGroup:specialGroup,fireRating:fireRating }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.AddToOrder = function(order, style2Id, productTypeId, userId, accessories) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.Create(Models.DoorOrders, order).then(function(order) {
                    if (accessories !== undefined && accessories !== null && accessories.length > 0) {
                        var pWait = [];
                        accessories.forEach(function(acc) {
                            pWait.push((function() {
                                var deferred = Q.defer();
                                oAcc = {
                                    LOrderID: order.id,
                                    AccessoryID: acc.AccessoryID,
                                    Price: acc.Price
                                };
                                Models.Create(Models.OrderAccessories, oAcc).then(function() {
                                    deferred.resolve();
                                });
                                return deferred.promise;
                            })());
                        });
                        Q.allSettled(pWait).then(function() {
                            fbQuotes.GetOrders(userId, style2Id, productTypeId, order.id, null, null, null).then(function(orders) {
                                deferred.resolve(orders[0]);
                            });
                        });
                    } else {
                        fbQuotes.GetOrders(userId, style2Id, productTypeId, order.id, null, null, null).then(function(orders) {
                            deferred.resolve(orders[0]);
                        });
                    }
                });
            });
        } else {
            $http.post(Config.API.Endpoints.IntDoors.AddToOrder, {
                order: order,
                style2Id: style2Id,
                productTypeId: productTypeId,
                userId: userId,
                accessories: accessories
            }).then(function(data) {
                deferred.resolve(data.data.Data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.UpdateOrder = function(order, style2Id, productTypeId, userId, accessories) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.OrderAccessories.all().filter('LOrderID', '=', order.id)
                    .and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(orderAccessories) {
                        var pWait = [];
                        orderAccessories.forEach(function(orderAccessory) {
                            pWait.push(Models.Delete(Models.OrderAccessories, orderAccessory));
                        });
                        Q.allSettled(pWait).then(function() {
                            Models.Alter(Models.DoorOrders, order).then(function(order) {
                                if (accessories !== undefined && accessories !== null && accessories.length > 0) {
                                    var pWait = [];
                                    accessories.forEach(function(accessory) {
                                        pWait.push((function() {
                                            var deferred = Q.defer();
                                            var orderAccessory = {
                                                OrderID: order.OrderID,
                                                LOrderID: order.id,
                                                AccessoryID: accessory.AccessoryID,
                                                Price: accessory.Price
                                            };
                                            Models.Create(Models.OrderAccessories, orderAccessory).then(function() {
                                                deferred.resolve();
                                            });
                                            return deferred.promise;
                                        })());
                                    });
                                    Q.allSettled(pWait).then(function() {
                                        fbQuotes.GetOrders(userId, style2Id, productTypeId, order.id, null, null, null).then(function(orders) {
                                            deferred.resolve(orders[0]);
                                        });
                                    });
                                } else {
                                    fbQuotes.GetOrders(userId, style2Id, productTypeId, order.id, null, null, null).then(function(orders) {
                                        deferred.resolve(orders[0]);
                                    });
                                }
                            });
                        });
                    });
            });
        } else {
            $http.post(Config.API.Endpoints.IntDoors.UpdateOrder, {
                order: order,
                style2Id: style2Id,
                productTypeId: productTypeId,
                userId: userId,
                accessories: accessories
            }).then(function(data) {
                deferred.resolve(data.data.Data);
            }, function() {
                deferred.reject();
            });
        }
        return deferred.promise;
    };

    return service;
});
