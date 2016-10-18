mainApp.directive("sidingdetails",['fbQuotes', 'fbLoading','calculateServ', function (fbQuotes, fbLoading, calculateServ) {
	return{
		restrict: 'E',
		scope:true,
		link:function(){
		
		},
		 templateUrl: 'components/directives/proposal-builder/sidingdetails/sidingdetails.html'
	};
}]);