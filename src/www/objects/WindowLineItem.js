function swapWindow(old_index, new_index, list) {
    if (new_index >= list.length) {
        var k = new_index - list.length;
        while ((k--) + 1) {
            list.push(undefined);
        }
    }
    list.splice(new_index, 0, list.splice(old_index, 1)[0]);
    return list;
}

function WindowLineItem(obj) {
    this.id = null;
    this.windowOrderId = null;
    this.windowList = [];
    this.includeMullCharges = true;
    this.quantity = 0;
    this.priceInDollars = 0;
    this.mullCharges = 0;
    this.fallBackBrand = null;
    this.tempFraction = null;
    this.heightFraction = null;
    this.widthFraction = null;
    this.location = null;
    this.notes = null;
    this.realWidth = 0;
    this.realHeight = 0;
    this.mullTax = 0;
    this.priceOverride = null;

    this.initialize = function(nId, qty) {
        this.id = nId;
        this.quantity = qty;
    };

    this.getSqFt = function() {
        var sf = 0;
        for (var i in this.windowList) {
            sf += this.windowList[i].getSqFt();
        }
        return sf;
    };

    this.getNetSqFt = function() {
        var sf = 0;
        var denom = this.getNetDenoms();
        for (var i in this.windowList) {
            var window = this.windowList[i];
            var dims = calculateNet(window, true, denom.width, denom.height);
            var wSf = (dims[0].wholeNum + (dims[0].fraction.num / dims[0].fraction.denom)) *
                (dims[1].wholeNum + (dims[1].fraction.num / dims[1].fraction.denom));
            sf += (wSf / 144);
        }
        return sf * this.quantity;

    };

    this.getUValues = function() {
        var value = 0;
        var listLength = 0;
        var totalSqft = 0;
        var windowValues = [];
        for (var i in this.windowList) {
            var val = this.windowList[i].getUValue();
            if (val > 0) {
                totalSqft = this.windowList[i].getSqFt();
                windowValues.push({ sqft: totalSqft, uVal: val });
            }
        }

        return windowValues;
    };

    this.getSHGCValues = function() {
        var value = 0;
        var listLength = 0;
        var totalSqft = 0;
        var currentSqft = 0;
        var windowValues = [];
        for (var i in this.windowList) {
            var val = this.windowList[i].getSHGC();
            if (val > 0) {
                currentSqft = this.windowList[i].getSqFt();
                windowValues.push({ sqft: currentSqft, shgc: val });
                //totalSqft += currentSqft;
            }
        }
        return windowValues;
    };


    this.setTemperType = function(windowId, temperType) {
        var window = this.getWindowById(windowId);
        if (window) {
            window.setTemperType(temperType);
        }
    };

    this.setHalfGridForWindow = function(windowId) {
        var window = this.getWindowById(windowId);
        if (window) {
            window.setHalfGrid();
        }
    };

    this.hasErrors = function() {
        for (var i in this.windowList) {
            if (this.windowList[i].hasErrors()) {
                return true;
            }
        }
        return false;
    };

    this.getWindowIndexFromId = function(id) {
        for (var i in this.windowList) {
            var window = this.windowList[i];
            if (window.id == id) {
                return i;
            }
        }
    };

    this.getWindow = function(windowIndex) {
        if (this.windowList.length > windowIndex) {
            return this.windowList[windowIndex];
        }
    };

    this.getWindowById = function(id) {
        for (var i in this.windowList) {
            var win = this.windowList[i];
            if (win.id == id) {
                return win;
            }
        }
    };

    this.flipWindow = function(windowId) {
        var window = this.getWindowById(windowId);
        if (window) {
            if (window.isFlipped) {
                window.isFlipped = false;
            } else {
                window.isFlipped = true;
            }
            return window.isFlipped;
        }
    };

    this.setOptionDenominator = function(windowIndex, option, denom) {
        var window = this.getWindow(windowIndex);
        if (window) {
            window.setOptionDenominator(option, denom);
        }
    };


    this.changeWindowBinding = function(winID, direction, connectID) {
        //var window = this.getWindowById(winID);
        var connectedWindow = this.getWindowById(connectID);
        switch (direction) {

            case "top":
                //      window.toTop = connectedWindow.id;
                connectedWindow.toTop = winID;
                break;

            case "bottom":

                //    window.toBottom = connectID;
                connectedWindow.toBottom = winID;
                break;

            case "left":

                connectedWindow.toLeft = winID;
                //  window.toLeft = connectID;
                break;

            case "right":

                connectedWindow.toRight = winID;
                //window.toRight = connectID;
                break;

        }

    };

    this.setGlassTypeForAll = function(glassType) {
        for (var i in this.windowList) {
            this.windowList[i].setGlassType(glassType);
        }
    };

    this.setExteriorColorForAll = function(color) {
        for (var i in this.windowList) {
            this.windowList[i].setExteriorColor(color);
        }
    };

    this.setFrameColorForAll = function(color) {
        for (var i in this.windowList) {
            this.windowList[i].setFrameColor(color);
        }
    };



    this.centerLineItem = function() {
        var centerCandidate;
        var candidateConnections = 0;
        var numConnections;
        var window;
        var selectedIndex = 0;
        for (var i in this.windowList) {
            numConnections = 0;
            window = this.windowList[i];
            if (!centerCandidate) {
                centerCandidate = window;
                selectedIndex = i;
            }
            if (window.toRight) {
                numConnections++;
            }
            if (window.toLeft) {
                numConnections++;
            }
            if (window.toTop) {
                numConnections++;
            }
            if (window.toBottom) {
                numConnections++;
            }
            if (candidateConnections < numConnections) {
                selectedIndex = i;
                centerCandidate = window;
                candidateConnections = numConnections;
            } else if (candidateConnections == numConnections) {
                if ((window.realWidth * window.realHeight) > (centerCandidate.realWidth * centerCandidate.realHeight)) {
                    selectedIndex = i;
                    centerCandidate = window;
                    candidateConnections = numConnections;
                }
            }

        }
        if (this.windowList && this.windowList.length > 0) {
            swapWindow(selectedIndex, 0, this.windowList);
        }
    };

    this.setToTopForWindow = function(windowIndex, toTopIndex) {
        var window = this.getWindow(windowIndex);
        if (window) {
            var toTopWin = this.getWindow(toTopIndex);
            if (toTopWin) {
                window.toTop = toTopWin.id;
                toTopWin.toBottom = window.id;
            }
        }
    };

    //Gets the height of a given window compared to other windows in the line. Used to correctly center the window icons.
    this.getHeightRatio = function(window) {
        var win = this.getWindowById(window.id);
        var ratio = 0;
        if (win) {
            for (var i in this.windowList) {
                var otherWin = this.windowList[i];
                if (otherWin != win) {
                    var val = win.realHeight / otherWin.realHeight;
                    if (val > ratio) {
                        ratio = val;
                    }
                }
            }
        }
        return ratio;
    };
    this.getWidthRatio = function(window) {
        var win = this.getWindowById(window.id);
        var ratio = 0;
        if (win) {
            for (var i in this.windowList) {
                var otherWin = this.windowList[i];
                if (otherWin != win) {
                    var val = win.realWidth / otherWin.realWidth;
                    if (val > ratio) {
                        ratio = val;
                    }
                }
            }
        }
        return ratio;
    };

    this.setToBottomForWindow = function(windowIndex, toBottomIndex) {
        var window = this.getWindow(windowIndex);
        if (window) {
            var toBottomWin = this.getWindow(toBottomIndex);
            if (toBottomWin) {
                window.toBottom = toBottomWin.id;
                toBottomWin.toTop = window.id;
            }
        }
    };

    this.setToRightForWindow = function(windowIndex, toRightIndex) {
        var window = this.getWindow(windowIndex);
        if (window) {
            var toRightWin = this.getWindow(toRightIndex);
            if (toRightWin) {
                window.toRight = toRightWin.id;
                toRightWin.toLeft = window.id;
            }
        }
    };

    this.setToLeftForWindow = function(windowIndex, toLeftIndex) {
        var window = this.getWindow(windowIndex);
        if (window) {
            var toLeftWin = this.getWindow(toLeftIndex);
            if (toLeftWin) {
                window.toLeft = toLeftWin.id;
                toLeftWin.toRight = window.id;
            }
        }
    };

    this.setRowsForWindow = function(windowIndex, rows) {
        var window = this.getWindow(windowIndex);
        if (window) {
            window.rows = rows;
        }
    };

    this.addTdlBar = function(windowId, startInch, isVertical) {
        var window = this.getWindowById(windowId);
        if (window) {
            window.addTdlBar(startInch, isVertical);
        }
    };
    this.removeTdlBar = function(windowId, tdlIndex) {
        var window = this.getWindowById(windowId);
        if (window) {
            window.removeTdlBar(tdlIndex);
        }
    };

    this.setColumnsForWindow = function(windowIndex, columns) {
        var window = this.getWindow(windowIndex);
        if (window) {
            window.columns = columns;
        }
    };

    this.setLegHeightForWindow = function(windowId, legHeight, legFraction) {
        var window = this.getWindowById(windowId);
        if (window) {
            window.legHeight = legHeight;
            if (legFraction) {
                window.legFraction = legFraction;
            }
        }
    };

    this.setTopDownHeightForWindow = function(windowId, height) {
        var window = this.getWindowById(windowId);
        if (window) {
            window.topDownHeight = height;
        }
    };

    this.toggleOption = function(windowId, option, value) {
        var window = this.getWindowById(windowId);
        if (window) {
            if (value === true || value === false) {
                window.setOption(option, value);
                return value;
            } else {
                return window.toggleOption(option);
            }
        }
    };

    this.setWindowOptionById = function(optionName, priceKey, windowId, value) {
        var window = this.getWindowById(windowId);
        if (window) {
            if (priceKey) {
                window.setOptionPriceKey(optionName, priceKey);
            }
            if (value !== null) {
                window.setOption(optionName, value);
            }
        }
    };

    this.setGridPatternForWindow = function(pattern, windowId) {
        var window = this.getWindowById(windowId);
        if (window) {
            window.setGridPattern(pattern);
        }
    };

    this.setGlassColorForWindow = function(color, windowId) {
        var window = this.getWindowById(windowId);
        if (window) {
            window.setGlassColor(color);
        }
    };



    this.setGridTypeForAll = function(type) {
        for (var i in this.windowList) {
            this.windowList[i].setGridType(type);
        }
    };

    this.setGridPatternForAll = function(pattern) {
        for (var i in this.windowList) {
            this.windowList[i].setGridPattern(pattern);
            if (this.windowList[i].rows === 0 || this.windowList[i].columns === 0) {
                this.windowList[i].setRowColToDefault();
            }
        }
    };

    this.formatDimensions = function() {
        var width = this.getLineWidth();
        var line = width;
        if (this.widthFraction && this.widthFraction.num > 0) {
            line += " <small><sup>" + this.widthFraction.num + "</sup>/<sub>" + this.widthFraction.denom + "</sub></small>";
        }

        line += " x " + this.getLineHeight();
        if (this.heightFraction !== null && this.heightFraction.num > 0) {
            line += "<small><sup>" + this.heightFraction.num + "</sup>/<sub>" + this.heightFraction.denom + "</sub></small>";
        }
        return line;
    };

    this.getLineWidth = function() {
        var width = 0;
        var newWidth;
        var tempFrac;
        var window;
        for (var i in this.windowList) {
            window = this.windowList[i];
            tempFrac = window.widthFraction;
            if (!tempFrac) {
                tempFrac = new Fraction();
            }
            newWidth = this.crawlWidth(window, tempFrac);
            if (newWidth > width) {
                width = newWidth;
                this.widthFraction = this.tempFraction;
            }
        }
        if (this.widthFraction && this.widthFraction.plus) {
            width = width + this.widthFraction.plus;
        }
        this.realWidth = width;
        return width;
    };

    this.crawlWidth = function(window, fraction) {
        var width = window.realWidth;
        this.tempFraction = fraction;
        if (window.toRight > 0) {
            var winToRight = this.getWindowById(window.toRight);
            if (winToRight && winToRight.widthFraction) {
                var newFrac = fraction.addThis(winToRight.widthFraction);
                fraction = newFrac;
                return width + this.crawlWidth(winToRight, fraction);
            } else {
                if (winToRight && winToRight.id != window.id) {
                    return width + this.crawlWidth(winToRight, winToRight.widthFraction);
                }
            }
        }
        return width;
    };

    this.getLineHeight = function() {
        var height = 0;
        var newHeight;
        var tempFrac;
        var window;
        for (var i in this.windowList) {
            window = this.windowList[i];
            tempFrac = window.heightFraction;
            if (!tempFrac) {
                tempFrac = new Fraction();
            }
            newHeight = this.crawlHeight(window, tempFrac);
            if (newHeight > height) {
                height = newHeight;
                this.heightFraction = this.tempFraction;
            }
        }
        if (this.heightFraction && this.heightFraction.plus) {
            height = height + this.heightFraction.plus;
        }
        this.realHeight = height;
        return height;
    };

    this.crawlHeight = function(window, fraction) {
        this.tempFraction = fraction;
        var height = window.realHeight;
        if (window.toTop > 0) {
            var winToTop = this.getWindowById(window.toTop);
            if (winToTop && winToTop.HeightFraction) {
                var newFrac = fraction.addThis(toTop.heightFraction);
                fraction = newFrac;
                return height + this.crawlHeight(winToTop, fraction);
            } else {
                if (winToTop && winToTop.id != window.id) {
                    return height + this.crawlHeight(winToTop, winToTop.heightFraction);
                }
            }
        }
        return height;
    };

    this.addWindow = function(window) {
        this.windowList.push(window);
        return this.windowList.length;
    };

    this.getAndersenMullCharge = function(linealLength, charge) {
        return (linealLenght / 12) * charge;
    };

    this.hasDoor = function() {
        for (var w in this.windowList) {
            if (this.windowList[w].type == "Patio Door") {
                return true;
            }
        }
        return false;
    };

    this.getSalesTax = function(salesTaxRate) {
        var tax = 0;
        for (var i in this.windowList) {
            tax += this.windowList[i].salesTax;
        }
        if (this.mullCharges) {
            tax += (this.mullCharges * salesTaxRate);
        }
        return tax * this.quantity;
    };

    this.setFinType = function(finType) {
        for (var i in this.windowList) {
            this.windowList[i].setFinType(finType);
        }
    };

    this.calculateLinePrice = function(salesTax, exchangeRate, markup, onFactor,
        laborCharge, mfInfo, productLine, mapsOptions, doorOnFactor, doorMarkup) {
        var pConfig;
        this.priceInDollars = 0;
        this.mullCharges = 0;
        if (this.hasErrors()) {
            return this.priceInDollars;
        }
        if (!salesTax) {
            salesTax = 0;
        }

        //make sure a config object exists for this product line.
        if (!mfInfo) {
            //TODO: report error if no configuration is found for a given line.
            for (var i in this.windowList) {
                this.windowList[i].isError = true;
            }
            return this.priceInDollars;
        }

        //Price each window.
        pConfig = mfInfo.lines[productLine];
        var window;
        for (var io in this.windowList) {
            window = this.windowList[io];
            //patio door uses different markups/onfactors
            if (window.type == "Patio Door") {
                if (!doorOnFactor) {
                    doorOnFactor = pConfig.doorOnFactor;
                }
                if (!doorMarkup) {
                    doorMarkup = pConfig.doorMarkup;
                }
                this.priceInDollars += window.calculatePrice(salesTax, mfInfo.manufacturer, laborCharge, doorMarkup, doorOnFactor, exchangeRate, pConfig, mapsOptions);
            } else {

                this.priceInDollars += window.calculatePrice(salesTax, mfInfo.manufacturer, laborCharge, markup, onFactor, exchangeRate, pConfig, mapsOptions);
            }
        }

        //calculate mull charges
        if (this.windowList.length > 1) {
            //this array is used to assure we don't count the same edge twice
            //for a pair of connected windows.
            var winIds = [];
            if (mfInfo.manufacturer == "PlyGem" && this.isVerticalSliderMull()) {
                //a very weird case for a special type of plygem mull.
                this.mullCharges = -80;
            } else if ((mfInfo.manufacturer == "Milgard" || mfInfo.manufacturer == "Plygem" || mfInfo.manufacturer == "Atrium") && this.hasDoor()) {
                this.mullCharges = 0;
            } else if (mfInfo.manufacturer == "Jeld-Wen" && this.hasDoor()) {
                this.mullCharges = 50;
            } else {
                this.mullCharges = (this.windowList.length - 1) * pConfig.combination;
            }
        }
        /*
        if (onFactor > 100) {
            this.mullCharges = this.mullCharges * (onFactor / 1000);
        } else {
            this.mullCharges = this.mullCharges * (onFactor / 100);
        }
        
        this.mullCharges = this.mullCharges * ((markup / 100) + 1);*/
        if (this.includeMullCharges) {
            this.mullTax = this.mullCharges * (salesTax / 100);
            this.priceInDollars += this.mullCharges + this.mullTax;
        }

        return this.priceInDollars;
    };



    this.getVendorCost = function(order, pConfig, laborItem) {
        var price = 0;
        if (!order) {
            return price;
        }
        for (var i in this.windowList) {
            price += this.windowList[i].getVendorCost(order, pConfig, laborItem);
        }
        var adjustedMull = this.mullCharges - this.mullTax;
        adjustedMull = this.mullCharges / ((order.markup / 100) + 1);
        adjustedMull += this.mullTax;
        price += adjustedMull;
        return price;
    };

    this.removeWindow = function(windowId) {
        var window = this.getWindowById(windowId);
        if (window) {
            this.replaceAllIdInstances(windowId, 0);
            var index = this.windowList.indexOf(window);
            this.windowList.splice(index, 1);
        }
    };

    //change the id of all mulls in the line item that match first param.
    this.replaceAllIdInstances = function(currentId, newId) {
        var win;
        for (var i in this.windowList) {
            win = this.windowList[i];
            if (win.toTop == currentId) {
                win.toTop = newId;
            }
            if (win.toBottom == currentId) {
                win.toBottom = newId;
            }
            if (win.toLeft == currentId) {
                win.toLeft = newId;
            }
            if (win.toRight == currentId) {
                win.toRight = newId;
            }
        }
    };


    //Atrium has this weird mulling rule with a certain kind of mull that actually subtracts from the window's price.
    //When a picture and a slider are mulled.
    this.isVerticalSliderMull = function() {
        var winNames = ["Slider", "Picture"];

        if (this.windowList.length == 2) {
            if (winNames.indexOf(this.windowList[0].type) != -1) {
                winNames.splice(winNames.indexOf(windowList[0].type), 1);
                if (winNames.indexOf(this.windowList[1].type != -1)) {
                    return true;
                }
            }
        }
        return false;
    };

    this.getNetDenoms = function() {
        var window;
        var wDenom = 2,
            hDenom = 2;
        for (var i in this.windowList) {
            window = this.windowList[i];
            if (window.toRight > 0) {
                wDenom += 2;
            }
            if (window.toBottom > 0) {
                hDenom += 2;
            }
        }
        return {
            width: wDenom,
            height: hDenom
        };
    };

    for (var prop in obj) {
        if (prop == "WindowLineItemID") {
            this.id = obj[prop];
        } else if (prop == "windowList") {
            this.windowList = [];
            for (var p in obj[prop]) {
                var window = new WindowModel(obj[prop][p]);
                this.windowList.push(window);
            }
        } else if (prop == "widthFraction" || prop == "heightFraction") {
            this[prop] = new Fraction(obj[prop]);
        } else {
            this[prop] = obj[prop];
        }
    }

}
