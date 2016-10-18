mainApp.factory('fbMetaData', function(Database, fbUser, fbQuotes, fbProducts, $http, fbLoading) {

    var service = {};

    service.GetProductJSON = function(styles2ID, productTypeID, manufacturer) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.Manufacturers.all().filter('name', '=', manufacturer).and(new persistence.PropertyFilter('ProdutTypeID', '=', productTypeID)).list(function(mfs) {
                    if (mfs.length > 0) {
                        Models.JsonTrees.all().filter('Styles2ID', '=', styles2ID).and(new persistence.PropertyFilter('ManufacturerID', '=', mfs[0].ManufacturerID)).order('createdOn', false).list(function(trees) {
                            if (trees.length > 0) {
                                deferred.resolve(trees[0]);
                            } else {
                                deferred.resolve();
                            }
                        });
                    } else {
                        deferred.resolve();
                    }
                });
            });
        } else {
            $http.post(Config.API.Endpoints.MetaData.GetProductJSON, { id: styles2ID, id3: manufacturer, id2: productTypeID, id1: 0 }).then(function(data) {
                data.data.tree = data.data.ProductListJson;
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;

    };

    service.GetProductListJSON = function(doorQuote, productType, id2, userId, isWindowEdit, manufacturerId) {

        var deferred = Q.defer();

        var res = {};

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                fbUser.GetUserPermissions(userId).then(function(cpps) {
                    var cpp = _.find(cpps, function(cpp) {
                        return cpp.ProductTypeID === productType.ProductTypeID;
                    });
                    if (cpp === undefined) {
                        deferred.reject("Your account currently does not have access to " +
                            productType.ProductType +
                            ". Please contact us at 888-474-1214 to upgrade your account");
                    } else {
                        fbProducts.GetAllProductTypes().then(function(pTypes) {
                            res.ProductTypes = pTypes;
                            (function() {
                                var deferred = Q.defer();
                                if (id2 !== 0 && id2 !== null) {
                                    deferred.resolve(id2);
                                } else {
                                    Models.LuStyles2.all().filter('ProductTypeID', '=', productType.ProductTypeID).list(function(style2List) {
                                        if (style2List.length > 0) {
                                            res.Styles2 = style2List;
                                            deferred.resolve(style2List[0].Styles2ID);
                                        } else {
                                            deferred.resolve(0);
                                        }
                                    });
                                }
                                return deferred.promise;
                            })().then(function(style2Id) {
                                (function() {
                                    var deferred = Q.defer();
                                    if (style2Id !== 0) {
                                        ///  var manufacturerId = 0;
                                        fbUser.GetPermittedMfs(productType.ProductTypeID).then(function(manufacturers) {
                                            //Models.Manufacturers.all().filter('ProdutTypeID', '=', productType.ProductTypeID).list(function(manufacturers) {
                                            res.Manufacturers = manufacturers;
                                            if (manufacturers.length > 0 && (manufacturerId === undefined || manufacturerId === null)) {
                                                manufacturerId = manufacturers[0].ManufacturerID;
                                            }

                                            service.GetTreeAndFilter(style2Id, manufacturerId).then(function(jS) {
                                                res.ProductListJson = jS.jtString;
                                                res.JsonFilterString = jS.jfString;
                                                Models.LuStyles.all().filter('Styles2ID', '=', style2Id).list(function(styles) {
                                                    res.Styles = styles;
                                                    fbQuotes.GetOrders(userId, style2Id, productType.ProductTypeID, null, doorQuote.id, null, null).then(function(orders) {
                                                        res.OrderDetails = orders;
                                                        deferred.resolve();
                                                    });
                                                });
                                            });
                                        });
                                    } else {
                                        deferred.resolve();
                                    }
                                    return deferred.promise;
                                })().then(function() {
                                    service.LoadSettings(productType.ProductTypeID, userId, doorQuote.LMasterQuoteID, doorQuote.MasterQuoteID).then(function(settings) {
                                        res.ManufacturerSettings = settings;
                                        deferred.resolve(res);
                                    });
                                });
                            });
                        });
                    }
                });
            });
        } else {
            $http.post(Config.API.Endpoints.MetaData.GetProductListJSON, {
                id: doorQuote.DoorQuoteID,
                id1: productType.ProductTypeID,
                id2: id2,
                isEdit: false,
                optUserId: userId,
                isWindowEdit: isWindowEdit,
                manufacturer: manufacturerId
            }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.LoadSettings = function(productID, userId, lMasterQuoteID, masterQuoteID) {
        var deferred = Q.defer();

        var settingsRes = [];

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                fbUser.GetPermittedMfs(productID).then(function(mfs) {
                    var pWait = [];
                    mfs.forEach(function(mf) {
                        pWait.push((function() {
                            var deferred = Q.defer();

                            var setting = {};
                            setting = {
                                ManufacturerID: mf.ManufacturerID,
                                MasterQuoteID: masterQuoteID,
                                LMasterQuoteID: lMasterQuoteID,
                                ProductTypeID: productID,
                                UserID: userId,
                                OnFactor: 0.5,
                                MarkUp: 1.0
                            };
                            setting.Manufacturer = mf;
                            settingsRes.push(setting);
                            deferred.resolve();

                            return deferred.promise;
                        })());
                    });

                    Q.allSettled(pWait).then(function() {
                        service.LoadSettingsLines(settingsRes).then(function(settings) {
                            settings.forEach(function(setting) {
                                setting.DistributorImage = setting.Manufacturer.PhotoFileName;
                            });
                            deferred.resolve(settings);
                        });
                    });

                });
            });
        } else {
            $http.post(Config.API.Endpoints.MetaData.LoadSettings, { productID: productID, userID: userId, masterQuoteID: masterQuoteID }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.LoadSettingsLines = function(inSettings) {
        var waitMain = [];
        var deferred = Q.defer();
        var outSettings = [];
        inSettings.forEach(function(setting) {
            var deferred = Q.defer();
            waitMain.push(deferred.promise);

            setting.Lines = [];
            Models.UserGroups.all().filter('UserID', '=', setting.UserID).and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(userGroups) {
                Models.OnFactorGroups.all().filter('ManufacturerID', '=', setting.ManufacturerID)
                    .and(new persistence.PropertyFilter('GroupID', '=', userGroups[0].GroupID))
                    .and(new persistence.PropertyFilter('Name', '!=', null)).list(function(groups) {
                        (function() {
                            var deferred = Q.defer();
                            deferred.resolve();
                            return deferred.promise;
                        })().then(function() {

                            var pWait = [];

                            groups.forEach(function(group) {
                                pWait.push((function() {
                                    var deferred = Q.defer();
                                    Models.SettingsLines.all().filter('LMasterQuoteID', '=', setting.LMasterQuoteID)
                                        .and(new persistence.PropertyFilter('OnFactorGroupID', '=', group.OnFactorGroupID)).list(function(settingLines) {
                                            if (settingLines.length === 0) {
                                                settingLine = {
                                                    MarkUp: group.DefaultMarkup,
                                                    OnFactor: group.DefaultOnFactor,
                                                    OnFactorGroupID: group.OnFactorGroupID,
                                                    LOnFactorGroupID: group.id,
                                                    Name: group.Name,
                                                    MasterQuoteID: setting.MasterQuoteID,
                                                    LMasterQuoteID: setting.LMasterQuoteID,
                                                    ManufacturerID: setting.ManufacturerID
                                                };
                                                Models.Create(Models.SettingsLines, settingLine).then(function(settingLine) {
                                                    setting.Lines.push(settingLine);
                                                    deferred.resolve();
                                                });
                                            } else {
                                                settingLines[0].Name = group.Name;
                                                setting.Lines.push(settingLines[0]);
                                                deferred.resolve();
                                            }
                                        });
                                    return deferred.promise;
                                })());
                            });

                            Q.allSettled(pWait).then(function() {
                                deferred.resolve(inSettings);
                            });

                        });
                    });
            });
        });
        Q.allSettled(waitMain).then(function() {
            deferred.resolve(inSettings);
        });
        return deferred.promise;
    };

    service.SaveSettings = function(settingsModel) {
        var pWait = [];
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                settingsModel.forEach(function(setting) {
                    var deferred = Q.defer();
                    pWait.push(deferred.promise);
                    var qWait = [];
                    setting.Lines.forEach(function(line) {
                        var deferred = Q.defer();
                        qWait.push(deferred.promise);
                        Models.Alter(Models.SettingsLines, line).then(function(line) {
                            deferred.resolve();
                        });
                    });
                    Q.allSettled(qWait).then(function() {
                        deferred.resolve();
                    });
                });
                Q.allSettled(pWait).then(function() {
                    settingsModel.forEach(function(setting) {
                        service.UpdateOrderPrices(setting);
                    });
                    deferred.resolve();
                });
            });
        } else {
            $http.post(Config.API.Endpoints.MetaData.SaveSettings, {
                settingModel: settingsModel,
                MasterQuoteID: settingsModel[0].MasterQuoteID,
                setDefaults: null
            }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.UpdateOrderPrices = function(setting) {
        var deferred = Q.defer();

        Models.Manufacturers.findBy('ManufacturerID', setting.ManufacturerID, function(manu) {
            Models.DoorQuotes.all().filter('Deleted', '=', false)
                .and(new persistence.PropertyFilter('LMasterQuoteID', '=', setting.LMasterQuoteID))
                .and(new persistence.PropertyFilter('ProductTypeID', '=', setting.ProductTypeID)).list(function(quotes) {
                    quotes.forEach(function(quote) {
                        switch (setting.ProductTypeID) {
                            case 1:
                                Models.DoorOrders.all().filter('Deleted', '=', false)
                                    .and(new persistence.PropertyFilter('LDoorQuoteID', '=', quote.id)).list(function(orders) {
                                        orders.forEach(function(or) {
                                            Models.Doors.findBy('DoorID', or.DoorID, function(door) {
                                                if (door.Distributor === manu.name) {
                                                    or.TotalPrice = or.PriceEach * or.Quantity * setting.Lines[0].OnFactor * ((setting.Lines[0].MarkUp / 100) + 1);
                                                    Models.Alter(Models.DoorOrders, or);
                                                }
                                            });
                                        });
                                    });

                                Models.ExtOrders.all().filter('Deleted', '=', false)
                                    .and(new persistence.PropertyFilter('LDoorQuoteID', '=', quote.id)).list(function(orders) {
                                        orders.forEach(function(or) {
                                            Models.ExteriorDoor.findBy('ExteriorDoorID', or.ExtDoorID, function(door) {
                                                if (door.Distributor === manu.name) {
                                                    or.TotalPrice = or.PriceEach * or.Quantity * setting.Lines[0].OnFactor * ((setting.Lines[0].MarkUp / 100) + 1);
                                                    Models.Alter(Models.ExtOrders, or);
                                                }
                                            });
                                        });
                                    });
                                break;
                            case 2:
                                Models.MouldingOrders.all().filter('Deleted', '=', false)
                                    .and(new persistence.PropertyFilter('LDoorQuoteID', '=', quote.id)).list(function(orders) {
                                        orders.forEach(function(or) {
                                            Models.Mouldings.findBy('MouldingID', or.MouldingID, function(door) {
                                                if (door.Distributor === manu.name) {
                                                    or.TotalPrice = or.PriceEach * or.Quantity * setting.Lines[0].OnFactor * ((setting.Lines[0].MarkUp / 100) + 1);
                                                    Models.Alter(Models.MouldingOrders, or);
                                                }
                                            });
                                        });
                                    });
                                break;
                            case 3:
                                Models.SidingOrders.all().filter('Deleted', '=', false)
                                    .and(new persistence.PropertyFilter('LDoorQuoteID', '=', quote.id)).list(function(orders) {
                                        orders.forEach(function(or) {
                                            Models.Sidings.findBy('SidingID', or.SidingID, function(door) {
                                                if (door.Distributor === manu.name) {
                                                    or.TotalPrice = or.PriceEach * or.Quantity * setting.Lines[0].OnFactor * ((setting.Lines[0].MarkUp / 100) + 1);
                                                    Models.Alter(Models.SidingOrders, or);
                                                }
                                            });
                                        });
                                    });
                                break;
                            case 4:
                                Models.DeckingOrders.all().filter('Deleted', '=', false)
                                    .and(new persistence.PropertyFilter('LDoorQuoteID', '=', quote.id)).list(function(orders) {
                                        orders.forEach(function(or) {
                                            Models.Deckings.findBy('DeckingID', or.DeckingID, function(door) {
                                                if (door.Distributor === manu.name) {
                                                    or.TotalPrice = or.PriceEach * or.Quantity * setting.Lines[0].OnFactor * ((setting.Lines[0].MarkUp / 100) + 1);
                                                    Models.Alter(Models.DeckingOrders, or);
                                                }
                                            });
                                        });
                                    });
                                break;
                            case 6:
                                break;
                            case 7:
                                Models.SkylightOrders.all().filter('Deleted', '=', false)
                                    .and(new persistence.PropertyFilter('LDoorQuoteID', '=', quote.id)).list(function(orders) {
                                        orders.forEach(function(or) {
                                            Models.Skulights.findBy('SkylightID', or.SkylightID, function(door) {
                                                if (door.Distributor === manu.name) {
                                                    or.TotalPrice = or.PriceEach * or.Quantity * setting.Lines[0].OnFactor * ((setting.Lines[0].MarkUp / 100) + 1);
                                                    Models.Alter(Models.SkylightOrders, or);
                                                }
                                            });
                                        });
                                    });
                                break;
                        }
                    });
                });
        });

        deferred.resolve();

        return deferred.promise;
    };

    service.GetTreeAndFilter = function(style2Id, manufacturerId) {

        var deferred = Q.defer();

        var jtString = "{}";
        var jfString = "{}";

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                var jtq = Models.JsonTrees.all().filter('Styles2ID', '=', style2Id);

                if (manufacturerId !== 0) {
                    jtq = jtq.and(new persistence.PropertyFilter('ManufacturerID', '=', manufacturerId));
                }

                jtq = jtq.order('createdOn', false);

                jtq.list(function(jts) {

                    if (jts.length > 0) {
                        jtString = jts[0].tree;
                    }

                    var jfq = Models.JsonFilters.all().filter('Styles2ID', '=', style2Id);

                    if (manufacturerId !== 0) {
                        jfq = jfq.and(new persistence.PropertyFilter('ManufacturerID', '=', manufacturerId));
                    }

                    jfq = jfq.order('JsonFiltersID', false);

                    jfq.list(function(jfs) {

                        if (jfs.length > 0) {
                            jfString = jfs[0].filters;
                        }

                        var res = {};
                        res.jtString = jtString;
                        res.jfString = jfString;

                        deferred.resolve(res);

                    });

                });
            });
        } else {
            $http.post(Config.API.Endpoints.MetaData.GetTreeAndFilter, { id: style2Id, id1: manufacturerId }).then(function(data) {
                data.data.jfString = (data.data.JsonFilterString === "") ? "{}" : data.data.JsonFilterString;
                data.data.jtString = (data.data.ProductListJson === "") ? "{}" : data.data.ProductListJson;
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.getExtJsonFilters = function(manufacturerId) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.ExtJsonFilters.all().filter('ManufacturerID', '=', manufacturerId).order('ExtJsonFiltersID', false).list(function(filters) {
                    if (filters.length > 0) {
                        deferred.resolve(JSON.parse(filters[0].filters));
                    } else {
                        deferred.resolve({});
                    }
                });
            });
        } else {
            $http.post(Config.API.Endpoints.MetaData.GetExtJsonFilters, { manufacturerId: manufacturerId }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    return service;

});
