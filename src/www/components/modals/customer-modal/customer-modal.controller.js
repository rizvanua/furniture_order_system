mainApp.controller('CustomerModalController', function($scope, close, Auth, fbUser, customer, fbLoading) {

    $scope.customer = customer;

    $scope.$broadcast('show-errors-reset', {
        formName: "customerform"
    });

    $scope.close = function(result) {
        close(result, 500);
    };

    $scope.SaveCustomer = function(customer) {

        var isEditMode = customer.CustomerID !== undefined && customer.CustomerID !== 0;

        $scope.$broadcast('show-errors-check-validity', {
            formName: "customerform"
        });

        if ($scope.customerform.$invalid) {
            toastr.error("Please enter valid values");
            return;
        }

        fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
            customer.UserID = user.UserID;
            fbLoading.showWhile(fbUser.SaveCustomer(customer)).then(function(customer) {
                $scope.close(customer);
            });
        });

    };

});
