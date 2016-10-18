var mainApp = angular.module('mainApp', ['ngCordova', 'ui.router', 'ngSanitize', 'ui.select', 'angularModalService',
    'darthwade.loading', 'angular.vertilize', 'angular-click-outside', 'ngclipboard', 'base64','uiSwitch','ngAnimate','ui.select','ngSignaturePad'
]);

mainApp.run(function(Database, Sync, ModalService, $rootScope, $state, fbUser, Auth) {

    $rootScope.FBConfig = Config;

    $rootScope.homeClick = function() {
        $state.go('frontpage');
    };

    $rootScope.showOfflineModal = function() {
        ModalService.showModal({
            templateUrl: 'components/modals/offline-modal/offline-modal.html',
            controller: "OfflineModalController"
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {});
        });
    };

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {

        var requireLogin = toState.data.requireLogin;

        var uid = Auth.getAuth().authKey;

        if (requireLogin && (uid === undefined || uid === null || uid === 0 || uid === "")) {
            event.preventDefault();
            ModalService.showModal({
                templateUrl: 'components/modals/login-modal/login.html',
                controller: "LoginModalController"
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    return $state.go(toState.name, toParams);
                });
            });
        }

    });

    fbUser.UserSet().then(function(user) {
        Sync.isFirstSync.then(function(isFirstSync) {
            if (isFirstSync) {
                ModalService.showModal({
                    templateUrl: 'components/modals/sync-modal/sync.html',
                    controller: "SyncModalController"
                }).then(function(modal) {
                    modal.element.modal();
                    modal.close.then(function(result) {
                        console.log("Done " + result);
                    });
                });
            }
        });
    });

});

mainApp.config(function($httpProvider) {
    //Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;
    $httpProvider.interceptors.push('AuthInterceptor');
    //Remove the header used to identify ajax call  that would prevent CORS from working
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

var ANGULAR_EXTERN = null;
var ANGULAR_EXTERN_INJ = null;
var ANGULAR_EXTERN_WINDOW_SVC = null;
var ANGULAR_EXTERN_USER_SVC = null;
var ANGULAR_EXTERN_SCOPE = null;
var ANGULAR_EXTERN_IMG_SVC = null;
var ANGULAR_EXTERN_LOADING_SVC = null;
var ANGULAR_EXTERN_DATABASE_SVC = null;
window.FB_USE_SQLLITE = false;

var app = {

    pDevReady: Q.defer(),
    pFSReady: Q.defer(),

    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        app.pDevReady.resolve();
        fbBindDom();
        app.pFSReady.resolve();
        ANGULAR_EXTERN = angular.element($("#mainApp"));
        ANGULAR_EXTERN_SCOPE = ANGULAR_EXTERN.scope();
        ANGULAR_EXTERN_INJ = ANGULAR_EXTERN.injector();
        ANGULAR_EXTERN_WINDOW_SVC = ANGULAR_EXTERN_INJ.get("fbWindows");
        ANGULAR_EXTERN_DATABASE_SVC = ANGULAR_EXTERN_INJ.get("Database");
        ANGULAR_EXTERN_USER_SVC = ANGULAR_EXTERN_INJ.get("fbUser");
        ANGULAR_EXTERN_IMG_SVC = ANGULAR_EXTERN_INJ.get("fbImg");
        ANGULAR_EXTERN_LOADING_SVC = ANGULAR_EXTERN_INJ.get("fbLoading");
        ANGULAR_EXTERN_IMG_SVC.ResolveUrl(Config.UPaths.UIImagePath + 'black_x_btn.png').then(function(img) {
            Config.StaticImages.BlackXBtn = img;
        });
        if (window.sqlitePlugin) {
            window.sqlitePlugin.echoTest(function() {
                window.FB_USE_SQLLITE = true;
                ANGULAR_EXTERN_DATABASE_SVC.init();
            }, function() {
                ANGULAR_EXTERN_DATABASE_SVC.init();
            });
        }
        ANGULAR_EXTERN_USER_SVC.CurrUser().then(function(user) {
            $zopim(function() {
                $zopim.livechat.setName(user.firstName);
                $zopim.livechat.setEmail(user.Email);
            });
        });
    },

    deviceReady: function() {
        return app.pDevReady.promise;
    },

    fileSystemReady: function() {
        return app.pFSReady.promise;
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};

var fbBindDom = function() {

    $('body').on("keypress", ".floatonly", function(event) {
        return isFloatNumber(event, this);
    });

};
