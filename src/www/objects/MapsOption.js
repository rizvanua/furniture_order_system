function MapsOption(obj) {

    this.selectedKeys = null;
    this.pricingMethods = null;
    this.multiSelect = null;
    this.prices = null;
    this.selected = null;

    this.addPrice = function(fullName, value, pricingMethod) {
        if (!this.prices) {
            this.prices = {};
        }
        if (!this.pricingMethods) {
            this.pricingMethods = {};
        }
        this.prices[fullName] = value;
        this.pricingMethods[fullName] = pricingMethod;
    };

    this.getPrice = function(key) {
        if (this.prices[key]) {
            return this.prices[key];
        } else {
            return 0;
        }
    };

    this.priceForWindow = function(window) {
        var method, cost;
        var total = 0;
        if (!this.selectedKeys) {
            this.selectedKeys = [];
        }
        for (var i in this.selectedKeys) {
            var sKey = this.selectedKeys[i];
            method = this.pricingMethods[sKey];
            cost = this.prices[sKey];
            //There are several different units that can be set for options.
            //calculate the cost accordingly. Square Foot, Lineal Foot, Width, or none.
            if (method == "SF") {
                total += (window.realWidth / 12) * (window.realHeight / 12) * cost;
            } else if (method == "LF") {
                total += ((window.realWidth * 2 / 12) + (window.realHeight * 2 / 12)) * cost;
            } else if (method == "W") {
                total += (window.realWidth / 12) * cost;
            } else {
                total += cost;
            }
        }
        return total;
    };

    this.clearSelectedKeys = function() {
        this.selectedKeys = [];
    };

    this.removeCost = function(key) {
        if (this.selectedKeys) {
            var index = this.selectedKeys.indexOf(key);
            if (index >= 0) {
                this.selectedKeys.splice(index, 1);
            }
            if (this.selectedKeys.length === 0) {
                this.selected = false;
            } else {
                this.selected = true;
            }
        }
    };

    this.setCost = function(key) {
        if (!this.prices) {
            this.prices = {};
        }
        if (this.prices[key] >= 0) {
            if (!this.selectedKeys) {
                this.selectedKeys = [];
            }
            if (this.selectedKeys.indexOf(key) === -1) {
                this.selectedKeys.push(key);
                this.selected = true;
                if (this.selectedKeys.length === 1) {
                    this.priceKey = key;
                }
            }
            this.cost = 0;
            for (var i in this.selectedKeys) {
                this.cost += this.getPrice(this.selectedKeys[i]);
            }
        }
    };

    for (var prop in obj) {
        this[prop] = obj[prop];
    }

}
