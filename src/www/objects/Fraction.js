function reduce(fraction) {
    var gcd = function gcd(a, b) {
        return b ? gcd(b, a % b) : a;
    };
    gcd = gcd(fraction.num, fraction.denom);
    fraction.num /= gcd;
    fraction.denom /= gcd;
}

function calculateNet(window, isNet, widthDenom, heightDenom) {
    var halfNum = 1;
    if (!widthDenom) {
        widthDenom = 2;
    }
    if (!heightDenom) {
        heightDenom = 2;
    }
    var dims = [];

    var numTotal = 0;
    var totalWidth = 0;
    var d = {};
    var commonDenom = 0;
    var totalHeight = 0;

    if (window.widthFraction !== null) {
        commonDenom = window.widthFraction.denom * widthDenom;
        numTotal = window.realWidth * commonDenom;
        totalWidth = numTotal + (window.widthFraction.num * widthDenom);
        halfNum = halfNum * window.widthFraction.denom;
        if (isNet === false) {
            totalWidth = totalWidth + halfNum;
        } else {
            totalWidth = totalWidth - halfNum;
        }
        d = {};
        d.wholeNum = Math.floor(totalWidth / commonDenom);
        d.fraction = {};
        d.fraction.num = totalWidth % commonDenom;
        d.fraction.denom = commonDenom;
        reduce(d.fraction);
        dims.push(d);
    } else {
        numTotal = window.realWidth * widthDenom;
        if (isNet === false) {
            totalWidth = numTotal + halfNum;

        } else {
            totalWidth = numTotal - halfNum;

        }
        d = {};
        d.wholeNum = Math.floor(totalWidth / widthDenom);
        d.fraction = {};
        d.fraction.num = totalWidth % widthDenom;
        d.fraction.denom = widthDenom;
        reduce(d.fraction);
        dims.push(d);
    }
    halfNum = 1;
    if (window.heightFraction !== null) {
        commonDenom = window.heightFraction.denom * heightDenom;
        numTotal = window.realHeight * commonDenom;
        totalHeight = numTotal + (window.heightFraction.num * heightDenom);
        halfNum = halfNum * window.heightFraction.denom;
        if (isNet === false) {
            totalHeight = totalHeight + halfNum;
        } else {
            totalHeight = totalHeight - halfNum;
        }
        d = {};
        d.wholeNum = Math.floor(totalHeight / commonDenom);
        d.fraction = {};
        d.fraction.num = totalHeight % commonDenom;
        d.fraction.denom = commonDenom;
        reduce(d.fraction);
        dims[1] = d;
    } else {
        numTotal = window.realHeight * heightDenom;
        totalHeight = 0;
        if (isNet === false) {
            totalHeight = numTotal + halfNum;
        } else {
            totalHeight = numTotal - halfNum;
        }
        d = {};
        d.wholeNum = Math.floor(totalHeight / heightDenom);
        d.fraction = {};
        d.fraction.num = totalHeight % heightDenom;
        d.fraction.denom = heightDenom;
        reduce(d.fraction);
        dims[1] = d;
    }
    return dims;
}

function formatDims(dims) {
    var width = dims[0].wholeNum;
    var line = width;
    if (dims[0].fraction && dims[0].fraction.num > 0) {
        line += " <small style='color:black;font-weight:bold'><sup>" + dims[0].fraction.num + "</sup>/<sub>" + dims[0].fraction.denom + "</sub></small>";
    }

    line += " x " + dims[1].wholeNum;
    if (dims[1].fraction !== null && dims[1].fraction.num > 0) {
        line += " <small style='color:black;font-weight:bold'><sup>" + dims[1].fraction.num + "</sup>/<sub>" + dims[1].fraction.denom + "</sub></small>";
    }
    return line;
}


function Fraction(obj) {
    this.num = 0;
    this.denom = 1;
    this.plus = 0;

    this.addThis = function(toAdd) {
        if (!toAdd) {
            return this;
        }
        var result = new Fraction();
        result.denom = this.denom * toAdd.denom;
        result.num = this.num * toAdd.denom + toAdd.num * this.denom;
        result.plus = this.plus;
        result.reduce();
        return result;

    };

    this.reduce = function() {
        var bigger;

        if (this.num >= this.denom) {
            this.plus++;
            this.num = this.num - this.denom;
        }
        bigger = this.denom;
        for (var i = bigger; i >= 2; i--) {
            if (this.num % i === 0 && this.denom % i === 0) {
                this.num = this.num / i;
                this.denom = this.denom / i;
                break;
            }
        }
        return this.plus;
    };

    for (var prop in obj) {
        this[prop] = obj[prop];
    }

}
