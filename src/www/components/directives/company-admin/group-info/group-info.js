 mainApp.directive('groupInfo', function() {
     return {
         restrict: 'E',
         transclude: false,
         scope: {
             groups: '=',
             editClicked: '&',
             createClicked: '&',
             editUser: '&',
             createUser: '&',
             showSettings: '&'
         },
         link: function(scope, element, attrs) {

             scope.editGroup = function(group) {
                 scope.editClicked({ group: group });
             };
             scope.newGroup = function() {
                 scope.createClicked();
             };

             scope.showOnFactors = function(group) {
                 scope.showSettings({ groupId: group.GroupID });
             };

             scope.showModifiers = function(group){
                 scope.showSettings({ groupId: group.GroupID, type: 1 }); 
             };

             scope.editUserClick = function(user, groupId) {
                 scope.editUser({ user: user, groupId: groupId });
             };
             scope.newUserClick = function(groupId) {
                 scope.createUser({ groupId: groupId });
             };
         },
         templateUrl: 'components/directives/company-admin/group-info/group-info.html'
     };
 });
