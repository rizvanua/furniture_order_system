mainApp.directive('qtyfield', function($rootScope, selectedProductType, fbManufacturers) {
    return {
        restrict: 'E',
        transclude: false,
        scope: {
            quantity: '=',
        },
        link: function(scope, element, attrs) {},
        templateUrl: 'components/directives/qty-select/qty-select.html'
    };
});
