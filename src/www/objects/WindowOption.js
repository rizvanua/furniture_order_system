function WindowOption(obj) {
    this.name = null;
    this.cost = null;
    this.selected = null;
    this.priceKey = null;
    this.prices = null;
    this.denominator = 1;
    this.units = null;
    this.isError = false;

    this.addPrice = function(fullName, value) {
        if (!this.prices) {
            this.prices = {};
        }
        this.prices[fullName] = value;
    };

    this.setCost = function(key) {
        if (!this.prices) {
            this.prices = {};
        }

        if (key in this.prices) {
            this.priceKey = key;
            this.cost = this.prices[key] / this.denominator;
            if (this.cost < 0) {
                this.isError = true;
            }
        }
    };

    this.setDenominator = function(denom) {
        this.denominator = denom;
        if (this.priceKey && this.prices[this.priceKey]) {
            this.cost = this.prices[this.priceKey] / this.denominator;
        }
    };

    for (var prop in obj) {
        this[prop] = obj[prop];
    }

}
