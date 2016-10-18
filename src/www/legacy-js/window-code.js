var showingMF = 0;
var selectedProdLine = 0;
var selectedLineItem = 0;
var selectedWindowId = 0;
var dropZones = [];
var draggingWindow = null;
var selectionShade = null;
var blinkTimer = null;

var isDemo = getParameterByName("demo");

if (isDemo === "true") {
    $('#customer-header-panel').tooltip('show');
    $('#customer-header-div').tooltip('show');
    $('#header-new-quote').tooltip('show');
}

var windowScreen = window;

var glassColors = ["bronze glass", "grey glass", "none"];

var fractions = ["1_16", "3_16", "5_16", "7_16", "9_16", "11_16",
    "13_16", "1_8", "1_4", "3_8", "1_2", "5_8", "3_4", "7_8"
];

var locations = ["Kitchen", "Dining room", "Living room", "Den",
    "Bed 1", "Bed 2", "Bed 3", "Bed 4", "Bonus room", "Office",
    "Closet", "Open", "Clerestory", "Laundry", "Mud room", "Garage", "Bath", "Master", "Entry", "Greatroom", "Powder"
];

var subTypes = {
    Picture: ["Pic Bay"],
    "Single hung": ["Double Hung", "SH Bay"],
    Slider: ["xox", "Slider Fixed", "Double Slider"],
    Casement: ["Case Fixed", "Case Bay", "Double Casement"],
    "Patio Door": ["3 Panel", "4 Panel"],
    Geo: ["Triangle", "Right Tri", "Parallelogram", "Octagon", "Trapezoid", "Gable"],
    Radius: ["Half Round", "Round Top", "Arch Top", "Qtr Round", "Qtr Rnd Top", "Full Round"]
};

$(window).on('load', function() {
    if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
        $('.main').css('width', '950px');
    }
});

$(document).on('new-window', function(args, win) {
    drawLineItemOnCanvas();
});

$(document).on('order-added', function(args, order) {
    updateMFTabs();
});

var scrollVal;

function showErrorMessage(message) {
    toastr.warning(message);
}

function snapCanvas() {


    scrollVal = $('#mainView').scrollTop();
    $('#mainView').scrollTop(0);
    $('.select-shader').remove();
    var id = getCurrentLineItem().id;
    html2canvas($('.canvas-main'), {
        background: undefined,
        allowTaint: true,
        onrendered: function(canvas) {

            $('#mainView').scrollTop(scrollVal);
            var data = canvas.toDataURL();
            mainQuote.lineIcons[id] = {
                main: data
            };
            drawSelectionShader();
            initializePage();
        }
    });
    var windowList = mainQuote.windowOrderList[selectedProdLine].lineItem[selectedLineItem].windowList;
}

function getSingleWindowSnapShot(windowList, index, lineId) {

    var window = windowList[index];
    var winIcon = $('#icon_' + window.id);
    if (winIcon) {
        html2canvas($('#icon_' + window.id), {
            onrendered: function(canvas) {
                var test = "est";
                var data = canvas.toDataURL();
                if (!mainQuote.lineIcons[lineId].windows) {
                    mainQuote.lineIcons[lineId].windows = {};
                }
                mainQuote.lineIcons[lineId].windows[window.id] = data;
                index++;
                if (windowList.length > index) {
                    getSingleWindowSnapShot(windowList, index, lineId);
                }
            }
        });
    }
}


function showLocationPanel() {
    var locPanel = $('.locationPanel');
    locPanel = "<div class='locationPanel'  style='width:300px;position:absolute; background-color:White;z-index:1000'>";

    for (var i in locations) {
        locPanel += "<button onclick='locPushed(\"" + locations[i] + "\")' class='black-border'style='padding:0px;background-color:#ffffff;text-align:center;width:150px;color:Black;float:left'><h3 style='margin:4px'>" + locations[i] + "</h3></button>";
    }

    locPanel += "<input onchange='customLoc(this)' placeholder='Custom' class='black-border'style='padding:0px;background-color:#ffffff;text-align:center;width:150px;height:40px;color:Black;float:left'></input>";

    $('body').append(locPanel);

    $('.locationPanel').position({
        my: "left bottom",
        at: "right bottom",
        of: '#location',
        collision: "none"
    });

}

function showTemperTypes(event) {
    if (event.stopPropagation) {
        event.stopPropagation(); // W3C model
    } else {
        event.cancelBubble = true; // IE model
    }
    $('html').mousedown(function(event) {
        $('.temperPanel').hide();
    });
    var selectedWindow = getCurrentLineItem().getWindowById(selectedWindowId);
    var tempTypes;
    if (selectedWindow.type.toLowerCase() == "single hung") {
        tempTypes = ["Temper All", "Temper Top", "Temper Bottom", "None"];
    } else if (selectedWindow.type == "Slider") {
        tempTypes = ["Temper All", "Temper Left", "Temper Right", "None"];
    } else {
        tempTypes = ["Temper All", "None"];
    }
    temperTimer = null;
    if (tempTypes) {
        var html = "<div class='temperPanel' style='padding:5px;z-index:1000;background-color:White;position:absolute;width:200px'>";
        html += "<button onmousedown='setTemperType(event)' class='btn btn-default Hover' style='margin-bottom:5px;width:100%;font-size:large'>" + tempTypes[0] + "</button>";

        html += "<button onmousedown='setTemperType(event)' class='btn btn-default Hover' style='margin-bottom:5px;width:100%;font-size:large'>" + tempTypes[1] + "</button>";
        if (tempTypes.length > 2) {
            html += "<button onmousedown='setTemperType(event)' class='btn btn-default Hover' style='margin-bottom:5px;width:100%;font-size:large'>" + tempTypes[2] + "</button>";
        }
        if (tempTypes.length > 3) {
            html += "<button onmousedown='setTemperType(event)' class='btn btn-default Hover' style='width:100%;font-size:large'>" + tempTypes[3] + "</button></div>";
        }
        $('body').append(html);
        $('.temperPanel').position({
            my: "left",
            at: "right",
            of: event.target,
            collision: "none"
        });
    }
}

function showObscureTypes(event) {
    if (event.stopPropagation) {
        event.stopPropagation(); // W3C model
    } else {
        event.cancelBubble = true; // IE model
    }
    $('html').mousedown(function(event) {
        $('.obscurePanel').hide();
    });


    var html = "<div class='obscurePanel' style='padding:5px;z-index:1000;background-color:White;position:absolute;width:200px'>";
    for (var prop in Constants.Obscures) {
        html += "<button onmousedown='setObscure(\"" + prop + "\")' class='btn btn-default Hover' style='margin-bottom:5px;width:100%;font-size:large'>" + Constants.Obscures[prop].name + "</button>";
    }
    html += "<hr />";
    for (var i in glassColors) {
        html += "<button onmousedown='setGlassColor(\"" + glassColors[i] + "\")' class='btn btn-default Hover' style='margin-bottom:5px;width:100%;font-size:large'>" + glassColors[i] + "</button>";
    }

    html += "</div>";
    $('body').append(html);
    $('.obscurePanel').position({
        my: "left",
        at: "right",
        of: event.target,
        collision: "none"
    });
}

function setGlassColor(color) {
    mainQuote.setGlassColorById(color, selectedLineItem, selectedWindowId);
    drawLineItemOnCanvas(true);
    setOptionButtonsForCurrentWin();
}



function setObscure(priceKey) {
    var line = getCurrentLineItem();
    if (priceKey == "none") {
        mainQuote.setWindowOptionById("obscure", "obscure", selectedWindowId, selectedLineItem);
        mainQuote.toggleOptionForWindow(line.id, selectedWindowId, "obscure", false);
    } else {
        mainQuote.setWindowOptionById("obscure", priceKey, selectedWindowId, selectedLineItem);
        mainQuote.toggleOptionForWindow(line.id, selectedWindowId, "obscure", true);
    }
    drawLineItemOnCanvas(true);
}



function setTemperType(tType) {
    // event.stopPropagation();
    if (tType.indexOf("All") > -1) {
        tType = "";
        mainQuote.setWindowOptionById("Tempered", null, selectedWindowId, selectedLineItem, true);
        mainQuote.setTemperTypeForWindow(selectedLineItem, selectedWindowId, "");
    } else if (tType.indexOf("None") > -1) {
        mainQuote.setTemperTypeForWindow(selectedLineItem, selectedWindowId, "");
        mainQuote.setWindowOptionById("Tempered", null, selectedWindowId, selectedLineItem, false);
    } else {
        mainQuote.setTemperTypeForWindow(selectedLineItem, selectedWindowId, tType);
    }
    $('#Tempered').css('background-color', 'gray');
    drawLineItemOnCanvas(true);
}

function temperReleased(event) {
    var id = $(event.target).attr('id');
    if (id == "temper-types") {
        showTemperTypes(event);
    } else {
        //  setOption(event.target, 'Tempered');
        showTemperTypes(event);
    }
}

function drawTdlOnWindows() {
    var line = getCurrentLineItem();
    for (var i in line.windowList) {
        var win = line.windowList[i];
        for (var j in win.tdlBars) {
            var bar = win.tdlBars[j];
            var borderType;
            var icon = $('#icon_' + win.id);
            var width = $(icon).width();
            var height = $(icon).height();
            var pos = $(icon).position();
            var top = pos.top + 2;
            var left = pos.left + 2;
            var percentage;
            if (!bar.isVertical) {
                percentage = bar.startInch / win.realHeight;
                height = height * percentage;
                height = height;
                width = width;
                borderType = "border-bottom";
            } else {
                percentage = bar.startInch / win.realWidth;
                width = width * percentage;
                width = width;
                height = height;
                borderType = "border-right";
            }
            var bar2 = $('<div id="tdl_' + win.id + '" onclick="windowGridClicked(this)" style="z-index:99;' + borderType + ':5px solid White;border-spacing:0px;position:absolute;width:' + width + 'px;height:' + height + 'px;top:' + top + 'px;left:' + left + 'px"></div>');
            $('.canvas-main').append(bar2);
        }
    }
}

function locPushed(loc) {
    mainQuote.setLocationForLine(selectedLineItem, loc);
    $('#location').html("Location: " + loc);
    $('.locationPanel').remove();
    drawLineItemOnCanvas(true);
}

function customLoc(element) {
    var loc = $(element).val();
    $('#location').html("Location: " + loc);
    mainQuote.setLocationForLine(selectedLineItem, loc);
    drawLineItemOnCanvas(true);
}

function showFractionPanel() {
    var fracPanel = $('.fracPanel');
    if (fracPanel.length > 0) {
        fracPanel.remove();
        return;
    }
    fracPanel = "<div class='fracPanel' style='width:200px;position:absolute; background-color:Black'>";
    for (var i in fractions) {
        var splitFrac = fractions[i].split('_');
        var fraction = "<sup>" + splitFrac[0] + "</sup>/<sub>" + splitFrac[1] + "</sub>";
        fracPanel += "<button onclick='fracPushed(" + splitFrac[0] + "," + splitFrac[1] + ")' style='background-color:#277290;text-align:center;width:100px;color:White;float:left'><h1 style='margin:4px'>" + fraction + "</h1></button>";
    }
    $('body').append(fracPanel);

    $('.fracPanel').position({
        my: "left center",
        at: "right center",
        of: '.numPad',
        collision: "none"
    });

}

function addNewWindow(type, subType) {
    $('.subtypePanel').remove();
    var line = getCurrentLineItem();
    if (line.windowList.length == 4) {
        showErrorMessage("Mull units can have a maximum of 3 windows.");
        return;
    }

    if (type == "Patio Door") {
        if (line.windowList.length === 0) {
            if (subType.indexOf("Trans") >= 0) {
                localStorage.setItem('includeTransom', true);
            } else {
                localStorage.removeItem('includeTransom');
            }
            localStorage.setItem("doorSelection", subType);
            // saveQuote('doors');
            $('#door-panel').modal('show');
            launchDoors();
            return;
        } else {
            showErrorMessage("Patio Doors can only be added to an empty line.");
            return;
        }
    }
    if (line && line.windowList.length >= 1) {
        if (dropZones.length > 0) {
            clearDropZones();
        } else {

            var dims = $('.numpad_val').val();
            dims = parseDims();
            var newWindow = {};
            newWindow.type = type;
            newWindow.subtype = subType;

            if (dims) {
                var sqFt = (dims.rWidth / 12) * (dims.rHeight / 12);
                if (sqFt + line.getSqFt() > 70) {
                    showErrorMessage("Cannot build mulls greater than 70 sqaure feet.");
                    return;
                }
                newWindow.realWidth = dims.rWidth;
                newWindow.realHeight = dims.rHeight;
                newWindow.widthFraction = dims.widthFrac;
                newWindow.heightFraction = dims.heightFrac;

                newWindow.id = mainQuote.windowIdCounter;
                draggingWindow = newWindow;
                addDropZones();
            }


        }
    } else {
        getWindow(type, subType);
    }
}

var timer = null;

function typePushed(type, subtype, element) {
    $('.radiusPanel').remove();
    if (subtype.indexOf("Geo") > -1) {
        showGeoPanel();
        return;
    }
    if (subtype.indexOf("Radius") > -1) {
        showRadiusPanel();
        return;
    }
    if (timer === null) {
        timer = setTimeout(function() {
            addNewWindow(type, subtype);
            timer = null;
        }, 200);
    } else {
        clearTimeout(timer);
        timer = null;
        showWindow(type, element);
    }
}

function removeWindow(id, element) {
    mainQuote.removeWindow(selectedLineItem, selectedWindowId);
    updateMFTabs();
    updatePricing();
    drawLineItemOnCanvas();
}



function setNextBlinker() {
    $('#next-btn').addClass("strobeButton");
}

function clearNextBlinker() {
    $('#next-btn').removeClass("strobeButton");
}


function showWindowOptions(element) {
    var id = $(element.target).attr('id');
    if (!id) {
        id = selectedWindowId;
    } else {
        id = id.split('_')[1];
    }
    var html = "<div class='window-opts' style='z-index:1400;position:absolute;background-color:Black;width:150px;padding:5px'>";
    html += "<button onclick='removeWindow(" + id + ",this)' style='color:White;font-size:large;height:50px;width:100%;margin-bottom:5px'>Remove Window</button><button onclick='saveQuote(\"GridTool\")' style='color:White;font-size:large;height:50px;width:100%;margin-bottom:5px'>Edit Grid</button>";
    html += "<button onclick='$(this).parent().remove()' style='color:White;font-size:large;height:50px;width:100%;margin-bottom:5px'>Close</button></div>";

    $('body').append($(html));
    $('.window-opts').position({
        my: "top",
        at: "bottom",
        of: element
    });
}

function showWindow(type, element, event) {
    if (event) {
        event.stopPropagation();
    }

    if ($('.subtypePanel').length > 0) {
        $('.subtypePanel').remove();
    }

    ANGULAR_EXTERN_IMG_SVC.ResolveUrl(Config.UPaths.UIImagePath + "black_x_btn.png").then(function(img1) {
        ANGULAR_EXTERN_IMG_SVC.ResolveUrl(Config.UPaths.WindowIconPath + type + "/" + subTypes[type][i] + ".png").then(function(img2) {
            var html = "<div class='subtypePanel shadow'><img onclick='$(this).parent().remove()'  style='float:right;margin-top:5px;margin-right:5px' src='" + img1 + "' />";
            for (var i in subTypes[type]) {
                html += "<div class='boldHover'  onclick='addNewWindow(\"" + type + "\",\"" + subTypes[type][i] + "\")' style='float:left;text-align:center;padding:3px'><img style='z-index:400;width:75px;height:75px' src='" + img2 + "' /><h4 style='width:100px;Color:Black;margin:0px'>" + subTypes[type][i] + "</h4></div>";
            }
            html += "</div>";

            $('body').append($(html));
            $('.subtypePanel').position({
                my: "right top",
                at: "right bottom",
                of: element
            });
        });
    });

}


function getWindow(type, subtype, toTop, toBottom, toLeft, toRight) {
    var dims = $('.numpad_val').val();
    setNextBlinker();
    dims = parseDims();
    if (dims && dims.rWidth && dims.rHeight) {

        addImage = true;
        var qty = $('#qty-txt').val();
        if (qty === "" || isNaN(qty)) {
            qty = 1;
        }
        var line = getCurrentLineItem();
        mainQuote.setQuantityForLine(selectedLineItem, qty);
        mainQuote.addWindowToAll(dims.rWidth, dims.rHeight, type, subtype, line.id, toTop, toBottom, toLeft, toRight, dims.wFraction, dims.hFraction);
    }

}

/*function getClosestWindow(type, subtype, dimString, toTop, toBottom, toLeft, toRight) {
    var dims = parseDims(dimString);
    if (dims && dims.rWidth && dims.rHeight) {
        addImage = true;
        var line = getCurrentLineItem();
        mainQuote.addClosestWindow(dims.rWidth, dims.rHeight, type, subtype, line.id, toTop, toBottom, toLeft, toRight, dims.wFraction, dims.hFraction);

    }
    if ($('#doorPopup').length) {
        $('#doorPopup').remove();
    }
}*/

function changeMF(LR) {
    if (LR === 0) {
        if (showingMF > 0) {
            showingMF = showingMF - 1;
        } else {
            showingMF = mf_info.length - 1;
        }
        setMFPanel(mf_info[showingMF], showingMF);
    } else {
        if (showingMF < mf_info.length - 1) {
            showingMF = showingMF + 1;
        } else {
            showingMF = 0;
        }
        setMFPanel(mf_info[showingMF], showingMF);
    }
}


function selectOrder(mf, line) {
    var order = mainQuote.getOrder(mf, line);
    var currentInfo;
    for (var i in mf_info) {
        var tempInfo = mf_info[i];
        if (tempInfo.manufacturer == mf) {
            currentInfo = tempInfo;
            break;
        }
    }
    selectedProdLine = mainQuote.getOrderIndex(mf, line);
    if (order) {

    } else {
        mainQuote.createWindowOrder(mf, line, currentInfo);
        selectedProdLine = mainQuote.windowOrderList.length - 1;
    }

}

function updateMFTabs() {
    calculateOrderPrices();
}

function setMFPanel(MFInfo, index) {
    if (index) {
        showingMF = index;
    }
    ANGULAR_EXTERN_IMG_SVC.ResolveUrl(Config.UPaths.ManufacturerImagePath + MFInfo.manufacturer + ".png").then(function(img1) {
        var lines = Object.keys(MFInfo.lines);
        var img = $('#bld_mf_img');
        img.attr('src', img1);
        var test = $('#mf-lbl-1');
        $('#mf-lbl-1').html(lines[0]);
        $('#mf-lbl-2').html(lines[1]);
        var order = mainQuote.getOrder(MFInfo.manufacturer, lines[0]);
        if (order) {
            $('#mf-price-1').html("$" + order.calculateOrderPrice(mainQuote.quoteDetails.taxPercentage, null, mainQuote.quoteDetails.exchangeRate, mainQuote.laborCharge, MFInfo).toFixed(2));
        } else {
            $('#mf-price-1').html("");
        }
        order = mainQuote.getOrder(MFInfo.manufacturer, lines[1]);
        if (order) {
            $('#mf-price-2').html("$" + order.calculateOrderPrice(mainQuote.quoteDetails.taxPercentage, null, mainQuote.quoteDetails.exchangeRate, mainQuote.laborCharge, MFInfo).toFixed(2));
        } else {
            $('#mf-price-2').html("");
        }
        $('#mf-line-1').attr('onclick', 'selectOrder(\'' + MFInfo.manufacturer + '\',\'' + lines[0] + '\')');
        $('#mf-line-2').attr('onclick', 'selectOrder(\'' + MFInfo.manufacturer + '\',\'' + lines[1] + '\')');
    });
}


function clearDropZones() {
    for (var i = 0; i < dropZones.length; i++) {
        $(dropZones[i]).remove();
    }
    dropZones = [];
}

function codeToDims(dimString) {
    var twelves = dimString[0] * 12;
    var ones = dimString[1];
    var dims = [];
    dims[0] = twelves + Number(ones);
    twelves = dimString[2] * 12;
    ones = dimString[3];
    dims[1] = twelves + Number(ones);
    return dims;
}

function parseDims(dims) {
    if (!dims) {
        var pad = $('#numpad_value');
        dims = pad.val();
    }
    var width, height, wFrac, hFrac;

    dims = dims.split(/\s*[\*\+a-zA-Z]\s*/);

    if (dims.length == 1) {
        if (dims[0].length == 4) {
            dims = codeToDims(dims[0]);
        } else {
            showErrorMessage("Invalid window dimensions.");
        }
    }

    if (!isNaN(dims[0]) && !isNaN(dims[1])) {
        var decimalSplit = 0;
        var denom = 0;
        if (("" + dims[0]).indexOf('.') > 0) {
            decimalSplit = dims[0].split('.');
            width = decimalSplit[0];
            wFrac = new Fraction();
            denom = Math.pow(10, decimalSplit[1].length);
            wFrac.num = decimalSplit[1];
            wFrac.denom = denom;
            reduce(wFrac);
        } else {
            width = dims[0];
        }
        if (("" + dims[1]).indexOf('.') > 0) {
            decimalSplit = dims[1].split('.');
            height = decimalSplit[0];
            hFrac = new Fraction();
            denom = Math.pow(10, decimalSplit[1].length);
            hFrac.num = decimalSplit[1];
            hFrac.denom = denom;
            reduce(hFrac);
        } else {
            height = dims[1];
        }
    } else {
        var wDim = dims[0].split(" ");
        var frac = 0;
        if (!isNaN(wDim[0])) {
            width = wDim[0];
        } else {
            showErrorMessage("Invalid window dimensions.");
            return;
        }
        if (wDim.length > 1) {
            if (wDim[1].indexOf("/") >= 1) {
                frac = wDim[1].split('/');
                wFrac = new Fraction();
                wFrac.num = frac[0];
                wFrac.denom = frac[1];
            }
        }
        if (!dims[1]) {
            showErrorMessage("Invalid window dimensions");
            return;
        }
        var hDim = dims[1].split(" ");
        if (!isNaN(hDim[0]) && hDim[0] !== "") {
            height = hDim[0];
        } else {
            showErrorMessage("Invalid window dimensions.");
            return;
        }
        if (hDim.length > 1) {
            if (hDim[1].indexOf("/") >= 1) {
                frac = hDim[1].split('/');
                hFrac = new Fraction();
                hFrac.num = frac[0];
                hFrac.denom = frac[1];
            }
        }
    }
    if (mainQuote.quoteDetails.isNet === true) {
        var adjustWindow = {
            realWidth: width,
            realHeight: height,
            widthFraction: wFrac,
            heightFraction: hFrac
        };
        dims = calculateNet(adjustWindow, false);
        return {
            rWidth: dims[0].wholeNum,
            rHeight: dims[1].wholeNum,
            hFraction: dims[1].fraction,
            wFraction: dims[0].fraction
        };
    }
    return {
        rWidth: width,
        rHeight: height,
        hFraction: hFrac,
        wFraction: wFrac
    };
}

var totalWidth = 0;
var totalHeight = 0;

function getScale(width, height) {
    var line = getCurrentLineItem();
    totalHeight = line.getLineHeight();
    totalWidth = line.getLineWidth();
    var canvas = $('.canvas-main');
    var dims = [];
    var scale;
    if (totalWidth > totalHeight) {
        scale = canvas.height() / totalWidth;
    } else {
        scale = canvas.height() / totalHeight;
    }

    var scaled_width = width * scale;
    var scaled_height = height * scale;
    dims[0] = scaled_width * 0.8;
    dims[1] = scaled_height * 0.8;
    return dims;
}

function showGridPopup() {
    $('#grid-popup').show();
}

function dropMade(helper, element) {
    clearDropZones();
    var vals = $(element).attr('id').split("_");
    var anchorID = vals[1];
    var anchorWindow = getCurrentLineItem().getWindowById(anchorID);
    //draggingWindow.toBottom = anchorID;
    //getCurrentLineItem().windows.push(draggingWindow);
    if (vals[0] == "top") {

        mainQuote.setWindowBindingForAll(selectedLineItem, anchorID, vals[0], mainQuote.windowIdCounter);
        getWindow(draggingWindow.type, draggingWindow.subtype, null, anchorID);
    } else if (vals[0] == "bottom") {
        mainQuote.setWindowBindingForAll(selectedLineItem, anchorID, vals[0], mainQuote.windowIdCounter);

        getWindow(draggingWindow.type, draggingWindow.subtype, anchorID);

    } else if (vals[0] == "right") {
        mainQuote.setWindowBindingForAll(selectedLineItem, anchorID, vals[0], mainQuote.windowIdCounter);

        getWindow(draggingWindow.type, draggingWindow.subtype, null, null, anchorID);
    } else if (vals[0] == "left") {

        mainQuote.setWindowBindingForAll(selectedLineItem, anchorID, vals[0], mainQuote.windowIdCounter);
        getWindow(draggingWindow.type, draggingWindow.subtype, null, null, null, anchorID);
    }

    //$(element).replaceWith($(helper));
    // alert("droppped");

}

function addDropZones() {
    var line = getCurrentLineItem();

    ANGULAR_EXTERN_IMG_SVC.ResolveUrl(Config.UPaths.UIImagePath + "ArrowTop.png").then(function(img1) {
        ANGULAR_EXTERN_IMG_SVC.ResolveUrl(Config.UPaths.UIImagePath + "ArrowBottom.png").then(function(img2) {
            ANGULAR_EXTERN_IMG_SVC.ResolveUrl(Config.UPaths.UIImagePath + "ArrowLeft.png").then(function(img3) {
                ANGULAR_EXTERN_IMG_SVC.ResolveUrl(Config.UPaths.UIImagePath + "ArrowRight.png").then(function(img4) {
                    for (var i = 0; i < line.windowList.length; i++) {
                        var tWindow = line.windowList[i];
                        if (tWindow) {
                            var targetIcon = $('#icon_' + tWindow.id);
                            var height = targetIcon.height();
                            var width = targetIcon.width();
                            var position = targetIcon.position();
                            var elementString = '';
                            var element = null;
                            if (tWindow.toTop === 0) {
                                elementString = "<img onclick='dropMade(null,this)' style='width:" + width + "px;height:50px;top:" + (position.top - 50) + "px;left:" + position.left + "px;position:absolute;' src='" + img1 + "'/>";
                                element = $(elementString);
                                element.attr('id', "top_" + tWindow.id);
                                $('.canvas-main').append(element);

                                dropZones.push(element);
                            }
                            if (tWindow.toBottom === 0) {
                                elementString = "<img onclick='dropMade(null,this)' style='width:" + width + "px;height:50px;top:" + (position.top + height) + "px;left:" + position.left + "px;position:absolute' src='" + img2 + "'/>";
                                element = $(elementString);

                                element.attr('id', "bottom_" + tWindow.id);
                                $('.canvas-main').append(element);
                                dropZones.push(element);
                            }
                            if (tWindow.toLeft === 0) {
                                elementString = "<img onclick='dropMade(null,this)' style='height:" + height + "px;width:50px;top:" + position.top + "px;left:" + (position.left - 50) + "px;position:absolute' src='" + img3 + "'/>";
                                element = $(elementString);
                                element.attr('id', "left_" + tWindow.id);
                                $('.canvas-main').append(element);
                                dropZones.push(element);
                            }

                            if (tWindow.toRight === 0) {
                                elementString = "<img onclick='dropMade(null,this)' style='height:" + height + "px;width:50px;top:" + position.top + "px;left:" + (position.left + width) + "px;position:absolute' src='" + img4 + "'/>";
                                element = $(elementString);
                                element.attr('id', "right_" + tWindow.id);
                                $('.canvas-main').append(element);
                                dropZones.push(element);
                            }
                        }
                    }
                });
            });
        });
    });

}

function isMobile() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    }
}

function positionFirstWindow(window, icon) {
    var lineItem = getCurrentLineItem();
    if (lineItem.windowList.length > 1) {
        var myPositioning = "";
        var ratio = 0;
        if (window.toTop > 0 && window.toBottom === 0) {
            if (window.toLeft > 0 && window.toRight === 0) {
                $(icon).position({
                    my: "left top",
                    at: "center",
                    of: ".canvas-main"
                });
                return;
            } else if (window.toRight > 0 && window.toLeft === 0) {
                $(icon).position({
                    my: "right top",
                    at: "center",
                    of: ".canvas-main"
                });
                return;
            } else {
                ratio = lineItem.getHeightRatio(window);
                if (ratio > 1) {
                    $(icon).position({
                        my: "center",
                        at: "center",
                        of: ".canvas-main"
                    });
                } else {
                    $(icon).position({
                        my: "top",
                        at: "center",
                        of: ".canvas-main"
                    });
                }
                return;
            }
        } else if (window.toBottom > 0 && window.toTop === 0) {
            if (window.toLeft > 0 && window.toRight === 0) {
                $(icon).position({
                    my: "left bottom",
                    at: "center",
                    of: ".canvas-main"
                });
                return;
            } else if (window.toRight > 0 && window.toLeft === 0) {
                $(icon).position({
                    my: "right bottom",
                    at: "center",
                    of: ".canvas-main"
                });
                return;
            } else {
                ratio = lineItem.getHeightRatio(window);
                if (ratio > 1) {
                    $(icon).position({
                        my: "center",
                        at: "center",
                        of: ".canvas-main"
                    });
                } else {
                    $(icon).position({
                        my: "bottom",
                        at: "center",
                        of: ".canvas-main"
                    });
                }
                return;
            }
        }
    }

    if (window.toLeft > 0 && window.toRight === 0) {
        $(icon).position({
            my: "left",
            at: "center",
            of: ".canvas-main"
        });
        return;
    } else
    if (window.toRight > 0 && window.toLeft === 0) {
        $(icon).position({
            my: "right",
            at: "center",
            of: ".canvas-main"
        });
        return;
    } else {
        $(icon).position({
            my: "center",
            at: "center",
            of: ".canvas-main"
        });
        return;
    }
}

function positionFirstWindow(window, icon) {
    var lineItem = getCurrentLineItem();
    var ratio = 0;
    if (lineItem.windowList.length > 1) {
        var myPositioning = "";
        if (window.toTop > 0 && window.toBottom === 0) {
            if (window.toLeft > 0 && window.toRight === 0) {
                $(icon).position({
                    my: "left top",
                    at: "center",
                    of: ".canvas-main"
                });
                return;
            } else if (window.toRight > 0 && window.toLeft === 0) {
                $(icon).position({
                    my: "right top",
                    at: "center",
                    of: ".canvas-main"
                });
                return;
            } else {
                ratio = lineItem.getHeightRatio(window);
                if (ratio > 1) {
                    $(icon).position({
                        my: "center",
                        at: "center",
                        of: ".canvas-main"
                    });
                } else {
                    $(icon).position({
                        my: "top",
                        at: "center",
                        of: ".canvas-main"
                    });
                }
                return;
            }
        } else if (window.toBottom > 0 && window.toTop === 0) {
            if (window.toLeft > 0 && window.toRight === 0) {
                $(icon).position({
                    my: "left bottom",
                    at: "center",
                    of: ".canvas-main"
                });
                return;
            } else if (window.toRight > 0 && window.toLeft === 0) {
                $(icon).position({
                    my: "right bottom",
                    at: "center",
                    of: ".canvas-main"
                });
                return;
            } else {
                ratio = lineItem.getHeightRatio(window);
                if (ratio > 1) {
                    $(icon).position({
                        my: "center",
                        at: "center",
                        of: ".canvas-main"
                    });
                } else {
                    $(icon).position({
                        my: "bottom",
                        at: "center",
                        of: ".canvas-main"
                    });
                }
                return;
            }
        }


    }

    if (window.toLeft > 0 && window.toRight === 0) {
        $(icon).position({
            my: "left",
            at: "center",
            of: ".canvas-main"
        });
        return;
    } else

    if (window.toRight > 0 && window.toLeft === 0) {
        $(icon).position({
            my: "right",
            at: "center",
            of: ".canvas-main"
        });
        return;
    } else {
        $(icon).position({
            my: "center",
            at: "center",
            of: ".canvas-main"
        });
        return;
    }
}

function populateWindowPicker() {

    var windowPicker = $('.canvas-window-select');
    windowPicker.html("");
    var line = getCurrentLineItem();

    for (var i = 0; i < line.windowList.length; i++) {
        var tType = "";
        var tWindow = line.windowList[i];
        if (tWindow.temperType) {
            tType = tWindow.temperType;
        }
        var windowLabel = $('<option value="' + tWindow.id + '">' + tWindow.formatDimensions() + ' ' + tWindow.subtype + ' ' + tType + '</option>');
        windowPicker.append(windowLabel);
    }
    $(windowPicker).change(function() {

        changeSelectedWindow();
    });
}

var windowDoubleClickTimer = null;
var clickedWindow;

function drawLineItemOnCanvas(skipWindowChange) {
    $('#tdl-panel').hide();
    localStorage.setItem("lineIndex", selectedLineItem);
    if (mainQuote === null) {
        return;
    }

    mainQuote.centerLineItem(selectedLineItem);
    var line = getCurrentLineItem();

    var lbl = $('#line_lbl');
    lbl.html("Line " + (selectedLineItem + 1));


    if (line.location) {
        $('#location').html("Location: " + line.location);
    } else {
        $('#location').html("Location: ");
    }
    var canvas = $('.canvas-main');

    canvas.html("");
    $('#qty-txt').val(line.quantity);

    var imgClickCallback = function(event) {
        clickedWindow = event.target;
        if (!windowDoubleClickTimer) {
            windowDoubleClickTimer = setTimeout(function() {
                var id = $(clickedWindow).attr("id");
                selectedWindowId = id.split("_")[1];
                windowDoubleClickTimer = null;
                setOptionButtonsForCurrentWin();
                drawSelectionShader();
                if (showingGridEditor === true) {
                    updateRowColButtons();
                }
            }, 500);
        } else {
            clearTimeout(windowDoubleClickTimer);
            windowDoubleClickTimer = null;
            var id = $(clickedWindow).attr("id");
            var clickedWindowId = id.split("_")[1];
            flipWindow(clickedWindowId);
        }
    };

    var pWait = [];

    for (var i = 0; i < line.windowList.length; i++) {
        pWait.push((function(i) {
            var deferred = Q.defer();
            var tWindow = line.windowList[i];
            var tType = "";
            if (tWindow.temperType) {
                tType = tWindow.temperType;
            }
            var id = "icon_" + tWindow.id;
            createScaledIcon(line.windowList[i]).then(function(image) {
                $(image).on('click', imgClickCallback);

                if (tWindow.isFlipped) {
                    $(image).addClass("flipImage");
                }
                $(canvas).append(image);
                $(image).css("position", "absolute");
                image.attr('id', id);
                if (i === 0) {
                    positionFirstWindow(tWindow, image);
                    if (!skipWindowChange) {
                        selectedWindowId = tWindow.id;
                    }
                } else {
                    var anchor = null;
                    if (tWindow.toTop > 0) {
                        anchor = $('#icon_' + tWindow.toTop);

                        if (anchor.length) {
                            $(image).position({
                                my: "left top",
                                at: "left bottom",
                                of: "#icon_" + tWindow.toTop,
                                collision: "none"
                            });
                        }
                    }

                    if (tWindow.toBottom > 0) {
                        anchor = $('#icon_' + tWindow.toBottom);

                        if (anchor.length) {
                            $(image).position({
                                my: "left bottom",
                                at: "left top",
                                of: "#icon_" + tWindow.toBottom,
                                collision: "none"
                            });
                        }
                    }

                    if (tWindow.toLeft > 0) {
                        anchor = $('#icon_' + tWindow.toLeft);
                        if (anchor.length) {

                            $(image).position({
                                my: "left top",
                                at: "right top",
                                of: "#icon_" + tWindow.toLeft,
                                collision: "none"
                            });
                        }
                    }
                    if (tWindow.toRight > 0) {
                        anchor = $('#icon_' + tWindow.toRight);
                        if (anchor.length) {
                            $(image).position({
                                my: "right top",
                                at: "left top",
                                of: "#icon_" + tWindow.toRight,
                                collision: "none"
                            });
                        }

                    }
                }
                deferred.resolve();
            });
            return deferred.promise;
        })(i));
    }
    Q.allSettled(pWait).then(function() {
        drawGridsOnWindows();
        drawTdlOnWindows();
        setOptionButtonsForCurrentWin();
        updateMFTabs();
        updatePricing();
        setTimeout(function() {
            snapCanvas();
        }, 100);
    });
}

function rescaleAll() {
    var icons = $('.canvas-main').children();

    for (var i = 0; i < icons.length; i++) {
        if ($(icons).eq(i).attr('id').indexOf('icon_') > -1) {
            var ID = $(icons).eq(i).attr('id').split('_')[1];
            var line = getCurrentLineItem();
            var window = line.getWindowById(ID);
            if (window) {
                createScaledIcon(window).then(function(image) {
                    if (image) {
                        $(image).attr('id', "icon_" + ID);
                        $(icons).eq(i).replaceWith(image);
                    } else {
                        showErrorMessage("Error creating image in rescaleAll().");
                    }
                });
            } else {
                showErrorMessage("Error in rescale all no win found.");
            }
        }
    }
}

function saveQuote(destination) {

    ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_WINDOW_SVC.SaveQuote(mainQuote.id, JSON.stringify(mainQuote), user.UserID, mainQuote.id, mainQuote.WebQuoteID)).then(function(order) {

        mainQuote.id = order;
        window.location.href = "/" + destination;

    });

}


function cycleWindowsOnCanvas() {
    setTimeout(function() {
        nextLine();
        if (mainQuote.windowOrderList[0] && selectedLineItem < mainQuote.windowOrderList[0].lineItem.length - 1) {
            cycleWindowsOnCanvas();
        }
    }, 1000);
}

function showLastLine() {
    if (mainQuote.windowOrderList && mainQuote.windowOrderList.length > 0 && mainQuote.windowOrderList[0].lineItem) {
        var index = mainQuote.windowOrderList[0].lineItem.length;
        if (mainQuote.windowOrderList[0].lineItem[index - 1].windowList.length === 0) {
            index = index - 1;
        }
        clearNextBlinker();
        $('#edit-grid-btn').hide();
        selectedLineItem = index;
        hideGridPanels();
        drawLineItemOnCanvas();
        $('.numpad_val').val("");
        $('.numpad_val').focus();
    }
}

function nextLine(event) {
    $('#edit-grid-btn').hide();
    hideGridPanels();
    clearNextBlinker();
    if (getCurrentLineItem().windowList.length < 1) {
        return 1;
    }

    selectedLineItem = (selectedLineItem + 1);

    if (selectedLineItem == mainQuote.windowOrderList[selectedProdLine].lineItem.length) {
        mainQuote.addEmptyLineItem();
    }
    $('.numpad_val').val("");
    $('.numpad_val').focus();
    showLineItem(selectedLineItem);
    return getCurrentLineItem().quantity;
}


function backLine() {
    $('#edit-grid-btn').hide();
    hideGridPanels();
    clearNextBlinker();
    if (mainQuote.windowOrderList[0].lineItem.length > 1) {
        if (selectedLineItem === 0) {
            selectedLineItem = mainQuote.windowOrderList[0].lineItem.length - 1;
        } else {
            selectedLineItem = (selectedLineItem - 1);
        }
        $('.numpad_val').val("");
        $('.numpad_val').focus();
        showLineItem(selectedLineItem);
    }
    return getCurrentLineItem().quantity;
}


function showNotesModal() {
    $('.line-modal-title').html("Line Notes");
    var html = '<h4 id="modal-heading">Enter notes for current line.</h4>';
    html += '<textarea rows="5" id="notes-txt" placeholder="Line Notes" class="form-control" style="margin-bottom: 10px; font-size: x-large" />';
    $('#line-modal-ok-btn').unbind('click');
    $('#line-modal-ok-btn').on('click', function() {
        var notes = $('#notes-txt').val();
        mainQuote.setLineItemNotes(selectedLineItem, notes);
        $('#line-modal').modal('hide');
        initializePage();

    });
    $('#line-modal-body').html(html);
    $('#notes-txt').val(getCurrentLineItem().notes);
    $('#line-modal').modal({
        backdrop: true,
        keyboard: true // to prevent closing with Esc button (if you want this too)
    });
    $('#line-modal').modal('show');
}

function setQty(element, val) {
    var qty = (element !== null) ? $(element).val() : val;
    if (qty !== "" && !isNaN(qty) && qty > 0 && mainQuote !== null) {
        mainQuote.setQuantityForLine(selectedLineItem, qty);
    }
    drawLineItemOnCanvas(true);
}


function toggleGrid(pattern) {
    $('#grid-popup').hide();
    mainQuote.setGridPatternForWindow(pattern, selectedLineItem, selectedWindowId);
    drawGridsOnWindows();
    updateMFTabs();
    updatePricing();
    setOptionButtonsForCurrentWin();
    snapCanvas();
}

function launchQuatityDialog() {
    $('#qty-val').val("");
    qtyDialog.dialog("open");
}

function launchNotesDialog() {

    if (getCurrentLineItem().notes) {
        $('#notes-val').val(getCurrentLineItem().notes);
    }
}

function showRadiusPanel() {
    if ($('.radiusPanel').length > 0) {
        $('.radiusPanel').remove();
    }
    ANGULAR_EXTERN_IMG_SVC.ResolveUrl(Config.UPaths.UIImagePath + "black_x_btn.png").then(function(img1) {
        ANGULAR_EXTERN_IMG_SVC.ResolveUrl(Config.UPaths.WindowIconPath + "Picture/" + subTypes.Radius[i] + ".png").then(function(img2) {
            ANGULAR_EXTERN_IMG_SVC.ResolveUrl(Config.UPaths.WindowIconPath + "Picture/" + subTypes.Radius[i] + ".png").then(function(img3) {
                var html = "<div class='radiusPanel shadow'><img onclick='$(this).parent().remove()'  style='float:right;margin-top:5px;margin-right:5px' src='" + img1 + "' />";
                for (var i in subTypes.Radius) {
                    if (subTypes.Radius[i] == "Half Round") {
                        html += "<div  class='boldHover' onclick='typePushed(\"Picture\",\"" + subTypes.Radius[i] + "\")' style='float:left;text-align:center;padding:3px'><img style='z-index:400;width:75px;height:50px;margin-top:10px' src='" + img2 + "' /><h4 style='width:100px;Color:Black;margin:0px;margin-top:15px'>" + subTypes.Radius[i] + "</h4></div>";

                    } else {
                        html += "<div class='boldHover' onclick='typePushed(\"Picture\",\"" + subTypes.Radius[i] + "\")' style='float:left;text-align:center;padding:3px'><img style='z-index:400;width:75px;height:75px' src='" + img3 + "' /><h4 style='width:100px;Color:Black;margin:0px'>" + subTypes.Radius[i] + "</h4></div>";
                    }
                }
                html += "</div>";

                $('body').append($(html));
                $('.radiusPanel').position({
                    my: "right top",
                    at: "right bottom",
                    of: "#Radius"
                });
            });
        });
    });
}


function showGeoPanel() {
    if ($('.radiusPanel').length > 0) {
        $('.radiusPanel').remove();
    }
    ANGULAR_EXTERN_IMG_SVC.ResolveUrl(Config.UPaths.UIImagePath + "black_x_btn.png").then(function(img1) {
        ANGULAR_EXTERN_IMG_SVC.ResolveUrl(Config.UPaths.WindowIconPath + "Picture/" + subTypes.Geo[i] + ".png").then(function(img2) {
            var html = "<div  class='radiusPanel shadow'><img onclick='$(this).parent().remove()'  style='float:right;margin-top:5px;margin-right:5px' src='" + img1 + "' />";
            for (var i in subTypes.Geo) {
                html += "<div class='boldHover'  onclick='typePushed(\"Picture\",\"" + subTypes.Geo[i] + "\")' style='float:left;text-align:center;padding:3px'><img style='z-index:400;width:75px;height:75px' src='" + img2 + "' /><h4 style='width:100px;Color:Black;margin:0px'>" + subTypes.Geo[i] + "</h4></div>";
            }
            html += "</div>";

            $('body').append($(html));
            $('.radiusPanel').position({
                my: "right top",
                at: "right bottom",
                of: "#Geo"
            });
        });
    });
}

function changeSelectedWindow(noShader) {
    var windowId = $('.canvas-window-select').val();
    selectedWindowId = windowId;
    if (showingGridEditor === true) {
        updateRowColButtons();
    }
    setOptionButtonsForCurrentWin();
    drawSelectionShader();
}

function setOptionButtonsForCurrentWin() {
    resetWindowOptBtns();
    var line = getCurrentLineItem();
    if (line) {
        var window = line.getWindowById(selectedWindowId);
        if (window) {
            if (Constants.legWindowTypes.indexOf(window.subtype) >= 0) {
                $('#leg-panel').show();
                $('#leg-txt').val(window.legHeight);
            } else {
                $('#leg-panel').hide();
            }

            if (window.glassColor != "none") {
                $('#obs-btn-txt').html(window.glassColor);
            }

            for (var i in window.options) {
                var opt = window.options[i];
                var button = $('#' + opt.name);
                var isGrid = opt.name == "grid" ? true : false;

                var isObs = opt.name == "obscure" ? true : false;
                if (button) {
                    if (opt.selected) {
                        if (isGrid) {
                            $('#edit-grid-btn').show();
                        } else if (isObs) {
                            var text = Constants.Obscures[opt.priceKey.replace("_t", "")].name + " OBS";
                            if (window.glassColor !== "none" && window.glassColor !== null) {
                                text += " " + window.glassColor;
                            }
                            $('#obs-btn-txt').html();
                        }
                        $(button).css("background-color", "#00a7fc");
                        $(button).css("color", "#ffffff");
                    } else {
                        if (isGrid) {
                            $('#edit-grid-btn').hide();
                        } else if (isObs) {
                            if (window.glassColor === "none" || window.glassColor === null) {
                                $('#obs-btn-txt').html("Obscure");
                            } else {
                                $('#obs-btn-txt').html(window.glassColor);
                            }
                        }
                        $(button).css("background-color", "");
                        $(button).css("color", "#000000");
                    }
                }
            }
        }
    }
}

function resetWindowOptBtns() {
    $('#leg-panel').hide();
    $('#fav').css('background-color', "");

    $('#fav').css('color', "black");
    $('#win-opt-panel > button').each(function() {
        $(this).css('background-color', "");

    });
}

function setOption(element, optionName) {
    var line = getCurrentLineItem();
    if (line) {
        var selected = mainQuote.toggleOptionForWindow(line.id, selectedWindowId, optionName);
        if (selected) {
            $(element).css("background-color", "##00a7fc");
            $(element).css("color", "#ffffff");
        } else {
            $(element).css("background-color", "#eeeeee");
            $(element).css("color", "#000000");
        }
    }
    updateMFTabs();
    updatePricing();
    drawLineItemOnCanvas(true);
}

function drawSelectionShader() {
    if (selectionShader) {
        $('.select-shader').remove();
    }
    var icon = $('#icon_' + selectedWindowId);

    if (icon) {
        var width = $(icon).width();
        var height = $(icon).height();
        var top = $(icon).css("top");
        var left = $(icon).css("left");

        selectionShader = $('<div id="' + selectedWindowId + '" class="select-shader" style="width:' + width + 'px;height:' + height + 'px;top:' + top + ';left:' + left + '"">');
        $(selectionShader).mousedown(function(element) {
            clickedWindow = element;
            if (!windowDoubleClickTimer) {
                windowDoubleClickTimer = setTimeout(function() {
                    windowDoubleClickTimer = null;
                }, 300);
            } else {
                clearTimeout(windowDoubleClickTimer);
                windowDoubleClickTimer = null;
                flipWindow(selectedWindowId);

            }
        });

        $('.canvas-main').append(selectionShader);
    }

}

var iconTimer = null;

function windowIconPressed(windowId) {
    if (!iconTimer) {
        iconTimer = setTimeout(function() {
            flipWindow(windowId);
            iconTimer = null;
        }, 400);
    } else {

    }
}

function drawXoxHalfGrid(icon, gridId, win) {
    var width = $(icon).width();
    var gridWidth = width / 4;
    var height = $(icon).height();
    var top = $(icon).css("top");
    var left = $(icon).css("left");
    var leftGridStart = (Number(left.replace("px", "")) + width) - gridWidth;
    $('#' + gridId + 'Left').remove();
    $('#' + gridId + 'Right').remove();
    var tableLeft = $('<table  onclick="windowGridClicked(this)" id="' + gridId + 'Left" style="z-index:100;border-spacing:0px;position:absolute;width:' + gridWidth + 'px;height:' + height + 'px;top:' + top + ';left:' + left + '">');
    var tableRight = $('<table  onclick="windowGridClicked(this)" id="' + gridId + 'Right" style="z-index:100;border-spacing:0px;position:absolute;width:' + gridWidth + 'px;height:' + height + 'px;top:' + top + ';left:' + leftGridStart + 'px">');
    var rowHTML = "";
    for (var i = 0; i < win.rows; i++) {
        rowHTML = "<tr>";
        for (var j = 0; j < win.columns; j++) {
            rowHTML += "<td style='border: 1px solid white'></td>";
        }
        rowHTML += "</tr>";
        $(tableRight).append(rowHTML);
        $(tableLeft).append(rowHTML);
    }
    $('.canvas-main').append(tableLeft);
    $('.canvas-main').append(tableRight);
}

function drawGridsOnWindows() {
    var line = getCurrentLineItem();
    for (var i in line.windowList) {
        var win = line.windowList[i];
        var gridId = "grid_" + win.id;
        $('#' + gridId).remove();
        var icon = null;
        var width = null;
        var height = null;
        var top = null;
        var left = null;
        var table = null;
        var rowHTML = "";
        if (win.gridPattern == "full" || win.gridPattern == "colonial") {
            icon = $('#icon_' + win.id);
            if (win.subtype == "xox" && win.isHalfGrid()) {
                drawXoxHalfGrid(icon, gridId, win);
            } else {
                width = $(icon).width();
                height = $(icon).height();
                if (win.subtype.toLowerCase() == "single hung" && win.isHalfGrid()) {
                    height = height / 2;
                }
                var pos = $(icon).position();
                top = pos.top + 4;
                left = pos.left + 4;
                table = $('<table  onclick="windowGridClicked(this)" id="' + gridId + '" style="z-index:100;border-spacing:0px;position:absolute;width:' + (width - 4) + 'px;height:' + (height - 4) + 'px;top:' + top + 'px;left:' + left + 'px">');
                rowHTML = "";
                for (var io = 0; io < win.rows; io++) {
                    rowHTML = "<tr>";
                    for (var j = 0; j < win.columns; j++) {
                        rowHTML += "<td style='border: 1px solid white'></td>";
                    }
                    rowHTML += "</tr>";
                    $(table).append(rowHTML);
                }
                $('.canvas-main').append(table);
            }
        } else if (win.gridPattern == "top down") {
            icon = $('#icon_' + win.id);
            width = $(icon).width();
            height = $(icon).height();
            top = $(icon).css("top");
            left = $(icon).css("left");
            var topDownScaler = win.topDownHeight / win.realHeight;
            height = height * topDownScaler;
            table = $('<table onclick="windowGridClicked(this)" id="' + gridId + '" style="z-index:100;border-spacing:0px;position:absolute;width:' + width + 'px;height:' + height + 'px;top:' + top + ';left:' + left + '">');
            rowHTML = "";
            for (var ij = 0; ij < win.rows; ij++) {
                rowHTML = "<tr>";
                for (var jo = 0; jo < win.columns; jo++) {
                    rowHTML += "<td style='border: 2px solid white'></td>";
                }
                rowHTML += "</tr>";
                $(table).append(rowHTML);
            }

            $('.canvas-main').append(table);
        } else if (win.gridPattern == "perimeter") {
            icon = $('#icon_' + win.id);
            width = $(icon).width();
            height = $(icon).height();
            top = $(icon).css("top");
            left = $(icon).css("left");
            var perimIcon = $('<div  onclick="windowGridClicked(this)" id="' + gridId + '" class="coverDiv cover" style="background-image:url(' + Config.Paths.WindowIconPath + 'Grid/noframeperim.png);z-index:100;position:absolute;width:' + width + 'px;height:' + height + 'px;top:' + top + ';left:' + left + '">');

            $('.canvas-main').append(perimIcon);

        }

    }
}

function windowGridClicked(element) {
    if (!windowDoubleClickTimer) {
        windowDoubleClickTimer = setTimeout(function() {
            var id = $(element).attr("id");
            selectedWindowId = id.split("_")[1];
            windowDoubleClickTimer = null;
            setOptionButtonsForCurrentWin();
            drawSelectionShader();
            if (showingGridEditor === true) {
                updateRowColButtons();
            }
        }, 500);
    } else {
        clearTimeout(windowDoubleClickTimer);
        windowDoubleClickTimer = null;
        var id = $(element).attr("id");
        var clickedWindowId = id.split("_")[1];
        flipWindow(clickedWindowId);
    }

}

function flipWindow(id, element) {
    if (!element) {
        element = $('#icon_' + id);
    }
    var flipped = mainQuote.flipWindow(selectedLineItem, id);
    if (flipped) {
        $(element).addClass("flipImage");
    } else {
        $(element).removeClass("flipImage");
    }
    snapCanvas();
    return false;
}

function createScaledIcon(window) {
    var deferred = Q.defer();
    var url = Config.UPaths.WindowIconPath + window.type + "/" + window.subtype + ".png";
    ANGULAR_EXTERN_IMG_SVC.ResolveUrl(url).then(function(img) {
        var image = $('<img id="icon_' + window.id + '" src="' + img + '" class="winicon"/>');
        var dims = getScale(window.realWidth, window.realHeight);
        image.css('width', dims[0]);
        image.css('height', dims[1]);
        //We can't draw a border around geo windows as they borders are square.
        if (window.type == "Picture" && window.subtype != "Picture") {

        } else {
            image.css('border', '2px solid black');
        }
        deferred.resolve(image);
    });
    return deferred.promise;
}



function drawGridsOverIcons() {
    var line = getCurrentLineItem();
    if (line) {
        for (var window in line.windowList) {
            if (window.gridPattern != "none") {

            }
        }
    }
}

function firstWindow(window) {
    rescaleAll();

    createScaledIcon(window).then(function(image) {
        var canvas = $('.canvas-main');
        canvas.append(image);
        updatePricing(window);
    });

}

function getCurrentLineItem() {
    if (mainQuote && mainQuote.windowOrderList && mainQuote.windowOrderList[selectedProdLine]) {
        if (mainQuote.windowOrderList[selectedProdLine].lineItem.length - 1 < selectedLineItem) {
            mainQuote.addEmptyLineItem();
        }
        return mainQuote.windowOrderList[selectedProdLine].lineItem[selectedLineItem];
    } else {
        //launchCustomers();
        //showErrorMessage("Please select or create a quote to get started.");
    }
}

function showLineItem(index) {

    selectedLineItem = index;
    var canvas = $('.canvas-main');
    canvas.html("");

    var ind = $('#ind-price');
    var tot = $('#total-price');
    var line = getCurrentLineItem();
    var price = line.priceInDollars;
    ind.html("$" + price.toFixed(2) + "");
    tot.html("$" + (Number(price) * line.quantity).toFixed(2) + "");

    //    for (var i = 0; i < line.windows.length; i++) {
    //      firstWindow(line.windows[i]);
    //}
    drawLineItemOnCanvas();
    if (showingGridEditor === true) {
        updateRowColButtons();
    }
}

function updatePricing() {
    var ind = $('#ind-price');
    var tot = $('#total-price');
    var line = getCurrentLineItem();
    var price = line.priceInDollars;
    ind.html("$" + price.toFixed(2));
    tot.html("$" + (Number(price) * line.quantity).toFixed(2));

}

function fracPushed(num, denom) {
    var dim_line = $('.numpad_val');
    dim_line.val(dim_line.val() + " " + num + "/" + denom);
    $('.fracPanel').remove();
}


function numPushed(element) {
    if (qtyDialog.dialog("isOpen")) {
        return;
    }
    var value = $(element).attr("id");
    value = value.replace(/\s+/g, '');
    var dim_line = $('.numpad_val');
    var html = "";

    if (!isNaN(value)) {
        html = dim_line.html() + value;
        dim_line.val(html);
        return;
    } else {
        var id = $(element).attr('id');
        switch (id) {
            case 'half_btn':
                html = dim_line.html() + " 1/2";
                dim_line.html(html);
                break;
            case 'qty_btn':
                launchQuatityDialog();
                break;
            case 'del_btn':
                html = dim_line.html();
                html = html.slice(0, html.length - 1);
                if (html === "") {
                    html = " ";
                }
                dim_line.html(html);
                break;
            case 'clr_btn':
                dim_line.html(' ');
                break;
            case 'x_btn':
                html = dim_line.html();
                html += " x ";
                dim_line.html(html);
                break;
        }

    }
}
