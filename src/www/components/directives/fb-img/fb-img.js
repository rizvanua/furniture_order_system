mainApp.directive('fbImgSrc', function($rootScope, fbQuotes, Database) {
    //var map = {};
    return {
        link: function(scope, element, attrs) {
            attrs.$observe('fbImgSrc', function(newValue) {
                if (newValue !== undefined && newValue !== null) {
                    newValue = encodeURI(newValue);
                    if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
                        Database.ready().then(function() {
                            Models.ImageDatabase.findBy('ImgUrl', newValue, function(obj) {
                                if (obj === null) {
                                    attrs.$set('src', Config.UPaths.Base + newValue);
                                } else {
                                    attrs.$set('src', 'data:image/png;base64,' + obj.Base64);
                                }
                            });
                        });
                    } else {
                        attrs.$set('src', Config.UPaths.Base + newValue);
                    }
                }
            });
        }
    };
});
