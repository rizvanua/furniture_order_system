    mainApp.directive('createGroup', function() {
        return {
            restrict: 'E',
            transclude: false,
            scope: {
                group: '=',
                onClose: '&',
                newGroup: '&',
                onDelete: '&'
            },
            link: function(scope, element, attrs) {
                scope.close = function() {
                    scope.onClose();
                };

                scope.createGroup = function() {
                    scope.newGroup();
                };

                scope.delete = function() {
                    scope.onDelete();
                };
            },
            templateUrl: 'components/directives/company-admin/edit-group/edit-group.html'
        };
    });
