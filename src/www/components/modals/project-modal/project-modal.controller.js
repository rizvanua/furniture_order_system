mainApp.controller('ProjectModalController', function($scope, close, Auth, fbUser, customer, masterQuote, fbQuotes, fbLoading) {

    $scope.customer = customer;
    $scope.masterQuote = masterQuote;

    $scope.$broadcast('show-errors-reset', {
        formName: "newprojectform"
    });

    $scope.close = function(result) {
        close(result, 500);
    };

    $scope.SaveProject = function(project) {

        project.LCustomerID = customer.id;
        project.CustomerID = customer.CustomerID;

        // $scope.$broadcast('show-errors-check-validity', {
        //     formName: "newprojectform"
        // });

        //  if ($scope.newprojectform.$invalid) {
        //      toastr.error("Please enter valid values");
        //      return;
        //  }

        fbLoading.showWhile(fbQuotes.ManageMasterQuote(project)).then(function(mq) {
            close(mq);
        });

    };

});
