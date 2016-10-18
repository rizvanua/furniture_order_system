mainApp.directive('dynamicUiSelect', ['paymentCount', function(paymentCount) {
  return {
		require: 'uiSelect',			
		link: function(scope, element, attrs, $select,$event) {
			
		var interestRate=1, loanTerm=1, cashDiscount=0, cashDeposit=0;	
			scope.vm.order = {}; 
		
			scope.vm.refreshResults = refreshResults;
			scope.vm.clear = clear;
			  /*dynamic object constructor*/
			function VmObject(name){
						return scope.vm[name];   
			} 
			/**/
			/*calculation function*/
				function Counter(name, data){
					if(name==='interestRates'){
					interestRate = paymentCount.interestRate(name, data);
						}
						else if(name==='loanTerms'){
					loanTerm = paymentCount.loanTerm(name, data);	
						}
						else if(name==='cashDiscounts'){
					cashDiscount = paymentCount.cashDiscount(name, data);	
						}
						else if(name==='deposits'){
					cashDeposit = paymentCount.cashDeposit(name, data);	
						}						
					console.log(name);
					console.log(data);					
					scope.calculation.mounthlyPayment=(scope.calculate.totalCost*interestRate)/loanTerm;
					scope.calculation.balanceDue=(scope.calculate.totalCost-cashDiscount-cashDeposit);
				}			
			/**/
			function refreshResults(name, $select){				
				var search = $select.search;
				 var list = $select.items;
				 var arrData=new VmObject(name);
				/*filter to avoid duplication item*/				 
				list = $select.items.filter(function(item) { 
				  return item.id !== -1&&item.id !==999;
				});
				/**/
				var userInputItem = {
					id: -1, 
					description: search
				  };
				/*substitute our data into item list*/
				var a = arrData.length-1;
				/*$select.items=list.concat(arrData[a]);*/
				item=list.concat(userInputItem);
				$select.items=item.concat(arrData[a]);				
				$select.selected=$select.search;
				/*console.log(field);*/
				/**/
				/*console.log($select.items);*/
				
				if($select.search){
					Counter(name, $select.search);
				}
								
			}
			/*function checkIfEnterKeyWasPressed($event){
					var keyCode = $event.which || $event.keyCode;
					console.log($event);
				}*/
		  
			  function clear($event, $select){
				$event.stopPropagation(); 
				//to allow empty field, in order to force a selection remove the following line
				$select.selected = undefined;
				//reset search query
				$select.search = undefined;
				//focus and open dropdown
				$select.activate();
			}
						
		
		/*fetch and post field's value from and into  */
			scope.blackmen=function (name,object,$event, $select){							
				var description=$select.search;		
				var arrData=new VmObject(name);
				if(object.elem===false){// check if item is the dummy to add data
					if(description===undefined||description.length===0){			
						clear($event, $select);												
					}
					else{			
						arrData.unshift({id: arrData.length+1, description: description, elem: true});				
						$select.selected=description;
						$select.search=description;
						
					}

				}
				else if(object.elem===true){
					Counter(name, object.description);
				}
								
			};
			/**/
		}
	};
}]);