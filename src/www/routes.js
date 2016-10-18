var mainApp = angular.module('mainApp');

mainApp.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when("/super-admin", "/super-admin/users");

    $stateProvider.state('frontpage', {
            url: "/",
            templateUrl: "components/pages/frontpage/frontpage.html",
            controller: "FrontPageController",
            data: {
                requireLogin: true
            }
        })
        .state('filter', {
            url: "/filter",
            templateUrl: "components/pages/filter/filter.html",
            controller: "FilterPageController",
            data: {
                requireLogin: true
            }
        })
        .state('proposal', {
            url: "/ProposalBuilder",
            templateUrl: "components/pages/proposal-builder/proposal-builder.html",
            controller: "ProposalController",
            data: {
                requireLogin: true
            }
        })
        .state('interior', {
            url: "/interior",
            templateUrl: "components/pages/order-interior/order-interior.html",
            controller: "InteriorOrderController",
            data: {
                requireLogin: true
            }
        })
        .state('exterior', {
            url: "/exterior",
            templateUrl: "components/pages/order-exterior/order-exterior.html",
            controller: "ExteriorOrderController",
            data: {
                requireLogin: true
            }
        })
        .state('moulding', {
            url: "/moulding",
            templateUrl: "components/pages/order-moulding/order-moulding.html",
            controller: "MouldingOrderController",
            data: {
                requireLogin: true
            }
        })
        .state('siding', {
            url: "/siding",
            templateUrl: "components/pages/order-siding/order-siding.html",
            controller: "SidingOrderController",
            data: {
                requireLogin: true
            }
        })
        .state('decking', {
            url: "/decking",
            templateUrl: "components/pages/order-decking/order-decking.html",
            controller: "DeckingOrderController",
            data: {
                requireLogin: true
            }
        })
        .state('skylight', {
            url: "/skylight",
            templateUrl: "components/pages/order-skylight/order-skylight.html",
            controller: "SkylightOrderController",
            data: {
                requireLogin: true
            }
        })
        .state('customers', {
            url: "/customers",
            templateUrl: "components/pages/customers/customers.html",
            controller: "CustomersController",
            data: {
                requireLogin: true
            }
        })
        .state('windows', {
            url: "/windows",
            templateUrl: "components/pages/windows/windows.html",
            controller: "WindowsController",
            data: {
                requireLogin: true
            }
        })
        .state('raw glass', {
            url: "/raw-glass",
            templateUrl: "components/pages/raw-glass/raw-glass.html",
            controller: "RawGlassController",
            data: {
                requireLogin: true
            }
        })
        .state('company admin', {
            url: "/company-admin",
            templateUrl: "components/pages/company-admin/company-admin.html",
            controller: "CompanyAdminController",
            data: {
                requireLogin: true
            }
        })
        .state('superadmin', {
            url: "/super-admin",
            //abstract: true,
            templateUrl: "components/pages/super-admin/super-admin.html",
            controller: "SuperAdminController",
            data: {
                requireLogin: true
            }
        })
        .state('superadmin.users', {
            url: "/users",
            templateUrl: "components/pages/super-admin/users/users.html",
            controller: "SuperAdminUsersController",
            data: {
                requireLogin: true
            }
        })
        .state('superadmin.companies', {
            url: "/companies",
            templateUrl: "components/pages/super-admin/companies/companies.html",
            controller: "SuperAdminCompaniesController",
            data: {
                requireLogin: true
            }
        })
        .state('superadmin.datapermissions', {
            url: "/data-permissions/:CompanyID",
            templateUrl: "components/pages/super-admin/data-permissions/data-permissions.html",
            controller: "SuperAdminDataPermissionsController",
            data: {
                requireLogin: true
            }
        })
        .state('default', {
            url: "*path",
            templateUrl: "components/pages/frontpage/frontpage.html",
            controller: "FrontPageController",
            data: {
                requireLogin: true
            }
        });
});
