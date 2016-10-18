mainApp.controller('RenameModalController', function($scope, close) {

    $scope.close = function(result) {
        close(result, 500);
    };

    $scope.ReName = function(name) {
        $scope.close(name);
    };

});
