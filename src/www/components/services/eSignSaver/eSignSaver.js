mainApp.factory('eSignSaver', function() {
	var esign={};
	
	function Sign(signature,scope){

		var canvas=scope.sign[signature]._ctx.canvas;
		return canvas;   
	}
	esign.Base64Img=function(arrow,scope){
			var dataUrlArr=[];
			var  dataUrl={};		 
			for(var i=0; i<arrow.length; i++)
			{	  
				var canvas = new Sign(arrow[i],scope);		  
				dataUrl= {data:canvas.toDataURL()};
				dataUrlArr.push(dataUrl);			
			}		
			return dataUrlArr;		
	};
		
	return esign;	
});