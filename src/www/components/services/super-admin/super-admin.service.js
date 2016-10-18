mainApp.factory('fbSuperAdmin', function($http, fbLoading, ModalService) {

    var service = {};

    service.getCompanies = function() {
        var deferred = Q.defer();
        $http.get(Config.API.Endpoints.SuperAdmin.Companies).then(function(data) {
            deferred.resolve(data.data);
        }, function() {
            deferred.reject();
        });
        return deferred.promise;
    };

    service.getDataPermissions = function(CompanyID) {
        var deferred = Q.defer();
        $http.get(Config.API.Endpoints.SuperAdmin.DataPermissions + '?CompanyID=' + CompanyID).then(function(data) {
            deferred.resolve(data.data);
        }, function() {
            deferred.reject();
        });
        return deferred.promise;
    };

    service.getJobStatus = function(CompanyID) {
        var deferred = Q.defer();
        $http.get(Config.API.Endpoints.SuperAdmin.ExportStatus).then(function(data) {
            deferred.resolve(data.data);
        }, function() {
            deferred.reject();
        });
        return deferred.promise;
    };

    service.runFullExport = function() {
        var deferred = Q.defer();
        $http.get(Config.API.Endpoints.SuperAdmin.RunFullExport).then(function(data) {
            deferred.resolve(data.data);
        }, function() {
            deferred.reject();
        });
        return deferred.promise;
    };

    service.changeDataPermissions = function(dps, CompanyID) {
        var deferred = Q.defer();
        $http.post(Config.API.Endpoints.SuperAdmin.ChangeDataPermissions, {
            dataPermissions: dps,
            CompanyID: CompanyID
        }).then(function(data) {
            deferred.resolve(data.data);
        }, function() {
            deferred.reject();
        });
        return deferred.promise;
    };

    return service;

});
