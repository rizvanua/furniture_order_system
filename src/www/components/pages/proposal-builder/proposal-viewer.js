mainApp.controller("ProposalController1", function($scope, fbUser, fbQuotes, fbLoading) {
    $scope.masterQuoteId = localStorage.getItem(userID + storedMasterQuoteSuffix);
console.log("YYYYY");
    fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
		console.log("HHHHH");
        $scope.CurrUser = user;
        fbLoading.showWhile(fbQuotes.GetAllOrders(user.UserID, $scope.masterQuoteId, $scope.masterQuoteId)).then(function(orders) {
            $scope.orderDetails = orders;
        });
    });

});
