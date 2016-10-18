var totalWidth = 0;
var totalHeight = 0;
var selectionShader;
var selectedProdLine = 0;
var selectedWindowId = 0;
var selectedRowBtn;
var selectedColBtn;
var tdlDir = 1;
var showingGridEditor = false;
$('#tdl-panel').hide();
function toggleGridControls() {
    if (showingGridEditor === false) {
        updateRowColButtons();
        $('#grid-row-panel').show();
        $('#grid-col-panel').show();

        showingGridEditor = true;
    } else {
        $('#grid-row-panel').hide();
        $('#grid-col-panel').hide();
        $('#top-down-panel').hide();
        showingGridEditor = false;
    }
}

function setTopDown(element) {
    var height = $(element).val();
    if (!isNaN(height) && height !== "") {
        mainQuote.setTopDownHeightForWindow(selectedWindowId, selectedLineItem, height);
        drawLineItemOnCanvas(true);
    }
}

function setLegDims(element) {
    var height = $(element).val();
    if (!isNaN(height) && height !== "") {
        mainQuote.setLegHeightForWindow(selectedWindowId, selectedLineItem, height);
    }
}

function changeRow(numRows, button) {
    mainQuote.setRowForWindow(getWindowIndex(), selectedLineItem, numRows);
    //  drawGridsOnWindows();
    if (selectedRowBtn) {
        $(selectedRowBtn).css('background-color', '');
    }
    $(button).css('background-color', 'Gray');
    selectedRowBtn = $(button);
    drawLineItemOnCanvas(true);
}

function changeCol(numCols, button) {

    mainQuote.setColumnsForWindow(getWindowIndex(), selectedLineItem, numCols);
    //    drawGridsOnWindows();

    if (selectedColBtn) {
        $(selectedColBtn).css('background-color', '');
    }
    $(button).css('background-color', 'Gray');
    selectedColBtn = $(button);
    drawLineItemOnCanvas(true);
}

function changeTdl(dirVal) {
    tdlDir = dirVal;
}



function addTdl() {
    var dim = $('#tdlDim').val();
    if (!isNaN(dim)) {
        var dir = false;
        if (tdlDir === 1) {
            dir = true;
        }
        mainQuote.addTdlBar(selectedLineItem, getCurrentWindow().id, dim, dir);
    }
    showTdlLabels();
    drawLineItemOnCanvas();
}

function closeSDL(){
    $('#tdl-panel').hide();
}

function removeTdl(index) {
    mainQuote.removeTdlBar(selectedLineItem, getCurrentWindow().id, index);
    showTdlLabels();
    drawLineItemOnCanvas();
    drawSelectionShader();
    drawTdlOnWindows();
}

function showTDL() {
    showTdlLabels();
    $('#tdl-panel').show();
    $('#tdlDim').focus();
    $('#grid-popup').hide();
}

function showTdlLabels() {
    var tdlPanel = $('#tdl-bar-panel');
    tdlPanel.empty();
    var window = getCurrentWindow();
    for (var i in window.tdlBars) {
        var tdl = window.tdlBars[i];
        var dir = "vertical";
        if (!tdl.isVertical) {
            dir = "horizontal";
        }
        html = ' <div style="color:Black;font-size: large;padding:10px; border:1px solid Black">' + tdl.startInch + '\' ' + dir + ' <img onclick="removeTdl(' + i + ')" style="float:right" src="' + Config.StaticImages.BlackXBtn + '"/></div>';
        tdlPanel.append(html);
    }
}



function updateRowColButtons() {
    var win = getCurrentWindow();
    if (win.subtype.toLowerCase() == "Single hung" || win.subtype == "xox") {
        $('#half-grid-btn').show();
    } else {
        $('#half-grid-btn').hide();
    }
    if (win.gridPattern == "top down") {
        $('#top-down-panel').show();
        $('#top-down-txt').val(win.topDownHeight);
    } else {
        $('#top-down-panel').hide();
    }
    var rowId, colId;
    if (win) {
        if (selectedRowBtn) {
            selectedRowBtn.css("background-color", "");
        }

        if (selectedColBtn) {
            selectedColBtn.css("background-color", "");
        }
        if (win.columns) {
            colId = "#col_" + win.columns;
            selectedColBtn = $(colId);
            $(selectedColBtn).css("background-color", "Gray");
        }
        if (win.rows) {
            rowId = "#row_" + win.rows;
            selectedRowBtn = $(rowId);
            $(selectedRowBtn).css("background-color", "Gray");
        }
    }
}

function hideGridPanels() {
    $('#grid-col-panel').hide();
    $('#half-grid-btn').hide();
    $('#grid-row-panel').hide();
    $('#top-down-panel').hide();
    showingGridEditor = false;
}


function setHalfGrid() {
    mainQuote.setHalfGridForWindow(selectedLineItem, selectedWindowId);
    drawLineItemOnCanvas();
}

function drawXoxHalfGrid(icon, gridId, win) {

    var width = $(icon).width();
    var gridWidth = width / 4;
    var height = $(icon).height();
    var top = $(icon).css("top");
    var left = $(icon).css("left");
    var leftGridStart = (Number(left.replace("px", "")) + width) - gridWidth;
    $('#' + gridId).remove();
    $('#' + gridId).remove();
    var tableLeft = $('<table  onclick="windowGridClicked(this)" id="' + gridId + '" style="z-index:100;border-spacing:0px;position:absolute;width:' + gridWidth + 'px;height:' + height + 'px;top:' + top + ';left:' + left + '">');
    var tableRight = $('<table  onclick="windowGridClicked(this)" id="' + gridId + '" style="z-index:100;border-spacing:0px;position:absolute;width:' + gridWidth + 'px;height:' + height + 'px;top:' + top + ';left:' + leftGridStart + 'px">');

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

function getWindowIndex() {
    var win = getCurrentWindow();
    return getCurrentLineItem().windowList.indexOf(win);
}

function getCurrentWindow() {
    return getCurrentLineItem().getWindowById(selectedWindowId);
}
