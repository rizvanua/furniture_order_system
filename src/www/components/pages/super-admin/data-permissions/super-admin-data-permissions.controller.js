mainApp.controller("SuperAdminDataPermissionsController", function($scope, $http, $location, fbLoading, fbCompanyAdmin, fbUser, Auth, fbSuperAdmin, $stateParams, fbProducts, fbManufacturers) {

    $scope.searchInfo = {};

    $scope.mfImgPath = Config.Paths.ManufacturerImagePath;
    $scope.pImgPath = Config.Paths.ProductTypeImagePath;

    $scope.CompanyID = $stateParams.CompanyID;

    $scope.DPChanges = [];
    $scope.dataPermissions = [];

    fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
        $scope.CurrUser = user;
        $scope.loadData();
    });

    $scope.loadData = function() {
        fbLoading.showWhile(fbSuperAdmin.getDataPermissions($scope.CompanyID)).then(function(dataPermissions) {
            $scope.dataPermissions = dataPermissions;
        });
        fbLoading.showWhile(fbManufacturers.getAll()).then(function(mfgs) {
            console.log(mfgs);
            $scope.mfgs = mfgs;
        });
        fbLoading.showWhile(fbProducts.GetAllProductTypes()).then(function(ptypes) {
            $scope.ptypes = ptypes;
        });
    };

    $scope.addDP = function(mf, pType) {
        mf.productType = pType;
        var newDP = {
            DataPermissionID: 0,
            ManufacturerID: mf.ManufacturerID,
            CompanyID: $scope.CompanyID,
            Deleted: false,
            Hidden: true,
            manufacturer: mf
        };
        $scope.dataPermissions.unshift(newDP);
        $scope.DPChanges.push(newDP);
    };

    $scope.deleteDP = function(dpID) {
        var dp = _.find($scope.dataPermissions, function(dp) {
            return dp.DataPermissionID === dpID;
        });
        dp.Deleted = true;
        $scope.DPChanges.push(dp);
        $scope.dataPermissions = _.reject($scope.dataPermissions, function(dp) {
            return dp.DataPermissionID === dpID;
        });
    };

    $scope.saveChanges = function() {
        $scope.DPChanges.forEach(function(dp) {
            dp.company = null;
            dp.manufacturer = null;
        });
        fbLoading.showWhile(fbSuperAdmin.changeDataPermissions($scope.DPChanges, $scope.CompanyID)).then(function(data) {
            if (data.Message === "already running") {
                toastr.error("An Export Is Already Running, Please Wait to Make Changes Until It Stops");
            } else {
                toastr.success(data.Message);
            }
        });
    };

});
