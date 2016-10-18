mainApp.factory('Auth', function($http, $loading) {

    var service = {};

    var invalidAuth = false;

    service.logOut = function() {
        localStorage.removeItem("userID");
        localStorage.removeItem("authKey");
        localStorage.removeItem("companyId");
        invalidAuth = true;
    };

    var AuthSetListeners = [];

    service.OnAuthSet = function() {
        var deferred = Q.defer();

        var auth = service.getAuth();

        if (auth.userID !== undefined && auth.userID !== null && auth.userID !== "" && auth.userID !== 0 &&
            auth.authKey !== undefined && auth.authKey !== null && auth.authKey !== "" && auth.authKey !== 0 &&
            auth.companyId !== undefined && auth.companyId !== null && auth.companyId !== "" && auth.companyId !== 0 && !invalidAuth) {
            deferred.resolve(auth);
        } else {
            AuthSetListeners.push(deferred);
        }

        return deferred.promise;
    };

    service.TriggerAuthSet = function() {
        var auth = service.getAuth();
        AuthSetListeners.forEach(function(deferred) {
            deferred.resolve(auth);
        });
    };

    service.setAuth = function(userId, authKey, companyId) {
        localStorage.setItem("userID", userId);
        localStorage.setItem("authKey", authKey);
        localStorage.setItem("companyId", companyId);
        invalidAuth = false;
        service.TriggerAuthSet();
    };

    service.getAuth = function() {
        return {
            userID: localStorage.getItem("userID"),
            authKey: localStorage.getItem("authKey"),
            companyId: localStorage.getItem("companyId")
        };
    };

    service.login = function(email, password) {
        $loading.start(Config.DOM.LoadingOverlay);

        var p = $http.post(Config.API.Endpoints.Auth.Login, {
            email: email,
            password: password,
            tabletId: 0
        });

        p.then(function(data) {
            $loading.finish(Config.DOM.LoadingOverlay);
            service.setAuth(data.data.userID, data.data.session.key, data.data.companyID);
            //Sync.TimeBomb(true);
        }, function() {
            $loading.finish(Config.DOM.LoadingOverlay);
        });

        return p;

    };

    service.forgot = function(email) {
        $loading.start(Config.DOM.LoadingOverlay);

        var p = $http.post(Config.API.Endpoints.Auth.Forgot, {
            email: email
        });

        p.then(function() {
            $loading.finish(Config.DOM.LoadingOverlay);
        }, function() {
            $loading.finish(Config.DOM.LoadingOverlay);
        });

        return p;

    };

    service.reset = function(password) {
        $loading.start(Config.DOM.LoadingOverlay);

        var p = $http.post(Config.API.Endpoints.Auth.Reset, {
            userId: localStorage.getItem("userID"),
            password: password
        });

        p.then(function(data) {
            $loading.finish(Config.DOM.LoadingOverlay);
            //Sync.TimeBomb(true);
        }, function() {
            $loading.finish(Config.DOM.LoadingOverlay);
        });

        return p;

    };

    return service;

});
