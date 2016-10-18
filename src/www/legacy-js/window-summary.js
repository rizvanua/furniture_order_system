var finTypes = null;
//holds the name of the last selected line and mf.
var lastMf = null;
var xBtnUrl;
var gridType = {
    "grid_1": "5/8 Flat",
    "grid_2": "1' Sculptured",
    "grid_3": "SDL"
};

var isFirstSave = true;
var lastLine = null;
var currentOrder = null;
var showColumnInfo = false;
var showPricing = false;
var showVendorCost = false;
//the productline config object for the selected order.
var pConfig = null;

function togglePricing(value) {
    if (value !== null && value !== undefined) {
        showPricing = value;
    } else {
        showPricing = !showPricing;
    }
    initializePage();
}

function toggleVendorCost(value) {
    if (value !== null && value !== undefined) {
        showVendorCost = value;
    } else {
        showVendorCost = !showVendorCost;
    }
    initializePage();
}

function createNewAddOn() {
    var cName = $('#charge-name').val();
    var cAmt = $('#charge-amount').val();
    var cQty = $('#charge-qty').val();


    var errorMsg = $('#error-msg');
    if (!cName || cName === '') {
        errorMsg.html("Please enter a description of your charge");
        return;
    }
    if (!cAmt || cAmt === '' || isNaN(cAmt)) {
        errorMsg.html("Please enter a valid charge amount.");
        return;
    }
    if (!cQty || cQty === '' || isNaN(cQty)) {
        errorMsg.html("Please enter a valid charge quantity");
        return;
    }
    errorMsg.html('');
    mainQuote.createNewAddOnCharge(cName, cAmt, cQty);
    calculateOrderPrices();
    $('#myModal').modal('hide');
}



function showLineAddModal() {
    $('.line-modal-title').html("Line Item Add");
    var html = '<h4 id="modal-heading">Enter the details of the add on charge.</h4>';
    html += '<input id="charge-name" placeholder="Charge name" class="form-control" style="margin-bottom: 10px; font-size: x-large;height: 50px" />';
    html += '<input id="charge-amount" placeholder="Charge amount ($)" type="number" class="form-control" style="margin-bottom: 10px; font-size: x-large;height: 50px" />';
    html += '<input id="charge-qty" placeholder="Charge quantity" type="number" class="form-control" style="margin-bottom: 10px; font-size: x-large;height: 50px" />';
    html += "<p id='error-msg'></p>";
    $('#line-modal-ok-btn').unbind('click');
    $('#line-modal-ok-btn').on('click', function() {
        createNewAddOn();
        $('#line-modal').modal('hide');
    });
    $('#line-modal-body').html(html);
    $('#line-modal').modal('show');
}


function calculateOrderPrices() {
    var activeInfos = [];
    var firstMf;
    var firstLine;

    //pick out which manufacturers are currently being used and price them.
    for (var i in mf_info) {
        var orders = mainQuote.getOrdersByMf(mf_info[i].manufacturer);
        if (orders && orders.length > 0) {
            firstMf = orders[0].manufacturer;
            firstLine = orders[0].productLine;
            for (var j in orders) {
                orders[j].calculateOrderPrice(mainQuote.quoteDetails.taxPercentage, mainQuote.addOnCharge, mainQuote.quoteDetails.exchangeRate, mainQuote.laborCharge, mf_info[i]);
            }
            // activeInfos.push(mf_info_list[i]);
        }
    }

    //mf_info = activeInfos;
    lastLine = localStorage.getItem("lastViewedLine");
    lastMf = localStorage.getItem("lastViewedMf");
    if (!lastLine || !lastMf) {
        lastLine = firstLine;
        lastMf = firstMf;
        localStorage.setItem("lastViewedMf", lastMf);
        localStorage.setItem("lastViewedLine", lastLine);
    }
    setLineConfig(lastMf, lastLine);
    initializePage();
}

function setBrandHeader(mf, line) {
    ANGULAR_EXTERN_IMG_SVC.ResolveUrl(Config.UPaths.ManufacturerImagePath + mf + ".png").then(function(img1) {
        $('#brand-header-img').attr('src', img1);
        $('#brand-header-txt').html(line);
    });
}

function bindCurrentOrder(mf, line) {
    var order = mainQuote.getOrder(mf, line);
    var info = getMfInfo(mf);
    $('#opt-frame-color').html(order.frameColor);
    $('#opt-line-txt').html(line);
    $('#opt-ext-paint').html(order.exteriorColor);
    $('#opt-glass-type').html(info.lines[line].loweNames[order.glassType]);
    $('#opt-lock-type').html(order.getLockStyle());
    $('#opt-door-line').html(order.defaultDoorLine);
    $('#opt-preserve').html("");
    $('#opt-slope-sill').html("");
    ANGULAR_EXTERN_IMG_SVC.ResolveUrl(Config.UPaths.ManufacturerImagePath + mf + ".png").then(function(img1) {
        $('#options-img').attr('src', img1);
    });
}

function changeSelectedLine(mf, line) {
    mf = mf.replace('%20', ' ');
    line = line.replace('%20', ' ');
    lastMf = mf;
    lastLine = line;
    localStorage.setItem("lastViewedMf", mf);
    localStorage.setItem("lastViewedLine", line);
    setLineConfig(mf, line);
    initializePage();
}

function setLineConfig(mf, line) {
    for (var i in mf_info) {
        var mfInfo = mf_info[i];
        if (mfInfo.manufacturer == mf && mfInfo.lines[line]) {
            pConfig = mfInfo.lines[line];
            $(document).trigger('window.linechange', [pConfig]);
        }
    }
}

function deleteAddOn(event, addOnIndex) {
    mainQuote.removeAddOnCharge(addOnIndex);
    calculateOrderPrices();
    ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_WINDOW_SVC.SaveQuote(mainQuote.id,
        JSON.stringify(mainQuote), user.UserID, mainQuote.id, mainQuote.WebQuoteID)).then(function(order) {

        mainQuote.id = order;

    });
}

// we need this to take care of a problem where initializePage is called several times, 
//and the #summary_mf_column is cleared before the async code resolves leaving duplicate mfs
function getMfHtml(mfNames) {
    var deferred = Q.defer();

    var pWait = [];

    var html = '';

    for (var n = 0; n < mfNames.length; n++) {
        pWait.push((function(n) {
            var deferred = Q.defer();
            var orders = mainQuote.getOrdersByMf(mfNames[n]);
            addMfPanelToColumn(mfNames[n], orders, n).then(function(tmp) {
                html += tmp;
                deferred.resolve();
            });
            return deferred.promise;
        })(n));
    }

    Q.allSettled(pWait).then(function() {
        deferred.resolve(html);
    });

    return deferred.promise;
}

function initializePage() {
    ANGULAR_EXTERN_IMG_SVC.ResolveUrl(Config.UPaths.UIImagePath + "black_x_btn.png").then(function(img1) {
        var mfNames = mainQuote.getMfNamesInOrder();
        var slHtml = "";

        getMfHtml(mfNames).then(function(html) {
            $('#summary_mf_column').html(html);
            $.material.init();
        });

        //$('#summary_mf_column').html($('#summary_mf_column').html());

        if (lastMf && lastLine) {
            currentOrder = mainQuote.getOrder(lastMf, lastLine);
        }

        if (!currentOrder) {
            if (mainQuote.windowOrderList.length === 0) {
                $('#canvas').html("");
                return;
            }
            currentOrder = mainQuote.windowOrderList[0];
            lastMf = currentOrder.manufacturer;
            lastLine = currentOrder.productLine;
            localStorage.setItem("lastViewedMf", lastMf);
            localStorage.setItem("lastViewedLine", lastLine);
            setLineConfig(lastMf, lastLine);
        }

        if (showVendorCost === true) {

            //$('#summary_list').html("Total vendor cost: $" + currentOrder.getVendorCost(pConfig, mainQuote.laborCharge).toFixed(2));
            slHtml += "Total vendor cost: $" + currentOrder.getVendorCost(pConfig, mainQuote.laborCharge).toFixed(2);
        }

        setBrandHeader(currentOrder.manufacturer, currentOrder.productLine);

        bindCurrentOrder(currentOrder.manufacturer, currentOrder.productLine);

        var pWait = [];

        for (var l in currentOrder.lineItem) {
            var lineLength = currentOrder.lineItem.length - 1;
            var item = currentOrder.lineItem[lineLength - l];
            if (item.filingId) {
                pWait.push(addLineItem(item, mainQuote.lineIcons[item.filingId], lineLength - l, currentOrder));
            } else {
                pWait.push(addLineItem(item, mainQuote.lineIcons[item.id], lineLength - l, currentOrder));
            }
        }

        var html = "";

        Q.allSettled(pWait).then(function(res) {

            res.forEach(function(temp) {
                if (temp.value !== undefined && temp.value !== null) {
                    slHtml += temp.value;
                }
            });

            for (var c in mainQuote.addOnCharge) {
                var charge = mainQuote.addOnCharge[c];
                html += "<h1 style='color:Black;float:right;text-align:right;border-bottom:2px solid Black;width:100%;margin:0px; padding:20px'>" + charge.description + " - Qty " + charge.quantity + " -  $" + ((charge.price * charge.quantity) + charge.taxTotal);
                html += '<img onclick="deleteAddOn(event,' + c + ')" style="float:right;width:30px;margin-left:30px" src="' + img1 + '" />';
                html += "</h1>";
            }

            var totalSqFt;
            if (mainQuote.quoteDetails.isNet === true) {
                totalSqFt = currentOrder.getNetSqFt();
            } else {
                totalSqFt = currentOrder.getSqFt();
            }


            var uVal = currentOrder.getAvgUValue().toFixed(3);
            var shgc = currentOrder.getAvgSHGC().toFixed(3);
            html += "<h4 class='pull-right'>SqFt Total: " + totalSqFt.toFixed(2) + " Ft <sup style='font-size:small'>2</sup><br/>U-Value: " + (isNaN(uVal) ? "" : uVal) + "</h4>";
            html += "<h4 class='pull-left'>Window Total: " + currentOrder.getWindowCount() + "<br/>SHGC: " + (isNaN(shgc) ? "" : shgc) + "</h4>";
            slHtml += html;

            $('#summary_list').html("");
            $('#summary_list').append(slHtml);

            var pressTimer = null;

            $("#togglePrices").on("touchstart", function() {
                pressTimer = window.setTimeout(function() {}, 1000);
            });
        });

    });

}

function toggleColumnInfo() {
    showColumnInfo = !showColumnInfo;
    initializePage();
}

function addMfPanelToColumn(mfName, orders, index) {

    var deferred = Q.defer();

    if (mfName === undefined) {
        return;
    }

    ANGULAR_EXTERN_IMG_SVC.ResolveUrl(Config.UPaths.ManufacturerImagePath + mfName + ".png").then(function(img1) {
        mfName = mfName.replace(/ /g, '%20');
        var html = '<div class=" blueBorder" style="width:100%;float:left;text-align:center;margin-bottom:10px"><img style="width:90%;margin-left:5%" class="summaryMfImg" src="' + img1 + '" />';
        var textColor = "Black";
        mfName = mfName.replace(/%20/g, '_');
        for (var or in orders) {
            if (orders[or].hasErrors()) {
                textColor = "red";
            } else {
                textColor = '#00a7fc';
            }
            if (lastMf && lastLine && lastMf == mfName && lastLine == orders[or].productLine) {
                html += '<div class="summaryMfLine panel boldHover  radio radio-primary" style="margin-bottom:5px;width:90%;border: 1px solid Black;height:25px;color:' + textColor + '">';
                html += '<label class="col-xs-12"><input type="radio" name="' + mfName + '-radio" id="mf-' + mfName + '" value="' + orders[or].productLine + '" checked="true" /><span style="float:left;margin-left:20px">' + orders[or].productLine + '</span> <span style="margin-left:95px;float:left">' + orders[or].totalCost.toFixed(2) + '</label></div>';

            } else {
                html += '<div onclick="changeSelectedLine(\'' + mfName + '\',\'' + orders[or].productLine + '\')"  class="summaryMfLine panel boldHover radio radio-primary" style="margin-bottom:5px;width:90%;height:25px;color:' + textColor + '" >';
                html += '<label class="col-xs-12"><input  type="radio" name="' + mfName + '-radio" id="mf-' + mfName + '" value="' + orders[or].productLine + '" checked="false" /><span style="float:left;margin-left:20px">' + orders[or].productLine + '</span> <span style="margin-left:95px;float:left">' + orders[or].totalCost.toFixed(2) + '</label></div>';
            }
        }
        if (isEditMode === false) {
            html += '<button onclick="saveToMaster(\'' + mfName + '\')" class="blueBorder pull-left col-xs-11" style="padding:3px;margin:5px;text-align:center;color:#00a7fc">SAVE BID TO MASTER</button>';
        } else {
            html += '<button onclick="saveToMaster(\'' + mfName + '\')" class="blueBorder pull-left col-xs-11" style="padding:3px;margin:5px;text-align:center;color:#00a7fc">OVERWRITE CURRENT BID</button>';
        }
        html += "</div>";

        //$('#summary_mf_column').append(html);

        //$.material.init();

        deferred.resolve(html);
    });

    return deferred.promise;
}


function saveToMaster(mf) {

    ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_USER_SVC.CurrUser()).then(function(user) {
        var selectedLine = $('input[name=' + mf + '-radio]:checked').val();
        var tempList = [];
        var testQuote = mainQuote;
        tempList = testQuote.windowOrderList;
        mf = mf.replace(/_/g, ' ');
        var orders = testQuote.getOrdersByMf(mf);
        var length = orders.length;
        var quoteCounter = 1;
        for (var i in orders) {
            testQuote.windowOrderList = [];
            testQuote.windowOrderList.push(orders[i]);
            if (isEditMode === false) {
                if (isFirstSave === true) {
                    isFirstSave = false;
                } else {
                    testQuote.id = -1;
                }
            }
            testQuote.masterId = masterId;

            ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_WINDOW_SVC.SaveQuote(testQuote.id,
                JSON.stringify(testQuote), user.UserID, testQuote.id, testQuote.id)).then(function(order) {
                if (quoteCounter++ == length) {
                    testQuote.id = order;
                    isAutoSaving = false;

                    testQuote.windowOrderList = tempList;
                    toastr.success("List saved to master quote.");
                    quoteSaved = true;
                }
            });
        }
    });

    //testQuote.windowOrderList = tempList;
    //toastr.success("List saved to master quote.");
    //quoteSaved = true;
    // return test;
}

function showInBuild(index) {
    $('#tdl-panel').hide();
    selectedLineItem = parseInt(index);
    drawLineItemOnCanvas();
}

function brandChangePanel(index) {
    var doors = pConfig.doorLines;
    var listPanel = $('#change-brand-list');
    var html = "";
    for (var i in doors) {
        html += "<h2>" + doors[i] + "</h2>";
    }
    listPanel.html(html);
}

function getPrice(price) {

    if (currentOrder) {
        price = price * currentOrder.onFactor;

        price = price * ((currentOrder.markup / 100) + 1);
    }
    return price;
}

function addLineItem(line, lineIcons, lineIndex, order) {
    var deferred = Q.defer();
    var html = "";
    var textColor = 'Black';
    if (!line || !line.windowList || line.windowList.length === 0) {
        return;
    }
    if (line.hasErrors()) {
        textColor = "red";
    }
    var exteriorString = "";
    var dims = null;
    if (line.windowList.length == 1) {
        var window = line.windowList[0];
        var tempType = "";
        var brandChanger = "";
        if (window.type == "Patio Door") {
            brandChanger = 'ondblclick="brandChangePanel(' + lineIndex + ')"';
        }
        if (window.temperType) {
            tempType = window.temperType;
        }
        html = '<div ' + brandChanger + ' onclick="showInBuild(' + lineIndex + ')"  class="summaryLineItem boldHover">';
        html += '<h6 style="float:left;width:100%;color:' + textColor + '">Line ' + (Number(lineIndex) + 1) + " - " + line.windowList[0].mfct + ' ' + line.windowList[0].prodLine + '</h6>';
        if (lineIcons && lineIcons.main) {
            html += '<img src="' + lineIcons.main + '" style="float: left; width: 40%;" />';
        }
        html += '<img onclick="deleteLine(event,' + lineIndex + ')" style="float:right;width:30px" src="' + Config.StaticImages.BlackXBtn + '" /><div style="width: 55%; float: left; color: Black; margin-top: 0px; margin-left: 2%">';
        html += '<h4 style="color:' + textColor + '">' + line.quantity + ' - ';
        if (mainQuote.quoteDetails.isNet) {
            dims = calculateNet(window, mainQuote.quoteDetails.isNet);
            html += formatDims(dims);
        } else {
            html += window.formatDimensions();
        }
        if (window.isCustomDoor) {
            html += " Custom";
        }
        exteriorString = "";
        if (window.exteriorColor != "None") {
            exteriorString = "Exterior: " + window.exteriorColor;
        }
        html += ' ' + window.getName() + ' ' + tempType + '</h4><p style="margin-left: 5%">' + exteriorString + ' Frame: ' + window.frameColor + '<br/>';
        if (showColumnInfo) {
            html += window.windowLineItemId + "<br/>";
            html += getWindowColumnOptions(window);
        }
        html += getWindowOptionsText(window) + '</p>';
        if (line.location) {
            html += "<p>Location: " + line.location + "</p>";
        }
        if (line.notes && line.notes !== "") {
            html += "<p><br/>Notes: " + line.notes + "</p>";
        }
        html += '</div>';
        if (showPricing) {
            html += '<div style=" margin-top: 10%"><table style="float:right"><tr><td><h3 style="margin-bottom: 1%; float: right; color: ' + textColor + ';">$' + getPrice(window.priceUSD).toFixed(2) + ' each</h3></td></tr>';
            html += '<tr><td><h3 style="float: right; color: ' + textColor + '">$' + (getPrice(window.priceUSD) * line.quantity).toFixed(2) + ' total</h3><td></tr></table></div>';
        }
        if (showVendorCost) {
            html += '<div style=" margin-top: 36%"><table style="float:right"><tr><td><h5>Vendor Cost:</h5></td></tr><tr><td><h3 style="margin-bottom: 1%; float: right; color: ' + textColor + ';">$' + window.getVendorCost(order, pConfig, mainQuote.laborCharge).toFixed(2) + ' each</h3></td></tr>';
            html += '<tr><td><h3 style="float: right; color: ' + textColor + '">$' + (window.getVendorCost(order, pConfig, mainQuote.laborCharge) * line.quantity).toFixed(2) + ' total</h3><td></tr></table></div>';
        }
        html += "</div>";
        //$('#summary_list').append(html);
        deferred.resolve(html);
    } else {
        line = new WindowLineItem(line);
        exteriorString = "";
        if (line.windowList[0].exteriorColor != "None") {
            exteriorString = "Exterior: " + line.windowList[0].exteriorColor;
        }
        html = '<div onclick="showInBuild(' + lineIndex + ')" class="summaryLineItem boldHover"><h5>Line ' + (Number(lineIndex) + 1) + '</h5><img src="' + lineIcons.main + '" style="float: left; width: 50%;margin-right:-10%" />';
        html += '<img onclick="deleteLine(event, ' + lineIndex + ')" style="float:right;width:30px" src="' + Config.StaticImages.BlackXBtn + '" /><div style="width: 45%; float: left; color: Black; margin-top: 0px; margin-left: 2%">';
        html += '<h4 style="color:' + textColor + '">' + line.quantity + ' - ';
        if (mainQuote.quoteDetails.isNet) {
            line.getLineWidth();
            line.getLineHeight();
            dims = calculateNet(line, mainQuote.quoteDetails.isNet);
            html += formatDims(dims);
        } else {
            html += line.formatDimensions();
        }
        html += ' mull</h4><p style="margin-left: 5%">' + exteriorString + ' Frame: ' + line.windowList[0].frameColor + '</p>';
        if (line.location) {
            html += "<p>Location: " + line.location + "</p>";
        }
        html += '</div>';
        if (showPricing) {
            html += '<div style=" margin-top: 6%"><table style="float:right"><tr><td><h3 style="margin-bottom: 1%; float: right; color: ' + textColor + ';">$' + getPrice(line.priceInDollars).toFixed(2) + ' each</h3></td></tr>';
            html += '<tr><td><h3 style="float: right; color: ' + textColor + '">$' + getPrice((line.priceInDollars * line.quantity)).toFixed(2) + ' total</h3></td></tr></table></div>';
        }
        if (showVendorCost) {
            html += '<div style=" margin-top: 30%"><table style="float:right"><tr><td><h5>Vendor Cost:</h5></td></tr><tr><td><h3 style="margin-bottom: 1%; float: right; color: ' + textColor + ';">$' + line.getVendorCost(order, pConfig, mainQuote.laborCharge).toFixed(2) + ' each</h3></td></tr>';
            html += '<tr><td><h3 style="float: right; color: ' + textColor + '">$' + (line.getVendorCost(order, pConfig, mainQuote.laborCharge) * line.quantity).toFixed(2) + ' total</h3><td></tr></table></div>';
        }
        if (showColumnInfo) {
            html += line.id + "<br/>";
            html += getWindowColumnOptions(undefined);
        }
        var pWait = [];
        for (var w in line.windowList) {
            pWait.push((function(w) {
                var deferred = Q.defer();
                addSubLineItem(line.windowList[w], line.quantity, lineIcons, line).then(function(temp) {
                    html += temp;
                    deferred.resolve();
                });
                return deferred.promise;
            })(w));
        }
        Q.allSettled(pWait).then(function() {
            //$('#summary_list').append(html);
            html += "</div>";
            deferred.resolve(html);
        });
    }
    return deferred.promise;
}


function deleteLine(event, index) {

    mainQuote.removeLineItem(index);
    if (mainQuote.windowOrderList[0].lineItem.length === 0) {
        mainQuote.createNewLineItem();
    }
    if (event.stopPropagation) {
        event.stopPropagation(); // W3C model
    } else {
        event.cancelBubble = true; // IE model
    }
    if (selectedLineItem >= index) {
        if (selectedLineItem > 0) {
            selectedLineItem--;
        }
        drawLineItemOnCanvas(true);
    }
    calculateOrderPrices();
    if (!isDemo) {
        ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_USER_SVC.CurrUser()).then(function(user) {
            ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_WINDOW_SVC.SaveQuote(mainQuote.id,
                JSON.stringify(mainQuote), user.UserID, mainQuote.id, mainQuote.WebQuoteID)).then(function(order) {

                mainQuote.id = order;

            });
        });
    }

}

function addSubLineItem(window, qty, lineIcons, line, order) {
    var deferred = Q.defer();
    builderCreateScaledIconAsync(window).then(function(icon) {

        var textColor = "Black";
        var tempType = "";
        if (window.temperType) {
            tempType = window.temperType;
        }
        if (window.isError) {
            textColor = "red";
        }
        var html = '<div class="summaryLineSubItem" style="width:100%">' + icon.outerHTML(); //<img src="'+ lineIcons.windows[window.id] +'" style="float: left; width: 20%" />';
        html += '<div style="width: 50%; float: left; color: Black; margin-top: 0px; margin-left: 2%">';
        html += '<h6 style="float:left;width:100%;color:' + textColor + '">' + window.mfct + ' ' + window.prodLine + '</h6><h4 style="color:' + textColor + '">';
        if (mainQuote.quoteDetails.isNet) {
            var denoms = line.getNetDenoms();
            var dims = calculateNet(window, mainQuote.quoteDetails.isNet, denoms.width, denoms.height);
            html += formatDims(dims);

        } else {
            html += window.formatDimensions();
        }
        if (window.isCustomDoor) {
            html += " Custom";
        }
        html += ' ' + window.getName() + ' ' + tempType + '</h4><p style="margin-left: 5%">';
        if (showColumnInfo) {
            html += window.windowLineItemId + "<br/>";
            html += getWindowColumnOptions(window);
        }
        html += getWindowOptionsText(window) + '</p></div>';
        if (showPricing) {
            html += '<div style=" margin-top: 6%"><table style="float:right"><tr><td><h3 style="margin-bottom: 1%; float: right; color: ' + textColor + ';">$' + getPrice(window.priceUSD).toFixed(2) + ' each</h3></td></tr>';
            html += '<tr><td><h3 style="float: right; color: ' + textColor + '">$' + getPrice((window.priceUSD * qty)).toFixed(2) + ' total</h3></td></tr></table></div><br/>';
        }
        if (showVendorCost) {
            html += '<div style=" margin-top: 23%"><table style="float:right"><tr><td><h5>Vendor Cost:</h5></td></tr><tr><td><h3 style="margin-bottom: 1%; float: right; color: ' + textColor + ';">$' + window.getVendorCost(currentOrder, pConfig, mainQuote.laborCharge).toFixed(2) + ' each</h3></td></tr>';
            html += '<tr><td><h3 style="float: right; color: ' + textColor + '">$' + (window.getVendorCost(currentOrder, pConfig, mainQuote.laborCharge) * line.quantity).toFixed(2) + ' total</h3><td></tr></table></div>';
        }
        html += "</div>";

        deferred.resolve(html);
    });
    return deferred.promise;
}


function getWindowColumnOptions(window) {
    var option;
    var optionString = "";
    if (!window || !window.options) {
        return "";
    }
    for (var i in window.options) {
        option = window.options[i];
        if (option.selected) {
            optionString += option.priceKey + ": " + option.cost + ", ";
        }
    }
    optionString += "<br />";
    return optionString;
}



function getWindowOptionsText(window) {
    var option;
    var optionString = "";
    if (mainQuote.quoteDetails.isNet) {
        optionString += "Net opening, ";
    } else {
        optionString += "Rough opening, ";
    }

    if (window.glassColor != "none") {
        optionString += window.glassColor + ", ";
    }

    for (var i in window.options) {
        option = window.options[i];
        if (option.selected) {
            if (option.isError) {
                optionString += "<span style='color:red'>";
            }

            if (option.name == "lowe") {
                optionString += pConfig.loweNames[option.priceKey.replace("_t", "")] + ", ";
            } else if (option.name == "fin") {
                optionString += finTypes[option.priceKey] + ", ";
            } else if (option.name == "grid") {
                optionString += gridType[option.priceKey.replace("_p", "")] + " " + window.gridPattern + " grid ";
                if (window.gridPattern == "full" || window.gridPattern == "colonial" || window.gridPattern == "full" ||
                    window.gridPattern == "top down") {
                    optionString += window.columns + "x" + window.rows;
                }
                optionString += ", ";
            } else if (option.name == "obscure") {


                optionString += "obscure " + Constants.Obscures[option.priceKey.replace("_t", "")].name + ", ";

            } else {
                optionString += option.name + ", ";
            }
            if (option.isError) {
                optionString += "</span>";
            }
        }
    }

    for (var io in currentOrder.mapsOptionList) {
        option = currentOrder.mapsOptionList[io];
        if (option.selected) {
            if (option.name.indexOf("Lock") > -1 || option.name.indexOf("lock") > -1) {
                if (window.type == "Slider" || window.type.toLowerCase() == "single hung") {
                    for (var j in option.selectedKeys) {
                        optionString += option.selectedKeys[j] + ", ";
                    }
                }
            } else {
                for (var ji in option.selectedKeys) {
                    optionString += option.selectedKeys[ji] + ", ";
                }
            }
        }
    }

    var shgc = window.getSHGC();
    var uVal = window.getUValue();
    optionString += ", U-Value: " + uVal.toFixed(3) + ", SHGC:  " + shgc.toFixed(3);
    if (window.type == "Slider" || window.type.toLowerCase() == "single hung" || window.type == "Casement" || window.type.toLowerCase() == "patio door" || window.type == "Awning") {
        optionString += "Screen: " + mainQuote.quoteDetails.screenType;
    }
    if (window.tdlBars && window.tdlBars.length > 0) {
        for (var tdl in window.tdlBars) {
            var numBars = 1;
            var tdlBar = window.tdlBars[tdl];
            optionString += ", SDL: " + tdlBar.startInch + '" from ' + (tdlBar.isVertical ? "left" : "top"); 
        }
    }

    return optionString;
}
