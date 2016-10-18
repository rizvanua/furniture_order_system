mainApp.directive("installationwarr",['fbQuotes', 'fbLoading', function (fbQuotes, fbLoading) {
	
	return {		
	restrict: 'E',
	scope:{
	pdfheight:"@",
	data:"@"	
	},
	link:function (scope) {	
  var data="http://fbpublicstorage.blob.core.windows.net/uploadfiles/PDF/Document.pdf"; 
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
    templateUrl: 'components/directives/proposal-builder/installationwarr/installationwarr.html'
	
  };
  
	
}]);