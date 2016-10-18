mainApp.controller('ConfirmModalController', function($scope, close, Auth, fbUser, customer, heading, body) {

    $scope.customer = customer;
    $scope.heading = heading;
    $scope.body = body;

    $scope.close = function(result) {
        close(result, 500);
    };

    $scope.confirm = function() {
        close(true);
    };

});
