var validator = {

    Constraints: {
        "Atrium": {
            "thickness": [{
                num: 3,
                denom: 32,
                sqFt: {
                    low: 0,
                    high: 12
                },
                linInch: {
                    low: 0,
                    high: 71
                }
            }, {
                num: 1,
                denom: 8,
                sqFt: {
                    low: 0,
                    high: 23
                },
                linInch: {
                    low: 71,
                    high: 83
                }
            }, {
                num: 5,
                denom: 32,
                sqFt: {
                    low: 0,
                    high: 27.78
                },
                linInch: {
                    low: 83,
                    high: 90
                }
            }, {
                num: 3,
                denom: 16,
                sqFt: {
                    low: 0,
                    high: 10000
                },
                linInch: {
                    low: 90,
                    high: 10000
                }
            }]

        }
    },

    validateObscure: function(window) {
        var obsOption = window.getOption("obscure");
        if (obsOption) {
            if (obsOption.cost < 0) {
                return;
            }
            var sqFt = window.getSqFt();

            var linInch = window.getLinInch();
            var priceKey = obsOption.priceKey;
            var obsDetails = Constants.Obscures[priceKey.replace("_t", "")];
            if (obsDetails) {
                if (obsDetails.thickness) {
                    var obsDecimal = obsDetails.thickness.num / obsDetails.thickness.denom;
                    var constraint = this.Constraints[window.mfct];
                    if (constraint) {
                        for (var i in constraint.thickness) {
                            var thicknessConstraint = constraint.thickness[i];
                            var constraintVal = thicknessConstraint.num / thicknessConstraint.denom;
                            if (obsDecimal <= constraintVal) {
                                if ((sqFt >= thicknessConstraint.sqFt.low && sqFt < thicknessConstraint.sqFt.high) ||
                                    (linInch >= thicknessConstraint.linInch.low && linInch < thicknessConstraint.linInch.high)) {
                                    obsOption.isError = false;
                                    return;
                                } else {
                                    obsOption.isError = true;
                                    return;
                                }
                            }
                        }
                    }
                }
            }
            obsOption.isError = false;
        }
    }

};
