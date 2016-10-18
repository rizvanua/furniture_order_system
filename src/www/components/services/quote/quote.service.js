mainApp.factory('fbQuotes', function(Database, fbProducts, fbUser, fbWindows, $window, $http, fbLoading) {

    var service = {};

    service.GetAvailableQuotes = function(doorQuoteID, style2ID, rDoorQuoteID) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                if (style2ID === InteriorDoorStyles2Id || style2ID === ExteriorDoorStyles2Id) {
                    Models.ExtOrders.all().filter('LDoorQuoteID', '=', doorQuoteID).and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(extDQS) {
                        Models.DoorOrders.all().filter('LDoorQuoteID', '=', doorQuoteID).and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(intDQS) {
                            extDQS = _.pluck(extDQS, 'OrderType');
                            intDQS = _.pluck(intDQS, 'OrderType');
                            deferred.resolve(_.union(extDQS, intDQS));
                        });
                    });
                } else if (style2ID === MouldingStyles2Id) {
                    Models.MouldingOrders.all().filter('LDoorQuoteID', '=', doorQuoteID).and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(orders) {
                        deferred.resolve(_.uniq(_.pluck(orders, 'OrderType')));
                    });
                } else if (style2ID === SkylightStyles2Id) {
                    Models.SkylightOrders.all().filter('LDoorQuoteID', '=', doorQuoteID).and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(orders) {
                        deferred.resolve(_.uniq(_.pluck(orders, 'OrderType')));
                    });
                } else if (style2ID === DeckingStyles2Id) {
                    Models.DeckingOrders.all().filter('LDoorQuoteID', '=', doorQuoteID).and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(orders) {
                        deferred.resolve(_.uniq(_.pluck(orders, 'OrderType')));
                    });
                } else if (style2ID === SidingStyles2Id) {
                    Models.SidingOrders.all().filter('LDoorQuoteID', '=', doorQuoteID).and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(orders) {
                        deferred.resolve(_.uniq(_.pluck(orders, 'OrderType')));
                    });
                } else if (style2ID === RawGlassStyles2Id) {
                    Models.RawGlassOrders.all().filter('LDoorQuoteID', '=', doorQuoteID).and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(orders) {
                        deferred.resolve(_.uniq(_.pluck(orders, 'OrderType')));
                    });
                } else {
                    deferred.resolve([]);
                }
            });
        } else {
            $http.post(Config.API.Endpoints.Quotes.GetAvailableQuotes, { DoorQuoteID: Number(rDoorQuoteID), Style2ID: Number(style2ID) }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.GetQuote = function(id, id1, inMasterQuote) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                fbUser.CurrUser().then(function(user) {
                    fbUser.GetUserPermissions(user.UserID).then(function(cpps) {
                        cpps = _.filter(cpps, function(cpp) {
                            return cpp.ProductTypeID === id;
                        });
                        if (cpps.length === 0) {
                            deferred.reject("Your account currently does not have access to this product type. Please contact us at 888-474-1214 to upgrade your account");
                        } else {
                            Models.MasterQuote.findBy("id", inMasterQuote.id, function(masterQuote) {
                                var suffix = '';
                                if (id === DeckingProductTypeId) {
                                    suffix = "DK";
                                } else if (id === SkylightProductTypeId) {
                                    suffix = "SK";
                                } else {
                                    suffix = id1.substring(0, 1).toUpperCase();
                                }
                                var temp = {};
                                temp.JobName = masterQuote.JobName + suffix;
                                temp.ProjectName = masterQuote.ProjectName + suffix;
                                temp.MasterQuoteID = masterQuote.MasterQuoteID;
                                temp.LMasterQuoteID = masterQuote.id;
                                temp.CustomerID = masterQuote.CustomerID;
                                temp.LCustomerID = masterQuote.LCustomerID;
                                temp.ProductTypeID = id;
                                Models.Create(Models.DoorQuotes, temp).then(function(dq) {
                                    deferred.resolve(dq);
                                });
                            });
                        }
                    });
                });
            });
        } else {
            fbUser.CurrUser().then(function(user) {
                $http.post(Config.API.Endpoints.Quotes.GetQuote, { id: id, id1: id1, id2: inMasterQuote.MasterQuoteID, userID: user.UserID }).then(function(data) {
                    deferred.resolve(data.data);
                }, function() {
                    deferred.reject();
                });
            });
        }

        return deferred.promise;
    };

    service.GetSubQuotes = function(productTypeId, masterQuoteID, rMasterQuoteID) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.DoorQuotes.all().filter('ProductTypeID', '=', productTypeId).and(new persistence.PropertyFilter('LMasterQuoteID', '=', masterQuoteID)).list(function(quotes) {
                    deferred.resolve(quotes);
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Quotes.GetSubQuotes, { productID: productTypeId, masterQuoteID: rMasterQuoteID }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }
        return deferred.promise;
    };

    service.GetOrder = function(userId, styles2Id, productTypeId, orderId, rOrderId) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                service.GetOrders(userId, styles2Id, productTypeId, orderId, null, null, null).then(function(orders) {
                    console.log(orders);
                    if (orders.length > 0) {
                        deferred.resolve(orders[0]);
                    } else {
                        deferred.resolve();
                    }
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Quotes.GetOrder, { id: userId, id1: styles2Id, id2: productTypeId, id3: rOrderId }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }
        return deferred.promise;
    };

    service.GetOrders = function(userId, styles2Id, productTypeId, orderId, doorQuoteId, orderType, masterQuoteId) {
        var deferred = Q.defer();
        var orders = [];
        Database.ready().then(function() {
            if (productTypeId === MouldingProductTypeId) {
                service.GetMouldingOrderDetails(userId, styles2Id, productTypeId, orderId,
                    doorQuoteId, orderType, masterQuoteId).then(function(res) {
                    orders = orders.concat(res);
                    deferred.resolve(orders);
                });
            } else if (productTypeId === DoorsProductTypeId) {
                service.GetExteriorOrderDetails(userId, styles2Id, productTypeId, orderId,
                    doorQuoteId, orderType, masterQuoteId).then(function(res) {
                    orders = orders.concat(res);
                    service.GetIntDoorDetails(userId, styles2Id, productTypeId, orderId,
                        doorQuoteId, orderType, masterQuoteId).then(function(res) {
                        orders = orders.concat(res);
                        deferred.resolve(orders);
                    });
                });
            } else if (productTypeId === SkylightProductTypeId) {
                service.GetSkylightOrderDetails(userId, styles2Id, productTypeId, orderId,
                    doorQuoteId, orderType, masterQuoteId).then(function(res) {
                    orders = orders.concat(res);
                    deferred.resolve(orders);
                });
            } else if (productTypeId === DeckingProductTypeId) {
                service.GetDeckingOrderDetails(userId, styles2Id, productTypeId, orderId,
                    doorQuoteId, orderType, masterQuoteId).then(function(res) {
                    orders = orders.concat(res);
                    deferred.resolve(orders);
                });
            } else if (productTypeId === SidingProductTypeId) {
                service.GetSidingOrderDetails(userId, styles2Id, productTypeId, orderId,
                    doorQuoteId, orderType, masterQuoteId).then(function(res) {
                    orders = orders.concat(res);
                    deferred.resolve(orders);
                });
            } else if (productTypeId === WindowProductTypeId) {
                service.GetWindowOrderDetails(userId, masterQuoteId).then(function(res) {
                    orders = orders.concat(res);
                    deferred.resolve(orders);
                });
            } else if (productTypeId === RawGlassProductTypeId) {
                service.GetRawGlassDetails(userId, styles2Id, productTypeId, orderId,
                    doorQuoteId, orderType, masterQuoteId).then(function(res) {
                    orders = orders.concat(res);
                    deferred.resolve(orders);
                });
            } else {
                deferred.resolve(orders);
            }
        });
        return deferred.promise;
    };

    service.GetAllOrders = function(userId, masterQuoteId, EMasterQuoteID) {

        var deferred = Q.defer();

        var orders = [];

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                fbProducts.GetAllProductTypes().then(function(pTypes) {
                    var pWait = [];
                    pTypes.forEach(function(pType) {
                        pWait.push((function() {
                            var deferred = Q.defer();
                            Models.LuStyles2.all().filter('ProductTypeID', '=', Number(pType.ProductTypeID)).list(function(tmp) {
                                var luStyle2 = tmp[0];
                                if (typeof luStyle2 !== 'undefined') {
                                    Models.DoorQuotes.all().filter('ProductTypeID', '=', Number(pType.ProductTypeID))
                                        .and(new persistence.PropertyFilter('LMasterQuoteID', '=', masterQuoteId)).list(function(dqs) {
                                            if (typeof dqs[0] !== 'undefined') {
                                                var dq = dqs[0];
                                                service.GetOrders(userId, luStyle2.Styles2ID, pType.ProductTypeID, null,
                                                    dq.id, null, masterQuoteId).then(function(res) {
                                                    orders = orders.concat(res);
                                                    deferred.resolve();
                                                });
                                            } else {
                                                deferred.resolve();
                                            }
                                        });
                                } else {
                                    deferred.resolve();
                                }
                            });
                            return deferred.promise;
                        })());
                    });
                    Q.allSettled(pWait).then(function() {
                        deferred.resolve(orders);
                    });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Quotes.GetAllOrders, { userID: userId, masterQuoteID: EMasterQuoteID }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;

    };

    var GCDFrac = function(a, b) {
        while (b !== 0) {
            var t = b;
            b = a % b;
            a = t;
        }
        return a;
    };

    var ReduceFrac = function(curr, x) {
        curr.num /= x;
        curr.denom /= x;
    };

    var NormalizeFrac = function(curr) {
        // Reduce the fraction to be in lowest terms
        ReduceFrac(curr, GCDFrac(curr.num, curr.denom));

        // Make it so that the denominator is always positive
        // Reduce(Math.Sign(Denominator));

        // Turn num/denom into a proper fraction and add to wholePart appropriately
        //WholePart = Numerator / Denominator;
        curr.plus = curr.num / curr.denom;
        curr.num %= curr.denom;
    };

    var addThisFrac = function(curr, other) {
        if (other !== undefined && other !== null) {
            curr.denom = curr.denom * other.denom;
            curr.num = curr.num * other.denom;
            curr.num += other.num * curr.denom;
            NormalizeFrac(curr);
        }
    };

    var getWindowById = function(line, id) {
        var win = null;
        line.windowList.forEach(function(w) {
            if (Number(w.id) === Number(id)) {
                win = w;
            }
        });
        return win;
    };

    var crawlWidth = function(line, w) {
        var width = w.realWidth;

        if (w.toRight > 0) {
            var toRight = getWindowById(line, w.toRight);
            if (line.tempFraction !== null && line.tempFraction !== null) {
                addThisFrac(line.tempFraction, toRight.widthFraction);
            } else {
                line.tempFraction = toRight.widthFraction;
            }
            return width + crawlWidth(line, toRight);
        } else {
            return width;
        }
    };

    var crawlHeight = function(line, w) {
        var height = w.realHeight;

        if (w.toTop > 0) {
            var toTop = getWindowById(line, w.toTop);
            if (line.tempFraction !== undefined && line.tempFraction !== null) {
                addThisFrac(line.tempFraction, toTop.heightFraction);
            } else {
                line.tempFraction = toTop.heightFraction;
            }
            return height + crawlHeight(line, toTop);
        } else {
            return height;
        }
    };

    var getLineWidth = function(line) {
        var width = 0;
        var newWidth = 0;
        line.tempFraction = null;
        line.windowList.forEach(function(w) {
            line.tempFraction = w.widthFraction;
            newWidth = crawlWidth(line, w);
            if (newWidth > width) {
                width = newWidth;
            }
        });
        if (line.widthFraction !== undefined && line.widthFraction !== null) {
            width = width + line.widthFraction.plus;
        }
        line.realWidth = width;
        line.widthFraction = line.tempFraction;
        return width;
    };

    var getLineHeight = function(line) {
        var height = 0;
        var newHeight = 0;
        line.tempFraction = null;
        line.windowList.forEach(function(w) {
            line.tempFraction = w.heightFraction;
            newHeight = crawlHeight(line, w);
            if (newHeight > height) {
                height = newHeight;
            }
        });
        if (line.heightFraction !== undefined && line.heightFraction !== null) {
            height = height + line.heightFraction.plus;
        }
        line.realHeight = height;
        line.heightFraction = line.tempFraction;
        return height;
    };

    var getPrice = function(price, onFactor, markup) {
        var newPrice = 0.0;
        var nOnFactor = Number(onFactor);
        var nMarkup = Number(markup);
        newPrice = price * nOnFactor;
        newPrice = newPrice * ((nMarkup / 100) + 1);
        return newPrice;
    };

    var getOptionText = function(win, config, mapOpts, gridTypes, obsTypes, frameTypes, isNet, screenType) {

        var optString = "";

        if (isNet) {
            optString += "Net opening";
        } else {
            optString += "Rough opening";
        }

        if (win.type === "Slider" || win.type === "Single Hung" || win.type === "Casement" || win.type === "Patio Door" || win.type === "Awning") {
            optString += ", Screen: " + screenType;
        }

        if (win.exteriorColor.toLowerCase() !== "none") {
            optString += ", " + exteriorColor + " exterior";
        }

        optString += ", " + win.frameColor + " frame";

        if (win.options !== null) {
            win.options.forEach(function(wo) {
                if (wo.name === "grid" && wo.selected) {
                    if (win.gridPattern !== "none") {
                        //if (gridTypes.ContainsKey(wo.priceKey.Replace("_p", ""))) {
                        if (_.has(gridTypes, wo.priceKey.replace("_p", ""))) {
                            optString += gridTypes[wo.priceKey.replace("_p", "")] + " " + win.gridPattern;

                        }
                        //      if (_.has(config.lines, win.prodLine)) {
                        //        optString += config.lines[win.prodLine].gridLabels[wo.priceKey] + " " +  win.gridPattern;
                        //   }
                        if (win.gridPattern === "full" || win.gridPattern === "colonial" || win.gridPattern === "top down") {
                            optString += " " + win.columns + "x" + win.rows;
                        }
                    }
                } else if (wo.selected === true && wo.name !== "paint" && wo.name !== "frame" && wo.name !== "grid") {
                    if (wo.name === "fav") {
                        wo.name = "FAV";
                    } else if (wo.name === "obscure") {
                        wo.name = obsTypes[wo.priceKey.replace("_t", "")];
                    } else if (wo.name === "fin") {
                        //if (frameTypes.ContainsKey(wo.priceKey)) {
                        if (_.has(frameTypes, wo.priceKey)) {
                            wo.name = frameTypes[wo.priceKey];
                        }
                    } else if (wo.name === "lowe") {
                        //if (config.lines.ContainsKey(win.prodLine)) {
                        if (_.has(config.lines, win.prodLine)) {
                            wo.name = config.lines[win.prodLine].loweNames[wo.priceKey.replace("_t", "")];
                        }
                    } else if (wo.name === "Tempered" && win.temperType !== undefined && win.temperType !== null) {
                        wo.name = win.temperType;
                    }
                    optString += ", " + wo.name;
                }
            });
        }

        mapOpts.forEach(function(mo) {
            if (mo.name.indexOf("lock") !== -1 || mo.name.indexOf("Lock") !== -1) {
                if (win.type === "Single hung" || win.type === "Slider") {
                    mo.selectedKeys.forEach(function(s) {
                        optString += ", " + s;
                    });
                }
            } else {
                mo.selectedKeys.forEach(function(s) {
                    optString += ", " + s;
                });
            }
        });

        if (win.glassColor !== "none") {
            optString += ", " + win.glassColor;
        }

        if (win.tdlBars !== null && win.tdlBars.length > 0) {
            win.tdlBars.forEach(function(tdl) {
                optString += ", TDL: " + tdl.startInch + " inches from ";
                if (tdl.isVertical === true) {
                    optString += "left";
                } else {
                    optString += "top";
                }
            });
        }

        optString += ", U-Value: " + win.uVal + ", SHGC: " + win.shgc;

        return optString;
    };

    service.GetWindowOrderDetails = function(userId, masterQuoteId) {
        var deferred = Q.defer();
        var index = 0;
        var windowDetails = [];
        Models.LuStyles2.findBy('Style2', 'Siding', function(style2) {
            var style2Id = (style2 !== null) ? style2.Styles2ID : 0;
            fbWindows.GetFrameTypes().then(function(frameTypes) {
                fbWindows.GetGridTypes().then(function(gridTypes) {
                    fbWindows.GetObscureTypes().then(function(obscureTypes) {
                        fbWindows.GetMfConfig().then(function(config) {
                            fbUser.RelatedUsers(userId).then(function(relatedUsers) {
                                var relatedUserIds = _.pluck(relatedUsers, 'UserID');
                                Models.WebQuotes.all().filter('LMasterQuoteID', '=', masterQuoteId)
                                    .and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(windowQuotes) {
                                        var pWait = [];
                                        windowQuotes.forEach(function(q) {
                                            pWait.push((function(q, index) {
                                                var deferred = Q.defer();
                                                if (q.jsonQuote !== undefined && q.jsonQuote !== null && q.jsonQuote !== "") {
                                                    var current = JSON.parse(q.jsonQuote);
                                                    var needSave = false;
                                                    if (current.windowOrderList !== undefined && current.windowOrderList !== null && current.windowOrderList.length > 0) {
                                                        var order = current.windowOrderList[0];
                                                        (function() {
                                                            var deferred = Q.defer();
                                                            var setting = null;
                                                            Models.Settings.all().filter('LMasterQuoteID', '=', masterQuoteId).list(function(temps) {
                                                                var pWait = [];
                                                                temps.forEach(function(temp) {
                                                                    pWait.push((function(temp) {
                                                                        var deferred = Q.defer();
                                                                        Models.Manufacturers.findBy('ManufacturerID', temp.ManufacturerID, function(mf) {
                                                                            if (mf.name === order.manufacturer) {
                                                                                setting = temp;
                                                                            }
                                                                            deferred.resolve();
                                                                        });
                                                                        return deferred.promise;
                                                                    })(temp));
                                                                });
                                                                Q.allSettled(pWait).then(function() {
                                                                    deferred.resolve(setting);
                                                                });
                                                            });
                                                            return deferred.promise;
                                                        })().then(function(setting) {
                                                            (function(setting) {
                                                                var deferred = Q.defer();
                                                                if (setting === null) {
                                                                    Models.Manufacturers.all().filter('name', '=', order.manufacturer)
                                                                        .and(new persistence.PropertyFilter('ProdutTypeID', '=', WindowProductTypeId)).list(function(mfs) {
                                                                            if (mfs.length !== 0) {
                                                                                var manufacturer = mfs[0];
                                                                                setting = {
                                                                                    ManufacturerID: manufacturer.ManufacturerID,
                                                                                    MarkUp: 0,
                                                                                    OnFactor: 0.5,
                                                                                    LMasterQuoteID: masterQuoteId,
                                                                                    MasterQuoteID: windowQuotes.MasterQuoteID,
                                                                                    ProductTypeID: WindowProductTypeId,
                                                                                    UserID: Number(userId)
                                                                                };
                                                                                //     Models.Create(Models.Settings, setting).then(function(setting) {
                                                                                deferred.resolve(setting);
                                                                                //     });
                                                                            }
                                                                        });
                                                                } else {
                                                                    deferred.resolve(setting);
                                                                }
                                                                return deferred.promise;
                                                            })(setting).then(function(setting) {
                                                                (function() {
                                                                    var deferred = Q.defer();
                                                                    Models.WindowOrderNames.all().filter('LWebQuoteID', '=', q.id)
                                                                        .and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(orderNames) {
                                                                            deferred.resolve((orderNames.length === 0) ? null : orderNames[0].Name);
                                                                        });
                                                                    return deferred.promise;
                                                                })().then(function(finalOrderName) {
                                                                    // Models.SettingsLines.all().filter('LSettingID', '=', setting.id).list(function(settingLines) {
                                                                    //   setting.Lines = settingLines;
                                                                    if (order !== null) {
                                                                        var pWait = [];
                                                                        order.lineItem.forEach(function(lineItem) {
                                                                            pWait.push((function() {
                                                                                var deferred = Q.defer();
                                                                                var deet = {
                                                                                    Manufacturer: order.manufacturer,
                                                                                    Distributor: order.manufacturer,
                                                                                    ProductTypeID: 6,
                                                                                    DoorQuoteID: q.WebQuoteID,
                                                                                    Width: getLineWidth(lineItem).toString(),
                                                                                    Height: getLineHeight(lineItem).toString(),
                                                                                    Location: lineItem.location,
                                                                                    Styles2ID: 10,
                                                                                    TotalPrice: Number(lineItem.priceInDollars),
                                                                                    PriceEach: Number(lineItem.priceInDollars / lineItem.quantity),
                                                                                    Description1: lineItem.notes,
                                                                                    PhotoFileName: current.lineIcons[lineItem.id.toString()].main,
                                                                                    Quantity: lineItem.quantity,
                                                                                    WidthFrac: (lineItem.widthFraction === undefined) ? null : lineItem.widthFraction,
                                                                                    HeightFrac: (lineItem.heightFraction === undefined) ? null : lineItem.heightFraction,
                                                                                    OrderType: index,
                                                                                    productType: WindowOrderStyle2Name,
                                                                                    OrderName: (finalOrderName === null) ? "Order " + (index + 1) : finalOrderName,
                                                                                    ProductLine: order.productLine,
                                                                                    OrderID: index,
                                                                                    LWebQuoteID: q.id,
                                                                                    WebQuoteID: q.WebQuoteID
                                                                                };
                                                                                if (deet.WidthFrac !== null && deet.WidthFrac.num === 0) {
                                                                                    deet.WidthFrac = null;
                                                                                }
                                                                                if (deet.HeightFrac !== null && deet.HeightFrac.num === 0) {
                                                                                    deet.HeightFrac = null;
                                                                                }
                                                                                (function(deet, order, setting) {
                                                                                    var deferred = Q.defer();
                                                                                    if (setting !== null) {
                                                                                        Models.UserGroups.all().filter('UserID', '=', setting.UserID).and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(userGroups) {

                                                                                            Models.OnFactorGroups.all().filter('Name', '=', order.productLine).and(new persistence.PropertyFilter('GroupID', '=', userGroups[0].GroupID))
                                                                                                .and(new persistence.PropertyFilter('ManufacturerID', '=', setting.ManufacturerID)).list(function(ogs) {
                                                                                                    if (ogs.length !== 0) {
                                                                                                        var og = ogs[0];
                                                                                                        Models.SettingsLines.all().filter('OnFactorGroupID', '=', og.OnFactorGroupID).list(function(lines) {
                                                                                                            if (lines.length !== 0) {
                                                                                                                var line = lines[0];
                                                                                                                deet.PriceEach = getPrice(deet.PriceEach, line.OnFactor, line.MarkUp);
                                                                                                                deet.TotalPrice = getPrice(deet.TotalPrice, line.OnFactor, line.MarkUp);
                                                                                                            }
                                                                                                            deferred.resolve(deet);
                                                                                                        });
                                                                                                    } else {
                                                                                                        deferred.resolve(deet);
                                                                                                    }
                                                                                                });
                                                                                        });
                                                                                    } else {
                                                                                        deferred.resolve(deet);
                                                                                    }
                                                                                    return deferred.promise;
                                                                                })(deet, order, setting).then(function(deet) {
                                                                                    if (lineItem.windowList.length === 1) {
                                                                                        deet.Name = lineItem.windowList[0].subtype;
                                                                                    } else {
                                                                                        deet.Name = "mull unit";
                                                                                    }
                                                                                    deet.WindowList = [];
                                                                                    var opts = order.frameColor + " Frame";
                                                                                    if (order.exteriorColor.toLowerCase() !== "none") {
                                                                                        opts += ", " + order.exteriorColor + " Exterior";
                                                                                    }
                                                                                    lineItem.windowList.forEach(function(win) {
                                                                                        if (win.UUID === undefined || win.UUID === null || win.UUID === "") {
                                                                                            win.UUID = uuid.v4();
                                                                                            needSave = true;
                                                                                        }
                                                                                        var winView = {
                                                                                            OptionsString: getOptionText(win, _.find(config.configs, function(obj) {
                                                                                                    return obj.manufacturer === order.manufacturer;
                                                                                                }), order.mapsOptionList, gridTypes, obscureTypes, frameTypes, current
                                                                                                .quoteDetails.isNet, current.quoteDetails.screenType),
                                                                                            SelectedWindow: win,
                                                                                            SubType: win.subtype,
                                                                                            UUID: win.UUID
                                                                                        };
                                                                                        winView.SelectedWindow.options = null;
                                                                                        if (win.isError === true) {
                                                                                            deet.HasErrors = true;
                                                                                        }
                                                                                        deet.WindowList.push(winView);
                                                                                    });
                                                                                    if (deet.WindowList.length > 0) {
                                                                                        windowDetails.push(deet);
                                                                                    }
                                                                                    deferred.resolve();
                                                                                });
                                                                                return deferred.promise;
                                                                            })());
                                                                        });
                                                                        Q.allSettled(pWait).then(function() {
                                                                            if (needSave) {
                                                                                q.jsonQuote = JSON.stringify(current);
                                                                                Models.Alter(Models.WebQuotes, q).then(function(q) {
                                                                                    deferred.resolve();
                                                                                });
                                                                            } else {
                                                                                deferred.resolve();
                                                                            }
                                                                        });
                                                                    } else {
                                                                        deferred.resolve();
                                                                    }
                                                                });
                                                            });
                                                        });
                                                        //});
                                                    } else {
                                                        deferred.resolve();
                                                    }
                                                } else {
                                                    deferred.resolve();
                                                }
                                                return deferred.promise;
                                            })(q, index));
                                            index++;
                                        });
                                        Q.allSettled(pWait).then(function() {
                                            deferred.resolve(windowDetails);
                                        });
                                    });
                            });
                        });
                    });
                });
            });
        });
        return deferred.promise;
    };

    service.GetMouldingOrderDetails = function(userId, styles2Id, productTypeId, orderId, doorQuoteId, orderType, masterQuoteId) {

        var deferred = Q.defer();

        var res = [];

        Database.ready().then(function() {

            Models.LuStyles2.findBy('Style2', MouldingOrderStyle2Name, function(luStyle2) {

                var style2Id = 0;

                if (luStyle2 !== null) {
                    style2Id = luStyle2.Styles2ID;
                }

                fbUser.RelatedUsers(userId).then(function(rUsers) {

                    var mCol = Models.MouldingOrders.all().filter('Deleted', '=', false);

                    if (orderId !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('id', '=', orderId));
                    }

                    if (doorQuoteId !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('LDoorQuoteID', '=', doorQuoteId));
                    }

                    if (orderType !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('OrderType', '=', orderType));
                    }

                    mCol.list(function(orders) {
                        var pWait = [];
                        orders.forEach(function(order) {
                            pWait.push((function() {
                                var deferred = Q.defer();
                                Models.DoorQuotes.findBy('id', order.LDoorQuoteID, function(dq) {
                                    Models.Customers.findBy('id', dq.LCustomerID, function(customer) {
                                        if (((rUsers.length === 0 && String(customer.UserID) === String(userId)) ||
                                                (rUsers.length !== 0 && fbUser.RelatedUsersContains(rUsers, customer.UserID))) &&
                                            (dq.ProductTypeID === productTypeId) &&
                                            (masterQuoteId === null || dq.LMasterQuoteID === masterQuoteId)) {
                                            Models.Users.findBy('UserID', userId, function(user) {
                                                Models.Mouldings.findBy('MouldingID', order.MouldingID, function(moulding) {
                                                    Models.OrderNames.all().filter('LDoorQuoteID', '=', order.LDoorQuoteID)
                                                        .and(new persistence.PropertyFilter('OrderType', '=', order.OrderType)).list(function(finalOrderNames) {
                                                            var finalOrderName = {
                                                                Name: null
                                                            };
                                                            if (typeof finalOrderNames[0] !== 'undefined') {
                                                                finalOrderName = finalOrderNames[0];
                                                            }
                                                            res.push({
                                                                ProductTypeID: productTypeId,
                                                                Styles2ID: style2Id,
                                                                Name: moulding.Name,
                                                                Collection: moulding.Collection,
                                                                PhotoFileName: moulding.PhotoName,
                                                                Manufacturer: moulding.Manufacturer,
                                                                Distributor: moulding.Distributor,
                                                                Length: moulding.Length,
                                                                Height: moulding.Height,
                                                                Width: moulding.Width,
                                                                DoorPrice: moulding.Price,
                                                                OrderID: order.OrderID,
                                                                LOrderID: order.id,
                                                                Quantity: order.Quantity,
                                                                TotalPrice: order.PriceOverride ? order.PriceOverride : order.TotalPrice,
                                                                PriceEach: order.PriceEach,
                                                                OrderType: order.OrderType,
                                                                DoorQuoteID: dq.DoorQuoteID,
                                                                LDoorQuoteID: dq.id,
                                                                DoorType: moulding.Type,
                                                                productType: MouldingOrderStyle2Name,
                                                                CompanyID: user.CompanyID,
                                                                OrderName: finalOrderName.Name,
                                                                Notes: order.Notes,
                                                                PriceOverride: order.PriceOverride
                                                            });
                                                            deferred.resolve();
                                                        });
                                                });

                                            });
                                        } else {
                                            deferred.resolve();
                                        }
                                    });
                                });
                                return deferred.promise;
                            })());
                        });
                        Q.allSettled(pWait).then(function() {
                            deferred.resolve(res);
                        });
                    });


                });

            });

        });

        return deferred.promise;

    };

    service.GetSkylightOrderDetails = function(userId, styles2Id, productTypeId, orderId, doorQuoteId, orderType, masterQuoteId) {

        var deferred = Q.defer();

        var res = [];

        Database.ready().then(function() {

            Models.LuStyles2.findBy('Style2', SkylightOrderStyle2Name, function(luStyle2) {

                var style2Id = 0;

                if (luStyle2 !== null) {
                    style2Id = luStyle2.Styles2ID;
                }

                fbUser.RelatedUsers(userId).then(function(rUsers) {

                    var mCol = Models.SkylightOrders.all().filter('Deleted', '=', false);

                    if (orderId !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('id', '=', orderId));
                    }

                    if (doorQuoteId !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('LDoorQuoteID', '=', doorQuoteId));
                    }

                    if (orderType !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('OrderType', '=', orderType));
                    }

                    mCol.list(function(orders) {
                        var pWait = [];
                        orders.forEach(function(order) {
                            pWait.push((function() {
                                var deferred = Q.defer();
                                Models.DoorQuotes.findBy('id', order.LDoorQuoteID, function(dq) {
                                    Models.Customers.findBy('id', dq.LCustomerID, function(customer) {
                                        if (((rUsers.length === 0 && String(customer.UserID) === String(userId)) ||
                                                (rUsers.length !== 0 && fbUser.RelatedUsersContains(rUsers, customer.UserID))) &&
                                            (dq.ProductTypeID === productTypeId) &&
                                            (masterQuoteId === null || dq.LMasterQuoteID === masterQuoteId)) {
                                            Models.Users.findBy('UserID', userId, function(user) {
                                                Models.Skylights.findBy('SkylightID', order.SkylightID, function(skylight) {
                                                    Models.SkylightBlinds.findBy('SkylightBlindID', order.SkylightBlindID, function(blind) {
                                                        Models.OrderNames.all().filter('LDoorQuoteID', '=', order.LDoorQuoteID)
                                                            .and(new persistence.PropertyFilter('OrderType', '=', order.OrderType)).list(function(finalOrderNames) {
                                                                var finalOrderName = {
                                                                    Name: null
                                                                };
                                                                if (typeof finalOrderNames[0] !== 'undefined') {
                                                                    finalOrderName = finalOrderNames[0];
                                                                }
                                                                res.push({
                                                                    ProductTypeID: productTypeId,
                                                                    Styles2ID: style2Id,
                                                                    Name: skylight.Name,
                                                                    Collection: skylight.Collection,
                                                                    Height: skylight.Height,
                                                                    Width: skylight.Width,
                                                                    GlassType: skylight.GlassType,
                                                                    GlassColor: skylight.GlassColor,
                                                                    EnergyPackage: skylight.EnergyPackage,
                                                                    Operation: skylight.Operation,
                                                                    OperatorType: skylight.OperatorType,
                                                                    Finish: skylight.Finish,
                                                                    QtyPriceDiscount: skylight.QtyPriceDiscount,
                                                                    Color: skylight.Color,
                                                                    Thickness: skylight.Thickness,
                                                                    Style: skylight.Style,
                                                                    Dimension: skylight.Dimension,
                                                                    PhotoFileName: skylight.PhotoName,
                                                                    Manufacturer: skylight.Manufacturer,
                                                                    Distributor: skylight.Distributor,
                                                                    DoorPrice: skylight.Price,
                                                                    OrderID: order.OrderID,
                                                                    LOrderID: order.id,
                                                                    Quantity: order.Quantity,
                                                                    TotalPrice: order.PriceOverride ? order.PriceOverride : order.TotalPrice,
                                                                    PriceEach: order.PriceEach,
                                                                    OrderType: order.OrderType,
                                                                    DoorQuoteID: dq.DoorQuoteID,
                                                                    LDoorQuoteID: dq.id,
                                                                    productType: SkylightOrderStyle2Name,
                                                                    CompanyID: user.CompanyID,
                                                                    invertDimensions: order.invertDimensions,
                                                                    OutsideCurb: skylight.OutsideCurb,
                                                                    OrderName: finalOrderName.Name,
                                                                    Notes: order.Notes,
                                                                    PriceOverride: order.PriceOverride,
                                                                    SkylightBlindID: order.SkylightBlindID,
                                                                    Blinds: blind
                                                                });
                                                                deferred.resolve();
                                                            });
                                                    });
                                                });

                                            });
                                        } else {
                                            deferred.resolve();
                                        }
                                    });
                                });
                                return deferred.promise;
                            })());
                        });
                        Q.allSettled(pWait).then(function() {
                            deferred.resolve(res);
                        });
                    });
                });
            });

        });

        return deferred.promise;
    };

    service.GetDeckingOrderDetails = function(userId, styles2Id, productTypeId, orderId, doorQuoteId, orderType, masterQuoteId) {

        var deferred = Q.defer();
        var res = [];

        Database.ready().then(function() {

            Models.LuStyles2.findBy('Style2', DeckingOrderStyle2Name, function(luStyle2) {

                var style2Id = 0;

                if (luStyle2 !== null) {
                    style2Id = luStyle2.Styles2ID;
                }

                fbUser.RelatedUsers(userId).then(function(rUsers) {

                    var mCol = Models.DeckingOrders.all().filter('Deleted', '=', false);

                    if (orderId !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('id', '=', orderId));
                    }

                    if (doorQuoteId !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('LDoorQuoteID', '=', doorQuoteId));
                    }

                    if (orderType !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('OrderType', '=', orderType));
                    }

                    mCol.list(function(orders) {
                        var pWait = [];
                        orders.forEach(function(order) {
                            pWait.push((function() {
                                var deferred = Q.defer();
                                Models.DoorQuotes.findBy('id', order.LDoorQuoteID, function(dq) {
                                    Models.Customers.findBy('id', dq.LCustomerID, function(customer) {
                                        if (((rUsers.length === 0 && String(customer.UserID) === String(userId)) ||
                                                (rUsers.length !== 0 && fbUser.RelatedUsersContains(rUsers, customer.UserID))) &&
                                            (dq.ProductTypeID === productTypeId) &&
                                            (masterQuoteId === null || dq.LMasterQuoteID === masterQuoteId)) {
                                            Models.Users.findBy('UserID', userId, function(user) {
                                                Models.Deckings.findBy('DeckingID', order.DeckingID, function(decking) {
                                                    Models.OrderNames.all().filter('LDoorQuoteID', '=', order.LDoorQuoteID)
                                                        .and(new persistence.PropertyFilter('OrderType', '=', order.OrderType)).list(function(finalOrderNames) {
                                                            var finalOrderName = {
                                                                Name: null
                                                            };
                                                            if (typeof finalOrderNames[0] !== 'undefined') {
                                                                finalOrderName = finalOrderNames[0];
                                                            }
                                                            res.push({
                                                                Thickness: decking.Thickness,
                                                                ProductTypeID: productTypeId,
                                                                Styles2ID: style2Id,
                                                                Manufacturer: decking.Manufacturer,
                                                                Distributor: decking.Distributor,
                                                                Name: decking.Name,
                                                                Style: decking.Style,
                                                                Collection: decking.Collection,
                                                                PhotoFileName: decking.PhotoName,
                                                                Length: decking.Length,
                                                                Width: decking.Width,
                                                                Color: decking.Color,
                                                                Description1: decking.Description1,
                                                                Description2: decking.Description2,
                                                                DoorPrice: decking.Price,
                                                                OrderID: order.OrderID,
                                                                LOrderID: order.id,
                                                                Quantity: order.Quantity,
                                                                TotalPrice: order.PriceOverride ? order.PriceOverride : order.TotalPrice,
                                                                PriceEach: order.PriceEach,
                                                                OrderType: order.OrderType,
                                                                DoorQuoteID: dq.DoorQuoteID,
                                                                LDoorQuoteID: dq.id,
                                                                productType: DeckingOrderStyle2Name,
                                                                CompanyID: user.CompanyID,
                                                                OrderName: finalOrderName.Name,
                                                                Notes: order.Notes,
                                                                PriceOverride: order.PriceOverride
                                                            });
                                                            deferred.resolve();
                                                        });
                                                });

                                            });
                                        } else {
                                            deferred.resolve();
                                        }
                                    });
                                });
                                return deferred.promise;
                            })());
                        });
                        Q.allSettled(pWait).then(function() {
                            deferred.resolve(res);
                        });
                    });
                });

            });

        });
        return deferred.promise;
    };

    service.GetSidingOrderDetails = function(userId, styles2Id, productTypeId, orderId, doorQuoteId, orderType, masterQuoteId) {

        var deferred = Q.defer();

        var res = [];

        Database.ready().then(function() {

            Models.LuStyles2.findBy('Style2', SidingOrderStyle2Name, function(luStyle2) {

                var style2Id = 0;

                if (luStyle2 !== null) {
                    style2Id = luStyle2.Styles2ID;
                }

                fbUser.RelatedUsers(userId).then(function(rUsers) {

                    var mCol = Models.SidingOrders.all().filter('Deleted', '=', false);

                    if (orderId !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('id', '=', orderId));
                    }

                    if (doorQuoteId !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('LDoorQuoteID', '=', doorQuoteId));
                    }

                    if (orderType !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('OrderType', '=', orderType));
                    }

                    mCol.list(function(orders) {
                        var pWait = [];
                        orders.forEach(function(order) {
                            pWait.push((function() {
                                var deferred = Q.defer();
                                Models.DoorQuotes.findBy('id', order.LDoorQuoteID, function(dq) {
                                    Models.Customers.findBy('id', dq.LCustomerID, function(customer) {
                                        if (((rUsers.length === 0 && String(customer.UserID) === String(userId)) ||
                                                (rUsers.length !== 0 && fbUser.RelatedUsersContains(rUsers, customer.UserID))) &&
                                            (dq.ProductTypeID === productTypeId) &&
                                            (masterQuoteId === null || dq.LMasterQuoteID === masterQuoteId)) {
                                            Models.Users.findBy('UserID', userId, function(user) {
                                                Models.Sidings.findBy('SidingID', order.SidingID, function(siding) {
                                                    Models.OrderNames.all().filter('LDoorQuoteID', '=', order.LDoorQuoteID)
                                                        .and(new persistence.PropertyFilter('OrderType', '=', order.OrderType)).list(function(finalOrderNames) {
                                                            var finalOrderName = {
                                                                Name: null
                                                            };
                                                            if (typeof finalOrderNames[0] !== 'undefined') {
                                                                finalOrderName = finalOrderNames[0];
                                                            }
                                                            res.push({
                                                                ProductTypeID: productTypeId,
                                                                Styles2ID: style2Id,
                                                                Manufacturer: siding.Manufacturer,
                                                                Distributor: siding.Distributor,
                                                                Name: siding.Name,
                                                                Style: siding.Style,
                                                                Collection: siding.Collection,
                                                                PhotoFileName: siding.PhotoName,
                                                                Length: siding.Length,
                                                                Width: siding.Width,
                                                                Color: siding.Color,
                                                                Exposure: siding.Exposure,
                                                                RGB: siding.RGB,
                                                                Description1: siding.Description1,
                                                                Description2: siding.Description2,
                                                                DoorPrice: siding.Price,
                                                                OrderID: order.OrderID,
                                                                LOrderID: order.id,
                                                                Quantity: order.Quantity,
                                                                TotalPrice: order.PriceOverride ? order.PriceOverride : order.TotalPrice,
                                                                PriceEach: order.PriceEach,
                                                                OrderType: order.OrderType,
                                                                DoorQuoteID: dq.DoorQuoteID,
                                                                LDoorQuoteID: dq.id,
                                                                productType: SidingOrderStyle2Name,
                                                                CompanyID: user.CompanyID,
                                                                OrderName: finalOrderName.Name,
                                                                Notes: order.Notes,
                                                                PriceOverride: order.PriceOverride
                                                            });
                                                            deferred.resolve();
                                                        });
                                                });

                                            });
                                        } else {
                                            deferred.resolve();
                                        }
                                    });
                                });
                                return deferred.promise;
                            })());
                        });
                        Q.allSettled(pWait).then(function() {
                            deferred.resolve(res);
                        });
                    });
                });

            });

        });

        return deferred.promise;

    };

    service.GetRawGlassDetails = function(userId, styles2Id, productTypeId, orderId, doorQuoteId, orderType, masterQuoteId) {

        var deferred = Q.defer();

        var res = [];

        Database.ready().then(function() {

            Models.LuStyles2.findBy('Style2', RawGlassOrderStyle2Name, function(luStyle2) {

                var style2Id = 0;

                if (luStyle2 !== null) {
                    style2Id = luStyle2.Styles2ID;
                }

                fbUser.RelatedUsers(userId).then(function(rUsers) {

                    var mCol = Models.RawGlassOrders.all().filter('Deleted', '=', false);

                    if (orderId !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('id', '=', orderId));
                    }

                    if (doorQuoteId !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('LDoorQuoteID', '=', doorQuoteId));
                    }

                    if (orderType !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('OrderType', '=', orderType));
                    }

                    mCol.list(function(orders) {
                        var pWait = [];
                        orders.forEach(function(order) {
                            pWait.push((function() {
                                var deferred = Q.defer();
                                Models.DoorQuotes.findBy('id', order.LDoorQuoteID, function(dq) {
                                    Models.Customers.findBy('id', dq.LCustomerID, function(customer) {
                                        if (((rUsers.length === 0 && String(customer.UserID) === String(userId)) ||
                                                (rUsers.length !== 0 && fbUser.RelatedUsersContains(rUsers, customer.UserID))) &&
                                            (dq.ProductTypeID === productTypeId) &&
                                            (masterQuoteId === null || dq.LMasterQuoteID === masterQuoteId)) {
                                            Models.Users.findBy('UserID', userId, function(user) {
                                                Models.RawGlass.findBy('RawGlassID', order.RawGlassID, function(glass) {
                                                    Models.OrderNames.all().filter('LDoorQuoteID', '=', order.LDoorQuoteID)
                                                        .and(new persistence.PropertyFilter('OrderType', '=', order.OrderType)).list(function(finalOrderNames) {
                                                            var finalOrderName = {
                                                                Name: null
                                                            };
                                                            if (typeof finalOrderNames[0] !== 'undefined') {
                                                                finalOrderName = finalOrderNames[0];
                                                            }
                                                            (function() {
                                                                var deferred = Q.defer();
                                                                var accs = [];

                                                                Models.RawGlassOrderAddOns.all().filter('LOrderID', '=', order.id)
                                                                    .and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(oAccs) {
                                                                        var pWait = [];
                                                                        oAccs.forEach(function(oAcc) {
                                                                            pWait.push((function() {
                                                                                var deferred = Q.defer();
                                                                                Models.RawGlassAddOns.findBy('AddOnID', oAcc.AddOnID, function(acc) {
                                                                                    if (acc !== null) {
                                                                                        accs.push(acc);
                                                                                    }
                                                                                    deferred.resolve();
                                                                                });
                                                                                return deferred.promise;
                                                                            })());
                                                                        });
                                                                        Q.allSettled(pWait).then(function() {
                                                                            deferred.resolve(accs);
                                                                        });
                                                                    });

                                                                return deferred.promise;
                                                            })().then(function(acc) {
                                                                res.push({
                                                                    ProductTypeID: productTypeId,
                                                                    Styles2ID: style2Id,
                                                                    Height: order.Height,
                                                                    Width: order.Width,
                                                                    Name: glass.Name,
                                                                    Thickness: glass.GlassThickness,
                                                                    Collection: glass.Collection,
                                                                    PhotoFileName: glass.PhotoName,
                                                                    Manufacturer: glass.Manufacturer,
                                                                    Distributor: glass.Distributor,
                                                                    DoorPrice: glass.Price,
                                                                    OrderID: order.OrderID,
                                                                    LOrderID: order.id,
                                                                    Quantity: order.Quantity,
                                                                    TotalPrice: order.PriceOverride ? order.PriceOverride : order.TotalPrice,
                                                                    PriceEach: order.PriceEach,
                                                                    OrderType: order.OrderType,
                                                                    DoorQuoteID: dq.DoorQuoteID,
                                                                    LDoorQuoteID: dq.id,
                                                                    productType: RawGlassOrderStyle2Name,
                                                                    CompanyID: user.CompanyID,
                                                                    OrderName: finalOrderName.Name,
                                                                    AddOns: acc,
                                                                    Notes: order.Notes,
                                                                    PriceOverride: order.PriceOverride
                                                                });
                                                                deferred.resolve();
                                                            });
                                                        });
                                                });
                                            });

                                        } else {
                                            deferred.resolve();
                                        }
                                    });
                                });
                                return deferred.promise;
                            })());
                        });
                        Q.allSettled(pWait).then(function() {
                            deferred.resolve(res);
                        });
                    });
                });
            });

        });
        return deferred.promise;
    };

    service.GetIntDoorDetails = function(userId, styles2Id, productTypeId, orderId, doorQuoteId, orderType, masterQuoteId) {

        var deferred = Q.defer();

        var res = [];

        Database.ready().then(function() {

            Models.LuStyles2.findBy('Style2', InteriorOrderStyle2Name, function(luStyle2) {

                var style2Id = 0;

                if (luStyle2 !== null) {
                    style2Id = luStyle2.Styles2ID;
                }

                fbUser.RelatedUsers(userId).then(function(rUsers) {

                    var mCol = Models.DoorOrders.all().filter('Deleted', '=', false);

                    if (orderId !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('id', '=', orderId));
                    }

                    if (doorQuoteId !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('LDoorQuoteID', '=', doorQuoteId));
                    }

                    if (orderType !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('OrderType', '=', orderType));
                    }

                    mCol.list(function(orders) {
                        var pWait = [];
                        orders.forEach(function(order) {
                            pWait.push((function() {
                                var deferred = Q.defer();
                                Models.DoorQuotes.findBy('id', order.LDoorQuoteID, function(dq) {
                                    Models.Customers.findBy('id', dq.LCustomerID, function(customer) {
                                        if (((rUsers.length === 0 && String(customer.UserID) === String(userId)) ||
                                                (rUsers.length !== 0 && fbUser.RelatedUsersContains(rUsers, customer.UserID))) &&
                                            (dq.ProductTypeID === productTypeId) &&
                                            (masterQuoteId === null || dq.LMasterQuoteID === masterQuoteId)) {
                                            Models.Users.findBy('UserID', userId, function(user) {
                                                Models.Doors.findBy('DoorID', order.DoorID, function(door) {
                                                    Models.Jambs.findBy('JambID', order.JambID, function(jamb) {
                                                        Models.OrderNames.all().filter('LDoorQuoteID', '=', order.LDoorQuoteID)
                                                            .and(new persistence.PropertyFilter('OrderType', '=', order.OrderType)).list(function(finalOrderNames) {
                                                                var finalOrderName = {
                                                                    Name: null
                                                                };
                                                                if (typeof finalOrderNames[0] !== 'undefined') {
                                                                    finalOrderName = finalOrderNames[0];
                                                                }
                                                                (function() {
                                                                    var deferred = Q.defer();
                                                                    var accs = [];

                                                                    Models.OrderAccessories.all().filter('LOrderID', '=', order.id)
                                                                        .and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(oAccs) {
                                                                            var pWait = [];
                                                                            oAccs.forEach(function(oAcc) {
                                                                                pWait.push((function() {
                                                                                    var deferred = Q.defer();
                                                                                    Models.Accessories.findBy('AccessoryID', oAcc.AccessoryID, function(acc) {
                                                                                        if (acc !== null) {
                                                                                            accs.push({
                                                                                                AccessoryID: acc.AccessoryID,
                                                                                                AccessoryName: acc.AccessoryName,
                                                                                                Price: acc.Price,
                                                                                                type: acc.AccessoryType
                                                                                            });
                                                                                        }
                                                                                        deferred.resolve();
                                                                                    });
                                                                                    return deferred.promise;
                                                                                })());
                                                                            });
                                                                            Q.allSettled(pWait).then(function() {
                                                                                deferred.resolve(accs);
                                                                            });
                                                                        });

                                                                    return deferred.promise;
                                                                })().then(function(acc) {
                                                                    res.push({
                                                                        ProductTypeID: productTypeId,
                                                                        Styles2ID: style2Id,
                                                                        HingeColor: order.HingeColor,
                                                                        HingeType: order.HingeType,
                                                                        Height: door.height,
                                                                        Width: door.width,
                                                                        Name: door.name,
                                                                        Thickness: door.thickness,
                                                                        Collection: door.collection,
                                                                        Surface: door.surface,
                                                                        PhotoFileName: door.photoName,
                                                                        Core: door.core,
                                                                        Material: door.material,
                                                                        Manufacturer: door.manufacturer,
                                                                        Distributor: door.Distributor,
                                                                        DoorPrice: door.price,
                                                                        OrderID: order.OrderID,
                                                                        LOrderID: order.id,
                                                                        Quantity: order.Quantity,
                                                                        TotalPrice: order.PriceOverride ? order.PriceOverride : order.TotalPrice,
                                                                        PriceEach: order.PriceEach,
                                                                        OrderType: order.OrderType,
                                                                        DoorHanding: (order.IsLeftHand) ? "Left Hand" : "Right Hand",
                                                                        DoorQuoteID: dq.DoorQuoteID,
                                                                        LDoorQuoteID: dq.id,
                                                                        JambType: (jamb === null) ? null : jamb.jambType,
                                                                        JambWidth: (jamb === null) ? null : jamb.width,
                                                                        JambPrice: (jamb === null) ? 0 : jamb.price,
                                                                        DoorType: door.type,
                                                                        productType: InteriorOrderStyle2Name,
                                                                        CompanyID: user.CompanyID,
                                                                        JambPicName: (jamb === null) ? null : jamb.JambPic,
                                                                        DoorSwing: order.DoorSwing,
                                                                        OrderName: finalOrderName.Name,
                                                                        Accessories: acc,
                                                                        Notes: order.Notes,
                                                                        PriceOverride: order.PriceOverride
                                                                    });
                                                                    deferred.resolve();
                                                                });
                                                            });
                                                    });
                                                });

                                            });
                                        } else {
                                            deferred.resolve();
                                        }
                                    });
                                });
                                return deferred.promise;
                            })());
                        });
                        Q.allSettled(pWait).then(function() {
                            deferred.resolve(res);
                        });
                    });
                });
            });

        });
        return deferred.promise;
    };

    service.GetExteriorOrderDetails = function(userId, styles2Id, productTypeId, orderId, doorQuoteId, orderType, masterQuoteId) {

        var deferred = Q.defer();

        var res = [];

        Database.ready().then(function() {

            Models.LuStyles2.findBy('Style2', ExteriorOrderStyle2Name, function(luStyle2) {

                var style2Id = 0;

                if (luStyle2 !== null) {
                    style2Id = luStyle2.Styles2ID;
                }

                fbUser.RelatedUsers(userId).then(function(rUsers) {

                    var mCol = Models.ExtOrders.all().filter('Deleted', '=', false);

                    if (orderId !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('id', '=', orderId));
                    }

                    if (doorQuoteId !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('LDoorQuoteID', '=', doorQuoteId));
                    }

                    if (orderType !== null) {
                        mCol = mCol.and(new persistence.PropertyFilter('OrderType', '=', orderType));
                    }

                    mCol.list(function(orders) {
                        var pWait = [];
                        orders.forEach(function(order) {
                            pWait.push((function() {
                                var deferred = Q.defer();
                                Models.DoorQuotes.findBy('id', order.LDoorQuoteID, function(dq) {
                                    Models.Customers.findBy('id', dq.LCustomerID, function(customer) {
                                        if (((rUsers.length === 0 && String(customer.UserID) === String(userId)) ||
                                                (rUsers.length !== 0 && fbUser.RelatedUsersContains(rUsers, customer.UserID))) &&
                                            (dq.ProductTypeID === productTypeId) &&
                                            (masterQuoteId === null || dq.LMasterQuoteID === masterQuoteId)) {
                                            Models.Users.findBy('UserID', userId, function(user) {
                                                Models.ExteriorDoor.findBy('ExteriorDoorID', order.ExtDoorID, function(door) {
                                                    Models.ExteriorJamb.findBy('ExteriorJambID', order.ExtJambID, function(jamb) {
                                                        Models.Sidelite.findBy('SideliteID', order.LeftSideliteID, function(lLite) {
                                                            Models.Sidelite.findBy('SideliteID', order.RightSideliteID, function(rLite) {
                                                                Models.ExteriorSill.findBy('ExteriorSillID', order.SillID, function(eSill) {
                                                                    Models.OrderNames.all().filter('LDoorQuoteID', '=', order.LDoorQuoteID)
                                                                        .and(new persistence.PropertyFilter('OrderType', '=', order.OrderType)).list(function(finalOrderNames) {
                                                                            var finalOrderName = {
                                                                                Name: null
                                                                            };
                                                                            if (typeof finalOrderNames[0] !== 'undefined') {
                                                                                finalOrderName = finalOrderNames[0];
                                                                            }
                                                                            (function() {
                                                                                var deferred = Q.defer();
                                                                                var accs = [];
                                                                                Models.ExtOrderAccessories.all().filter('LExtOrderID', '=', order.id)
                                                                                    .and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(oas) {
                                                                                        var pWait = [];
                                                                                        oas.forEach(function(oa) {
                                                                                            pWait.push((function() {
                                                                                                var deferred = Q.defer();
                                                                                                Models.ExtAccessoryModel.findBy('ExtAccessoryID', oa.ExtAccessoryID, function(a) {
                                                                                                    if (a !== null) {
                                                                                                        accs.push({
                                                                                                            ExtAccessoryID: a.ExtAccessoryID,
                                                                                                            AccessoryName: a.AccessoryName,
                                                                                                            Price: oa.Price,
                                                                                                            species: a.species,
                                                                                                            finish: a.finish,
                                                                                                            AccessoryType: a.AccessoryType,
                                                                                                            JambType: a.JambType,
                                                                                                            colorCode: a.colorCode,

                                                                                                            colorName: a.colorName,
                                                                                                            sideliteAdd: a.sideliteAdd,
                                                                                                            distributor: a.distributor,
                                                                                                            type: a.type,
                                                                                                            height: a.height,
                                                                                                            photoName: a.photoName,
                                                                                                            SortOrder: a.SortOrder,
                                                                                                            FBSku: a.FBSku
                                                                                                        });
                                                                                                    }
                                                                                                    deferred.resolve();
                                                                                                });
                                                                                                return deferred.promise;
                                                                                            })());
                                                                                        });
                                                                                        Q.allSettled(pWait).then(function() {
                                                                                            deferred.resolve(accs);
                                                                                        });
                                                                                    });
                                                                                return deferred.promise;
                                                                            })().then(function(acc) {
                                                                                res.push({
                                                                                    ExtOrderId: order.ExtOrderID,
                                                                                    HingeColor: order.HingeColor,
                                                                                    HingeType: order.HingeType,
                                                                                    ProductTypeID: productTypeId,
                                                                                    Thickness: door.thickness,
                                                                                    Styles2ID: style2Id,
                                                                                    Height: door.height,
                                                                                    Width: door.width,
                                                                                    Name: door.name,
                                                                                    Collection: door.collection,
                                                                                    PhotoFileName: door.photoName,
                                                                                    OrderID: order.ExtOrderID,
                                                                                    LOrderID: order.id,
                                                                                    Quantity: order.Quantity,
                                                                                    TotalPrice: order.PriceOverride ? order.PriceOverride : order.TotalPrice,
                                                                                    PriceEach: order.PriceEach,
                                                                                    OrderType: order.OrderType,
                                                                                    DoorQuoteID: order.DoorQuoteID,
                                                                                    LDoorQuoteID: dq.id,
                                                                                    DoorHanding: (order.IsLeftHand) ? "Left Hand" : "Right Hand",
                                                                                    JambType: (jamb === null) ? null : jamb.jambType,
                                                                                    JambWidth: (jamb === null) ? null : jamb.width,
                                                                                    leftSidelite: lLite,
                                                                                    rightSidelite: rLite,
                                                                                    DoorType: door.type,
                                                                                    productType: ExteriorOrderStyle2Name,
                                                                                    sill: eSill,
                                                                                    Surface: door.species,
                                                                                    DoorPrice: door.price,
                                                                                    Core: "Solid",
                                                                                    JambPrice: (jamb === null) ? 0 : jamb.price,
                                                                                    JambOneSidelite: (jamb === null || jamb.sideliteAdd === null) ? 0 : jamb.sideliteAdd,
                                                                                    JambTwoSidelite: (jamb === null || jamb.doubleSideliteAdd === null) ? 0 : jamb.doubleSideliteAdd,
                                                                                    Manufacturer: door.manufacturer,
                                                                                    Distributor: door.Distributor,
                                                                                    CompanyID: user.CompanyID,
                                                                                    DoorSwing: order.DoorSwing,
                                                                                    OrderName: finalOrderName.Name,
                                                                                    ExtAccessories: acc,
                                                                                    JambPicName: (jamb === null) ? '' : jamb.JambPic,
                                                                                    Notes: order.Notes,
                                                                                    PriceOverride: order.PriceOverride
                                                                                });
                                                                                deferred.resolve();
                                                                            });
                                                                        });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        } else {
                                            deferred.resolve();
                                        }
                                    });
                                });
                                return deferred.promise;
                            })());
                        });
                        Q.allSettled(pWait).then(function() {
                            deferred.resolve(res);
                        });
                    });


                });

            });

        });

        return deferred.promise;

    };

    service.RenameWindowOrder = function(lWebQuoteID, webQuoteID, name) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.WindowOrderNames.all().filter('LWebQuoteID', '=', lWebQuoteID)
                    .and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(results) {
                        if (results.length === 0) {
                            var orderName = {};
                            orderName.LWebQuoteID = lWebQuoteID;
                            orderName.WebQuoteID = webQuoteID;
                            orderName.Name = name;
                            Models.Create(Models.WindowOrderNames, orderName).then(function() {
                                deferred.resolve();
                            });
                        } else {
                            results[0].Name = name;
                            Models.Alter(Models.WindowOrderNames, results[0]).then(function() {
                                deferred.resolve();
                            });
                        }
                    });
            });
        } else {
            $http.post(Config.API.Endpoints.Quotes.RenameWindowOrder, { WebQuoteID: webQuoteID, Name: name }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.RenameOrder = function(lDoorQuoteId, doorQuoteId, orderType, name) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.OrderNames.all().filter('LDoorQuoteID', '=', lDoorQuoteId).and(new persistence.PropertyFilter('Deleted', '=', false))
                    .and(new persistence.PropertyFilter('OrderType', '=', orderType)).list(function(results) {
                        if (results.length === 0) {
                            var orderName = {};
                            orderName.LDoorQuoteID = lDoorQuoteId;
                            orderName.DoorQuoteID = doorQuoteId;
                            orderName.Name = name;
                            orderName.OrderType = orderType;
                            Models.Create(Models.OrderNames, orderName).then(function() {
                                deferred.resolve();
                            });
                        } else {
                            results[0].Name = name;
                            Models.Alter(Models.OrderNames, results[0]).then(function() {
                                deferred.resolve();
                            });
                        }
                    });
            });
        } else {
            $http.post(Config.API.Endpoints.Quotes.RenameOrder, { DoorQuoteID: doorQuoteId, OrderType: orderType, Name: name }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }
        return deferred.promise;
    };

    service.OverrideOrderPrice = function(order, overridePrice) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                if (order.ProductTypeID == DoorsProductTypeId) {
                    if (order.Styles2ID == ExteriorDoorStyles2Id) {
                        Models.ExtOrders.findBy('id', order.LOrderID, function(odr) {
                            odr.PriceOverride = overridePrice;
                            Models.Alter(Models.ExtOrders, odr).then(function() {
                                deferred.resolve();
                            });
                        });
                    } else {
                        Models.DoorOrders.findBy('id', order.LOrderID, function(odr) {
                            odr.PriceOverride = overridePrice;
                            Models.Alter(Models.DoorOrders, odr).then(function() {
                                deferred.resolve();
                            });
                        });
                    }
                } else if (order.ProductTypeID == DeckingProductTypeId) {
                    Models.DeckingOrders.findBy('id', order.LOrderID, function(odr) {
                        odr.PriceOverride = overridePrice;
                        Models.Alter(Models.DeckingOrders, odr).then(function() {
                            deferred.resolve();
                        });
                    });
                } else if (order.ProductTypeID == SidingProductTypeId) {
                    Models.SidingOrders.findBy('id', order.LOrderID, function(odr) {
                        odr.PriceOverride = overridePrice;
                        Models.Alter(Models.SidingOrders, odr).then(function() {
                            deferred.resolve();
                        });
                    });
                } else if (order.ProductTypeID == MouldingProductTypeId) {
                    Models.MouldingOrders.findBy('id', order.LOrderID, function(odr) {
                        odr.PriceOverride = overridePrice;
                        Models.Alter(Models.MouldingOrders, odr).then(function() {
                            deferred.resolve();
                        });
                    });
                } else if (order.ProductTypeID == SkylightProductTypeId) {
                    Models.SkylightOrders.findBy('id', order.LOrderID, function(odr) {
                        odr.PriceOverride = overridePrice;
                        Models.Alter(Models.SkylightOrders, odr).then(function() {
                            deferred.resolve();
                        });
                    });
                }
            });
        } else {
            $http.post(Config.API.Endpoints.Quotes.OverrideOrderPrice, { order: order, overridePrice: overridePrice }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.SaveNotes = function(order, notes) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                if (order.ProductTypeID == DoorsProductTypeId) {
                    if (order.Styles2ID == ExteriorDoorStyles2Id) {
                        Models.ExtOrders.findBy('id', order.LOrderID, function(odr) {
                            odr.Notes = notes;
                            Models.Alter(Models.ExtOrders, odr).then(function() {
                                deferred.resolve();
                            });
                        });
                    } else {
                        Models.DoorOrders.findBy('id', order.LOrderID, function(odr) {
                            odr.Notes = notes;
                            Models.Alter(Models.DoorOrders, odr).then(function() {
                                deferred.resolve();
                            });
                        });
                    }
                } else if (order.ProductTypeID == DeckingProductTypeId) {
                    Models.DeckingOrders.findBy('id', order.LOrderID, function(odr) {
                        odr.Notes = notes;
                        Models.Alter(Models.DeckingOrders, odr).then(function() {
                            deferred.resolve();
                        });
                    });
                } else if (order.ProductTypeID == SidingProductTypeId) {
                    Models.SidingOrders.findBy('id', order.LOrderID, function(odr) {
                        odr.Notes = notes;
                        Models.Alter(Models.SidingOrders, odr).then(function() {
                            deferred.resolve();
                        });
                    });
                } else if (order.ProductTypeID == MouldingProductTypeId) {
                    Models.MouldingOrders.findBy('id', order.LOrderID, function(odr) {
                        odr.Notes = notes;
                        Models.Alter(Models.MouldingOrders, odr).then(function() {
                            deferred.resolve();
                        });
                    });
                } else if (order.ProductTypeID == SkylightProductTypeId) {
                    Models.SkylightOrders.findBy('id', order.LOrderID, function(odr) {
                        odr.Notes = notes;
                        Models.Alter(Models.SkylightOrders, odr).then(function() {
                            deferred.resolve();
                        });
                    });
                }
            });
        } else {
            $http.post(Config.API.Endpoints.Quotes.SaveNotes, { order: order, notes: notes }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }
        return deferred.promise;
    };

    service.CloneOrder = function(order, orderNum) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                if (order.ProductTypeID == DoorsProductTypeId) {
                    if (order.Styles2ID == ExteriorDoorStyles2Id) {
                        Models.ExtOrders.findBy('id', order.LOrderID, function(odr) {
                            var clone = JSON.parse(JSON.stringify(odr._data));
                            if (orderNum) {
                                clone.OrderType = orderNum;
                            }
                            clone.OrderID = null;
                            Models.Create(Models.ExtOrders, clone).then(function() {
                                deferred.resolve();
                            });
                        });
                    } else {
                        Models.DoorOrders.findBy('id', order.LOrderID, function(odr) {
                            var clone = JSON.parse(JSON.stringify(odr._data));
                            if (orderNum) {
                                clone.OrderType = orderNum;
                            }
                            clone.OrderID = null;
                            Models.Create(Models.DoorOrders, clone).then(function() {
                                deferred.resolve();
                            });
                        });
                    }
                } else if (order.ProductTypeID == DeckingProductTypeId) {
                    Models.DeckingOrders.findBy('id', order.LOrderID, function(odr) {
                        var clone = JSON.parse(JSON.stringify(odr._data));
                        if (orderNum) {
                            clone.OrderType = orderNum;
                        }
                        clone.OrderID = null;
                        Models.Create(Models.DeckingOrders, clone).then(function() {
                            deferred.resolve();
                        });
                    });
                } else if (order.ProductTypeID == SidingProductTypeId) {
                    Models.SidingOrders.findBy('id', order.LOrderID, function(odr) {
                        var clone = JSON.parse(JSON.stringify(odr._data));
                        if (orderNum) {
                            clone.OrderType = orderNum;
                        }
                        clone.OrderID = null;
                        Models.Create(Models.SidingOrders, clone).then(function() {
                            deferred.resolve();
                        });
                    });
                } else if (order.ProductTypeID == MouldingProductTypeId) {
                    Models.MouldingOrders.findBy('id', order.LOrderID, function(odr) {
                        var clone = JSON.parse(JSON.stringify(odr._data));
                        if (orderNum) {
                            clone.OrderType = orderNum;
                        }
                        clone.OrderID = null;
                        Models.Create(Models.MouldingOrders, clone).then(function() {
                            deferred.resolve();
                        });
                    });
                } else if (order.ProductTypeID == SkylightProductTypeId) {
                    Models.SkylightOrders.findBy('id', order.LOrderID, function(odr) {
                        var clone = JSON.parse(JSON.stringify(odr._data));
                        if (orderNum) {
                            clone.OrderType = orderNum;
                        }
                        clone.OrderID = null;
                        Models.Create(Models.SkylightOrders, clone).then(function() {
                            deferred.resolve();
                        });
                    });
                } else if (order.ProductTypeID == WindowProductTypeId) {
                    Models.WebQuotes.findBy('id', order.LWebQuoteID, function(quote) {
                        var jsonQuote = JSON.parse(quote.jsonQuote);
                        var findLineItem = function() {
                            var data = null;
                            _.each(order.WindowList, function(win) {
                                if (jsonQuote.windowOrderList !== undefined && jsonQuote.windowOrderList !== null) {
                                    _.each(jsonQuote.windowOrderList, function(wItem) {
                                        if (wItem.lineItem !== undefined && wItem.lineItem !== null) {
                                            _.each(wItem.lineItem, function(lineItem) {
                                                if (lineItem.windowList !== undefined && lineItem.windowList !== null) {
                                                    _.each(lineItem.windowList, function(wLItem) {
                                                        if (wLItem.UUID === win.UUID) {
                                                            data = {
                                                                lineItem: lineItem,
                                                                wItem: wItem
                                                            };
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                            return data;
                        };
                        var data = findLineItem();
                        var lineItem = data.lineItem;
                        var wItem = data.wItem;
                        var newLine = JSON.parse(JSON.stringify(lineItem));
                        _.each(newLine.windowList, function(win) {
                            win.UUID = uuid.v4();
                        });
                        wItem.lineItem.push(newLine);
                        quote.jsonQuote = JSON.stringify(jsonQuote);
                        Models.Alter(Models.WebQuotes, quote).then(function() {
                            deferred.resolve();
                        });
                    });
                } else {
                    deferred.resolve();
                }
            });
        } else {
            if (order.ProductTypeID == WindowProductTypeId) {
                //console.log(order.WindowList);
                $http.post(Config.API.Endpoints.Quotes.CloneOrder, {
                    id: order.OrderID,
                    productType: order.productType,
                    DoorQuoteID: order.DoorQuoteID,
                    UUID: order.WindowList[0].SelectedWindow.UUID
                }).then(function(data) {
                    deferred.resolve(data.data);
                }, function() {
                    deferred.reject();
                });
            } else {
                $http.post(Config.API.Endpoints.Quotes.CloneOrder, {
                    id: order.OrderID,
                    productType: order.productType,
                    DoorQuoteID: order.DoorQuoteID,
                    UUID: ""
                }).then(function(data) {
                    deferred.resolve(data.data);
                }, function() {
                    deferred.reject();
                });
            }
        }

        return deferred.promise;
    };

    service.CloneOrderCard = function(orderCard, orderNum) {
        var def = Q.defer();
        var waitOrders = [];
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                if (orderCard.items !== undefined && orderCard.items.length > 0 && orderCard.items[0].ProductTypeID === WindowProductTypeId) {
                    var id = orderCard.items[0].LWebQuoteID;
                    Models.WebQuotes.findBy('id', id, function(quote) {
                        var clone = JSON.parse(JSON.stringify(quote._data));
                        Models.Create(Models.WebQuotes, clone).then(function() {
                            def.resolve();
                        });
                    });
                } else {
                    orderCard.items.forEach(function(order) {
                        var deferred = Q.defer();
                        waitOrders.push(deferred);
                        service.CloneOrder(order, orderNum).then(function() {
                            deferred.resolve();
                        });
                    });
                    Q.allSettled(waitOrders).then(function() {
                        def.resolve();
                    });
                }
            });
        } else {
            $http.post(Config.API.Endpoints.Quotes.CloneOrderCard, {
                DoorQuoteID: orderCard.items[0].DoorQuoteID,
                OrderType: orderCard.items[0].OrderType,
                ProductTypeID: orderCard.items[0].ProductTypeID
            }).then(function(data) {
                def.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return def.promise;
    };


    service.DeleteOrder = function(order) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                if (order.ProductTypeID == DoorsProductTypeId) {
                    if (order.Styles2ID == ExteriorDoorStyles2Id) {
                        Models.ExtOrders.findBy('id', order.LOrderID, function(odr) {
                            odr.Deleted = true;
                            Models.Alter(Models.ExtOrders, odr).then(function() {
                                deferred.resolve();
                            });
                        });
                    } else {
                        Models.DoorOrders.findBy('id', order.LOrderID, function(odr) {
                            odr.Deleted = true;
                            Models.Alter(Models.DoorOrders, odr).then(function() {
                                deferred.resolve();
                            });
                        });
                    }
                } else if (order.ProductTypeID == DeckingProductTypeId) {
                    Models.DeckingOrders.findBy('id', order.LOrderID, function(odr) {
                        odr.Deleted = true;
                        Models.Alter(Models.DeckingOrders, odr).then(function() {
                            deferred.resolve();
                        });
                    });
                } else if (order.ProductTypeID == SidingProductTypeId) {
                    Models.SidingOrders.findBy('id', order.LOrderID, function(odr) {
                        odr.Deleted = true;
                        Models.Alter(Models.SidingOrders, odr).then(function() {
                            deferred.resolve();
                        });
                    });
                } else if (order.ProductTypeID == MouldingProductTypeId) {
                    Models.MouldingOrders.findBy('id', order.LOrderID, function(odr) {
                        odr.Deleted = true;
                        Models.Alter(Models.MouldingOrders, odr).then(function() {
                            deferred.resolve();
                        });
                    });
                } else if (order.ProductTypeID == SkylightProductTypeId) {
                    Models.SkylightOrders.findBy('id', order.LOrderID, function(odr) {
                        odr.Deleted = true;
                        Models.Alter(Models.SkylightOrders, odr).then(function() {
                            deferred.resolve();
                        });
                    });
                } else if (order.ProductTypeID == WindowProductTypeId) {
                    Models.WebQuotes.findBy('id', order.LWebQuoteID, function(webquote) {
                        if (webquote.jsonQuote !== undefined && webquote.jsonQuote !== null && webquote.jsonQuote !== "") {
                            var jsonQuote = JSON.parse(webquote.jsonQuote);
                            _.each(order.WindowList, function(win) {
                                if (jsonQuote.windowOrderList !== undefined && jsonQuote.windowOrderList !== null) {
                                    _.each(jsonQuote.windowOrderList, function(wItem) {
                                        if (wItem.lineItem !== undefined && wItem.lineItem !== null) {
                                            _.each(wItem.lineItem, function(lineItem) {
                                                if (lineItem.windowList !== undefined && lineItem.windowList !== null) {
                                                    lineItem.windowList = _.reject(lineItem.windowList, function(wlItem) {
                                                        return wlItem.UUID === win.UUID;
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                            webquote.jsonQuote = JSON.stringify(jsonQuote);
                            Models.Alter(Models.WebQuotes, webquote).then(function(webquote) {
                                deferred.resolve();
                            });
                        } else {
                            deferred.resolve();
                        }
                    });
                } else {
                    deferred.reject();
                }
            });
        } else {
            if (order.ProductTypeID == WindowProductTypeId) {
                $http.post(Config.API.Endpoints.Quotes.DeleteOrder, {
                    id: order.OrderID,
                    productType: order.productType,
                    DoorQuoteID: order.DoorQuoteID,
                    UUID: order.WindowList[0].SelectedWindow.UUID
                }).then(function(data) {
                    deferred.resolve(data.data);
                }, function() {
                    deferred.reject();
                });
            } else {
                $http.post(Config.API.Endpoints.Quotes.DeleteOrder, {
                    id: order.OrderID,
                    productType: order.productType,
                    DoorQuoteID: order.DoorQuoteID,
                    UUID: ""
                }).then(function(data) {
                    deferred.resolve(data.data);
                }, function() {
                    deferred.reject();
                });
            }
        }
        return deferred.promise;
    };

    service.DeleteOrderCard = function(orderCard) {
        var def = Q.defer();
        var waitOrders = [];
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                orderCard.items.forEach(function(order) {
                    var deferred = Q.defer();
                    waitOrders.push(deferred);
                    service.DeleteOrder(order).then(function() {
                        deferred.resolve();
                    });
                });
                Q.allSettled(waitOrders).then(function() {
                    def.resolve();
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Quotes.DeleteOrderCard, {
                DoorQuoteID: orderCard.items[0].DoorQuoteID,
                OrderType: orderCard.items[0].OrderType,
                productType: orderCard.items[0].productType
            }).then(function(data) {
                def.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }
        return def.promise;
    };

    service.DeleteMasterQuote = function(mq) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.Delete(Models.MasterQuote, mq).then(function(mq) {
                    Models.Settings.all().filter('LMasterQuoteID', '=', mq.id).list(function(settings) {
                        var pWait = [];
                        settings.forEach(function(setting) {
                            pWait.push((function() {
                                var deferred = Q.defer();
                                Models.Delete(Models.Settings, setting).then(function(setting) {
                                    deferred.resolve();
                                });
                                return deferred.promise;
                            })());
                        });
                        Q.allSettled(pWait).then(function() {
                            deferred.resolve();
                        });
                    });
                });
            });
        } else {
            $http.post(Config.API.Endpoints.Quotes.DeleteMasterQuote, { masterQuoteId: mq.MasterQuoteID }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.ManageMasterQuote = function(mq) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                if (mq.id !== undefined && mq.id !== null && mq.id !== '') {
                    Models.Alter(Models.MasterQuote, mq).then(function(mq) {
                        deferred.resolve(mq);
                    });
                } else {
                    mq.CreatedDateTime = '/Date(' + (new Date().getTime()) + ')/';
                    Models.Create(Models.MasterQuote, mq).then(function(mq) {
                        deferred.resolve(mq);
                    });
                }
            });
        } else {
            $http.post(Config.API.Endpoints.Quotes.ManageMasterQuote, { masterQuote: mq }).then(function(data) {
                deferred.resolve(data.data.Data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.BreakoutOrders = function(odrs) {
        var orders = {};
        var filtered = [];
        filtered = odrs.filter(function(or) {
            if (or.ProductTypeID == WindowProductTypeId) {
                return true;
            }
        });
        orders.Windows = filtered;
        filtered = odrs.filter(function(or) {
            if (or.Styles2ID == ExteriorDoorStyles2Id) {
                return true;
            }
        });
        orders.ExteriorDoors = filtered;
        filtered = odrs.filter(function(or) {
            if (Number(or.Styles2ID) === Number(RawGlassStyles2Id)) {
                return true;
            }
        });
        orders.RawGlass = filtered;

        filtered = odrs.filter(function(or) {
            if (or.ProductTypeID !== WindowProductTypeId && or.Styles2ID !== ExteriorDoorStyles2Id && Number(or.Styles2ID) !== Number(RawGlassStyles2Id)) {
                return true;
            }
        });

        orders.Other = filtered;
        return orders;
    };

    service.GenPdf = function(LMasterQuoteID, excluded, userId, jobName, showLinePricing, MasterQuoteID) {
        var deferred = Q.defer();
        service.GetAllOrders(userId, LMasterQuoteID, MasterQuoteID).then(function(quotes) {
            var splitOrders = service.BreakoutOrders(quotes);
            $('#fbPDFform-userId').val(userId.toString());
            $('#fbPDFform-excluded').val(excluded);
            $('#fbPDFform-jobName').val(jobName);
            $('#fbPDFform-data').val(JSON.stringify(splitOrders.Other));
            $('#fbPDFform-windowData').val(JSON.stringify(splitOrders.Windows));
            $('#fbPDFform-exteriorData').val(JSON.stringify(splitOrders.ExteriorDoors));
            $('#fbPDFform-rawGlassData').val(JSON.stringify(splitOrders.RawGlass));
            $('#fbPDFform-showLinePricing').val(showLinePricing);
            $('#fbPDFform').submit();
            deferred.resolve();
        });
        return deferred.promise;
    };

    service.GenDataExport = function(MasterQuoteID, userId) {
        var deferred = Q.defer();
        service.GetAllOrders(userId, MasterQuoteID, MasterQuoteID).then(function(quotes) {
            var splitOrders = service.BreakoutOrders(quotes);
            $('#fbExportform-masterQuoteId').val(MasterQuoteID);
            $('#fbExportform-userId').val(userId);
            $('#fbExportform').submit();
            deferred.resolve();
        });
        return deferred.promise;
    };

    service.EagleExport = function(MasterQuoteID, UserID) {
        var deferred = Q.defer();
        $http.post(Config.API.Endpoints.Quotes.EpicorEagleExport, { MQID: MasterQuoteID, UID: UserID }).then(function(data) {
            deferred.resolve(data.data);
        }, function() {
            deferred.reject();
        });
        return deferred.promise;
    };

    return service;

});
