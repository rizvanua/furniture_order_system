mainApp.directive("instalagreesign",['fbQuotes', 'fbLoading','calculateServ', function (fbQuotes, fbLoading, calculateServ) {
	return{
		restrict: 'E',
		scope:true,
		link:function(scope){
			
		console.log(scope);	
		
		},
		 templateUrl: 'components/directives/proposal-builder/instalagreesign/instalagreesign.html'
	};
}]);