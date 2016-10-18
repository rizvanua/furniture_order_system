mainApp.controller("SuperAdminUsersController", function($scope, $http, $location, fbLoading, fbCompanyAdmin, fbUser, Auth, $state) {

    $scope.companyImgPath = "http://fbpublicstorage.blob.core.windows.net/uploadfiles/CompanyLogos/";

    fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
        $scope.CurrUser = user;
        $scope.loadData();
    });

    $scope.loadData = function() {
        fbLoading.showWhile(fbUser.GetCompleteUserList()).then(function(users) {
            $scope.users = users;
        });
    };

    $scope.ImpUser = function(userId) {
        fbLoading.showWhile(fbUser.Impersonate(userId)).then(function(data) {
            if (data.code === 0) {
                Auth.setAuth(data.user.userID, data.user.session.key, data.user.companyID);
                $state.go('frontpage');
            } else {
                console.log(data.Message);
            }
        });
    };

});
