mainApp.factory('PayTermsDataServ', function() {
		var data={}, paymentOptions=[], cashDiscounts=[], loanTerms=[], interestRates=[], months=[], years=[];
		data.getDataPaymentOptions=function(){
			paymentOptions = [
			{id: 1, description: '90 days same as cash',elem: true}, 
			{id: 2, description: '180 month long term loan',elem: true},
			{id: 999, description: '+add new item', elem: false}
			];
		return paymentOptions;
		};
		
		data.getDataCashDiscounts=function(){
			cashDiscounts = [ 
			{id: 1, description: '100', elem: true}, 
			{id: 2, description: '200',elem: true},
			{id: 999, description: '+add new item', elem: false}
			];
		return cashDiscounts;
		};
		
		data.getDataDeposits=function(){
			Deposits = [ 
			{id: 1, description: '100', elem: true}, 
			{id: 2, description: '200',elem: true},
			{id: 999, description: '+add new item', elem: false}
			];
		return Deposits;
		};
		
		data.getDataLoanTerms=function(){
			loanTerms = [ 
			{id: 1, description: '10', elem: true}, 
			{id: 2, description: '60',elem: true},
			{id: 999, description: '+add new item', elem: false}
			];
		return loanTerms;
		};
		
		data.getInterestRates=function(){
			interestRates = [ 
			{id: 1, description: '10', elem: true}, 
			{id: 2, description: '60',elem: true},
			{id: 999, description: '+add new item', elem: false}
			];
		return interestRates;
		};
		
		data.getMonths=function(){
			var month=1;
			for(var i=0; i<12; i++)
				{
					var forMonth=month+i;
					if(forMonth<10)
					{
					forMonth="0"+forMonth.toString();
					}
					else{
					forMonth=forMonth.toString();
					}
						months.push({id: i, description: forMonth, elem: true});
					}
					
			
		return months;
		};
		
		data.getYears=function(){
			var getYear=new Date().getFullYear();
			for(var i=0; i<10; i++)
				{
					getYearData=getYear+i;					
					years.push({id: i, description: getYearData , elem: true});
				}
				
		return years;
		};
	
	return data;
});