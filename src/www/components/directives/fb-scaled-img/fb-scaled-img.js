mainApp.directive('fbScaledImgData', function($rootScope, fbQuotes, Database) {
    return {
        link: function(scope, element, attrs) {
            attrs.$observe('fbScaledImgData', function(newValue) {
                if (newValue !== undefined && newValue !== null && newValue !== "") {
                    var inWindow = JSON.parse(newValue);
                    var url = Config.UPaths.WindowIconPath + inWindow.type + "/" + inWindow.subtype + ".png";
                    var dims = builderGetScale(inWindow.realWidth, inWindow.realHeight, parent);
                    if (inWindow.isFlipped === true) {
                        element.addClass("flipImage");
                    }
                    element.css('width', dims[0]);
                    element.css('height', dims[1]);
                    element.css('float', 'left');
                    element.css('position', 'relative');
                    element.css('border', '1px solid black');
                    drawTdlOnWindow(element, inWindow);
                    builderDrawGridsOnWindows(element, inWindow);
                    url = encodeURI(url);
                    if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
                        Database.ready().then(function() {
                            Models.ImageDatabase.findBy('ImgUrl', url, function(obj) {
                                if (obj === null) {
                                    attrs.$set('src', Config.UPaths.Base + url);
                                } else {
                                    attrs.$set('src', 'data:image/png;base64,' + obj.Base64);
                                }
                            });
                        });
                    } else {
                        attrs.$set('src', Config.UPaths.Base + url);
                    }
                }
            });
        }
    };
});
