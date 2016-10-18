mainApp.directive("paymentdescription",['fbQuotes', 'fbLoading', function (fbQuotes, fbLoading) {
	
	return {		
	restrict: 'E',
    templateUrl: 'components/directives/proposal-builder/paymentdescription/paymentdescription.html'	
  };  
	
}]);