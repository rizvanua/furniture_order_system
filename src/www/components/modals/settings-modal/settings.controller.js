mainApp.controller('SettingsModalController', function($scope, close, Auth, fbUser, fbMetaData, MasterQuote, OrderTree, fbLoading) {
    $scope.FBConfig = Config;
    $scope.settingsProductId = 1;
    $scope.orderTree = OrderTree;
    $scope.userId = localStorage.getItem("userID");

    $scope.getSettings = function() {
        fbLoading.showWhile(fbMetaData.LoadSettings($scope.settingsProductId, $scope.userId, MasterQuote.id, MasterQuote.MasterQuoteID)).then(function(settings) {
            $scope.settingModel = settings;
            $scope.$apply();
        });
    };

    $scope.changeSettingsProduct = function(prod) {
        $scope.SaveSettings(true);
        $scope.settingsProductId = prod.ProductTypeID;
        $scope.getSettings();
    };

    $scope.SaveSettings = function(remainOpen) {
        fbLoading.showWhile(fbMetaData.SaveSettings($scope.settingModel)).then(function() {
            if (!remainOpen) {
                setTimeout(function() {
                    close($scope.settingModel);
                }, 1500);
            }
        });
    };

    $scope.getSettings();
});
