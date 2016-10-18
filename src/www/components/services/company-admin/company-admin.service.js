mainApp.factory('fbCompanyAdmin', function($http, fbLoading, ModalService) {

    var service = {};

    service.LoadCompanyData = function(uId) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            deferred.reject("You must be in online mode in order to access company admin info.");
        } else {
            $http.post(Config.API.Endpoints.CompanyAdmin.AllCompanyInfo, { userId: uId }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject("A server error has occurred. If the problem persists, contact support.");
            });
        }

        return deferred.promise;
    };


    service.UpdateCompany = function(comp) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            deferred.reject();
        } else {
            $http.post(Config.API.Endpoints.CompanyAdmin.EditCompany, { company: comp }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }
        return deferred.promise;
    };


    service.UpdateGroup = function(group, userId) {
        var deferred = Q.defer();
        group.CreatedBy = userId;
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            deferred.reject();
        } else {
            $http.post(Config.API.Endpoints.CompanyAdmin.NewGroup, { group: group, userId: userId }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.UpdateUser = function(user, groupId, compId) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            deferred.reject();
        } else {
            $http.post(Config.API.Endpoints.CompanyAdmin.NewUser, { user: user, groupID: groupId, companyId: compId }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }
        return deferred.promise;
    };

    service.RemoveGroup = function(groupId) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            deferred.reject();
        } else {
            $http.post(Config.API.Endpoints.CompanyAdmin.DeleteGroup, { id: groupId }).then(function(data) {
                if (data.data.Message !== "") {
                    ModalService.showModal({
                        templateUrl: 'components/modals/confirm-modal/confirm-modal.html',
                        controller: "ConfirmModalController",
                        inputs: {
                            customer: null,
                            heading: "Error Deleting Group",
                            body: data.data.Message
                        }
                    }).then(function(modal) {
                        modal.element.modal();
                        modal.close.then(function(res) {});
                    });
                }
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.RemoveUser = function(userId) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            deferred.reject();
        } else {
            $http.post(Config.API.Endpoints.CompanyAdmin.DeleteUser, { id: userId }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.GetSettings = function(productId, groupId, companyId) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            deferred.reject();
        } else {
            $http.post(Config.API.Endpoints.CompanyAdmin.GetSettings, {
                productID: productId,
                groupID: groupId,
                companyID: companyId
            }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    return service;
});
