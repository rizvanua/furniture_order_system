mainApp.factory('fbExtDoors', function(Database, fbProducts, fbUser, fbQuotes, $http, fbLoading) {

    var service = {};

    service.PriceDoor = function(door, params, sill) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.ExteriorDoor.all().filter('Distributor', '=', door.distributor).and(new persistence.PropertyFilter('collection', '=', door.collection))
                    .and(new persistence.PropertyFilter('width', '=', params.width)).and(new persistence.PropertyFilter('height', '=', params.height))
                    .and(new persistence.PropertyFilter('name', '=', door.name)).and(new persistence.PropertyFilter('type', '=', params.type)).list(function(newDoors) {
                        Models.ExteriorJamb.all().filter('height', '=', params.height).and(new persistence.PropertyFilter('jambType', '=', params.jambType))
                            .and(new persistence.PropertyFilter('type', '=', params.type)).and(new persistence.PropertyFilter('width', '=', params.jambWidth)).list(function(jambs) {
                                Models.ExteriorSill.all().filter('name', '=', params.sillType).and(new persistence.PropertyFilter('type', '=', params.type))
                                    .and(new persistence.OrFilter(new persistence.PropertyFilter('width', '=', params.jambWidth),
                                        new persistence.OrFilter(new persistence.PropertyFilter('width', '=', null), new persistence.PropertyFilter('width', '=', '')))).list(function(sills) {
                                        var extSill = sills[0];
                                        deferred.resolve({
                                            door: newDoors.length > 0 ? newDoors[newDoors.length - 1] : null,
                                            jamb: jambs.length > 0 ? jambs[jambs.length - 1] : null,
                                            accessory: {},
                                            sill: extSill
                                        });
                                    });
                            });
                    });
            });
        } else {
            $http.post(Config.API.Endpoints.ExtDoors.PriceDoor, { door: door, parameters: params }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.GetJambFilters = function(fireRating, specialGroup, manufacturerId) {
        fireRating = fireRating !== undefined ? fireRating : "";
        specialGroup = specialGroup !== undefined ? specialGroup : "";

        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                var qJamb = Models.ExtJambFilters.all().filter('ManufacturerID', '=', manufacturerId).and(new persistence.PropertyFilter('fireRating', '=', fireRating));
                var qGroup = qJamb.and(new persistence.PropertyFilter('specialGroup', '=', specialGroup));

                qGroup.order('ExtJambFiltersID', false).list(function(jambGroup) {
                    if (jambGroup.length > 0) {
                        deferred.resolve(JSON.parse(jambGroup[0].filters));
                    } else {
                        qJamb.order('ExtJambFiltersID', false).list(function(jambs) {
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
            $http.post(Config.API.Endpoints.ExtDoors.GetJambFilters, {
                manufacturerId: manufacturerId,
                fireRating: fireRating,
                specialGroup: specialGroup
            }).then(function(data) {
                deferred.resolve(JSON.parse(data.data));
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.GetAvailableSills = function(manufacturerId, swing, width, fireRating, specialGroup) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.Manufacturers.findBy('ManufacturerID', manufacturerId, function(mf) {
                    if (mf !== null) {
                        Models.ExteriorSill.all().filter('distributor', '=', mf.name)
                            .and(new persistence.OrFilter(new persistence.PropertyFilter('swing', '=', swing), new persistence.PropertyFilter('swing', '=', '')))
                            .and(new persistence.OrFilter(new persistence.PropertyFilter('width', '=', width), new persistence.PropertyFilter('width', '=', '')))
                            .order('ExteriorSillID', true).list(function(sills) {
                                deferred.resolve(_.uniq(_.pluck(sills, 'name')));
                            });
                    } else {
                        deferred.resolve('No manufacturer found.');
                    }
                });
            });
        } else {
            $http.post(Config.API.Endpoints.ExtDoors.GetAvailableSills, {
                manufacturerId: manufacturerId,
                swing: swing,
                width: width,
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

    service.GetAllSidelites = function(manufacturerId, height, species, manufacturer) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.Manufacturers.findBy('ManufacturerID', manufacturerId, function(manu) {
                    Models.Sidelite.all().filter('Distributor', '=', manu.name).and(new persistence.PropertyFilter('height', '=', height))
                        .and(new persistence.PropertyFilter('manufacturer', '=', manufacturer)).and(new persistence.PropertyFilter('species', '=', species)).list(function(sls) {
                            Models.SideliteFilters.all().filter('ManufacturerID', '=', manufacturerId).order('SideliteFiltersID', false).list(function(slsf) {
                                deferred.resolve({
                                    sidelites: sls,
                                    filters: slsf[0]
                                });
                            });
                        });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.ExtDoors.GetAllSidelites, {
                manufacturerId: manufacturerId,
                height: height,
                species: species,
                manufacturer: manufacturer
            }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.GetSidelites = function(doorId) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.ExteriorDoor.findBy('ExteriorDoorID', doorId, function(door) {
                    if (door !== null) {
                        Models.Sidelite.all().filter('sideliteKey', '=', door.sideliteKey).list(function(sls) {
                            deferred.resolve(sls);
                        });
                    } else {
                        deferred.reject('Door not found');
                    }
                });
            });
        } else {
            $http.post(Config.API.Endpoints.ExtDoors.GetSidelites, { doorId: doorId }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.GetHingeNames = function(distributor, doorType, fireRating, specialGroup) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                var hinges = Models.ExtAccessories.all().filter('AccessoryType', '=', 'Hinge')
                    .and(new persistence.PropertyFilter('distributor', '=', distributor))
                    .and(new persistence.PropertyFilter('type', '=', doorType));

                if (fireRating !== undefined && fireRating !== null && fireRating !== '') {
                    hinges = hinges.and(new persistence.PropertyFilter('fireRating', '=', fireRating));
                } else {
                    hinges = hinges.and(new persistence.OrFilter(new persistence.PropertyFilter('fireRating', '=', ''), new persistence.PropertyFilter('fireRating', '=', null)));
                }

                if (specialGroup !== null && specialGroup !== undefined && specialGroup !== '') {
                    hinges = hinges.and(new persistence.PropertyFilter('specialGroup', '=', specialGroup));
                } else {
                    hinges = hinges.and(new persistence.OrFilter(new persistence.PropertyFilter('specialGroup', '=', ''), new persistence.PropertyFilter('specialGroup', '=', null)));
                }

                hinges.order('SortOrder', true).list(function(accs) {
                    deferred.resolve(_.uniq(_.pluck(accs, 'AccessoryName')));
                });
            });
        } else {
			comsole.log("line 199"+''+Config.API.Endpoints.ExtDoors.GetHingeNames);
            $http.post(Config.API.Endpoints.ExtDoors.GetHingeNames, {
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

    service.GetHingeColors = function(distributor, hingeName, doorType, fireRating, specialGroup, height) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                var hinges = Models.ExtAccessories.all().filter('AccessoryType', '=', 'Hinge')
                    .and(new persistence.PropertyFilter('distributor', '=', distributor))
                    .and(new persistence.PropertyFilter('type', '=', doorType))
                    .and(new persistence.PropertyFilter('AccessoryName', '=', hingeName))
                    .and(new persistence.OrFilter(new persistence.PropertyFilter('height', '=', height), new persistence.PropertyFilter('height', '=', "")));
                if (fireRating !== undefined && fireRating !== null && fireRating !== '') {
                    hinges = hinges.and(new persistence.PropertyFilter('fireRating', '=', fireRating));
                } else {
                    hinges = hinges.and(new persistence.OrFilter(new persistence.PropertyFilter('fireRating', '=', ''), new persistence.PropertyFilter('fireRating', '=', null)));
                }

                if (specialGroup !== null && specialGroup !== undefined && specialGroup !== '') {
                    hinges = hinges.and(new persistence.PropertyFilter('specialGroup', '=', specialGroup));
                } else {
                    hinges = hinges.and(new persistence.OrFilter(new persistence.PropertyFilter('specialGroup', '=', ''), new persistence.PropertyFilter('specialGroup', '=', null)));
                }
                hinges.list(function(accs) {
                    deferred.resolve(accs);
                });
            });
        } else {
            $http.post(Config.API.Endpoints.ExtDoors.GetHingeColors, {
                distributor: distributor,
                hingeName: hingeName,
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

    service.GetAccessories = function(params) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                if ((params.type === undefined || params.type === null) && params.accessoryType === 'Jamb') {
                    params.type = 'Single';
                }

                var query = Models.ExtAccessories.all().filter('AccessoryType', '=', params.accessoryType)
                    .and(new persistence.PropertyFilter('distributor', '=', params.distributor));

                if (params.type !== null) {
                    query = query.and(new persistence.OrFilter(new persistence.PropertyFilter('type', '=', ''), new persistence.PropertyFilter('type', '=', params.type)));
                }

                if (params.height !== null) {
                    query = query.and(new persistence.OrFilter(new persistence.PropertyFilter('height', '=', ''), new persistence.PropertyFilter('height', '=', params.height)));
                }

                if (params.jambType !== null) {
                    query = query.and(new persistence.OrFilter(new persistence.PropertyFilter('JambType', '=', ''), new persistence.PropertyFilter('JambType', '=', params.jambType)));
                }

                if (params.fireRating !== null && params.fireRating !== undefined && params.fireRating !== '') {
                    query = query.and(new persistence.PropertyFilter('fireRating', '=', params.fireRating));
                } else {
                    query = query.and(new persistence.OrFilter(new persistence.PropertyFilter('fireRating', '=', ''), new persistence.PropertyFilter('fireRating', '=', null)));
                }

                if (params.specialGroup !== null && params.specialGroup !== undefined && params.specialGroup !== '') {
                    query = query.and(new persistence.PropertyFilter('specialGroup', '=', params.specialGroup));
                } else {
                    query = query.and(new persistence.OrFilter(new persistence.PropertyFilter('specialGroup', '=', ''), new persistence.PropertyFilter('specialGroup', '=', null)));
                }

                query.order('AccessoryName', true).list(function(accs) {
                    if (params.accessoryName !== null) {
                        accs = _.filter(accs, function(acc) {
                            return acc.AccessoryName === '' || acc.AccessoryName.indexOf(params.accessoryName) > -1;
                        });
                        deferred.resolve(_.pluck(accs, '_data'));
                    }
                });
            });
        } else {
            $http.post(Config.API.Endpoints.ExtDoors.GetAccessories, { exteriorOrderAccessorySearch: params }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.GetSill = function(width, name, type) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.ExteriorSill.all().filter('width', '=', width).and(new persistence.PropertyFilter('name', '=', name))
                    .and(new persistence.PropertyFilter('type', '=', type)).list(function(sills) {
                        if (sills.length > 0) {
                            deferred.resolve(sills[0]);
                        } else {
                            deferred.reject('No Sill Found');
                        }
                    });
            });
        } else {
            $http.post(Config.API.Endpoints.ExtDoors.GetSill, { width: width, name: name, type: type }).then(function(data) {
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
                Models.Create(Models.ExtOrders, order).then(function(order) {
                    if (accessories !== undefined && accessories !== null && accessories.length > 0) {
                        var pWait = [];
                        accessories.forEach(function(acc) {
                            pWait.push((function() {
                                var deferred = Q.defer();
                                oAcc = {
                                    LExtOrderID: order.id,
                                    ExtAccessoryID: acc.ExtAccessoryID,
                                    Price: acc.Price
                                };
                                Models.Create(Models.ExtOrderAccessories, oAcc).then(function() {
                                    deferred.resolve();
                                });
                                return deferred.promise;
                            })());
                        });
                        Q.allSettled(pWait).then(function() {
                            fbQuotes.GetExteriorOrderDetails(userId, style2Id, productTypeId, order.id, null, null, null).then(function(orders) {
                                deferred.resolve(orders[0]);
                            });
                        });
                    } else {
                        fbQuotes.GetExteriorOrderDetails(userId, style2Id, productTypeId, order.id, null, null, null).then(function(orders) {
                            deferred.resolve(orders[0]);
                        });
                    }
                });
            });
        } else {
            $http.post(Config.API.Endpoints.ExtDoors.AddToOrder, {
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
                Models.ExtOrderAccessories.all().filter('LExtOrderID', '=', order.id)
                    .and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(orderAccessories) {
                        var pWait = [];
                        orderAccessories.forEach(function(orderAccessory) {
                            pWait.push(Models.Delete(Models.ExtOrderAccessories, orderAccessory));
                        });
                        Q.allSettled(pWait).then(function() {
                            Models.Alter(Models.ExtOrders, order).then(function(order) {
                                if (accessories !== undefined && accessories !== null && accessories.length > 0) {
                                    var pWait = [];
                                    accessories.forEach(function(accessory) {
                                        pWait.push((function() {
                                            var deferred = Q.defer();
                                            var orderAccessory = {
                                                ExtOrderID: order.ExtOrderID,
                                                LExtOrderID: order.id,
                                                ExtAccessoryID: accessory.ExtAccessoryID,
                                                Price: accessory.Price
                                            };
                                            Models.Create(Models.ExtOrderAccessories, orderAccessory).then(function() {
                                                deferred.resolve();
                                            });
                                            return deferred.promise;
                                        })());
                                    });
                                    Q.allSettled(pWait).then(function() {
                                        fbQuotes.GetExteriorOrderDetails(userId, style2Id, productTypeId, order.id, null, null, null).then(function(orders) {
                                            deferred.resolve(orders[0]);
                                        });
                                    });
                                } else {
                                    fbQuotes.GetExteriorOrderDetails(userId, style2Id, productTypeId, order.id, null, null, null).then(function(orders) {
                                        deferred.resolve(orders[0]);
                                    });
                                }
                            });
                        });
                    });
            });
        } else {
            $http.post(Config.API.Endpoints.ExtDoors.UpdateOrder, {
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
