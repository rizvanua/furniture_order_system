mainApp.controller('OverrideModalController', function($scope, close, order, fbQuotes, fbLoading) {

    $scope.order = order;

    $scope.close = function(result) {
        close(result, 500);
    };

    $scope.SaveOverride = function() {
        fbLoading.showWhile(fbQuotes.OverrideOrderPrice($scope.order, $scope.overridePrice)).then(function() {
            $scope.close();
        });

    };

});
