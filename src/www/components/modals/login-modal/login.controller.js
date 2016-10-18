mainApp.controller('LoginModalController', function($scope, close, Auth, fbUser, fbLoading) {

    $scope.showing = 'login';

    $scope.enterClicked = function() {
        if ($scope.showing == 'login') {
            $scope.login($scope.loginEmail, $scope.loginPassword);
        } else if ($scope.showing == 'forgot') {
            $scope.forgot($scope.forgotEmail);
        } else {
            $scope.reset($scope.resetPassword);
        }
    };

    $scope.close = function(result) {
        close(result, 500);
    };

    $scope.showForgot = function() {
        $scope.showing = 'forgot';
    };

    $scope.login = function(email, password) {

        if (validateLogin(email, password)) {

            Auth.login(email, password).then(function(response) {
                if (response.data.userID) {
                    fbUser.SetUser(response.data.userID);
                    if (response.data.forgotPassword) {
                        $scope.showing = 'reset';
                    } else {
                        close("success", 500);
                    }
                } else {
                    toastr.error(response.data.error);
                }
            }, function(response) {
                toastr.error("Error trying to log in.");
            });

        }

    };

    $scope.forgot = function(email) {
        if (email !== '' && isValidEmailAddress(email)) {

            Auth.forgot(email).then(function(response) {
                if (response.data.IsSuccess) {
                    $scope.showing = 'login';
                    toastr.success(response.data.Message);
                } else {
                    toastr.error(response.data.Message);
                }
            }, function(response) {
                toastr.error("Error sending password.");
            });

        } else {
            toastr.error(pleaseEnterValidEmailAddress);
        }
    };

    $scope.reset = function(password) {
        if (password !== '') {

            Auth.reset(password).then(function(response) {
                if (response.data.IsSuccess) {
                    toastr.success(response.data.Message);
                    close("success", 500);
                } else {
                    toastr.error(response.data.Message);
                }
            }, function(response) {
                toastr.error(ajaxFailError);
            });

        } else {
            toastr.error("Please enter password.");
        }
    };

});
