function Quote(obj) {
    var selectedLine;

    this.id = 0;
    this.customerId = 0;
    this.jobName = "";
    this.projectName = "";
    this.date = null;
    this.lineIcons = {};
    this.quoteDetails = new QuoteDetails();
    this.laborCharge = {};
    this.windowOrderList = [];
    this.windowOrderBitmap = null;
    this.addOnCharge = [];
    this.windowIdCounter = 1;
    this.fromDroid = false;

    this.initialize = function(sId, sCustomerId, job, project, sDate) {
        id = sId;
        customerId = sCustomerId;
        jobName = job;
        projectName = project;
        date = sDate;
        windowOrderList = [];
        windowOrderBitmap = [];
        addOnCharge = [];
    };

    //calculate the total of all add on charges for this quote.
    this.addOnChargeTotal = function() {
        var cost = 0;
        for (var charge in this.addOnCharge) {
            cost += (this.addOnCharge[charge].price * this.addOnCharge[charge].quantity);
        }
        return cost;
    };

    this.centerLineItem = function(lineIndex) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].centerLineItem(lineIndex);
        }
    };

    //add new charge, and return it.
    this.createNewAddOnCharge = function(name, cost, qty) {
        var charge = {
            description: name,
            price: cost,
            quantity: qty,
            taxTotal: 0
        };
        this.addOnCharge.push(charge);
    };

    //remove charge from quote;
    this.removeAddOnCharge = function(index) {
        this.addOnCharge.splice(index, 1);
    };

    //flip a given window in each order.
    this.flipWindow = function(lineIndex, windowId) {
        var flipped;
        for (var i in this.windowOrderList) {
            flipped = this.windowOrderList[i].flipWindow(lineIndex, windowId);
        }
        return flipped;
    };

    //Set notes for a given line item in each order.
    this.setLineItemNotes = function(lineIndex, notes) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setNotesForLine(lineIndex, notes);
        }
    };

    this.removeLineItem = function(lineIndex) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].removeLine(lineIndex);
        }
    };

    //sets an option with a given name to the given price key.
    //every window option can have multiple prices depending on other options
    //the price keys allow you to change the options cost.
    this.setWindowOptionForAll = function(option, priceKey) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setWindowOptionForAll(option, priceKey);
        }
    };



    this.setWindowOptionById = function(option, priceKey, windowId, lineIndex, value) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setWindowOptionById(option, priceKey, windowId, lineIndex, value);
        }
    };

    this.setHalfGridForWindow = function(lineIndex, windowId) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setHalfGridForWindow(lineIndex, windowId);
        }
    };

    this.removeWindow = function(lineIndex, windowId) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].removeWindow(lineIndex, windowId);
        }
    };

    //Certain windows can have special temper values such has left,right,top or bottom.
    //These are stored in the windows temper type field.
    this.setTemperTypeForWindow = function(lineIndex, windowId, tType) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setTemperTypeForWindow(lineIndex, windowId, tType);
        }
    };

    //Remove a WindowOrder from the quotes Order list.
    this.removeWindowOrder = function(manufact, line) {
        for (var i in this.windowOrderList) {
            if (this.windowOrderList[i].manufacturer == manufact &&
                this.windowOrderList[i].productLine == line) {
                this.windowOrderList.splice(i, 1);
                break;
            }

        }
    };

    //remove any lineitems in any order that do not have a window in them.
    this.clearEmptyLines = function() {
        for (var i in this.windowOrderList) {
            var order = this.windowOrderList[i];
            for (var j in order.lineItem) {
                if (order.lineItem[j].windowList.length === 0) {
                    order.removeLine(j);
                }
            }
        }
    };

    //Global grid types are grid types set for all windows in all orders.
    this.getGlobalGridType = function() {
        if (!this.quoteDetails) {
            this.quoteDetails = new QuoteDetails(this.id);
        }
        return this.quoteDetails.gridType;
    };

    this.getGlobalFinType = function() {
        if (!this.quoteDetails) {
            this.quoteDetails = new QuoteDetails(this.id);
        }
        return this.quoteDetails.finType;
    };

    this.setGlobalFinType = function(finType) {
        if (!this.quoteDetails) {
            this.quoteDetails = new QuoteDetails(this.id);
        }
        this.quoteDetails.finType = finType;
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setFinType(finType);
        }
    };




    this.setQuantityForLine = function(lineIndex, quantity) {
        var count = 0;
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setQuantityForLine(lineIndex, quantity);
        }
    };

    //Get all order objects that are of a given manufacturer name;
    this.getOrdersByMf = function(mf) {
        var orderList = [];
        for (var i in this.windowOrderList) {
            var order = this.windowOrderList[i];
            if (order.manufacturer == mf) {
                orderList.push(order);
            }
        }
        return orderList;
    };

    this.getOrder = function(mf, line) {
        for (var i in this.windowOrderList) {
            var order = this.windowOrderList[i];
            if (order.manufacturer == mf && order.productLine == line) {
                return order;
            }
        }
    };

    this.getOrderIndex = function(mf, line) {
        for (var i in this.windowOrderList) {
            var order = this.windowOrderList[i];
            if (order.manufacturer == mf && order.productLine == line) {
                return i;
            }
        }
    };

    //Toggle a WindowOption to selected or deselected in every order.
    this.toggleOptionForWindow = function(lineId, windowId, optionName, value) {
        var selected;
        var thisOpt;
        for (var i in this.windowOrderList) {
            thisOpt = this.windowOrderList[i].toggleOptionForWindow(lineId, windowId, optionName, value);
            if (thisOpt) {
                selected = thisOpt;
            }
        }
        return selected;
    };

    this.setDynamicOption = function(option, priceKey, mf, line) {
        var order = this.getOrder(mf, line);
        if (order) {
            order.addDynamicOption(option);
            return order.setDynamicOptionCost(option.name, priceKey);
        }
    };

    this.setGlobalGridType = function(gridType) {
        if (!this.quoteDetails) {
            this.quoteDetails = new QuoteDetails(id);
        }
        this.quoteDetails.gridType = gridType;
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setGridType(gridType);
        }
    };


    this.setLocationForLine = function(lineIndex, location) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setLocationForLine(lineIndex, location);
        }
    };

    this.setGlobalGridPattern = function(gridPattern) {
        if (!this.quoteDetails) {
            this.quoteDetails = new QuoteDetails(id);
        }
        this.quoteDetails.gridPattern = gridPattern;
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setGridPattern(gridPattern);
        }
    };

    this.setGridPatternForWindow = function(pattern, lineIndex, windowId) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setGridPatternForWindow(pattern, lineIndex, windowId);
        }
    };

    this.setGlassColorById = function(color, lineIndex, windowId) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setGlassColorForWindow(color, lineIndex, windowId);
        }
    };

    this.getDate = function() {
        return date;
    };

    this.updateExteriorColorForOrder = function(color, mf, line) {
        var order = this.getOrder(mf, line);
        if (order) {
            order.setExteriorColor(color);
        }
    };

    this.updateFrameColorForOrder = function(color, mf, line) {
        var order = this.getOrder(mf, line);
        if (order) {
            order.setFrameColor(color);
        }
    };

    this.updateGlassType = function(mf, line, glassType) {
        var order = this.getOrder(mf, line);
        if (order) {
            order.setGlassType(glassType);
        }
    };


    this.setTDLForWindow = function(lineIndex, windowIndex, tdlHeight) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setTDLForWindow(lineIndex, windowIndex, tdlHeight);
        }
    };

    this.addTdlBar = function(lineIndex, windowId, startInch, isVertical) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].addTdlBar(lineIndex, windowId, startInch, isVertical);
        }
    };

    this.removeTdlBar = function(lineIndex, windowId, startInch, isVertical, tdlIndex) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].removeTdlBar(lineIndex, windowId, startInch, isVertical, tdlIndex);
        }
    };

    this.isMfInOrder = function(mf) {
        var orders = this.getOrdersByMf(mf);
        if (!orders || orders.length === 0) {
            return false;
        }
        return true;
    };

    this.getMfNamesInOrder = function() {
        var names = [];
        for (var i in this.windowOrderList) {
            var mfName = this.windowOrderList[i].manufacturer;
            if (names.indexOf(mfName) == -1) {
                names.push(mfName);
            }
        }
        return names;
    };

    this.setWindowBindingForAll = function(lineIndex, connectTo, direction, windowID) {

        for (var i = 0; i < this.windowOrderList.length; i++) {
            var line = this.windowOrderList[i].getLineByIndex(lineIndex);
            line.changeWindowBinding(windowID, direction, connectTo);
        }
    };

    this.setToTopForWindow = function(windowIndex, lineIndex, toTopWindowIndex) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setToTopForWindow(windowIndex, lineIndex, toTopWindowIndex);
        }
    };

    this.setToBottomForWindow = function(windowIndex, lineIndex, toBottomWindowIndex) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setToBottomForWindow(windowIndex, lineIndex, toBottomWindowIndex);
        }
    };

    this.setToRightForWindow = function(windowIndex, lineIndex, toRightWindowIndex) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setToRightForWindow(windowIndex, lineIndex, toRightWindowIndex);
        }
    };

    this.setToLeftForWindow = function(windowIndex, lineIndex, toLeftWindowIndex) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setToLeftForWindow(windowIndex, lineIndex, toLeftWindowIndex);
        }
    };

    this.setRowForWindow = function(windowIndex, lineIndex, rows) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setRowForWindow(windowIndex, lineIndex, rows);
        }
    };

    this.setColumnsForWindow = function(windowIndex, lineIndex, cols) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setColForWindow(windowIndex, lineIndex, cols);
        }
    };

    this.setLegHeightForWindow = function(windowIndex, lineIndex, legHeight, legFraction) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setLegHeightForWindow(windowIndex, lineIndex, legHeight, legFraction);
        }
    };

    this.setTopDownHeightForWindow = function(windowIndex, lineIndex, height) {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].setTopDownHeightForWindow(windowIndex, lineIndex, height);
        }
    };

    this.setDefaultDoorForOrder = function(mf, line, doorLine) {
        var order = this.getOrder(mf, line);
        if (order) {
            order.defaultDoorLine = doorLine;
        }
    };

    this.addEmptyLineItem = function() {
        for (var i in this.windowOrderList) {
            this.windowOrderList[i].createNewLineItem();
        }
    };

    this.populateNewWindow = function(json, widthFrac, heightFrac) {

        var newWindow = new WindowModel(json.window);

        var order = this.getOrder(newWindow.mfct, json.orderProdLine);
        newWindow.setFinType(this.quoteDetails.finType);
        newWindow.heightFraction = heightFrac;
        newWindow.widthFraction = widthFrac;
        newWindow.setExteriorColor(order.exteriorColor);
        newWindow.setFrameColor(order.frameColor);
        newWindow.setGlassType(order.glassType);
        newWindow.setGridPattern(order.gridPattern);
        newWindow.setGridType(order.gridType);
        newWindow.glassColor = this.quoteDetails.glassColor;
        return newWindow;
    };

    this.setGlobalGlassColor = function(color) {
        this.quoteDetails.glassColor = color;
        for (var i in this.windowOrderList) {
            for (var j in this.windowOrderList[i].lineItem) {
                for (var k in this.windowOrderList[i].lineItem[j].windowList) {
                    this.windowOrderList[i].lineItem[j].windowList[k].glassColor = color;
                }
            }
        }
    };

    this.addClosestDoor = function(width, widthFrac, height, heightFrac, doorType, mf, prodLine, selectedOrder, lineItemId, transomHeight, transomHeightFrac, roundToBook) {
        var savedQuote = this;
        selectedLine = lineItemId;
        var currentOrder;
        var mfToUse, lineToUse;

        var callback = function(json) {
            var window = savedQuote.populateNewWindow(json, widthFrac, heightFrac);
            var order = savedQuote.getOrder(window.mfct, json.orderProdLine);
            if (selectedLine > order.lineItem.length - 1) {
                savedQuote.addEmptyLineItem(selectedLine);
            }
            order.getLineById(selectedLine).addWindow(window);
            if (transomHeight && transomHeight > 0) {
                savedQuote.addWindow(window.realWidth, transomHeight, "Patio Door", "Transom", lineItemId, window.mfct, window.prodLine, (window.id + 1), function(json) {
                    var window = savedQuote.populateNewWindow(json, widthFrac, heightFrac);
                    var order = savedQuote.getOrder(window.mfct, json.orderProdLine);
                    var door = order.getLineById(selectedLine).windowList[0];
                    window.toBottom = door.id;
                    door.toTop = window.id;
                    order.getLineById(selectedLine).addWindow(window);
                    $(document).trigger('new-window', [window]);

                }, null, false, json.orderProdLine);
            } else {
                $(document).trigger('new-window', [window]);
            }
        };

        for (var i in this.windowOrderList) {
            currentOrder = this.windowOrderList[i];
            var orderToUse;
            if (currentOrder == selectedOrder) {
                orderToUse = selectedOrder;
                mfToUse = mf;
                lineToUse = prodLine;
            } else {
                mfToUse = currentOrder.manufacturer;
                lineToUse = currentOrder.defaultDoorLine;
                orderToUse = currentOrder;
            }

            this.addWindow(width, height, "Patio Door", doorType, lineItemId, mfToUse, lineToUse, this.windowIdCounter, callback, null, roundToBook, orderToUse.productLine);
        }
    };

    this.addClosestWindow = function(width, height, type, subType, lineitemID, toTop, toBottom, toLeft, toRight, widthFrac, heightFrac, mfNotUsed, prodLine) {
        var savedQuote = this;
        selectedLine = lineitemID;

        var callback = function(windowJSON) {
            var line = windowJSON.orderProdLine;

            var window = new WindowModel(windowJSON.window);
            window.heightFraction = heightFrac;
            window.setFinType(savedQuote.quoteDetails.finType);
            window.widthFraction = widthFrac;
            var order = savedQuote.getOrder(window.mfct, window.prodLine);
            if (toTop > 0) {
                window.toTop = toTop;
            }
            if (toBottom > 0) {
                window.toBottom = toBottom;
            }

            if (toLeft > 0) {
                window.toLeft = toLeft;
            }
            if (toRight > 0) {
                window.toRight = toRight;
            }
            window.setExteriorColor(order.exteriorColor);
            window.frameColor = order.frameColor;
            window.setGlassType(order.glassType);
            window.setGridPattern(order.gridPattern);
            order.lineItem[selectedLine].addWindow(window);
            $(document).trigger('new-window', [window]);

        };

        for (var i = 0; i < this.windowOrderList.length; i++) {
            var mf = this.windowOrderList[i].manufacturer;
            var line = this.windowOrderList[i].productLine;
            this.addWindow(width, height, type, subType, lineitemID, mf, line, this.windowIdCounter, callback, null, true);
        }
        this.windowIdCounter++;
    };

    this.addWindowToAll = function(width, height, type, subType, lineitemID, toTop, toBottom, toLeft, toRight, widthFrac, heightFrac) {
        var savedQuote = this;

        selectedLine = lineitemID;

        var callback = function(windowJSON) {
            var window = savedQuote.populateNewWindow(windowJSON, widthFrac, heightFrac);
            var order = savedQuote.getOrder(window.mfct, windowJSON.orderProdLine);
            if (toTop > 0) {
                window.toTop = toTop;
            }
            if (toBottom > 0) {
                window.toBottom = toBottom;
            }

            if (toLeft > 0) {
                window.toLeft = toLeft;
            }
            if (toRight > 0) {
                window.toRight = toRight;
            }
            if (Constants.legWindowTypes.indexOf(window.subtype) >= 0) {
                window.legHeight = window.realHeight / 2;
            }

            order.getLineById(selectedLine).addWindow(window);
            $(document).trigger('new-window', [window]);

        };

        for (var i = 0; i < this.windowOrderList.length; i++) {
            var mf = this.windowOrderList[i].manufacturer;
            var line = this.windowOrderList[i].productLine;
            this.addWindow(width, height, type, subType, lineitemID, mf, line, this.windowIdCounter, callback, null, false, line);
        }
        this.windowIdCounter++;
    };

    this.changeProductLine = function(manufacturer, brandToChange, newBrand, lineIndex) {
        var savedQuote = this;
        var targetOrder = this.getOrder(manufacturer, brandToChange);

        var callback = function(windowJSON, windowToCopy) {
            var window = savedQuote.populateNewWindow(windowJSON, windowToCopy.widthFrac, windowToCopy.heightFrac);
            var order = thisOrder.getOrder(window.mfct, json.orderProdLine);
            if (windowToCopy) {
                window.toLeft = windowToCopy.toLeft;
                window.toRight = windowToCopy.toRight;
                window.windowLineItemId = windowToCopy.windowLineItemId;
                window.toTop = windowToCopy.toTop;
                window.toBottom = windowToCopy.toBottom;
                window.id = windowToCopy.id;
                window.legHeight = windowToCopy.legHeight;
                window.temperType = windowToCopy.temperType;
                window.widthFraction = windowToCopy.widthFraction;
                window.heightFraction = windowToCopy.heightFraction;
                window.gridPattern = windowToCopy.gridPattern;
                window.glassType = newOrder.glassType;
                window.glassColor = windowToCopy.glassColor;
                window.rows = windowToCopy.rows;
                window.columns = windowToCopy.columns;
                window.isFlipped = windowToCopy.isFlipped;
                window.topDownHeight = windowToCopy.topDownHeight;
                window.setFrameColor(order.frameColor);
                window.setExteriorColor(order.exteriorColor);
                window.tdlHeight = windowToCopy.tdlHeight;

                window.setFinType(thisQuote.quoteDetails.finType);
                for (var op in window.options) {
                    var newOpt = window.options[op];
                    var copyOpt = windowToCopy.getOption(newOpt.name);
                    if (copyOpt) {
                        newOpt.selected = copyOpt.selected;
                        newOpt.setCost(copyOpt.priceKey);
                    }
                }
            }

            order.getLineById(window.windowLineItemId).getWindow(window.id); // = window;
            $(document).trigger('new-window', [window]);

        };

        if (targetOrder) {
            var line = targetOrder.lineItem[lineIndex];
            for (var i in line.windowList) {
                var windowToReplace = line.windowList[i];
                this.addWindow(windowToReplace.realWidth, windowToReplace.realHeight, windowToReplace.type,
                    windowToReplace.subtype, lineIndex, manufacturer, newBrand, windowToReplace.id,
                    callback, windowToReplace, !windowToReplace.isCustomDoor, brandToChange);

            }
        } else {
            return "error";
        }
    };

    this.addWindow = function(width, height, type, subType, lineitemID, mf, doorProdLine, winID, callback, windowToCopy, useBookDims, orderProdLine) {
        if (useBookDims) {
            //netGetClosestDoor(width, height, type, subType, mf, doorProdLine, lineitemID, winID, callback, windowToCopy, orderProdLine);
             ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_WINDOW_SVC.GetClosestDoor(width, height, mf, doorProdLine, type, subType, lineitemID, winID, orderProdLine)).then(function(json) {
                if (callback) {
                    callback(json, windowToCopy);
                }
            });
        } else {
            //netGetWindow(width, height, type, subType, mf, doorProdLine, lineitemID, winID, callback, windowToCopy, orderProdLine);
             ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_WINDOW_SVC.GetWindow(width, height, mf, doorProdLine, type, subType, lineitemID, winID, orderProdLine)).then(function(json) {
                console.log(json);
                if (callback) {
                    callback(json, windowToCopy);
                } else {
                    firstWindow(json);
                }
            });
        }
    };

    //Create a new window order by copying over all the information from an existing line
    //or adding a new empty order.
    this.createWindowOrder = function(mf, line, info) {
        var thisOrder = this;
        var pConfig = info.lines[line.replace('_', ' ')];
        if (!this.windowOrderList) {
            this.windowOrderList = [];
        }

        //check to see if order exists
        var newOrder = this.getOrder(mf, line);

        if (!newOrder) {
            newOrder = new WindowOrder();
            newOrder.initialize(this.id, mf, line, true, pConfig);

            newOrder.glassType = this.quoteDetails.glassType;
            newOrder.gridType = this.quoteDetails.gridType;
            newOrder.gridPattern = this.quoteDetails.gridPattern;
            newOrder.markup = pConfig.markup;
            newOrder.onFactor = pConfig.onFactor;
            newOrder.defaultDoorLine = pConfig.defaultDoorLine;

            if (pConfig.doorOnFactor && pConfig.hasDoors === true) {
                newOrder.doorOnFactor = pConfig.doorOnFactor;
            }
            if (pConfig.doorMarkup && pConfig.hasDoors === true) {
                newOrder.doorMarkup = pConfig.doorMarkup;
            }

            var toCopy = this.getOrdersOfSameMf(mf, line);
            if (toCopy) {
                newOrder.exteriorColor = toCopy.exteriorColor;
                newOrder.frameColor = toCopy.frameColor;
                newOrder.glassType = toCopy.glassType;
                newOrder.gridType = toCopy.gridType;
                for (var i in toCopy.mapOptions) {
                    var configOpt = toCopy.getMapOptions[i];
                    var newMapOpt = pConfig.mapOptions[configOpt.name];
                    newMapOpt.clearSelectedKeys();
                    for (var j in configOpt.selectedKeys) {
                        newMapOpt.selectedKeys.push(configOpt.selectedKeys[j]);
                    }
                    newOrder.addDynamicOption(newMapOpt);
                }

                this.windowOrderList.push(newOrder);
            } else {
                //If no orders by the same manufacturer exist, get any existing order.
                if (this.windowOrderList.length === 0) {
                    //this is the first order. 
                    newOrder.createNewLineItem();
                    this.windowOrderList.push(newOrder);
                    return newOrder;
                } else {
                    toCopy = this.windowOrderList[0];
                    this.windowOrderList.push(newOrder);
                }
            }
            //copy over all the windows in the line item, hitting the server to get the new pricing info.
            var thisQuote = this;

            var callback = function(json, windowToCopy) {
                var line = json.orderProdLine;

                var window = new WindowModel(json.window);
                var order = thisOrder.getOrder(window.mfct, json.orderProdLine);
                if (windowToCopy) {
                    window.toLeft = windowToCopy.toLeft;
                    window.toRight = windowToCopy.toRight;
                    window.windowLineItemId = windowToCopy.windowLineItemId;
                    window.toTop = windowToCopy.toTop;
                    window.toBottom = windowToCopy.toBottom;
                    window.id = windowToCopy.id;
                    window.legHeight = windowToCopy.legHeight;
                    window.temperType = windowToCopy.temperType;
                    window.widthFraction = windowToCopy.widthFraction;
                    window.heightFraction = windowToCopy.heightFraction;
                    window.gridPattern = windowToCopy.gridPattern;
                    window.glassType = newOrder.glassType;
                    window.glassColor = windowToCopy.glassColor;
                    window.rows = windowToCopy.rows;
                    window.columns = windowToCopy.columns;
                    window.isFlipped = windowToCopy.isFlipped;
                    window.topDownHeight = windowToCopy.topDownHeight;
                    window.setFrameColor(order.frameColor);
                    window.setExteriorColor(order.exteriorColor);
                    window.tdlHeight = windowToCopy.tdlHeight;

                    window.setFinType(thisQuote.quoteDetails.finType);
                    for (var op in window.options) {
                        var newOpt = window.options[op];
                        var copyOpt = windowToCopy.getOption(newOpt.name);
                        if (copyOpt) {
                            newOpt.selected = copyOpt.selected;
                            newOpt.setCost(copyOpt.priceKey);
                        }
                    }
                }

                order.getLineById(window.windowLineItemId).addWindow(window);
                $(document).trigger('new-window', [window]);
            };

            for (var li in toCopy.lineItem) {
                var copyLine = toCopy.lineItem[li];
                var newLine = newOrder.createNewLineItem(copyLine.id);
                newLine.location = copyLine.location;
                newLine.quantity = copyLine.quantity;
                newLine.notes = copyLine.notes;
                for (var w in copyLine.windowList) {
                    var copyWindow = copyLine.windowList[w];
                    var roundToBook = false;
                    if (copyWindow.type == "Patio Door") {
                        roundToBook = true;
                        line = newOrder.defaultDoorLine;
                    } else {
                        line = newOrder.productLine;
                    }

                    this.addWindow(copyWindow.realWidth, copyWindow.realHeight, copyWindow.type, copyWindow.subtype, copyLine.id, mf,
                        line, copyWindow.id, callback, copyWindow, roundToBook, newOrder.productLine);


                }
            }

        }
    };

    this.getOrdersOfSameMf = function(mf, line) {
        var mfs = [];
        for (var i in this.windowOrderList) {
            var order = this.windowOrderList[i];
            if (order.manufacturer == mf && order.productLine != line) {
                return order;
            }
        }
    };


    for (var prop in obj) {
        if (prop == "QuoteID") {
            this.id = obj[prop];
        } else if (prop == "windowOrderList") {
            this.windowOrderList = [];
            for (var p in obj[prop]) {
                var order = new WindowOrder(obj[prop][p]);
                this.windowOrderList.push(order);
            }
        } else if (prop == "quoteDetails") {
            this[prop] = new QuoteDetails(obj[prop]);
        } else {
            this[prop] = obj[prop];
        }
    }

}
