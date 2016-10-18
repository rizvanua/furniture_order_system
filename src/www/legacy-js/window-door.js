var windowsReturned, totalWindowsPricing;
var transomCell;
var quoteID;
var manufacturer;
var prodLine;
var doorType;
var hasTransom;
var transomHeight = 0;
var transomFrac = null;
var doorDims;
var customMf;
var customLine;

$('#doorHeaderTxt').html(doorType);


function customDoorModal(line) {
    $('.modal-title').html("Add Custom Door");
    var html = '<h4 id="modal-heading">Custom Door</h4>';
    html += '<input id="doorDims" placeholder="Door Dimensions" class="form-control" style="margin-bottom: 10px; font-size: x-large;height: 50px" />';
    html += '<input id="doorTransom" placeholder="Transom Height" class="form-control" style="margin-bottom: 10px; font-size: x-large;height: 50px" />';
    html += '<p id="login-msg"></p>';
    $('#modal-ok-btn').unbind('click');
    $('#modal-ok-btn').on('click', function() {
        var dimensions = $('#doorDims').val();
        var transom = $('#doorTransom').val();
        if (transom !== "") {
            transomHeight = transom;
        }
        getCustomWindow(manufacturer, customLine, dimensions);

        $('#myModal').modal('hide');
    });
    $('#my-modal-body').html(html);
    $('#myModal').modal('show');
}


$('#customTrans').on("change", function() {
    var num = $(this).val();
    if (!isNaN(num)) {
        transomHeight = num;
    }
    drawDoorButtons();
});

$('#customTrans').on("click", function() {
    if (transomCell) {
        $(transomCell).css("background-color", "#1f1f1f");
    }
    transomCell = $(this).parent();
    $(transomCell).css("background-color", "#277290");
});

function launchDoors() {
    quoteID = localStorage.getItem("currentQuoteId");
    manufacturer = lastMf;
    prodLine = lastLine;
    doorType = localStorage.getItem("doorSelection");
    hasTransom = localStorage.getItem("includeTransom");
    transomHeight = 0;
    if (transomCell) {
        $(transomCell).css("background-color", "#ffffff");
        transomCell = null;
    }
    drawDoorButtons();
    if (doorType == "4 Panel") {
        $('#transom-panel').hide();
    } else {
        $('#transom-panel').show();
    }
    ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_WINDOW_SVC.GetDoorDims(manufacturer, null, 'Patio Door', doorType)).then(function(jsonList) {
        doorDims = jsonList;
        drawDoorButtons();
    });
}

function drawDoorButtons() {
    var html = "";
    for (var i in doorDims) {
        html += "<div style=\"height:500px;width:20%;float:left;overflow:auto;text-align:center\">";
        html += "<h2 style='color:Black'>" + doorDims[i].name + "</h2>";
        for (var j in doorDims[i].dimensions) {
            var newDims = doorDims[i].dimensions[j][0] + " x " + (Number(doorDims[i].dimensions[j][1].trim()) + Number(transomHeight));
            html += "<button class=\"btn\" style=\"padding:2px;color:Black;background-color:White;border:1px solid black; border-radius:5px;font-size:large;width:95%\" onclick=\"getClosestWindow('" + manufacturer + "','" + doorDims[i].name + "',this,'" + newDims +"')\">" + newDims + "</button>";
        }
        if (doorDims[i].dimensions.length > 0) {
            html += "<button class=\"btn\" style=\"color:Black;background-color:White;border:1px solid black; border-radius:5px;font-size:large;width:95%\" onclick=\"getClosestWindow('" + manufacturer + "','" + doorDims[i].name + "',this,'Custom')\">Custom</button>";
        }
        html += "</div>";
    }
    $('.doorPanel').html(html);
}

function selectTransom(tableCell) {
    if (transomCell) {
        $(transomCell).css("background-color", "#ffffff");
    }
    transomCell = tableCell;
    $(transomCell).css("background-color", "#277290");
    transomHeight = $(transomCell).attr('id').trim();
    drawDoorButtons();
}

function parseDimAndFrac(dimString) {
    if (dimString.indexOf('/') > -1) {
        var vals = dimString.split(' ');
        if (vals.length > 1) {
            var fracVals = vals[1].split('/');
            if (fracVals.length > 1) {
                if (!isNaN(vals[0]) && !isNaN(fracVals[0]) && !isNaN(fracVals[1])) {
                    return { wholeNum: Number(vals[0]), frac: { num: fracVals[0], denom: fracVals[1] } };
                }
            }
        }
    } else {
        if (!isNaN(dimString)) {
            return { wholeNum: Number(dimString) };
        }
    }
}



function getCustomWindow(mf, productLine, dimString) {
    windowsReturned = 0;
    totalWindowsPricing = mainQuote.windowOrderList.length;
    var selectedOrder = mainQuote.getOrder(manufacturer, prodLine);

    var dims = parseDims(dimString);
    if (dims.rWidth && dims.rHeight) {
        addImage = true;
        var line = getCurrentLineItem();
        mainQuote.addClosestDoor(dims.rWidth, dims.wFraction, dims.rHeight - transomHeight, dims.hFraction, doorType, mf,
            productLine, selectedOrder, line.id, transomHeight, transomFrac, false);

    }
    $('#door-panel').modal('hide');
}



function getClosestWindow(mf, productLine, button, dimString) {
    windowsReturned = 0;
    totalWindowsPricing = mainQuote.windowOrderList.length;
    var selectedOrder = mainQuote.getOrder(manufacturer, prodLine);
    if (dimString.indexOf('Custom') > -1) {
        customLine = productLine;
        customMf = mf;
        customDoorModal(prodLine);
        return;
    }
    var dims = parseDims(dimString);
    if (dims.rWidth && dims.rHeight) {
        addImage = true;
        var line = getCurrentLineItem();
        mainQuote.addClosestDoor(dims.rWidth, dims.wFraction, dims.rHeight - transomHeight, dims.hFraction, doorType, mf,
            productLine, selectedOrder, line.id, transomHeight, transomFrac, true);

    }
    $('#door-panel').modal('hide');

}
