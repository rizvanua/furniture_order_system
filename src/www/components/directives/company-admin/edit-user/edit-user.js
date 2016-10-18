    mainApp.directive('createUser', function() {
        return {
            restrict: 'E',
            transclude: false,
            scope: {
                user: '=',
                onClose: '&',
                newUser: '&',
                groups: '=',
                groupId: '=',
                onDelete: '&'
            },
            link: function(scope, element, attrs) {
                scope.userTypes = [{
                    name: 'Standard',
                    value: 3
                }, {
                    name: 'Admin',
                    value: 2
                }];

                scope.close = function() {
                    scope.onClose();
                };

                scope.createUser = function() {
                    scope.newUser({ groupID: scope.groupId });
                };

                scope.delete = function() {
                    scope.onDelete();
                };
            },
            templateUrl: 'components/directives/company-admin/edit-user/edit-user.html'
        };
    });
