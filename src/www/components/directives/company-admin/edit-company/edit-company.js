mainApp.directive('companyInfo', function($rootScope) {
    return {
        restrict: 'E',
        transclude: false,
        scope: {
            company: '=',
            onUpdate: '&'
        },
        link: function(scope, element, attrs) {

            scope.companyImgPath = "http://fbpublicstorage.blob.core.windows.net/uploadfiles/CompanyLogos/";

            scope.saveClicked = function() {
                scope.onUpdate();
            };

        },
        templateUrl: 'components/directives/company-admin/edit-company/edit-company.html'
    };
});
