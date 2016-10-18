mainApp.filter('percentage', ['$filter', function($filter) {
    return function(input) {
        return $filter('number')(input)+'%';
    };
}]);
