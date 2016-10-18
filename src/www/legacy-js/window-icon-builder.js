jQuery.fn.outerHTML = function() {
    return jQuery('<div />').append(this.eq(0).clone()).html();
};

function builderCreateScaledIcon(window, parent) {
    var url = Constants.WindowIconPath + window.type.replace(" ", "%20") + "/" + window.subtype.replace(" ", "%20") + ".png";
    var image = $('<div id="summary_icon_' + window.id + '" class="stretchBackgroundImage" style=" background-repeat: no-repeat;float:left;position:relative;background-image:url(' + url + ');background-size:100% 100%;border: 1px solid black " ></div>');
    var dims = builderGetScale(window.realWidth, window.realHeight, parent);
    if (window.isFlipped === true) {
        $(image).addClass("flipImage");
    }

    image.css('width', dims[0]);
    image.css('height', dims[1]);
    drawTdlOnWindow(image, window);
    builderDrawGridsOnWindows(image, window);

    return image;
}

function builderCreateScaledIconAsync(window, parent) {
    var deferred = Q.defer();

    //var url = Constants.WindowIconPath + window.type.replace(" ", "%20") + "/" + window.subtype.replace(" ", "%20") + ".png";
    var url = Config.UPaths.WindowIconPath + window.type + "/" + window.subtype + ".png";

    ANGULAR_EXTERN_IMG_SVC.ResolveUrl(url).then(function(url) {

        var image = $('<div id="summary_icon_' + window.id + '" class="stretchBackgroundImage" style=" background-repeat: no-repeat;float:left;position:relative;background-image:url(' + url + ');background-size:100% 100%;border: 1px solid black " ></div>');
        var dims = builderGetScale(window.realWidth, window.realHeight, parent);
        if (window.isFlipped === true) {
            $(image).addClass("flipImage");
        }

        image.css('width', dims[0]);
        image.css('height', dims[1]);
        drawTdlOnWindow(image, window);
        builderDrawGridsOnWindows(image, window);

        deferred.resolve(image);
    });

    return deferred.promise;
}

function builderGetScale(width, height, parent) {

    totalHeight = height;
    totalWidth = width;
    var canvas = $(parent);
    var dims = [];
    var scale;
    if (totalWidth > totalHeight) {
        dims[0] = "100px";
        dims[1] = ((totalHeight / totalWidth) * 100) + "px";
    } else {
        dims[1] = "100px";
        dims[0] = ((totalWidth / totalHeight) * 100) + "px";
    }

    return dims;
}

function drawTdlOnWindow(parent, win) {

    for (var j in win.tdlBars) {
        var bar = win.tdlBars[j];
        var borderType;
        var width = parent.width();
        var height = parent.height();
        var percentage;
        if (!bar.isVertical) {
            percentage = bar.startInch / win.realHeight;
            height = height * percentage;
            height = height - 5;
            width = width - 6;
            borderType = "border-bottom";
        } else {
            percentage = bar.startInch / win.realWidth;
            width = width * percentage;
            width = width - 5;
            height = height - 6;
            borderType = "border-right";
        }
        bar = $('<div id="tdl" style="margin-left:2px;margin-top:2px;z-index:99;position:absolute;' + borderType + ':6px solid White;border-spacing:0px;width:' + width + 'px;height:' + height + 'px;"></div>');
        parent.parent().append(bar);
    }
}



function builderDrawGridsOnWindows(parent, win) {
    //var icon = $('#icon_' + win.id);
    var gridId = "grid_" + win.id;
    var width = 0;
    var height = 0;
    var table = "";
    var rowHTML = "";
    var icon = null;
    if (win.gridPattern == "full" || win.gridPattern == "colonial") {
        width = parent.width();
        height = parent.height();
        table = '<table id="' + gridId + '" style="z-index:100;border-spacing:0px;width:' + width + 'px;height:' + height + 'px">';
        rowHTML = "";
        for (var i = 0; i < win.rows; i++) {
            rowHTML = "<tr>";
            for (var j = 0; j < win.columns; j++) {
                rowHTML += "<td style='border: 1px solid white'></td>";
            }
            rowHTML += "</tr>";
            table += rowHTML;
        }
        table += "</table>";
        parent.append(table);

    } else if (win.gridPattern == "top down") {

        icon = $('#icon_' + win.id);
        width = parent.width();
        height = parent.height();
        var topDownScaler = win.topDownHeight / win.realHeight;
        height = height * topDownScaler;
        table = '<table id="' + gridId + '" style="z-index:100;border-spacing:0px;width:' + width + 'px;height:' + height + 'px;top:' + top + '">';
        rowHTML = "";
        for (var io = 0; io < win.rows; io++) {
            rowHTML = "<tr>";
            for (var jo = 0; jo < win.columns; jo++) {
                rowHTML += "<td style='border: 2px solid white'></td>";
            }
            rowHTML += "</tr>";
            table += rowHTML;
        }
        table += "</table>";
        parent.append(table);
    } else if (win.gridPattern == "perimeter") {
        icon = $('#icon_' + win.id);
        width = parent.width();
        height = parent.height();
        var perimIcon = $('<div class="coverDiv cover" id="' + gridId + '" style="background-image:url(' + Constants.WindowIconPath + 'Grid/noframeperim.png);z-index:100;width:' + width + 'px;height:' + height + 'px">');
        parent.append(perimIcon);
    }
}
