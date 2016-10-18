mainApp.controller('SyncModalController', function($scope, close, Auth, fbUser, fbLoading) {


    $scope.currentPer = '0%';
    $scope.currentTwoWayPer = '0%';
    $scope.currentImgPer = '0%';
    $scope.currentStep = 'Initializing';
    $scope.currentImgStep = 'Loading Images...';
    $scope.currentTwoWayStep = 'Initializing';

    $scope.dataSyncDone = false;
    $scope.imgSyncDone = false;
    $scope.twoWaySyncDone = false;
    $scope.windowSyncDone = false;
    $scope.allDone = false;

    fbLoading.disable();

    $('body').bind('fb_syncing_basic', function(data) {
        if (!$scope.dataSyncDone) {
            $scope.currentStep = 'Loading ' + data.name + ' Records ' +
                (data.index - (((data.index - data.chunk) < 0) ? data.index : data.chunk)) + '-' +
                ((data.index === 0) ? 100 : data.index);
            $scope.$apply();
        }
    });

    $('body').bind('fb_syncing_two_way', function(data) {
        if (!$scope.dataSyncDone) {
            $scope.currentTwoWayStep = 'Loading ' + data.name + ' Records ' +
                (data.index - (((data.index - data.chunk) < 0) ? data.index : data.chunk)) + '-' +
                ((data.index === 0) ? 100 : data.index);
            $scope.$apply();
        }
    });

    $('body').bind('fb_syncing_basic_done', function(data) {
        $scope.currentStep = "Catalog Finished Loading";
        $scope.dataSyncDone = true;
        $scope.stepDone();
        $scope.$apply();
    });

    $('body').bind('fb_syncing_image_done', function(data) {
        $scope.imgSyncDone = true;
        $scope.currentImgStep = "Images Finished Loading";
        $scope.stepDone();
        $scope.$apply();
    });

    $('body').bind('fb_syncing_two_way_done', function(data) {
        $scope.twoWaySyncDone = true;
        $scope.currentTwoWayStep = "User Data Finished Loading";
        $scope.stepDone();
        $scope.$apply();
    });

    $('body').bind('fb_syncing_window_done', function(data) {
        $scope.windowSyncDone = true;
        $scope.stepDone();
        $scope.$apply();
    });

    $('body').bind('fb_syncing_basic_progress', function(data) {
        if (!$scope.dataSyncDone) {
            $scope.currentPer = data.progress + "%";
            $scope.$apply();
        }
    });

    $('body').bind('fb_syncing_two_way_progress', function(data) {
        if (!$scope.twoWaySyncDone) {
            $scope.currentTwoWayPer = data.progress + "%";
            $scope.$apply();
        }
    });

    $('body').bind('fb_syncing_image_processed', function(data) {
        $scope.currentImgStep = "Loading Image " + data.index + "/" + data.length;
        $scope.currentImgPer = data.progress + "%";
        $scope.$apply();
    });

    $scope.stepDone = function() {
        if ($scope.dataSyncDone && $scope.imgSyncDone && $scope.twoWaySyncDone && $scope.windowSyncDone) {
            $scope.allDone = true;
        }
    };

    $scope.close = function(result) {
        fbLoading.enable();
        close(result, 500);
    };

    $scope.continue = function() {
        $scope.close({});
        window.location.reload();
    };

});
