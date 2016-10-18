mainApp.controller("SuperAdminController", function($scope, $http, $location, fbLoading, fbCompanyAdmin, fbUser, Auth, fbSuperAdmin) {

    $scope.jobProgress = 0;
    $scope.runningJob = false;

    $scope.companyImgPath = Config.Paths.CompanyImagePath;

    $scope.sidemenu = new mlPushMenu(document.getElementById('mp-menu'), document.getElementById('trigger'), {
        type: 'overlap',
    });

    $scope.searchInfo = {};

    $scope.logOut = function() {
        Auth.logOut();
        location.reload();
    };

    fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
        $scope.CurrUser = user;
        $scope.loadData();
    });



    async.forever(
        function(next) {
            fbSuperAdmin.getJobStatus().then(function(job) {
                if (job.Message === undefined || job.Message !== "no jobs") {
                    $scope.runningJob = true;
                    $scope.jobProgress = job.Percent;
                } else {
                    $scope.runningJob = false;
                }
                setTimeout(function() {
                    next();
                }, 1000 * 10);

            }, function() {
                setTimeout(function() {
                    next();
                }, 1000 * 10);
            });
        },
        function(err) {

        }
    );

});
