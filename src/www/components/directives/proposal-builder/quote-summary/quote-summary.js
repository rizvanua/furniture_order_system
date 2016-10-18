mainApp.directive("quotesummary",['fbQuotes', 'fbLoading','fbManufacturers','calculateServ', function (fbQuotes, fbLoading, fbManufacturers, calculateServ) {
	
	return {		
	restrict: 'E',
	scope:true,	 
link: function(scope, element, attrs) {
	fbLoading.showWhile(fbManufacturers.getAll()).then(function(manufacturers) {
                scope.Manufacturers = manufacturers;
                scope.$apply();				
            });
		
},
    templateUrl: 'components/directives/proposal-builder/quote-summary/quote-summary.html'
	
  };
  
	
}]);