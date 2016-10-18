var mfIndex = 0;
var mf_info;
var mf_names = [];
var removeMf;
var removeLine;
var removeCheck;
var showingColorModal = false;
var warningPopover;

$('#colorModal').on('show.bs.modal', function(e) {
    showingColorModal = true;
});

$('#colorModal').on('hide.bs.modal', function(e) {
    showingColorModal = false;
});

function confirmDelete(event) {
    event.stopPropagation();
    toggleProductLine(removeMf, removeLine, removeCheck, true);
    removeCheck.popover('hide');
}



function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}
var selectedColorButton;

function showColorDialog(mf, line, type, element) {
    selectedColorButton = element;

    var pConfig = mf_info[mfIndex].lines[line];
    var colorList = $('#color-list');
    colorList.html("");
    var colorNames;
    var colorMap;
    if (type == "exterior") {
        colorNames = Object.keys(pConfig.extColors);
        colorNames.unshift("None");
        colorMap = pConfig.extColors;
    } else if (type == "frame") {
        colorNames = Object.keys(pConfig.frameColors);
        colorMap = pConfig.frameColors;
    }

    for (var i in colorNames) {
        var colorSwatch;
        if (colorNames[i] === "None") {
            colorSwatch = $("<div onclick='setColor(\"" + mf + "\",\"" + line + "\",\"" + colorNames[i] + "\",\"White\",\"" + type + "\")' style='width:100%;height:100px;background-color:White'>None</div>");
        } else {
            colorSwatch = $("<div onclick='setColor(\"" + mf + "\",\"" + line + "\",\"" + colorNames[i] + "\",\"" + padDigits(colorMap[colorNames[i]].toString(16), 6) + "\",\"" + type + "\")' style='width:100%;height:100px;background-color:#" + padDigits(colorMap[colorNames[i]].toString(16), 6) + "; '></div>");
            $(colorSwatch).html(colorNames[i]);
            var rgb = $(colorSwatch).css("background-color");
            if (useBlackText(rgb)) {
                $(colorSwatch).css("color", "#000000");
            } else {
                $(colorSwatch).css("color", "#ffffff");
            }
        }
        colorList.append(colorSwatch);
    }

    $('#colorModal').modal('show');

}

function setColor(mf, line, colorName, colorHex, colorType) {
    if (colorType == "exterior") {
        mainQuote.updateExteriorColorForOrder(colorName, mf, line);
    } else if (colorType == "frame") {
        mainQuote.updateFrameColorForOrder(colorName, mf, line);
    }

    if (selectedColorButton) {
        $(selectedColorButton).css("background-color", "#" + colorHex);
        var rgb = $(selectedColorButton).css("background-color");
        if (useBlackText(rgb)) {
            $(selectedColorButton).css("color", "#000000");
        } else {
            $(selectedColorButton).css("color", "#ffffff");
        }
        $(selectedColorButton).html(colorName);
    }
    $('#colorModal').modal('hide');
    drawLineItemOnCanvas(true);
}

function useBlackText(rgbString) {
    if (!rgbString || rgbString === "" || rgbString == "transparent") {
        return true;
    }
    var subString = rgbString.substring(rgbString.indexOf('(') + 1, rgbString.indexOf(')'));
    var rgbVals = subString.split(',');
    var red = rgbVals[0].trim();
    var green = rgbVals[1].trim();
    var blue = rgbVals[2].trim();
    var brightness;
    brightness = (red * 299) + (green * 587) + (blue * 114);
    brightness = brightness / 255000;

    // values range from 0 to 1
    // anything greater than 0.5 should be bright enough for dark text
    if (brightness >= 0.5) {
        return true;
    } else {
        return false;
    }
}



function launchOptions() {
    buildMfPanel(mf_info[mfIndex]);
    bindOrdersToView(mf_info[mfIndex]);
    $('#brand-panel').modal('show');
}

function toggleProductLine(manufacturer, productLine, element, removeLast) {
    // $(event).stopPropagation();
    manufacturer = manufacturer.replace(/_/g, ' ');
    productLine = productLine.replace(/_/g, ' ');
    var check = $(element).attr('class');
    if (check && check.indexOf("newCheckPanel") == -1) {
        element = $(element).parent().find('.checkPanel');
    }

    var $checkbox = $(element).find(".lineCheckBox");
    var order = mainQuote.getOrder(manufacturer, productLine);
    if (!order) {
        //      $checkbox.prop("checked", true);
        //       $(element).parent().find(".optPanelShader").hide();


        mainQuote.createWindowOrder(manufacturer, productLine, mf_info[mfIndex]);
        changeSelectedLine(manufacturer, productLine);
    } else {

        if (mainQuote.windowOrderList.length == 1 && !removeLast) {
            removeMf = manufacturer;
            removeLine = productLine;
            removeCheck = element;
            $(element).popover({ template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>' });
            $(element).tooltip('html', "This is the last one");

            var html = '<div  class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div><button onclick="confirmDelete(event)" class="btn btn-default">Yes</button><button class="btn btn-default">No</button></div>';
            var content = 'Removing the last manufacturer from an order will result in loss of all window data. Are you sure you want to continue?';
            $(element).popover({ title: "Warning!", placement: 'top', container: 'body', content: content, template: html });
            $(element).popover('show');
        } else {
            mainQuote.removeWindowOrder(manufacturer, productLine);
            $(element).parent().find(".optPanelShader").show();
            //   $checkbox.prop("checked", false);
        }
    }
    initializePage();
}

function buildMfPanel(current_info) {
    var $linesPanel = $('.allLinesPanel');
    var $mfPanel = $('.optHeaderPanel');
    $linesPanel.html("");
    $mfPanel.html("");
    var html = '';
    $.each(current_info.lines, function(item) {
        var splitItem = item.replace(/ /g, "_");
        var mfct = current_info.manufacturer.replace(/ /g, "_");
        var columnId = "column_" + mfct + "_" + splitItem;
        var line_html = "<div id='" + columnId + "' class='col-xs-4' style='padding:10px'>" +
            "<div  class='col-xs-8 col-xs-offset-2'>" +
            "<div class='checkbox double'><label><span style='font-size:13px;color:#00a7fc'>" +
            "" + item.toUpperCase() + "</span>" +
            "<input  onclick='toggleProductLine( \"" + mfct + "\",\"" + splitItem + "\", this)' id='main_checkbox' class='lineCheckBox double'  type='checkbox' /></label>" +
            "</div></div>" +
            "<div class='optPanelShader' onclick=''></div>" +
            "<div class='optControlHeader col-xs-6'>" +
            "<h5 style='margin-bottom: 5px;'>" +
            "Frame Color</h5>" +
            "<button style='color:Black;border: 1px solid black;width:100%;padding:6px' onclick='showColorDialog(\"" + mfct + "\",\"" + item + "\",\"frame\",this)' id='frameColorBtn' class='optColorBtn'>" +
            "White</button>" +
            "</div>" +
            "<div class='optControlHeader col-xs-6'>" +
            "<h5 style='margin-bottom: 5px;'>" +
            "Exterior Paint</h5>" +
            "<button id='extColorBtn' style='color:Black;border: 1px solid black;width:100%;padding:6px' onclick='showColorDialog(\"" + mfct + "\",\"" + item + "\",\"exterior\",this)' class='optColorBtn'>" +
            "None</button>" +
            "</div>" +
            "<div class='optControlHeader'>" +
            "<h5 style='margin-bottom: 5px;float:left'>" +
            "Glass Type</h5>" +
            "<select id='glass_spinner' onchange='setGlassType(\"" + mfct + "\", \"" + item + "\",this)' class='form-control'>";
        var loweKeys = Object.keys(current_info.lines[item].loweNames);
        var i = null;
        for (i in loweKeys) {
            line_html += "<option value='" + loweKeys[i] + "'>" + current_info.lines[item].loweNames[loweKeys[i]] + "</option>";
        }
        line_html += "</select></div>";

        line_html += '<div class="optControlHeader"><h5 style="margin-bottom: 5px;text-align:left">Door Line</h5><select id="door_spinner" onchange="setDefaultDoor(\'' + mfct + '\', \'' + item + '\',this)" class="form-control">';
        var doorLines = current_info.doorLines;
        i = null;
        for (i in doorLines) {
            if (current_info.lines[item].defaultDoorLine == doorLines[i]) {
                line_html += "<option value='" + doorLines[i] + "' selected>" + doorLines[i] + "</option>";
            } else {
                line_html += "<option value='" + doorLines[i] + "'>" + doorLines[i] + "</option>";
            }
        }
        line_html += "</select></div>";

        $.each(current_info.lines[item].mapOptions, function(opt) {
            line_html += addDynamicOptions(current_info.lines[item].mapOptions[opt], current_info.manufacturer, item);
        });
        line_html += "</div>";
        $linesPanel.append(line_html);
    });

    $mfPanel.append(html);
}

function setFrameTypeList(frameTypes) {
    var keys = Object.keys(frameTypes);
    var html = "";
    for (var i in keys) {
        html += "<option value='" + keys[i] + "'>" + frameTypes[keys[i]] + "</option>";
    }
    $('#select_frameType').html(html);
    $('#select_frameType').on('change', function() {
        mainQuote.setGlobalFinType($(this).val());
        drawLineItemOnCanvas(true);
        // $('#global-panel').hide();
    });
}

function setFrameType(frame) {
    mainQuote.setGlobalFinType(frame);
    drawLineItemOnCanvas(true);
}

function setDefaultDoor(mf, line, element) {
    var defaultDoor = $(element).val();
    mainQuote.setDefaultDoorForOrder(mf, line, defaultDoor);
}

function setGlassType(mf, line, element) {
    var selection = $(element).val();
    if (selection) {
        mainQuote.updateGlassType(mf, line, selection);
    }
    drawLineItemOnCanvas(true);
}

function changeGlobalGridPattern(val) {
    mainQuote.setGlobalGridPattern(val);
    selectedLineItem = 0;
    $('#global-panel').hide();
    drawLineItemOnCanvas();
    cycleWindowsOnCanvas();
}

function setGlobalGlassColor(val) {
    mainQuote.setGlobalGlassColor(val);
    $('#global-panel').hide();
    drawLineItemOnCanvas(true);
}

function changeGlobalOpening(val) {
    var isNet = false;
    if (val == "Net") {
        isNet = true;
    } else {
        isNet = false;
    }

    // netChangeOpening(mainQuote, isNet, function (quote) {
    //   mainQuote = new Quote(quote);
    mainQuote.quoteDetails.isNet = isNet;
    drawLineItemOnCanvas(true);
    // });
}

function changeGridType(gType) {
    mainQuote.setGlobalGridType(gType);
    drawLineItemOnCanvas(true);
}

function setDynamicOption(optionName, optionKey, mf, line, element) {
    var toggle;
    if ($(element).is("select")) {
        optionKey = $(element).val();
    }

    var current_info = mf_info[mfIndex];
    var pConfig = current_info.lines[line];
    if (pConfig) {
        for (var i in pConfig.mapOptions) {
            var opt = pConfig.mapOptions[i];
            if (opt.name == optionName) {
                toggle = mainQuote.setDynamicOption(opt, optionKey, mf, line);
                break;
            }
        }
        $(element).find(':checkbox').prop("checked", toggle);
    }

    drawLineItemOnCanvas(true);
}

function addDynamicOptions(option, mf, line) {
    var html = "<div id='" + option.name + "' class='optControlHeader' style='text-align:left'>" +
        "<h4 style='margin-bottom: 5px;width:100%;float:left'>" + option.name + "</h4>";

    if (option.multiSelect) {
        $.each(option.prices, function(key, value) {
            var swapkey = key.replace(/ /g, "_");
            html += "<div style='width:100%;float:left' onclick='setDynamicOption(\"" + option.name + "\",\"" + key + "\",\"" + mf + "\",\"" + line + "\",this)' id='" + key + "' class='newCheckPanel'><div style='margin-left:30px;width: 70%; float: left; font-size: larger'>" + key + "</div>" +
                "<input id='" + option.name.replace(/ /g, "_") + "_" + swapkey + "' style='float: right' type='checkbox' class='double' /></div>";
        });
    } else {
        html += "<select id='" + option.name.replace(/ /g, "_") + "' onchange='setDynamicOption(\"" + option.name + "\",\"\",\"" + mf + "\",\"" + line + "\",this)' class='form-control'>";

        $.each(option.prices, function(key, value) {
            html += "<option value='" + key + "'>" + key + "</option>";
        });
        html += "</select>";
    }
    html += "</div>";

    return html;
}

function bindOrdersToView(mfInfo) {
    var orders = mainQuote.getOrdersByMf(mfInfo.manufacturer);
    $('#select_frameType').val(mainQuote.quoteDetails.finType);
    $('#select_gridPattern').val(mainQuote.quoteDetails.gridPattern);

    $.each(orders, function(index, item) {
        var column = $('#column_' + item.manufacturer.replace(/ /g, '_') + "_" + item.productLine.replace(/ /g, '_'));
        column.find(".optPanelShader").hide();
        column.find('#main_checkbox').prop('checked', true);
        var pConfig = mfInfo.lines[item.productLine];
        var element = column.find('#extColorBtn');
        var colorVal = pConfig.extColors[item.exteriorColor];
        element.html(item.exteriorColor);

        //set color buttons to correct values
        if (colorVal) {
            element.css("background-color", "#" + colorVal.toString(16));
        }

        element.css('color', useBlackText(element.css("background-color")) ? 'Black' : 'White');
        element = column.find('#frameColorBtn').html(item.frameColor);
        colorVal = pConfig.frameColors[item.frameColor];
        if (colorVal) {
            element.css("background-color", "#" + colorVal.toString(16));
        }

        element.css('color', useBlackText(element.css("background-color")) ? 'Black' : 'White');
        //set glass type
        column.find('#glass_spinner').val(item.glassType);
        if (item.defaultDoorLine) {
            column.find('#door_spinner').val(item.defaultDoorLine);
        }

        colorVal = pConfig.extColors[item.frameColor];
        if (colorVal) {
            element.css("background-color", "#" + pConfig.frameColors[item.frameColor].toString(16));
        }
        $.each(item.mapsOptionList, function(index, item) {
            if (item.selected) {
                if (item.multiSelect) {
                    $.each(item.selectedKeys, function(index, key) {
                        var id = item.name.replace(/ /g, "_") + "_" + key.replace(/ /g, "_");
                        var test = column.find('#' + id).prop("checked", true);

                    });
                } else {
                    column.find('#' + item.name.replace(/ /g, "_")).val(item.selectedKeys[0]);
                }

            }
        });
        //set dynamic option controls to correct values
    });

}


function showPreviousMf() {
    if (mfIndex === 0) {
        mfIndex = mf_info.length - 1;
    } else {
        mfIndex--;
    }
    buildMfPanel(mf_info[mfIndex]);
    bindOrdersToView(mf_info[mfIndex]);

}

function showNextMf(index) {
    mfIndex = index;
    buildMfPanel(mf_info[mfIndex]);
    bindOrdersToView(mf_info[mfIndex]);

}
