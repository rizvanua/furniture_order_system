function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
}

function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}

function isFloatNumber(evt, element) {
    var charCode = (evt.which) ? evt.which : event.keyCode;
    if (
        (charCode != 45 || $(element).val().indexOf('-') != -1) && // “-” CHECK MINUS, AND ONLY ONE.
        (charCode != 46 || $(element).val().indexOf('.') != -1) && // “.” CHECK DOT, AND ONLY ONE.
        (charCode < 48 || charCode > 57))
        return false;

    return true;
}

function validateLogin(email, password) {
    var result = true;
    if (email === '') {
        toastr.error("Please enter email address");
        result = false;
    }
    if (password === '') {
        toastr.error("Please enter password");
        result = false;
    }
    if (result && !isValidEmailAddress(email)) {
        toastr.error("Please enter a valid email address");
        result = false;
    }
    return result;
}

function getImgClassNames(orderDetail, flipImage) {
    var className = "";
    if (orderDetail.sill) {
        if (orderDetail.sill.name.indexOf("Bronze") == -1) {
            className += "graySillThumb";
        } else {
            className += "bronzeSillThumb";
        }
    } else if (orderDetail.ProductTypeID == 1) {
        className += "";
    }


    if (flipImage !== undefined && flipImage !== null) {
        if (orderDetail.DoorHanding == 'Right Hand' && orderDetail.DoorType == 'Single') {
            className += " flipImage";
        }
        if (orderDetail.productType == 'Interior' || orderDetail.productType == 'Exterior') {
            className += " order-detail-img";
        } else {
            className += " img-responsive";
        }
    }

    className += " " + getClassNames(orderDetail);
    return className;
}

function getClassNames(orderDetail) {
    var className = '';
    var addShadow = false;
    if (orderDetail.JambPicName !== null && orderDetail.JambPicName !== undefined) {
        if (orderDetail.JambPicName.toLowerCase() == 'dark brown')
            className = 'doorBorderDarkThumb ';
        if (orderDetail.JambPicName.toLowerCase() == 'light brown')
            className = 'doorBorderMediumThumb';
        if (orderDetail.JambPicName.toLowerCase() == 'grey')
            className = 'doorBorderGrayThumb';
    } else {
        if (orderDetail.DoorType !== undefined && orderDetail.DoorType !== null && orderDetail.DoorType.toLowerCase() != 'bifold') {
            addShadow = true;
        }
    }
    if (orderDetail.productType == 'Interior') {
        //className += ' order-list';
        if (addShadow) {
            className += " shadow";
        }
    } else if (orderDetail.productType == 'Exterior') {
        //REMOVE THIS BIT ONCE EXTERIOR DETAILS GET THEIR JAMBPICNAMES
        if (orderDetail.JambType !== undefined && orderDetail.JambType !== null && orderDetail.JambType.toLowerCase().indexOf('cherry') > -1) {
            className = 'doorBorderDarkThumb ';
        } else if (orderDetail.JambType !== undefined && orderDetail.JambType !== null && orderDetail.JambType.toLowerCase().indexOf('prime') > -1) {
            className = 'doorBorderGrayThumb';
        } else if (orderDetail.JambType !== undefined && orderDetail.JambType !== null && orderDetail.JambType.toLowerCase() == 'grey') {
            className = 'doorBorderMediumThumb';
        }
        className += ' ext-order-list';
        if (addShadow) {
            className += " shadow";
        }
    }
    return className;
}

function KeyPressNumericValidation() {
    jQuery('input[data="integer"]').keypress(function(event) {
        return Integer(this, event);
    }).bind('paste', function(e) {
        return false;
    });

    jQuery('input[data="digit"]').keypress(function(event) {
        return Digit(this, event);
    }).bind('paste', function(e) {
        return false;
    });

    jQuery('input[data="numeric"]').keypress(function(event) {
        return Numeric(this, event);
    }).bind('paste', function(e) {
        return false;
    });

    jQuery('input[data="PositiveNumeric"]').keypress(function(event) {
        return PositiveNumeric(this, event);
    }).bind('paste', function(e) {
        return false;
    });

    jQuery('.disablepaste').bind("paste", function() {
        return false;
    });
}

function Digit(objTextbox, event) {
    var keyCode = (event.which) ? event.which : (window.event) ? window.event.keyCode : -1;
    if (keyCode >= 48 && keyCode <= 57) {
        return true;
    }
    if (keyCode == 8 || keyCode == -1) {
        return true;
    } else {
        return false;
    }
}

function Integer(objTextbox, event) {
    var keyCode = (event.which) ? event.which : (window.event) ? window.event.keyCode : -1;
    if (keyCode >= 48 && keyCode <= 57 || keyCode == 45) {
        if (keyCode == 45) {
            if (objTextbox.value.indexOf("-") == -1)
                return true;
            else
                return false;
        } else
            return true;
    }
    if (keyCode == 8 || keyCode == -1) {
        return true;
    } else {
        return false;
    }
}

function Numeric(objTextbox, event) {
    var keyCode = (event.which) ? event.which : (window.event) ? window.event.keyCode : -1;
    if (keyCode >= 48 && keyCode <= 57 || keyCode == 46 || keyCode == 45) {
        if (keyCode == 46) {
            if (objTextbox.value.indexOf(".") == -1)
                return true;
            else
                return false;
        } else if (keyCode == 45) {
            if (objTextbox.value.indexOf("-") == -1)
                return true;
            else
                return false;
        } else
            return true;
    }
    if (keyCode == 8 || keyCode == -1) {
        return true;
    } else {
        return false;
    }
}

function PositiveNumeric(objTextbox, event) {
    var keyCode = (event.which) ? event.which : (window.event) ? window.event.keyCode : -1;
    if (keyCode >= 48 && keyCode <= 57 || keyCode == 46) {

        if (keyCode == 46) {
            if (objTextbox.value.indexOf(".") == -1)
                return true;
            else
                return false;
        } else
            return true;
    }
    if (keyCode == 8 || keyCode == -1) {
        return true;
    } else {
        return false;
    }
}

function getTotalPrice(quantity, priceEach, selectedManufacturerSettings) {
    var totalPrice;
    if ($.isNumeric(quantity) && $.isNumeric(priceEach)) {
        totalPrice = (priceEach * quantity).toFixed(2);
        var onFactor;
        var markUp;
        if (selectedManufacturerSettings !== null) {
            if (angular.isUndefined(selectedManufacturerSettings.OnFactor))
                selectedManufacturerSettings.OnFactor = 0.5;

            if (angular.isUndefined(selectedManufacturerSettings.MarkUp))
                selectedManufacturerSettings.MarkUp = 100;

            onFactor = selectedManufacturerSettings.Lines[0].OnFactor;
            markUp = selectedManufacturerSettings.Lines[0].MarkUp;
        } else {
            onFactor = 0.5;
            markUp = 100;
        }
        totalPrice = (totalPrice * onFactor * (1 + (markUp / 100))).toFixed(2);
    } else {
        totalPrice = "N/A";
    }
    return totalPrice;
}

// Converts an ArrayBuffer directly to base64, without any intermediate 'convert to string then
// use window.btoa' step. According to my tests, this appears to be a faster approach:
// http://jsperf.com/encoding-xhr-image-data/5

function base64ArrayBuffer(arrayBuffer) {
    var base64 = '';
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    var bytes = new Uint8Array(arrayBuffer);
    var byteLength = bytes.byteLength;
    var byteRemainder = byteLength % 3;
    var mainLength = byteLength - byteRemainder;

    var a, b, c, d;
    var chunk;

    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
        d = chunk & 63; // 63       = 2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength];

        a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

        // Set the 4 least significant bits to zero
        b = (chunk & 3) << 4; // 3   = 2^2 - 1

        base64 += encodings[a] + encodings[b] + '==';
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

        a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

        // Set the 2 least significant bits to zero
        c = (chunk & 15) << 2; // 15    = 2^4 - 1

        base64 += encodings[a] + encodings[b] + encodings[c] + '=';
    }

    return base64;
}
