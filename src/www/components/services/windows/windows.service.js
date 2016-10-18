mainApp.factory('fbWindows', function(Database, fbUser, $http, fbLoading) {

    var service = {};

    service.CurrentMasterQuote = null;

    service.SetMasterQuote = function(mq) {
        service.CurrentMasterQuote = mq;
    };

    service.GetQuoteIdFromMasterQuoteId = function(masterId, rMasterId) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.MasterQuote.findBy('id', masterId, function(mq) {
                    if (mq !== null) {
                        var webquote = {
                            MasterQuoteID: mq.MasterQuoteID,
                            LMasterQuoteID: mq.id,
                            createdOn: '/Date(' + (new Date().getTime()) + ')/',
                            customerID: mq.CustomerID,
                            LcustomerID: mq.LCustomerID,
                            DoorQuoteID: null,
                            LDoorQuoteID: null
                        };
                        Models.Create(Models.WebQuotes, webquote).then(function(webquote) {
                            deferred.resolve(webquote);
                        });
                    } else {
                        deferred.reject("This Master Quote Does Not Exist!");
                    }
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Windows.GetQuoteIdFromMasterQuoteId, { masterId: rMasterId }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.GetQuote = function(quoteID) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.WebQuotes.findBy('id', quoteID, function(quote) {
                    if (quote === null || quote.jsonQuote === null || quote.jsonQuote === '') {
                        deferred.resolve({
                            isNew: true,
                            customerId: quote.customerID,
                            LcustomerId: quote.LcustomerID
                        });
                    } else {
                        var ret = function() {
                            var json = JSON.parse(quote.jsonQuote);
                            json.id = quoteID;
                            deferred.resolve(json);
                        };
                        if (quote.jsonQuote === "" || quote.jsonQuote === null) {
                            quote.jsonQuote = "{}";
                            Models.Alter(Models.WebQuotes, quote).then(function() {
                                ret();
                            });
                        } else {
                            ret();
                        }
                    }
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Windows.GetQuote, {
                quoteID: (quoteID !== "undefined" &&
                    quoteID !== undefined && quoteID !== null) ? quoteID : 0
            }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.GetMfConfig = function(masterQuoteID, rMasterQuoteID) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                fbUser.CurrUser().then(function(user) {
                    Models.WindowMfConfig.findBy('MfConfigID', 1, function(cfg) {
                        cfg = JSON.parse(cfg.JSON);
                        if (masterQuoteID !== undefined && masterQuoteID !== null && masterQuoteID !== 0) {
                            fbUser.GetPermittedMfs(WindowProductTypeId).then(function(mfs) {
                                mfs.forEach(function(mf) {
                                    Models.SettingsLines.all().filter('LMasterQuoteID', '=', masterQuoteID).and(new persistence.PropertyFilter('ManufacturerID', '=', mf.ManufacturerID)).list(function(settingLines) {
                                        var config = _.find(cfg.configs, function(obj) {
                                            return obj.manufacturer === mf.name;
                                        });
                                        var pWait = [];
                                        settingLines.forEach(function(settingLine) {
                                            pWait.push((function() {
                                                var deferred = Q.defer();
                                                Models.OnFactorGroups.findBy('OnFactorGroupID', settingLine.OnFactorGroupID, function(ofg) {
                                                    if (ofg !== null && _.has(config.lines, ofg.Name)) {
                                                        config.lines[ofg.Name].onFactor = Number(settingLine.OnFactor);
                                                        config.lines[ofg.Name].markup = Number(settingLine.MarkUp);
                                                    }
                                                    deferred.resolve();
                                                });
                                                return deferred.promise;
                                            })());
                                        });
                                        Q.allSettled(pWait).then(function() {
                                            deferred.resolve(cfg);
                                        });
                                    });
                                });
                            });
                        }else {
                            deferred.resolve(cfg);
                        }
                    });
                });
            });
        } else {
            fbUser.CurrUser().then(function(user) {
                $http.post(Config.API.Endpoints.Windows.GetMfConfig, { userID: user.UserID, masterQuoteId: rMasterQuoteID, key: 0 }).then(function(data) {
                    deferred.resolve(data.data);
                }, function() {
                    deferred.reject();
                });
            });
        }
        return deferred.promise;
    };

    
    service.GetDoorDims = function(mf, line, type, subType) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                type = type.replace('_', ' ');
                subType = subType.replace('_', ' ');

                Models.WindowDoorDims.findBy('DoorDimID', 1, function(obj) {
                    var dimms = JSON.parse(obj.JSON);
                    var doorDims = [];
                    var data = dimms[mf]['Sliding Doors'];
                    angular.forEach(data, function(value, key) {
                        if (value[subType] !== undefined) {
                            var dimStrings = value[subType];
                            var splitDims = [];
                            dimStrings.forEach(function(item) {
                                var split = item.split(' x ');
                                if (split.length > 1) {
                                    splitDims.push([split[0], split[1]]);
                                }
                            });
                            var newLine = {
                                name: key,
                                dimensions: splitDims
                            };

                            doorDims.push(newLine);
                        }
                    });
                    deferred.resolve(doorDims);
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Windows.GetDoorDims, { manufacturer: mf, doorType: subType }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.ApplyConfigToWindow = function(window, mf, orderLine) {
        var deferred = Q.defer();

        var addPrice = function(opt, name, price) {

            if (name !== "") {
                if (opt.prices === null || opt.prices.length === 0) {
                    opt.prices = {};
                    opt.prices[name] = price;
                    if (_.has(opt.prices, name)) {
                        opt.priceKey = name;
                        opt.cost = opt.prices[name];
                    }
                } else {
                    if (!_.has(opt.prices, name)) {
                        opt.prices[name] = price;
                    }
                }
            }

        };

        var setPriceUnit = function(opt, priceKey, unit) {
            if (!_.has(opt.units, priceKey)) {
                if (opt.units === undefined || opt.units === null) {
                    opt.units = {};
                }
                opt.units[priceKey] = unit;
            }
        };

        service.GetMfConfig().then(function(config) {

            var mfConfig = _.find(config.configs, function(obj) {
                return obj.manufacturer === mf;
            });

            var pConfig = null;

            if (_.has(mfConfig, orderLine)) {
                pConfig = mfConfig.lines[orderLine];
            }

            if (pConfig !== null) {
                var keys = _.keys(pConfig.optionAdds);

                keys.forEach(function(key) {

                    var name = key;
                    var columnInfo = pConfig.optionAdds[key];

                    var opt = _.find(window.options, function(obj) {
                        return obj.name === name;
                    });

                    if (opt !== undefined && opt !== null) {
                        columnInfo.forEach(function(values) {
                            if (values[1].indexOf('N') !== -1 || values[1].indexOf('n') !== -1 || values[1] === "" || values[1] === "N/A") {
                                addPrice(opt, values[0], 0);
                            } else {
                                addPrice(opt, values[0], Number(values[1]));
                            }
                        });
                    } else {
                        opt = {};
                        opt.name = name;
                        columnInfo.forEach(function(values) {
                            if (values[1].indexOf('N') !== -1 || values[1].indexOf('n') !== -1 || values[1] === "" || values[1] === "N/A") {
                                addPrice(opt, values[0], 0);
                            } else {
                                addPrice(opt, values[0], Number(values[1]));
                            }
                        });
                        opt.selected = false;
                        if (window.options === undefined || window.options === null) {
                            window.options = [];
                        }
                        window.options.push(opt);
                    }


                });

                keys = _.keys(pConfig.columnUnits);

                keys.forEach(function(key) {
                    var name = key.split('_')[0];
                    var unit = pConfig.columnUnits[key];

                    var opt = _.find(window.options, function(obj) {
                        return obj.name === name;
                    });

                    if (opt !== null) {
                        setPriceUnit(opt, key, unit);
                    } else {
                        opt = {};
                        opt.name = name;
                        setPriceUnit(opt, key, unit);
                        opt.selected = false;
                        if (window.options === undefined || window.options === null) {
                            window.options = [];
                        }
                        window.options.push(opt);
                    }

                });
            }

            deferred.resolve(window);

        });

        return deferred.promise;
    };

    service.GetWindow = function(width, height, mf, line, type, subType, lineID, windowID, orderLine) {
        var deferred = Q.defer();

        var res = {};

        height = Number(height);
        width = Number(width);

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                type = type.replace('_', ' ');
                subType = subType.replace('_', ' ');

                Models.WindowCoreData.findBy('Manufacturer', mf, function(objData) {
                    var data = JSON.parse(objData.JSON);

                    if (subType.indexOf("Trans") !== -1 && subType !== "Transom") {
                        subType = subType.replace(" Trans", "");
                    }

                    if (type === "Geo" || type === "Radius") {
                        type = "Picture";
                    }

                    if (orderLine === undefined || orderLine === null) {
                        orderLine = line;
                    }

                    var lineData = data[line];

                    /*var window = _.find(lineData, function(window) {

                        return Number(window.pricingHeight) === Number(height) &&
                            Number(window.pricingWidth) === Number(width) && window.type === type &&
                            window.subtype === subType;

                    });*/

                    var window = {};

                    var foundHeight = false;
                    var foundWidth = false;
                    var lType = type.toLowerCase();
                    var lSubType = subType.toLowerCase();
                    for (var i = 0; i < lineData.length; i++) {
                        window = lineData[i];
                        if (window.type.toLowerCase() === lType && window.subtype.toLowerCase() === lSubType) {
                            if (Number(window.pricingHeight) >= height || Number(window.pricingWidth) >= width) {
                                if (Number(window.pricingHeight) >= height) {
                                    foundHeight = true;
                                }
                                if (Number(window.pricingWidth) >= width) {
                                    foundWidth = true;
                                }
                                if (foundWidth && foundHeight) {
                                    break;
                                }
                            }
                        }
                    }
                    if (!foundHeight || !foundWidth) {
                        window.type = type;
                        window.subtype = subType;
                        window.basePriceUSD = 0;
                        window.realWidth = width;
                        window.readHeight = height;
                        window.isError = true;
                    }
                    Models.EnergyValues.all().filter('type', '=', subType)
                        .and(new persistence.PropertyFilter('series', '=', line))
                        .and(new persistence.PropertyFilter('manufacturer', '=', mf)).list(function(evs) {
                            window.energyValues = evs;

                            if (lineID !== undefined && lineID !== null) {
                                window.windowLineItemId = Number(lineID);
                            }
                            if (windowID !== undefined && windowID !== null) {
                                window.id = Number(windowID);
                            }
                            if (type === "Patio Door" && subType !== "Transom") {
                                window.isCustomDoor = true;
                            }

                            window.realWidth = width;
                            window.realHeight = height;

                            service.ApplyConfigToWindow(window, mf, orderLine).then(function(window) {
                                deferred.resolve({
                                    window: window,
                                    orderProdLine: orderLine
                                });
                            });

                        });

                });
            });
        } else {
            $http.post(Config.API.Endpoints.Windows.GetWindow, {
                width: width,
                height: height,
                mf: mf,
                line: line,
                type: type,
                subType: subType,
                lineID: lineID,
                windowID: windowID,
                orderLine: orderLine
            }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;

    };

    service.GetClosestWindow = function(width, height, mf, line, type, subType, lineID, windowID) {
        var deferred = Q.defer();

        var res = {};

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                type = type.replace('_', ' ');
                subType = subType.replace('_', ' ');

                height = Number(height);
                width = Number(width);

                Models.WindowCoreData.findBy('Manufacturer', mf, function(objData) {
                    var data = JSON.parse(objData.JSON);

                    if (subType.indexOf("Trans") !== -1 && subType !== "Transom") {
                        subType = subType.replace(" Trans", "");
                    }

                    var lineData = data[line];

                    var window = {};

                    var foundHeight = false;
                    var foundWidth = false;

                    for (var i = 0; i < lineData.length; i++) {
                        window = lineData[i];
                        if (window.type === type && window.subtype === subType) {
                            if (Number(window.pricingHeight) >= height || Number(window.pricingWidth) >= width) {
                                if (Number(window.pricingHeight) >= height) {
                                    foundHeight = true;
                                }
                                if (Number(window.pricingWidth) >= width) {
                                    foundWidth = true;
                                }
                                if (foundWidth && foundHeight) {
                                    break;
                                }
                            }
                        }
                    }

                    Models.EnergyValues.all().filter('type', '=', subType)
                        .and(new persistence.PropertyFilter('series', '=', line))
                        .and(new persistence.PropertyFilter('manufacturer', '=', mf)).list(function(evs) {
                            window.energyValues = evs;

                            if (lineID !== undefined && lineID !== null) {
                                window.windowLineItemId = Number(lineID);
                            }
                            if (windowID !== undefined && windowID !== null) {
                                window.id = Number(windowID);
                            }

                            window.realWidth = width;
                            window.realHeight = height;

                            deferred.resolve(window);

                        });

                });
            });
        } else {
            $http.post(Config.API.Endpoints.Windows.GetClosestWindow, {
                width: width,
                height: height,
                mf: mf,
                line: line,
                type: type,
                subType: subType,
                lineID: lineID,
                windowID: windowID
            }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;

    };

    service.GetClosestDoor = function(width, height, mf, line, type, subType, lineID, windowID, orderLine) {
        var deferred = Q.defer();

        var res = {};

        height = Number(height);
        width = Number(width);

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {

                type = type.replace('_', ' ');
                subType = subType.replace('_', ' ');



                Models.WindowCoreData.findBy('Manufacturer', mf, function(objData) {
                    var data = JSON.parse(objData.JSON);

                    if (subType.indexOf("Trans") !== -1 && subType !== "Transom") {
                        subType = subType.replace(" Trans", "");
                    }

                    if (subType.indexOf("2 Panel") !== -1) {
                        subType = "Patio Door";
                    }

                    var lineData = data[line];

                    var window = {};

                    var foundHeight = false;
                    var foundWidth = false;

                    for (var i = 0; i < lineData.length; i++) {
                        window = lineData[i];
                        if (window.type === type && window.subtype === subType) {
                            if (Number(window.pricingHeight) >= height || Number(window.pricingWidth) >= width) {
                                if (Number(window.pricingHeight) >= height) {
                                    foundHeight = true;
                                }
                                if (Number(window.pricingWidth) >= width) {
                                    foundWidth = true;
                                }
                                if (foundWidth && foundHeight) {
                                    break;
                                }
                            }
                        }
                    }

                    Models.EnergyValues.all().filter('type', '=', subType)
                        .and(new persistence.PropertyFilter('series', '=', line))
                        .and(new persistence.PropertyFilter('manufacturer', '=', mf)).list(function(evs) {
                            window.energyValues = evs;

                            if (lineID !== undefined && lineID !== null) {
                                window.windowLineItemId = Number(lineID);
                            }
                            if (windowID !== undefined && windowID !== null) {
                                window.id = Number(windowID);
                            }

                            window.realWidth = width;
                            window.realHeight = height;

                            service.ApplyConfigToWindow(window, mf, orderLine).then(function(window) {
                                deferred.resolve({
                                    window: window,
                                    orderProdLine: orderLine
                                });
                            });

                        });

                });
            });
        } else {
            $http.post(Config.API.Endpoints.Windows.GetClosestDoor, {
                width: width,
                height: height,
                mf: mf,
                line: line,
                type: type,
                subType: subType,
                lineID: lineID,
                windowID: windowID,
                orderLine: orderLine
            }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;

    };

    service.EditQuote = function(quoteId, job, project, rQuoteID) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.WebQuotes.findBy('id', quoteId, function(quote) {
                    quote.project = project;
                    quote.job = job;
                    Models.Alter(Models.WebQuotes, quote).then(function(quote) {
                        deferred.resolve({ success: "Success" });
                    });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Windows.EditQuote, { quoteId: rQuoteID, job: job, project: project }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.SaveQuote = function(quoteID, jsonQuote, userID, localQuoteID, rQuoteID) {
        var deferred = Q.defer();

        var job = service.CurrentMasterQuote.JobName;
        var project = service.CurrentMasterQuote.ProjectName;
        var customerID = service.CurrentMasterQuote.CustomerID;
        var LcustomerID = service.CurrentMasterQuote.LCustomerID;
        var masterId = service.CurrentMasterQuote.MasterQuoteID;
        var LmasterId = service.CurrentMasterQuote.id;

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                if (quoteID !== 0 && quoteID !== "" && quoteID !== "0" && jsonQuote !== "") {

                    jsonQuote = JSON.parse(jsonQuote);

                    if (jsonQuote.windowOrderList !== undefined && jsonQuote.windowOrderList !== null) {
                        _.each(jsonQuote.windowOrderList, function(wItem) {
                            if (wItem.lineItem !== undefined && wItem.lineItem !== null) {
                                _.each(wItem.lineItem, function(lineItem) {
                                    if (lineItem.windowList !== undefined && lineItem.windowList !== null) {
                                        _.each(lineItem.windowList, function(listItem) {
                                            if (listItem.UUID === undefined || listItem.UUID === null || listItem.UUID === "") {
                                                listItem.UUID = uuid.v4();
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }

                    Models.WebQuotes.findBy('id', quoteID, function(quote) {
                        if (quote !== null) {
                            jsonQuote.id = quote.WebQuoteID;
                            if (jsonQuote.date === null) {
                                jsonQuote.date = new Date();
                            }
                            quote.jsonQuote = JSON.stringify(jsonQuote);
                            quote.userID = userID;
                            quote.project = project;
                            quote.job = job;
                            quote.localQuoteID = (localQuoteID === undefined || localQuoteID === null || localQuoteID === "" || localQuoteID === "undefined" || localQuoteID === "null") ? 0 : localQuoteID;
                            quote.customerID = customerID;
                            quote.LcustomerID = LcustomerID;
                            quote.fromDroid = false;
                            quote.DoorQuoteID = null;
                            if (masterId !== null || LmasterId !== null) {
                                quote.MasterQuoteID = Number(masterId);
                                quote.LMasterQuoteID = LmasterId;
                            }
                            Models.Alter(Models.WebQuotes, quote).then(function(quote) {
                                deferred.resolve(quote.id);
                            });
                        } else {
                            jsonQuote.id = 0;
                            jsonQuote.date = new Date();
                            quote = {
                                createdOn: new Date(),
                                jsonQuote: JSON.stringify(jsonQuote),
                                localQuoteID: (localQuoteID === undefined || localQuoteID === null || localQuoteID === "" || localQuoteID === "undefined" || localQuoteID === "null") ? 0 : localQuoteID,
                                userID: userID,
                                project: project,
                                job: job,
                                customerID: customerID,
                                LcustomerID: LcustomerID,
                                fromDroid: false,
                                DoorQuoteID: null
                            };
                            if (masterId !== null || LmasterId !== null) {
                                quote.MasterQuoteID = Number(masterId);
                                quote.LMasterQuoteID = LmasterId;
                            }
                            quote.DoorQuoteID = null;
                            Models.Create(Models.WebQuotes, quote).then(function(quote) {
                                quote.localQuoteID = quote.id;
                                Models.Alter(Models.WebQuotes, quote).then(function(quote) {
                                    deferred.resolve(quote.id);
                                });
                            });
                        }
                    });
                } else {
                    deferred.resolve();
                }
            });
        } else {
            rQuoteID = (rQuoteID !== "undefined" && rQuoteID !== undefined && rQuoteID !== null) ? rQuoteID : 0;
            $http.post(Config.API.Endpoints.Windows.SaveQuote, {
                quoteID: rQuoteID,
                jsonQuote: jsonQuote,
                userID: userID,
                localQuoteID: (localQuoteID === undefined || localQuoteID === null || localQuoteID === "" || localQuoteID === "undefined" || localQuoteID === "null") ? 0 : localQuoteID,
                job: job,
                project: project,
                customerID: customerID,
                fromDroid: false,
                masterId: masterId
            }).then(function(data) {
                console.log(data.data);
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.GetFrameTypes = function() {
        var deferred = Q.defer();

        Database.ready().then(function() {
            service.GetMfConfig().then(function(cfg) {
                deferred.resolve(cfg.frameTypes);
            });
        });

        return deferred.promise;
    };

    service.GetGridTypes = function() {
        var deferred = Q.defer();

        deferred.resolve({
            grid_1: "5/8 Flat",
            grid_2: "1' Sculptured",
            grid_3: "SDL"
        });

        return deferred.promise;
    };

    service.GetObscureTypes = function() {
        var deferred = Q.defer();

        Database.ready().then(function() {
            Models.WindowMfConfig.findBy('MfConfigID', 2, function(cfg) {
                deferred.resolve(cfg);
            });
        });

        return deferred.promise;
    };

    return service;

});
