mainApp.controller('OfflineModalController', function($scope, close, Sync, fbLoading) {

    $scope.FBConfig = Config;

    $scope.currState = Config.API.getMode();

    $scope.offlineState = $scope.currState === Config.API.Modes.OFFLINE;

    $scope.browserGood = (bowser.chrome || bowser.safari || bowser.webkit || bowser.android || bowser.ios);
    $scope.memGood = true;
    $scope.ramGood = true;

    $scope.supportsOffline = ($scope.browserGood && $scope.memGood && $scope.ramGood);

    $scope.close = function(result) {
        close(result, 500);
    };

    $scope.set = function(offline) {
        Config.API.setMode((offline) ? Config.API.Modes.OFFLINE : Config.API.Modes.ONLINE);
        location.reload();
    };

    setTimeout(function() {
        $.material.init();
    }, 500);

    $scope.ClearDB = function() {
        fbLoading.showWhile(Sync.ClearDB()).then(function() {
            location.reload();
        });
    };

});
