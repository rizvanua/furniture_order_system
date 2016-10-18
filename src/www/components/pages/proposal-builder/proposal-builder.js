mainApp.controller("ProposalController", ['$scope', 'fbUser', 'fbQuotes', 'fbLoading', 'calculateServ', 'PayTermsDataServ', 'fbManufacturers', 'eSignSaver', function($scope, fbUser, fbQuotes, fbLoading, calculateServ, PayTermsDataServ, fbManufacturers, eSignSaver) {
 $scope.vm={};
 $scope.pscheck={};
 $scope.main={};
 $scope.calculation={};
 $scope.sign={};
/*Data formate function*/
var TodayData=function (){
var d= new Date();
var month =d.getMonth()+1;
var day =d.getDate();
var year =d.getFullYear();
if(month<10){
month='0'+month;
}
var data = year+'/'+month+'/'+day;
return data;
};

    $scope.masterQuoteId = localStorage.getItem(userID + storedMasterQuoteSuffix);	
	
	
	fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
		
		$scope.CurrUser = user;
		$scope.main.user=user.companyName;	   
		/*get data from service for input fields!!!! Use POST/GET in real life*/	
		$scope.vm.paymentOptions = PayTermsDataServ.getDataPaymentOptions();
		$scope.vm.cashDiscounts = PayTermsDataServ.getDataCashDiscounts();
		$scope.vm.deposits = PayTermsDataServ.getDataDeposits();
		$scope.vm.loanTerms = PayTermsDataServ.getDataLoanTerms();
		$scope.vm.interestRates = PayTermsDataServ.getInterestRates();
		$scope.vm.months = PayTermsDataServ.getMonths();
		$scope.vm.years = PayTermsDataServ.getYears();		
		/**/
		/*convert data from canvases to base64 */
		$scope.getSignsImg=function(arrow){		
		console.log(eSignSaver.Base64Img(arrow,$scope));		
			};
		/**/
		
		
	   /*Remove this $scope before production*/
		$scope.customerId = 542;
		/**/
        fbLoading.showWhile(fbQuotes.GetAllOrders(user.UserID, $scope.masterQuoteId, $scope.masterQuoteId)).then(function(orders) {
			
            $scope.orderDetails = orders;			
			$scope.calculate = calculateServ.getCalc(orders);			
			$scope.companyName=user.companyName;
			fbLoading.showWhile(fbUser.GetCustomer($scope.customerId, $scope.customerId)).then(function(customer) {
				Object.defineProperty(customer, "FullLocation", {
				  get: function() {
					return this.city + ' ' + this.stat+ ' ' + this.zip;
				  }
				});
				
                $scope.Customer = customer;
				$scope.Customer.date= TodayData();				
            });			
        });
				
    });
}]);
