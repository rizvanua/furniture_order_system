mainApp.controller('NotesModalController', function($scope, close, order, fbQuotes, fbLoading) {

    $scope.order = order;

    $scope.$broadcast('show-errors-reset', {
        formName: "newprojectform"
    });

    $scope.close = function(result) {
        close(result, 500);
    };

    $scope.SaveNotes = function() {
        fbLoading.showWhile(fbQuotes.SaveNotes($scope.order, $scope.notes)).then(function() {
            $scope.close();
        });
    };

});
