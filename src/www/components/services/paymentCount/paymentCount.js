mainApp.factory('paymentCount', function() {
	var calculation={}, interestRate={}, loanTerm={}, mounthlyPayment={};
	
calculation.interestRate=function(name, elem){
		if(elem!==undefined&&name!==undefined){
			if(name==='interestRates')
			{
				interestRate=1+(elem/100);				
				
				return interestRate;
			}		
	}
		
		};
calculation.loanTerm=function(name, elem){
		if(elem!==undefined&&name!==undefined){
			if(name==='loanTerms')
			{
				loanTerm=elem;				
				
				return loanTerm;
			}		
		}	
		
	};
calculation.cashDiscount=function(name, elem){
		if(elem!==undefined&&name!==undefined){
			if(name==='cashDiscounts')
			{
				cashDiscount=elem;				
				
				return cashDiscount;
			}		
		}	
		
	};
calculation.cashDeposit=function(name, elem){
		if(elem!==undefined&&name!==undefined){
			if(name==='deposits')
			{
				cashDeposit=elem;				
				
				return cashDeposit;
			}		
		}	
		
	};	

		
	return calculation;
	
});