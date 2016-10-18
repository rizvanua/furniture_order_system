mainApp.directive('orderbutton', function($rootScope, fbQuotes) {
    return {
        restrict: 'E',
        transclude: false,
        scope: {
            doorQuoteId: '=',
            remoteDoorQuoteId: '=',
            styleId: '=',
            addClicked: '&',
            updateClicked: '&'
        },
        link: function(scope, element, attrs) {

            scope.AddToOrder = function(selected, title) {
                scope.addClicked({
                    selected: selected
                });
            };

            scope.UpdateOrder = function() {
                scope.updateClicked();
            };

            scope.levels = [];

            var loadLevels = function() {
                if ((scope.doorQuoteId === undefined || scope.doorQuoteId === null) && (scope.remoteDoorQuoteId === undefined || scope.remoteDoorQuoteId === null)) {
                    scope.levels = [];
                } else {
                    fbQuotes.GetAvailableQuotes(scope.doorQuoteId, Number(scope.styleId), scope.remoteDoorQuoteId).then(function(response) {
                        scope.levels = [];
                        if (scope.doorQuoteId === undefined && scope.remoteDoorQuoteId === undefined) {

                        } else {
                            response.forEach(function(item) {
                                scope.levels.push({
                                    title: "ORDER " + item,
                                    id: item
                                });
                            });
                            if (response.length === 0) {
                                scope.levels.push({
                                    title: "NEW ORDER",
                                    id: 1
                                });
                            } else {
                                scope.levels.push({
                                    title: "NEW ORDER",
                                    id: _.max(response) + 1
                                });
                            }
                            if (scope.levels[0] !== undefined) {
                                scope.selected = scope.levels[0];
                            }
                        }
                        scope.$apply();
                    });
                }
            };


            $(document).on("item_added_to_order", function(evt) {
                loadLevels();
            });

            loadLevels();

        },
        templateUrl: 'components/directives/order-button/order-button.html'
    };
});
