mainApp.controller("CustomersController", function($scope, $http, $location, selectedProductType, productMetaTree,
    fbProducts, fbUser, fbQuotes, $rootScope, $state, fbMetaData, ModalService, fbLoading, Auth) {

    $scope.sidemenu = new mlPushMenu(document.getElementById('mp-menu'), document.getElementById('trigger'), {
        type: 'overlap',
    });

    $scope.logOut = function() {
        localStorage.clear();
        Auth.logOut();
        location.reload();
    };

    $scope.getCustomers = function() {
        fbLoading.showWhile(fbUser.AllCustomerInfo(localStorage.getItem("userID"))).then(function(customers) {
            console.log(customers);
            if (!$(".user-header").is(':visible')) {
                $(".user-header").show();
                $(".email-address").text(customers.UserEmail);
            }
            $scope.$apply(function() {
                $scope.Users = customers.UserDetails;
                $scope.SelecteduserID = localStorage.getItem(userID + storedUserSuffix);
                if (!$scope.SelecteduserID || $scope.SelecteduserID === 'null')
                    $scope.SelecteduserID = $scope.CurrUser.UserID;
                $scope.Customers = customers.Customers;
                $scope.changeUser($scope.SelecteduserID);
                var customerId = localStorage.getItem(userID + storedCustomerSuffix);
                if (customerId) {
                    var currentCustomers = $scope.Customers.filter(function(i) {
                        return i.CustomerID == customerId;
                    });
                    if (currentCustomers.length > 0) {
                        $scope.SelectedCustomer = currentCustomers[0];
                    } else {
                        $scope.SelectedCustomer = $scope.Customers.length > 0 ? $scope.Customers[0] : null;
                    }
                } else {
                    $scope.SelectedCustomer = $scope.Customers.length > 0 ? $scope.Customers[0] : null;
                }
                $scope.MasterQuoteFilter.CustomerID = $scope.SelectedCustomer !== null ? $scope.SelectedCustomer.CustomerID : 0;
                $scope.CustomerFilter.CustomerID = $scope.SelectedCustomer !== null ? $scope.SelectedCustomer.CustomerID : 0;

                $scope.CustomerMasterQuotes = customers.CustomerMasterQuotes;
                var masterQuoteId;
                if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
                    masterQuoteId = localStorage.getItem(userID + storedLMasterQuoteSuffix);
                } else {
                    masterQuoteId = localStorage.getItem(userID + storedMasterQuoteSuffix);
                }
                if (masterQuoteId) {
                    var currentMasterQuotes = $scope.CustomerMasterQuotes.filter(function(i) {
                        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
                            return i.id == masterQuoteId;
                        } else {
                            return i.MasterQuoteID == masterQuoteId;
                        }
                    });
                    if (currentMasterQuotes.length > 0) {
                        $scope.SelectedMasterQuote = currentMasterQuotes[0];

                    } else {
                        $scope.SetMasterQuotes();
                    }
                } else {
                    $scope.SetMasterQuotes();
                }

            });
        });
    };

    $scope.SetMasterQuotes = function() {
        var customerMasterQuotes = $scope.CustomerMasterQuotes.filter(function(masterQuote) {
            return masterQuote.CustomerID == $scope.SelectedCustomer.CustomerID;
        });
        if (customerMasterQuotes.length === 0) {
            $scope.OpenQuoteModal();
            return;
        }
        if (!$scope.SelectedMasterQuote) {
            $scope.SetSelectedMasterQuote(customerMasterQuotes.length > 0 ? customerMasterQuotes[0] : null);
        }
    };

    $scope.SetSelectedMasterQuote = function(selectedMasterQuote, $event) {
        if ($event) {
            $event.stopPropagation();
        }
        $scope.SelectedMasterQuote = selectedMasterQuote;
        $scope.SelectMasterQuote(selectedMasterQuote);
        $scope.CustomerFilter.ProductTypeID = $scope.productType !== undefined ? $scope.productType.ProductTypeID : 0;
        //$scope.getOrderDetails();
        $('[data-toggle="dropdown"]').parent().removeClass('open');
    };

    $scope.selectCustomer = function(customer) {
        var selectedCustomer = $scope.Customers.filter(function(i) {
            return i.CustomerID == customer.CustomerID;
        });
        $scope.SelectedCustomer = selectedCustomer[0];
        $scope.MasterQuoteFilter.CustomerID = $scope.SelectedCustomer.CustomerID;
        $scope.CustomerFilter.CustomerID = $scope.SelectedCustomer.CustomerID;
        $scope.SetMasterQuotes(); //set master quote of the selected customer.
    };

    $scope.CustomerFilter = {
        CustomerID: $scope.SelectedCustomer !== undefined && $scope.SelectedCustomer !== null ? $scope.SelectedCustomer.CustomerID : 0
    };

    $scope.MasterQuoteFilter = {
        CustomerID: $scope.SelectedCustomer !== undefined && $scope.SelectedCustomer !== null ? $scope.SelectedCustomer.CustomerID : 0
    };

    $scope.changeUser = function(cUserID) {
        $scope.SelecteduserID = cUserID;
        localStorage.setItem(userID + storedUserSuffix, cUserID);
        var user = $scope.Users.filter(function(item) {
            if (item.UserID == cUserID) {
                return true;
            } else {
                return false;
            }
        });
        if (user.length > 0) {
            $scope.selectedUser = user[0];
        }
    };

    $scope.OpenCustomerModal = function() {
        ModalService.showModal({
            templateUrl: 'components/modals/customer-modal/customer-modal.html',
            controller: "CustomerModalController",
            inputs: {
                customer: {},
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(customer) {
                $scope.CustomerInfoUpdated(customer, false);
            });
        });
    };

    $scope.OpenQuoteModal = function() {
        ModalService.showModal({
            templateUrl: 'components/modals/project-modal/project-modal.html',
            controller: "ProjectModalController",
            inputs: {
                customer: $scope.SelectedCustomer,
                masterQuote: {}
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(mQuote) {
                //$scope.getCustomers();
                $scope.CustomerMasterQuotes.push(mQuote);
                $scope.SetSelectedMasterQuote(mQuote);
                $state.go('frontpage');
                toastr.success("Project Added Successfully!");
            });
        });
    };

    $scope.EditMasterQuote = function(masterQuote) {
        ModalService.showModal({
            templateUrl: 'components/modals/project-modal/project-modal.html',
            controller: "ProjectModalController",
            inputs: {
                customer: $scope.SelectedCustomer,
                masterQuote: masterQuote
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(customer) {
                $scope.getCustomers();
                toastr.success("Project Saved Successfully!");
            });
        });
    };

    $scope.selectUser = function($item, $model) {
        $scope.changeUser($item.UserID);
    };

    $scope.DeleteMasterQuote = function(masterQuote) {
        if (!masterQuote) {
            masterQuote = $scope.SelectedMasterQuote;
        }
        $scope.SelectedMasterQuote = masterQuote;
        ModalService.showModal({
            templateUrl: 'components/modals/confirm-modal/confirm-modal.html',
            controller: "ConfirmModalController",
            inputs: {
                customer: $scope.SelectedCustomer,
                heading: "Delete Master Quote for Job: " + $scope.SelectedCustomer.name + ' ' + masterQuote.JobName + ' ' + masterQuote.ProjectName,
                body: "Do you want to delete the " + masterQuote.JobName + " master quote?"
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(res) {
                if (res === true) {
                    fbLoading.showWhile(fbQuotes.DeleteMasterQuote($scope.SelectedMasterQuote)).then(function() {
                        $scope.getCustomers();
                        toastr.success("Master Quote Deleted!");
                    });
                }
            });
        });
    };

    $scope.getDate = function(masterQuote) {
        var value = new Date(parseInt(masterQuote.CreatedDateTime.replace("/Date(", "").replace(")/", ""), 10));
        return value.toDateString();
    };

    $scope.SelectMasterQuote = function(masterQuote, $event) {
        var selectedMasterQuote = $scope.CustomerMasterQuotes.filter(function(i) {
            if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
                return i.id == masterQuote.id;
            } else {
                return i.MasterQuoteID == masterQuote.MasterQuoteID;
            }
        });
        localStorage.setItem(userID + storedUserSuffix, $scope.SelectedCustomer.UserID);
        localStorage.setItem(userID + storedCustomerSuffix, $scope.SelectedCustomer.CustomerID);
        localStorage.setItem(userID + storedLMasterQuoteSuffix, selectedMasterQuote[0].id);
        localStorage.setItem(userID + storedMasterQuoteSuffix, selectedMasterQuote[0].MasterQuoteID);
        if ($event) {
            $state.go('frontpage');
        }
    };

    $scope.EditCustomer = function() {
        ModalService.showModal({
            templateUrl: 'components/modals/customer-modal/customer-modal.html',
            controller: "CustomerModalController",
            inputs: {
                customer: $scope.SelectedCustomer,
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(customer) {
                $scope.CustomerInfoUpdated(customer, true);
            });
        });
    };

    $scope.DeleteCustomer = function(customer) {
        if (customer === undefined || customer === null) {
            customer = $scope.SelectedCustomer;
        }
        ModalService.showModal({
            templateUrl: 'components/modals/confirm-modal/confirm-modal.html',
            controller: "ConfirmModalController",
            inputs: {
                customer: $scope.SelectedCustomer,
                heading: "Delete Customer",
                body: "Do you want to delete this customer?"
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(res) {
                if (res === true) {
                    fbLoading.showWhile(fbUser.DeleteCustomer(customer)).then(function() {
                        $scope.getCustomers();
                        toastr.success("Customer Deleted!");
                    });
                }
            });
        });
    };

    $scope.CustomerInfoUpdated = function(customer, isEditMode) {
        if (isEditMode) {
            $scope.Customers = $scope.Customers.map(function(element, index) {
                if (element.id == customer.id)
                    return customer;
                return element;
            });
            if ($scope.SelectedCustomer.CustomerID == customer.CustomerID) {
                $scope.SelectedCustomer = angular.copy(customer);
            }
        } else {
            $scope.Customers.push(customer);
        }

        if ($scope.SelectedCustomer === null) {
            $scope.SelectedCustomer = customer; // if there are not any customer, Set the newly added customer as current customer.
        }
        $scope.selectCustomer(customer);
        toastr.success(isEditMode ? "Customer updated successfully" : "Customer added successfully");
    };

    fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
        $scope.CurrUser = user;
        $scope.getCustomers();
        $scope.$apply();
    });

});
