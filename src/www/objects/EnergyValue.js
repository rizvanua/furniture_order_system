function EnergyValue(obj) {

    this.glass = null;
    this.grid = null;
    this.sqftGreaterThan = null;
    this.sqftLessThan = null;
    this.shgc = null;
    this.uValue = null;

    for (var prop in obj) {
        this[prop] = obj[prop];
    }
}