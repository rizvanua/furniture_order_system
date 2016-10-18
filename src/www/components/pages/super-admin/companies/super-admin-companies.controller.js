mainApp.controller("SuperAdminCompaniesController", function($scope, $http, $location, fbLoading, fbCompanyAdmin, fbUser, Auth, fbSuperAdmin) {

    $scope.searchInfo = {};

    $scope.companyImgPath = Config.Paths.CompanyImagePath;

    fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
        $scope.CurrUser = user;
        $scope.loadData();
    });

    $scope.loadData = function() {
        fbLoading.showWhile(fbSuperAdmin.getCompanies()).then(function(companies) {
            $scope.companies = companies;
        });
    };

    $scope.runFullExport = function() {
        fbLoading.showWhile(fbSuperAdmin.runFullExport()).then(function(data) {
            toastr.success(data.Message);
        });
    };

});
