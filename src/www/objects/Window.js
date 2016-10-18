function WindowModel(obj) {

    this.id = null;
    this.windowLineItemId = null;
    this.options = [];
    this.tdlBars = [];
    this.toLeft = null;
    this.toRight = null;
    this.toTop = null;
    this.toBottom = null;
    this.temperType = "";
    this.type = null;
    this.subtype = null;
    this.frameColor = null;
    this.exteriorColor = "None";
    this.fallbackMf = null;
    this.glassType = "lowe_1";
    this.gridType = "none";
    this.isCustomDoor = false;
    this.isFlipped = null;
    this.isError = null;
    this.pricingWidth = null;
    this.pricingHeight = null;
    this.realWidth = null;
    this.realHeight = null;
    this.quantity = null;
    this.salesTax = 0;
    this.rows = null;
    this.columns = null;
    this.priceUSD = null;
    this.basePriceUSD = null;
    this.widthFraction = null;
    this.heightFraction = null;
    this.legHeight = null;
    this.legFraction = null;
    this.topDownHeight = 12;
    this.gridPattern = "none";
    this.glassColor = "none";
    this.EnergyValue = null;
    this.uVal = 0;
    this.shgc = 0;

    this.initialize = function(nId, lineId, nType, subType, rWidth, rHeight) {
        this.id = nId;
        this.WindowLineItemId = lineId;
        this.type = nType;
        this.subtype = subType;
        this.realWidth = rWidth;
        this.readHeight = rHeight;
    };

    this.addTdlBar = function(dimension, isVertical) {
        var newTdl = {
            startInch: dimension,
            isVertical: isVertical
        };
        if (!this.tdlBars) {
            this.tdlBars = [];
        }
        this.tdlBars.push(newTdl);
    };

    this.removeTdlBar = function(tdlIndex) {
        this.tdlBars.splice(tdlIndex, 1);
    };

    this.getName = function() {
        if (this.subtype == "Slider") {
            if (this.isFlipped === true) {
                return "OX";
            }
            return "XO";
        }

        if (this.subtype == "Casement") {
            if (this.isFlipped) {
                return "Casement left";
            }
            return "Casement right";
        }

        return this.subtype;
    };

    //Based on the dimensions of this window, and the type of grid set,
    //calculate a default number of grid rows and columns.
    this.setRowColToDefault = function() {
        if (!this.gridPattern) {
            this.gridPattern = "none";
        }

        if (this.gridPattern == "top down") {
            this.columns = Math.round(this.realWidth / 12);
            this.topDownHeight = 12;
            this.rows = 1;
            //Sliders always have even number of columns
            if (this.columns % 2 !== 0 && this.type.toLowerCase() === "slider" || this.subtype.toLowerCase() === "patio door") {
                this.columns++;
            }
            //always start with at least two columns.
            if (this.columns < 2) {
                this.columns = 2;
            }
        } else if (this.gridPattern == "full" || this.gridPattern == "colonial") {
            this.rows = Math.round(this.realHeight / 12);

            if (this.subtype == "3 Panel") {
                this.columns = 9;
                this.rows = 6;
            } else if (this.subtype == "4 Panel") {
                this.columns = 12;
                this.rows = 6;
            } else if (this.subtype == "Patio Door") {
                this.columns = 6;
                this.rows = 6;
            } else {
                this.columns = Math.round(this.realWidth / 12);
                //Sliders always have even number of columns
                if (this.columns % 2 !== 0 && (this.type.toLowerCase() === "slider" || this.subtype.toLowerCase() === "patio Door")) {
                    this.columns++;
                }
                //Single Hungs always have even number of rows to start.
                if (this.rows % 2 !== 0 && this.type.toLowerCase() === "single hung") {
                    this.rows++;
                }
                //always start with at least two columns and rows.
                if (this.columns < 2) {
                    this.columns = 2;
                }
                if (this.rows < 2) {
                    this.rows = 2;
                }
            }
        }
    };

    this.setHalfGrid = function() {
        if (this.mfct != "Atrium") {
            var gridOpt = this.getOption("grid");
            if (gridOpt) {
                if (gridOpt.denominator == 2) {
                    gridOpt.setDenominator(1);
                } else {
                    gridOpt.setDenominator(2);
                }
            }
        }
    };

    this.getBoxCount = function() {
        var boxCount = 0;
        if (!this.gridPattern || this.gridPattern == "none") {
            return boxCount;
        } else if (this.gridPattern == "perimeter") {
            return 9;
        } else {
            boxCount = this.rows * this.columns;
            if (this.gridPattern == "top down") {
                boxCount++;
                if (this.subtype == "Slider" || this.subtype == "Single hung" || this.subtype == "Patio Door") {
                    boxCount++;
                } else if (this.subtype == "xox" || this.subtype == "3 Panel") {
                    boxCount += 2;
                } else if (this.subtype == "4 Panel") {
                    boxCount += 3;
                }
            }
            return boxCount;
        }

    };

    this.isHalfGrid = function() {
        var gridOpt = this.getOption("grid");
        if (gridOpt && gridOpt.denominator == 2) {
            return true;
        }
        return false;
    };

    this.setFinType = function(finType) {
        var opt = this.getOption('fin');
        if (opt) {
            opt.setCost(finType);
            opt.selected = true;
        }
    };

    this.getOption = function(optName) {
        var target;
        for (var i in this.options) {
            target = this.options[i];
            if (target.name == optName) {
                return target;
            }
        }
    };

    this.getSqFt = function() {
        var widthFracVal = 0;
        var heightFracVal = 0;
        if (this.widthFraction) {
            widthFracVal = (this.widthFraction.num / this.widthFraction.denom);
        }
        if (this.heightFraction) {
            heightFracVal = (this.heightFraction.num / this.heightFraction.denom);
        }
        return ((this.realWidth + widthFracVal) / 12) * ((this.realHeight + heightFracVal) / 12);
    };

    this.numberOfLites = function(){
        var lites = 1;
        if (this.subtype.toLowerCase() === 'slider' || this.subtype.toLowerCase() === 'single hung' || this.subtype.toLowerCase() === 'patio door') {
             lites = 2;
        }
        if (this.subtype.toLowerCase() === '3 panel' || this.subtype.toLowerCase() === 'xox') {
            lites = 3;
        }
        if (this.subtype.toLowerCase() === '4 panel') {
            lites = 4;
        }
        return lites;
    };

    this.getUValue = function() {
        var sqft = this.getSqFt() / this.numberOfLites();
        for (var i in this.energyValues) {
            var ev = this.energyValues[i];
            var gType = this.gridPattern.toLocaleLowerCase() == "none" ? "" : this.gridType;
            if (ev.glass == this.glassType && ev.grid == gType) {
                if (sqft >= ev.sqftGreaterThan && sqft < ev.sqftLessThan) {
                    this.uVal = ev.uValue;
                    return ev.uValue;
                }
            }
        }
        return 0;
    };

    this.getSHGC = function() {
        var sqft = this.getSqFt() / this.numberOfLites();
        for (var i in this.energyValues) {
            var ev = this.energyValues[i];
            var gType = this.gridPattern.toLocaleLowerCase() == "none" ? "" : this.gridType;
            if (ev.glass == this.glassType && ev.grid == gType) {
                if (sqft >= ev.sqftGreaterThan && sqft < ev.sqftLessThan) {
                    this.shgc = ev.shgc;
                    return ev.shgc;
                }
            }
        }
        return 0;
    };


    this.getLinInch = function() {
        var widthFracVal = 0;
        var heightFracVal = 0;
        if (this.widthFraction) {
            widthFracVal = (this.widthFraction.num / this.widthFraction.denom);
        }
        if (this.heightFraction) {
            heightFracVal = (this.heightFraction.num / this.heightFraction.denom);
        }
        return ((this.realWidth + widthFracVal)) + ((this.realHeight + heightFracVal));
    };


    this.setOption = function(optionName, value) {
        var opt = this.getOption(optionName);
        if (opt) {
            if (opt.name == "Tempered") {
                this.toggleTemperedCosts(value, 1);
            }
            opt.selected = value;
            if (opt.selected === false) {
                opt.isError = false;
            }
        }
    };

    this.setOptionPriceKey = function(optionName, priceKey) {
        var opt = this.getOption(optionName);
        if (opt) {
            opt.setCost(priceKey);
        }
    };

    this.toggleOption = function(optName) {
        var toggleSwitch = false;
        var isTempered = false;
        if (optName == "Tempered" || optName == "obscure") {
            isTempered = true;
            if (this.temperType === null || this.temperType === "") {
                this.temperType = "Tempered";
            }
        } else {
            isTempered = false;
        }
        for (var i in this.options) {
            var option = this.options[i];
            if (option.name == optName) {
                if (option.selected) {
                    toggleSwitch = false;
                } else {
                    toggleSwitch = true;
                }
                option.selected = toggleSwitch;
                if (option.selected === false) {
                    option.isError = false;
                }
                if (isTempered) {
                    var tempOpt = this.getOption("Tempered");
                    this.toggleTemperedCosts(tempOpt.selected, tempOpt.denominator);
                }
            }
        }
        return toggleSwitch;

    };

    this.toggleTemperedCosts = function(isTemp, denom) {
        //if an option has a tempered option column i.e. lowe_1_t we must set
        //the option to it if tempered, and turn it back to lowe_1 if untempered.
        var obs, lowe;

        if (isTemp === false) {
            //temperType holds special names for tempers, like temper top/bottom
            this.temperType = null;
        } else {
            if (this.temperType === null || this.temperType === "") {
                this.temperType = "Tempered";
            }
        }
        obs = this.getOption("obscure");
        lowe = this.getOption("lowe");

        if (isTemp) {
            if (obs) {
                obs.setCost(obs.priceKey + "_t");
                obs.setDenominator(denom);
                if (obs.selected && obs.priceKey.indexOf("_t") > -1) {
                    if (lowe) {
                        lowe.setCost(lowe.priceKey.replace("_t", ""));
                        lowe.setDenominator(1);
                    }
                } else {
                    if (lowe) {
                        lowe.setCost(lowe.priceKey + "_t");
                        lowe.setDenominator(denom);
                    }
                }
            }

        } else {
            if (obs) {
                obs.setCost(obs.priceKey.replace("_t", ""));
                obs.setDenominator(1);
            }
            if (lowe) {
                lowe.setCost(lowe.priceKey.replace("_t", ""));
                lowe.setDenominator(1);
            }
        }

    };

    //Tempertype keeps tabs of the name of the temper "Temper top" Temper left, etc.
    this.setTemperType = function(tType) {
        this.temperType = tType;
        var option = this.getOption("Tempered");
        if (option) {
            option.selected = true;
            var denom = 1;
            //everything is half temps except xox.
            if (tType !== "Tempered" && tType !== "") {
                if (this.subtype == "xox") {
                    denom = 4;
                } else {
                    denom = 2;
                }
            }
            this.toggleTemperedCosts(true, denom);
        }
    };

    this.setGlassType = function(gType) {
        this.glassType = gType;
        var glassOpt = this.getOption("lowe");
        if (glassOpt) {
            glassOpt.selected = true;
            var tempOpt = this.getOption("Tempered");
            //the lowe option is modified by tempered's status.
            //set the price key to lowe_#_t if tempered selected.
            if (tempOpt && tempOpt.selected) {
                if (tempOpt.prices[gType + "_t"]) {
                    glassOpt.setCost(gType + "_t");
                } else {
                    glassOpt.setCost(gType);
                }
            } else {
                glassOpt.setCost(gType);
            }
        }
        //grid price gets modified based on glass type selection.
        var gridOpt = this.getOption("grid");
        if (gridOpt) {
            var vals = gType.split("_");
            if (vals.length > 1) {
                gridOpt.setCost("grid_" + vals[1]);
            }
        }
    };

    this.setTdlHeight = function(height) {
        if (height) {
            this.tdlHeight = height;
        } else {
            this.tdlHeight = this.realHeight / 2;
        }
    };

    this.setFrameColor = function(color) {
        this.frameColor = color;
        if (color != "White") {
            this.setOption("frame", true);
        } else {
            this.setOption("frame", false);
        }
    };

    //exterior color is a mod to other options. As such,
    //we have to set _p or remove it from the priceKey for other options based on how this option is set.
    this.setExteriorColor = function(color) {
        this.exteriorColor = color;
        var option = this.getOption("grid");
        if (option) {
            if (color == "None" || color == "none") {
                var newKey = option.priceKey.replace("_p", "");
                option.setCost(newKey);
            } else {
                option.setCost(option.priceKey + "_p");
            }
        }

        option = this.getOption("paint");
        if (option) {
            if (color == "None") {
                option.selected = false;
            } else {
                option.selected = true;
            }
        }
    };

    this.setGridPattern = function(nGridPattern) {
        this.gridPattern = nGridPattern;
        if (nGridPattern == "none") {
            this.setOption("grid", false);
        } else {

            this.setOption("grid", true);
            var gridOpt = this.getOption('grid');
            if (gridOpt) {
                this.gridType = gridOpt.priceKey;
            }
            this.setRowColToDefault();

        }

    };

    this.setGlassColor = function(color) {

        this.glassColor = color;

    };

    this.setGridType = function(gridType) {
        var grid = this.getOption('grid');
        if (grid) {
            grid.setCost(gridType);
            this.gridType = gridType;
        }
    };

    this.setGridOptionKey = function() {
        var grid = this.getOption('grid');
        if (grid) {
            if (this.exteriorColor == "none" || this.exteriorColor == "None") {
                grid.setCost(grid.priceKey.split('_p')[0]);
            } else {
                grid.setCost(grid.priceKey + "_p");
            }
        }
    };

    //get dimensions as html formatted text.
    this.formatDimensions = function() {
        var width = this.realWidth;
        var line = width;
        if (this.widthFraction && this.widthFraction.num > 0) {
            line += " <small style='color:black;font-weight:bold'><sup>" + this.widthFraction.num + "</sup>/<sub>" + this.widthFraction.denom + "</sub></small>";
        }

        line += " x " + this.realHeight;
        if (this.heightFraction && this.heightFraction.num > 0) {
            line += " <small style='color:black;font-weight:bold'><sup>" + this.heightFraction.num + "</sup>/<sub>" + this.heightFraction.denom + "</sub></small>";
        }

        if (this.legHeight) {
            line += " x " + this.legHeight;
        }
        return line;
    };

    this.checkAtriumDoor = function() {
        var setCustomGrid = false;
        var setCustomWidth = false;
        var setCustomGlass = false;
        var gridOpt = this.getOption("grid");
        var lowe = this.getOption("lowe");
        if (lowe.priceKey.replace("_t", "") != "lowe_1") {
            setCustomGlass = true;

        }

        var gridCost = 0;
        if (gridOpt && gridOpt.selected === true) {

            if (gridOpt.priceKey === "grid_1") {
                setCustomGrid = true;
            } else {
                if (this.subtype == "Patio Door") {
                    if (this.rows == 6 && this.columns == 6 && (this.realWidth == 72 && (this.realHeight == 80 || this.realHeight == 82))) {
                        setCustomWidth = false;
                    } else {
                        setCustomWidth = true;
                    }
                    gridCost = 120;
                } else if (this.subtype == "3 Panel") {
                    if (this.rows == 6 && this.columns == 9 * (this.realWidth == 108 && (this.realHeight == 80 || this.realHeight == 82))) {
                        setCustomWidth = false;
                    } else {
                        setCustomWidth = true;
                    }
                    gridCost = 180;
                } else if (this.subtype == "4 Panel") {
                    if (this.rows == 6 && this.columns == 12 && (this.realWidth == 144 && (this.realHeight == 80 || this.realHeight == 82))) {
                        setCustomWidth = false;
                    } else {
                        setCustomWidth = true;
                    }
                    gridCost = 240;
                }
            }
        } else {
            setCustomGrid = false;
        }
        if (this.realWidth != this.pricingWidth || this.realHeight != this.pricingHeight) {
            setCustomWidth = true;
        }

        var setCustom = (setCustomGlass || setCustomGrid || setCustomWidth);
        if (setCustom === false) {
            this.isCustomDoor = false;
            gridOpt.cost = gridCost;
            return true;
        } else {
            this.isCustomDoor = true;
            gridOpt.setCost(gridOpt.priceKey);
            return false;
        }
    };

    this.hasErrors = function() {
        if (this.isError === true) {
            return true;
        }
        return this.checkOptionErrors();
    };

    this.checkOptionErrors = function() {
        validator.validateObscure(this);
        for (var i in this.options) {
            if (this.options[i].isError && this.options[i].selected === true) {
                return true;
            }
        }
        return false;
    };

    this.calculatePrice = function(salesTax, mf, labor, markup, onFactor, exchangeRate, config, mapsOptions) {
        var isPainted = false;
        var gridOverridden = false;
        var sqFt = null;

        this.checkOptionErrors();
        if (this.isError) {
            this.priceUSD = 0;
            return this.priceUSD;
        }
        if (mf == "Atrium" && this.type == "Patio Door" && this.subtype != "Transom") {
            gridOverridden = this.checkAtriumDoor();
        }

        if (gridOverridden === false) {
            this.setGridOptionKey();
        }
        this.priceUSD = this.basePriceUSD;

        if (this.glassColor !== "none" && this.glassColor !== null) {
            if (mf == "Atrium") {
                sqFt = this.getSqFt();
                if (sqFt >= 24) {
                    this.priceUSD += (sqFt * 8);
                } else {
                    this.priceUSD += (sqFt * 7.24);
                }
            }
        }


        //If a patio door is not priced to a size in the book, it adds 50%
        if (this.type === "Patio Door" && this.isCustomDoor === true) {
            if (mf == "Milgard") {
                if (this.subtype == "Patio Door") {
                    this.priceUSD += 500;
                } else if (this.subtype == "3 Panel") {
                    this.priceUSD += 750;
                } else if (this.subtype == "4 Panel") {
                    this.priceUSD += 1000;
                }
            } else if (mf == "Plygem") {

            } else if (mf == "Jeld-Wen") {
                if (this.subtype == "Patio Door") {
                    this.priceUSD += 386;
                } else if (this.subtype == "3 Panel") {
                    this.priceUSD += 605;
                } else if (this.subtype == "4 Panel") {
                    this.priceUSD += 805;
                }
            } else {
                this.priceUSD = this.priceUSD * 1.5;
            }
        }

        //Maps options are options set in mf config.csv, and controlled on the options page.
        //Though these options are stored at the order level, they factor into the pricing for each window.
        for (var i in mapsOptions) {
            var opt = mapsOptions[i];
            var optCost = opt.priceForWindow(this);
            if (opt.name == "DS Minimum") {
                sqFt = this.getSqFt();
                if (this.subtype == "Slider" || this.substype == "Single hung") {
                    sqFt = sqFt / 2;
                } else if (this.subtype == "xox") {
                    sqFt = sqFt / 3;
                }
                if (sqFt < 12) {
                    this.priceUSD += optCost;
                }
            } else if (opt.name.indexOf("Lock") > -1 || opt.name.indexOf("lock") > -1) {
                if (this.type == "Slider" || this.type == "Single hung") {
                    if (this.subType == "xox") {
                        this.priceUSD += optCost * 2;
                    } else {
                        this.priceUSD += optCost;
                    }
                }
            } else {
                this.priceUSD += optCost;
            }
        }
        var winOp;
        for (var io in this.options) {
            winOp = this.options[io];
            var skipPricing = false;
            if (winOp.selected) {

                if (winOp.name == "paint" || winOp.name == "frame") {
                    if (mf == "Andersen") {
                        if (!isPainted) {
                            isPainted = true;
                        } else {
                            skipPricing = true;
                        }
                    }
                }
                if (winOp.priceKey == "grid_3" && mf == "Atrium") {
                    var paintOp = this.getOption("paint");
                    if (paintOp && paintOp.selected) {
                        this.priceUSD += 25;
                    }
                }

                //Admins have the option to set a unit for any particular option column in the mf config.csv
                //file. Based on those settings, we need to use a different formula for adding the cost of an option.
                if (skipPricing === false) {
                    if (config.columnUnits && config.columnUnits[winOp.priceKey]) {
                        var unit = config.columnUnits[winOp.priceKey];
                        if (unit == "PB") {
                            this.priceUSD += (winOp.cost * (this.getBoxCount()));
                        } else if (unit == "SF") {
                            this.priceUSD += (winOp.cost * ((this.realHeight * this.realWidth) / 144));
                        } else if (unit == "LF") {
                            this.priceUSD += (winOp.cost * ((2 * this.realHeight + 2 * this.realWidth) / 12));
                        } else if (unit == "W") {
                            this.priceUSD += (winOp.cost * (this.realWidth / 12));
                        } else {
                            this.priceUSD += winOp.cost;
                        }
                    } else {
                        this.priceUSD += winOp.cost;
                    }
                }
            }
        }
        //Certain windows break a tdl into more than one bar and charge per bar.
        if (this.tdlBars && this.tdlBars.length > 0) {
            if(config.tdlBar < 0){
                this.isError = true;
                return 0;
            }
            for (var tdl in this.tdlBars) {
                var numBars = 1;
                var tdlBar = this.tdlBars[tdl];
                if (tdlBar.isVertical) {
                    if (config.tdlPriceType == "PB") {
                        if (this.type == "Single Hung") {
                            numBars = 2;
                        }
                    }
                } else {
                    if (config.tdlPriceType == "PB") {
                        if (this.subtype == "Slider" || this.subtype == "Patio Door") {
                            numBars = 2;
                        } else if (this.subtype == "xox" || this.subtype == "3 Panel") {
                            numBars = 3;
                        } else if (this.subtype == "4 Panel") {
                            numBars = 4;
                        }
                    }
                }
                this.priceUSD = this.priceUSD + (config.tdlBar * numBars);
            }
        }

        /*add onfactor and markups
        if (onFactor > 100) {
            this.priceUSD = this.priceUSD * (onFactor / 1000);
        } else {
            this.priceUSD = this.priceUSD * (onFactor / 100);
        }

        this.priceUSD = this.priceUSD * ((markup / 100) + 1);
        */

        var addLabor = false;
        var laborMultiplier = 0;

        //certain labor types are added in the pricing here at the window level.
        //the others at the line item level.
        if (labor && labor.name) {
            if (labor.name == "per window") {
                addLabor = true;
                laborMultiplier = 1;
            } else if (labor.name == "united inch") {
                laborMultiplier = this.realHeight + this.realWidth;
                addLabor = true;
            }
        }

        //now add the labor charge to the window price.
        if (addLabor) {
            var laborTotal = 0;
            if (labor.applyMarkup) {
                var laborMarkup;
                laborMarkup = (config.markup / 100) + 1;
                laborTotal = laborMarkup * labor.cost * laborMultiplier;
            } else {
                this.priceUSD += labor.cost * laborMultiplier;
            }
            this.priceUSD += laborTotal;
        }

        //echange rates and taxes.
        if (exchangeRate) {
            this.priceUSD = this.priceUSD * exchangeRate;
        }
        if (salesTax) {
            this.salesTax = (this.priceUSD * (salesTax / 100));
            //  this.priceUSD = this.priceUSD + this.salesTax;
        } else {
            this.salesTax = 0;
        }
        return this.priceUSD;
    };

    this.getVendorCost = function(order, pConfig, labor) {
        var price = this.priceUSD;
        if (!order) {
            return price;
        }



        var taxAmount = 0;
        //certain labor types are added in the pricing here at the window level.
        //the others at the line item level.
        if (labor && labor.name) {
            if (labor.name == "per window") {
                subtractLabor = true;
                laborMultiplier = 1;
            } else if (labor.name == "united inch") {
                laborMultiplier = this.realHeight + this.realWidth;
                subtractLabor = true;
            }
        }

        //now add the labor charge to the window price.
        if (subtractLabor) {
            var laborTotal = 0;
            laborMarkup = (pConfig.markup / 100) + 1;
            laborTotal = labor.cost * laborMultiplier;

            price -= laborTotal;
        }

        if (this.salesTax) {
            price = price - this.salesTax;
        }
        if (this.type === "Patio Door" && order.doorMarkup && pConfig.hasDoors === true) {
            price = price / ((order.doorMarkup / 100) + 1);
        } else {
            price = price / ((order.markup / 100) + 1);
        }
        var subtractLabor = false;

        price = price + this.salesTax;

        return price;
    };

    this.setOptionDenominator = function(optionName, denom) {
        var option = this.getOption(optionName);
        if (option) {
            option.setDenominator(denom);
        }
    };

    for (var prop in obj) {
        if (prop == "WindowID") {
            this.id = obj[prop];
        } else if (prop == "widthFraction" || prop == "heightFraction") {
            this[prop] = new Fraction(obj[prop]);
        } else if (prop == "options") {
            this.options = [];
            for (var p in obj[prop]) {
                var option = new WindowOption(obj[prop][p]);
                this.options.push(option);
            }
        } else {
            this[prop] = obj[prop];
        }
    }

}
