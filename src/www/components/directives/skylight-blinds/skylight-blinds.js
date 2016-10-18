mainApp.directive('skylightBlinds', function($rootScope, fbManufacturers, fbSkylight) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            itemType: '=',
            blind: '=',
            mfSettings: '=',
            updatePrice: '&'
        },
        link: function(scope, element, attrs) {
            scope.blindTree = {};

            scope.BlindImagePath = "http://fbpublicstorage.blob.core.windows.net/uploadfiles/SkylightBlinds/";

            scope.setSelectedBlind = function(item) {
                scope.blind.blind = item;
                scope.updatePrice();
            };

            scope.getBlindPrice = function() {
                if (scope.blind.blind) {
                    return getTotalPrice(1, scope.blind.blind.Price, scope.mfSettings);
                }
                return 0;
            };

            scope.getBlinds = function() {
                fbSkylight.GetBlinds("Velux", scope.itemType).then(function(blinds) {
                    scope.blinds = blinds;
                    scope.buildBlindTree();
                    scope.$apply();
                });
                /*AjaxCall('/skylight/getBlinds', { distributor: "Velux", type : scope.itemType }, "post", "json").done(function (response) {
                    scope.blinds = response;
                    scope.buildBlindTree();
                    scope.$apply();
                }).fail(function (data) {
                    toastr.error("Error retrieving skylight blinds.");
                });*/
            };

            scope.buildBlindTree = function() {

                scope.blinds.forEach(function(item) {
                    if (!scope.blindTree[item.Description]) {
                        scope.blindTree[item.Description] = [];
                    }

                    scope.blindTree[item.Description].push(item);
                });
            };

            scope.getBlinds();
        },
        templateUrl: 'components/directives/skylight-blinds/skylight-blinds.html'
    };
});
