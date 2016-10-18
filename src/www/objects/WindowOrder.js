function WindowOrder(obj) {
    this.id = null;
    this.quote_id = null;
    this.manufacturer = null;
    this.productLine = null;
    this.exteriorColor = "None";
    this.frameColor = "White";
    this.gridPattern = "none";
    this.glassType = "lowe_1";
    this.gridType = null;
    this.onFactor = 0;
    this.markup = 0;
    this.doorOnFactor = 0;
    this.doorMarkup = 0;
    this.totalCost = 0;
    this.error = false;
    this.lineItem = [];
    this.mapsOptionList = [];
    this.salesTax = 0;
    this.defaultDoorLine = null;

    this.initialize = function(qId, mf, line, selected, pConfig) {
        this.manufacturer = mf;
        this.productLine = line;
        this.quote_id = qId;
        if (pConfig) {
            for (var i in pConfig.mapOptions) {
                var mapOpt = pConfig.mapOptions[i];
                if (mapOpt.multiSelect === false) {
                    this.addDynamicOption(mapOpt);
                }
            }
        }
    };

    this.getSqFt = function() {
        var sqft = 0;
        for (var i in this.lineItem) {
            sqft += this.lineItem[i].getSqFt() * this.lineItem[i].quantity;
        }
        return sqft;
    };


    this.getNetSqFt = function() {
        var sqft = 0;
        for (var i in this.lineItem) {
            sqft += this.lineItem[i].getNetSqFt();
        }
        return sqft;
    };

    this.getAvgUValue = function() {
        var currentVal;
        var totalUVal = 0;
        var totalSqft = 0;
        for (var i in this.lineItem) {
            currentVal = this.lineItem[i].getUValues();
            for (var j in currentVal) {
                var val = currentVal[j];
                if (val.uVal > 0) {
                    totalUVal += (val.uVal * val.sqft);
                    totalSqft += val.sqft;
                }
            }
        }

        if (totalSqft === 0) {
            totalSqft = 1;
        }
        return totalUVal / totalSqft;
    };

    this.getAvgSHGC = function() {
        var currentVal;
        var totalSqft = 0;
        var totalSHGC = 0;
        for (var i in this.lineItem) {
            currentVal = this.lineItem[i].getSHGCValues();
            for (var j in currentVal) {
                var val = currentVal[j];
                if (val.shgc > 0) {
                    totalSHGC += (val.shgc * val.sqft);
                    totalSqft += val.sqft;
                }
            }
        }
        if (totalSqft === 0) {
            totalSqft = 1;
        }
        return totalSHGC / totalSqft;
    };

    this.getWindowCount = function() {
        var count = 0;
        for (var i in this.lineItem) {
            count += this.lineItem[i].windowList.length * this.lineItem[i].quantity;
        }
        return count;
    };



    this.createNewLineItem = function(newId) {
        var item = new WindowLineItem();
        item.initialize(this.id, 1);
        if (newId) {
            item.id = newId;
        } else {
            item.id = this.getNewLineId();
        }
        this.lineItem.push(item);
        return item;
    };

    this.getNewLineId = function() {
        var id = 0;
        var line;
        for (var i in this.lineItem) {
            line = this.lineItem[i];
            if (id <= line.id) {
                id = line.id + 1;
            }
        }
        return id;
    };

    this.getLineById = function(lineID) {
        for (var i = 0; i < this.lineItem.length; i++) {
            if (this.lineItem[i].id == lineID) {
                return this.lineItem[i];
            }
        }
    };

    this.getLineByIndex = function(lineIndex) {
        if (this.lineItem.length > lineIndex) {
            return this.lineItem[lineIndex];
        }
        return null;
    };

    this.addDynamicOption = function(option) {
        if (this.getDynamicOptionByName(option.name) === null || this.getDynamicOptionByName(option.name) === undefined) {
            option.selected = true;
            this.mapsOptionList.push(new MapsOption(option));
            return this.mapsOptionList.length;
        }
    };

    this.setDynamicOptionCost = function(name, priceKey) {
        var opt = this.getDynamicOptionByName(name);
        if (!opt.multiSelect) {
            opt.selectedKeys = [];
        }
        if (opt) {
            if (opt.selectedKeys.indexOf(priceKey) >= 0) {
                opt.removeCost(priceKey);
                return false;
            } else {
                opt.setCost(priceKey);
                return true;
            }
        }
    };

    this.getLockStyle = function() {
        for (var i in this.mapsOptionList) {
            var opt = this.mapsOptionList[i];
            if (opt.name.indexOf("Lock") > -1) {
                return opt.selectedKeys[0];
            }
        }
    };

    this.getDynamicOptionByName = function(name) {
        var option;
        for (var i in this.mapsOptionList) {
            option = this.mapsOptionList[i];
            if (option.name == name) {
                return option;
            }
        }
    };

    this.getVendorCost = function(pConfig, laborItem) {
        var cost = 0;
        for (var i in this.lineItem) {
            cost += this.lineItem[i].getVendorCost(this, pConfig, laborItem) * this.lineItem[i].quantity;
        }
        return cost;
    };



    this.setOptionDenominator = function(lineIndex, windowIndex, optionName, denom) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].setOptionDenominator(windowIndex, optionName, denom);
        }
    };

    this.setLocationForLine = function(lineIndex, loc) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].location = loc;
        }
    };

    this.setHalfGridForWindow = function(lineIndex, windowId) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].setHalfGridForWindow(windowId);
        }
    };

    this.setTemperTypeForWindow = function(lineIndex, windowId, tType) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].setTemperType(windowId, tType);
        }
    };

    this.removeWindow = function(lineIndex, windowId) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].removeWindow(windowId);
        }
    };

    this.centerLineItem = function(lineIndex) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].centerLineItem();
        }
    };

    this.setNotesForLine = function(lineIndex, notes) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].notes = notes;
        }
    };

    this.toggleOptionForWindow = function(lineId, windowId, option, value) {
        var line = this.getLineById(lineId);
        if (line) {
            return line.toggleOption(windowId, option, value);
        }
    };

    this.setTDLForWindow = function(lineIndex, windowIndex, tdlHeight) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].setTDLForWindow(windowIndex, tdlHeight);
        }
    };

    this.addTdlBar = function(lineIndex, windowId, startInch, isVertical) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].addTdlBar(windowId, startInch, isVertical);
        }
    };

    this.removeTdlBar = function(lineIndex, windowId, tdlIndex) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].removeTdlBar(windowId, tdlIndex);
        }
    };

    this.setQuantityForLine = function(lineIndex, quantity) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].quantity = quantity;
        }
    };


    this.setFinType = function(finType) {
        for (var i in this.lineItem) {
            this.lineItem[i].setFinType(finType);
        }
    };

    this.calculateOrderPrice = function(salesTaxRate, addOnCosts, exchangeRate, labor, info) {
        this.totalCost = 0;

        this.salesTax = 0;
        var laborTax = 0;
        var laborTotal = 0;
        if (!salesTaxRate) {
            salesTaxRate = 0;
        }
        var pConfig = info.lines[this.productLine];
        if (labor) {
            //the user can tell the app to apply markups to labor charges or not
            // from the settings page.      
            var markup = 1;
            if (labor.applyMarkup) {
                markup = pConfig.markup / 100 + 1;
            }
            //Only two of the labor options get priced at the order level.
            if (labor.name == "total add") {
                laborTotal = markup * labor.cost;
            } else if (labor.name == "hourly") {
                laborTotal = (markup * labor.cost * labor.quantity);
            }
            laborTax = laborTotal * (salesTaxRate / 100);
            this.salesTax += laborTax;
            this.totalCost += laborTotal + laborTax;
        }

        //Check our config object to load up all the relevent onfactors and markups
        //if this brand uses seperate door markups feed them to the next algorithm,
        //or else the regular markup and onfactor for door and windows.
        var dMarkup, dOnFactor;
        if (pConfig.hasDoorMultipliers) {
            dMarkup = this.doorMarkup;
            dOnFactor = this.doorOnFactor;
        } else {
            dMarkup = this.markup;
            dOnFactor = this.onFactor;
        }
        //calculate the price for each line and add it to the total
        for (var i in this.lineItem) {
            var line = this.lineItem[i];
            this.totalCost += (line.quantity * line.calculateLinePrice(salesTaxRate, exchangeRate, this.markup, this.onFactor, labor, info, this.productLine, this.mapsOptionList, dOnFactor, dMarkup));
            this.salesTax += line.getSalesTax(salesTaxRate);
        }
        if (addOnCosts) {
            for (var io in addOnCosts) {
                if (salesTaxRate) {
                    var addOnTax = addOnCosts[io].price * (salesTaxRate / 100);
                    this.salesTax += addOnTax;
                    addOnCosts[io].taxTotal = addOnTax;
                }
                this.totalCost += (Number(addOnCosts[io].price) + Number(addOnCosts[io].taxTotal)) * Number(addOnCosts[io].quantity);
            }
        }
        this.totalCost += this.salesTax;
        this.totalCost = this.totalCost * this.onFactor;
        this.totalCost = this.totalCost * ((this.markup / 100) + 1);
        return this.totalCost;
    };

    this.hasErrors = function() {
        for (var i in this.lineItem) {
            if (this.lineItem[i].hasErrors()) {
                return true;
            }
        }
        return false;
    };

    this.setWindowOptionForAll = function(optionName, priceKey) {
        for (var i in this.lineItem) {
            this.lineItem[i].setWinowOptionForAll(optionName, priceKey);
        }
    };

    this.setWindowOptionById = function(optionName, priceKey, windowId, lineIndex, value) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].setWindowOptionById(optionName, priceKey, windowId, value);
        }
    };

    this.setToTopForWindow = function(windowIndex, lineIndex, toTopWindowIndex) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].setToTopForWindow(windowIndex, toTopWindowIndex);
        }
    };

    this.setToBottomForWindow = function(windowIndex, lineIndex, toBottomWindowIndex) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].setToBottomForWindow(windowIndex, toBottomWindowIndex);
        }
    };

    this.setToLeftForWindow = function(windowIndex, lineIndex, toLeftWindowIndex) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].setToLeftForWindow(windowIndex, toLeftWindowIndex);
        }
    };

    this.setToRightForWindow = function(windowIndex, lineIndex, toRightWindowIndex) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].setToRightForWindow(windowIndex, toRightWindowIndex);
        }
    };

    this.setRowForWindow = function(windowIndex, lineIndex, rows) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].setRowsForWindow(windowIndex, rows);
        }
    };

    this.setColForWindow = function(windowIndex, lineIndex, cols) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].setColumnsForWindow(windowIndex, cols);
        }
    };

    this.setLegHeightForWindow = function(windowId, lineIndex, legHeight, legFraction) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].setLegHeightForWindow(windowId, legHeight, legFraction);
        }
    };

    this.setTopDownHeightForWindow = function(windowId, lineIndex, height) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem[lineIndex].setTopDownHeightForWindow(windowId, height);
        }
    };

    this.removeLine = function(lineIndex) {
        if (this.lineItem.length > lineIndex) {
            this.lineItem.splice(lineIndex, 1);
        }
    };

    this.flipWindow = function(lineIndex, windowId) {
        if (this.lineItem.length > lineIndex) {
            return this.lineItem[lineIndex].flipWindow(windowId);
        }
    };

    this.getLineItem = function(lineIndex) {
        if (this.lineItem.length > lineIndex) {
            return this.lineItem[lineIndex];
        }
    };

    this.setExteriorColor = function(color) {
        this.exteriorColor = color;
        for (var i in this.lineItem) {
            this.lineItem[i].setExteriorColorForAll(color);
        }
    };

    this.setFrameColor = function(color) {
        this.frameColor = color;
        for (var i in this.lineItem) {
            this.lineItem[i].setFrameColorForAll(color);
        }
    };

    this.setGlassType = function(gType) {
        this.glassType = gType;
        for (var i in this.lineItem) {
            this.lineItem[i].setGlassTypeForAll(gType);
        }
    };

    this.setGridType = function(gType) {
        this.gridType = gType;
        for (var i in this.lineItem) {
            this.lineItem[i].setGridTypeForAll(gType);
        }

    };

    this.setGridPattern = function(gPattern) {
        this.gridPattern = gPattern;
        for (var i in this.lineItem) {
            this.lineItem[i].setGridPatternForAll(gPattern);
        }
    };

    this.setGridPatternForWindow = function(pattern, lineIndex, windowId) {
        var item = this.getLineItem(lineIndex);
        if (item) {
            item.setGridPatternForWindow(pattern, windowId);
        }
    };

    this.setGlassColorForWindow = function(color, lineIndex, windowId) {
        var item = this.getLineItem(lineIndex);
        if (item) {
            item.setGlassColorForWindow(color, windowId);
        }
    };


    for (var prop in obj) {
        if (prop == "WindowOrderID") {
            this.id = obj[prop];
        } else if (prop == "lineItem") {
            this.lineItem = [];
            for (var p in obj[prop]) {
                var item = new WindowLineItem(obj[prop][p]);
                this.lineItem.push(item);
            }
        } else if (prop == "mapsOptionList") {
            this.mapsOptionList = [];
            for (var pr in obj[prop]) {
                var option = new MapsOption(obj[prop][pr]);
                this.mapsOptionList.push(option);
            }

        } else {
            this[prop] = obj[prop];
        }
    }

}
