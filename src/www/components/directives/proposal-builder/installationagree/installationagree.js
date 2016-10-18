mainApp.directive("installationagree",['fbQuotes', 'fbLoading', function (fbQuotes, fbLoading) {
	return{
		restrict: 'E',
	scope:true,		
	link:function (scope) {	
  var data="http://fbpublicstorage.blob.core.windows.net/uploadfiles/PDF/Details.pdf"; 
	scope.data=data;  
  PDFJS.getDocument(data).then(function (doc) {	  
    var numPages = doc.numPages;    
	if(numPages>1){
		scope.pdfheight="height: 2000px;";		
	}
	else
	{
		scope.pdfheight="height: 1400px;";		
	}	
	});	
	
	},	
		 templateUrl: 'components/directives/proposal-builder/installationagree/installationagree.html'
	};
}]);