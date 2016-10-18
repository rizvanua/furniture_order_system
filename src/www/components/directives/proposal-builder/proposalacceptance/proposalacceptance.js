mainApp.directive("proposalacceptance",['fbQuotes', 'fbLoading','calculateServ', function (fbQuotes, fbLoading, calculateServ) {
	return{
		restrict: 'E',
		scope:true,
		link:function(){
		
		},
		 templateUrl: 'components/directives/proposal-builder/proposalacceptance/proposalacceptance.html'
	};
}]);