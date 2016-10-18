mainApp.controller("CompanyAdminController", function($scope, $http, $location, fbLoading, fbCompanyAdmin, fbUser, Auth, ModalService) {

    $scope.companyImgPath = "http://fbpublicstorage.blob.core.windows.net/uploadfiles/CompanyLogos/";

    $scope.EditingGroup = false;

    $scope.sidemenu = new mlPushMenu(document.getElementById('mp-menu'), document.getElementById('trigger'), {
        type: 'overlap',
    });

    $scope.logOut = function() {
        Auth.logOut();
        location.reload();
    };

    $scope.selectedTab = 1;
    $scope.reloadData = function() {
        fbLoading.showWhile(fbCompanyAdmin.LoadCompanyData($scope.CurrUser.UserID)).then(function(response) {
            $scope.company = response.Company;
            $scope.groups = response.Groups;
            $scope.products = response.Products;
        }, function(response) { toastr.error(response); });
    };

    $scope.editCompanyInfo = function() {
        fbLoading.showWhile(fbCompanyAdmin.UpdateCompany($scope.company)).then(function(response) {
            if (response.Message) {
                toastr.error(response.data.Message);
            } else {
                toastr.success("Company info updated.");
                $scope.reloadData();
            }
        });

    };

    $scope.removeGroup = function() {

        fbLoading.showWhile(fbCompanyAdmin.RemoveGroup($scope.selectedGroup.GroupID)).then(function(response) {
            if (response.Message) {
                toastr.error(response.data.Message);
            } else {
                toastr.success("Group has been deleted.");
                $scope.reloadData();
                $scope.closeEditGroup();
            }
        });
    };

    $scope.removeUser = function() {
        fbLoading.showWhile(fbCompanyAdmin.RemoveUser($scope.selectedUser.UserID)).then(function(response) {
            if (response.Message) {
                toastr.error(response.data.Message);
            } else {
                toastr.success("User has been deleted.");
                $scope.reloadData();
                $scope.closeEditUser();
            }
        });
    };

    $scope.newGroup = function() {
        fbLoading.showWhile(fbCompanyAdmin.UpdateGroup($scope.selectedGroup, $scope.CurrUser.UserID)).then(function(response) {
            var newGroup = {
                Group: response,
                Users: []
            };
            if (!$scope.EditingGroup) {
                $scope.groups.push(newGroup);
            }
            $scope.showNewGroup = false;
            toastr.success("Group has been saved.");
            $scope.closeEditGroup();
        });
    };

    $scope.newUser = function(groupId) {
        fbLoading.showWhile(fbCompanyAdmin.UpdateUser($scope.selectedUser, groupId, $scope.company.CompanyID)).then(function(response) {
            $scope.reloadData();
            $scope.closeEditUser();
            toastr.success("User has been saved.");
        }, function() {
            ModalService.showModal({
                templateUrl: 'components/modals/confirm-modal/confirm-modal.html',
                controller: "ConfirmModalController",
                inputs: {
                    customer: null,
                    heading: "Error Saving User",
                    body: "An error occured while saving this user, please check that everything is filled out correctly and try again"
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(res) {});
            });
        });
    };

    $scope.createGroup = function() {
        $scope.EditingGroup = false;
        $scope.selectedGroup = null;
        $scope.showNewGroup = true;
        $scope.showNewUser = false;
    };
    $scope.createUser = function(groupId) {
        $scope.selectedGroupId = groupId;
        $scope.selectedUser = null;
        $scope.showNewUser = true;
        $scope.showNewGroup = false;
    };

    $scope.editUser = function(user, groupId) {
        $scope.selectedGroupId = groupId;
        $scope.selectedUser = user;
        $scope.showNewUser = true;
        $scope.showNewGroup = false;
    };

    $scope.editGroup = function(group) {
        $scope.EditingGroup = true;
        $scope.selectedGroup = group;
        $scope.showNewGroup = true;
        $scope.showNewUser = false;
    };

    $scope.closeEditGroup = function() {
        $scope.showNewGroup = false;
    };
    $scope.closeEditUser = function() {
        $scope.showNewUser = false;
    };

    $scope.showSettings = function(groupId, type) {
        $scope.selectedGroupId = groupId;
        if(type === 1){

        $(document).trigger('show-modifiers', [groupId]);  
        }else{
        $(document).trigger('show-settings', [groupId]);
    }
    };

    fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
        $scope.CurrUser = user;
        $scope.reloadData();
    });

});
