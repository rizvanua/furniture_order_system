mainApp.factory('calculateServ', function() {
	var calcfac={}, quotes={}, totalDoors=0, totalMoulding=0, totalSiding=0, totalDecking=0, totalWindows=0, totalSkylights=0, totalRawGlass=0;
	
  calcfac.getCalc=function(orders){
	var a;
/*Sorting*/	
	  for(a=0; a<orders.length; a++)
	  {
		  var order=orders[a];		
		 if(order.ProductTypeID===1)
		{
		totalDoors += order.TotalPrice;					
		}
		else if(order.ProductTypeID===2)
		{
		totalMoulding +=order.TotalPrice;		
		}
		else if(order.ProductTypeID===3)
		{
		totalSiding +=order.TotalPrice;		
		}
		else if(order.ProductTypeID===4)
		{
		totalDecking +=order.TotalPrice;		
		}
		else if(order.ProductTypeID===6)
		{
		totalWindows +=order.TotalPrice;		
		}
		else if(order.ProductTypeID===7)
		{
		totalSkylights +=order.TotalPrice;	
		}
		else if(order.ProductTypeID===8)
		{
		totalRawGlass +=order.TotalPrice;
		}
	  }	   
	  /*Calculation*/	
	  quotes.totalDoors=parseFloat(totalDoors.toFixed(2));
	  quotes.totalMoulding=parseFloat(totalMoulding.toFixed(2));
	  quotes.totalSiding=parseFloat(totalSiding.toFixed(2));
	  quotes.totalDecking=parseFloat(totalDecking.toFixed(2));
	  quotes.totalWindows=parseFloat(totalWindows.toFixed(2));
	  quotes.totalSkylights=parseFloat(totalSkylights.toFixed(2));
	  quotes.totalRawGlass=parseFloat(totalRawGlass.toFixed(2));	  
	  quotes.totalCost=quotes.totalDoors+quotes.totalMoulding+quotes.totalSiding+quotes.totalDecking+quotes.totalWindows+quotes.totalSkylights+quotes.totalRawGlass;
	  
	return quotes;	
		};
	return calcfac;
});