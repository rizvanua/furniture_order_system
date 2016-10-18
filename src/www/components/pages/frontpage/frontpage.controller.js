mainApp.controller("FrontPageController", function($scope, $http, $location, selectedProductType, productMetaTree,
    fbProducts, fbUser, fbQuotes, $rootScope, $state, fbMetaData, fbWindows, ModalService, fbLoading, Auth) {

    $scope.hasOrders = true;

    $scope.FBConfig = Config;

    //$scope.CurrUser = {};
    //$scope.CurrUser.companyImagePath = '';
    $scope.showLinePricing = {};
    $scope.showLinePricing.isChecked = false;

    $scope.sidemenu = new mlPushMenu(document.getElementById('mp-menu'), document.getElementById('trigger'), {
        type: 'overlap',
    });

    $scope.selectUser = function($item, $model) {
        $scope.changeUser($item.UserID);
    };

    $scope.goToProposal = function() {
        $state.go('proposal');
    };



    $scope.epicorXML = function() {
        var masterQuoteId = $scope.SelectedMasterQuote.MasterQuoteID;
        $http.post(Config.API.Endpoints.Quotes.BistrackExport, { UID: $scope.CurrUser.UserID, MQID: masterQuoteId }).then(function(data) {
            if (response.error) {
                toastr.error(response.error);
            } else if (response.success) {
                toastr.success(response.success);
            }
        });
    };


    $scope.OpenSettingsModal = function() {
        ModalService.showModal({
            templateUrl: 'components/modals/settings-modal/settings.html',
            controller: "SettingsModalController",
            inputs: {
                MasterQuote: $scope.SelectedMasterQuote,
                OrderTree: $scope.orderTree
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(settings) {
                setTimeout(function() {
                    $scope.getProductTypes();
                }, 1000);
                //$scope.CustomerInfoUpdated(customer, false);
            });
        });
    };

    var item = selectedProductType.getSelectedStyles2();

    $scope.logOut = function() {
        localStorage.clear();
        Auth.logOut();
        location.reload();
    };

    $scope.getStyles2 = function(productType) {
        var masterQuoteId = $scope.SelectedMasterQuote.MasterQuoteID;
        var doorQuote = $scope.CustomerDoorQuotes.filter(function(i) {
            return i.ProductTypeID == productType.ProductTypeID && (i.LMasterQuoteID == $scope.SelectedMasterQuote.id && i.MasterQuoteID == $scope.SelectedMasterQuote.MasterQuoteID);
        });
        if (doorQuote.length === 0) {
            fbLoading.showWhile(fbQuotes.GetQuote(productType.ProductTypeID, productType.ProductType, $scope.SelectedMasterQuote)).then(function(response) {
                $scope.$apply(function() {
                    $scope.CustomerDoorQuotes.push(response);
                    $scope.SelectedDoorQuote = response;
                    $scope.RedirectToFilterPage(productType);
                });
                toastr.success("Quote added successfully");
            }, function(error) {
                toastr.error(error);
            });
        } else {
            $scope.SelectedDoorQuote = doorQuote[0];
            $scope.RedirectToFilterPage(productType);
        }
    };

    fbProducts.GetProductMetaTree().then(function(tree) {
        productMetaTree.setTree(tree);
    });

    $scope.RedirectToFilterPage = function(productType) {
        if (productType.ProductTypeID == 6) {
            var masterQuoteId = $scope.SelectedMasterQuote.MasterQuoteID;
            fbLoading.showWhile(fbWindows.GetQuoteIdFromMasterQuoteId($scope.SelectedMasterQuote.id, $scope.SelectedMasterQuote.MasterQuoteID)).then(function(webquote) {
                localStorage.setItem('currentQuoteId', (Config.API.getMode() === Config.API.Modes.OFFLINE) ? webquote.id : webquote.WebQuoteID);
                $scope.GetProductDetails(productType, false);
            }, function(msg) {
                toastr.error(msg);
            });
        } else {
            $scope.GetProductDetails(productType, false);
        }
    };


    $scope.GetProductDetails = function(productType, skipRedirect) {
        var productTypeId = productType.ProductTypeID;
        var doorQuoteId = $scope.SelectedDoorQuote.DoorQuoteID;
        fbLoading.showWhile(fbMetaData.GetProductListJSON($scope.SelectedDoorQuote, productType, null, localStorage.getItem("userID"))).then(function(listJSON) {
            var item = {};
            item.ProductTypeItem = productType;
            item.ProductTypes = listJSON.ProductTypes;
            item.Styles2Item = listJSON.Styles2[0];
            item.Styles2List = listJSON.Styles2;
            item.Manufacturers = listJSON.Manufacturers;
            if (listJSON.ProductListJson !== "") {
                item.ProductListJsonString = $.parseJSON(listJSON.ProductListJson);
            } else {
                item.ProductListJsonString = {};
            }
            item.StylesList = listJSON.Styles;
            item.OrderDetails = listJSON.OrderDetails;
            item.CustomerMasterQuotes = $scope.CustomerMasterQuotes.filter(function(item) {
                if (item.CustomerID == $scope.SelectedCustomer.CustomerID) {
                    return true;
                }
            });
            if (listJSON.JsonFilterString !== "") {
                item.JsonFilterString = $.parseJSON(listJSON.JsonFilterString);
            } else {
                item.JsonFilterString = {};
            }
            item.SelectedCustomer = $scope.SelectedCustomer;
            item.SelectedDoorQuote = $scope.SelectedDoorQuote;
            item.SelectedMasterQuote = $scope.SelectedMasterQuote;
            item.ManufacturerSettings = listJSON.ManufacturerSettings;
            selectedProductType.setSelectedStyles2(item);
            fbWindows.SetMasterQuote($scope.SelectedMasterQuote);
            if (productType.ProductType === "Windows") {
                //window.location.href = '#/Window';
                $state.go('windows');
            } else {
                if (!skipRedirect) {
                    $state.go('filter');
                }
            }
        }, function(error) {
            toastr.error(error);
        });

    };

    $scope.SelectDoorQuote = function(doorQuote, productType, masterQuote) {
        $scope.SelectedDoorQuote = doorQuote;
        $scope.SelectedMasterQuote = masterQuote;
        $scope.RedirectToFilterPage(productType);
    };

    $scope.MasterQuoteFilter = {
        CustomerID: $scope.SelectedCustomer !== undefined ? $scope.SelectedCustomer.CustomerID : 0
    };

    $scope.CustomerFilter = {
        CustomerID: $scope.SelectedCustomer !== undefined ? $scope.SelectedCustomer.CustomerID : 0,
        ProductTypeID: $scope.productType !== undefined ? $scope.productType.ProductTypeID : 0
    };

    $scope.disabled = undefined;

    $scope.showFab = false;

    $scope.enable = function() {
        $scope.disabled = false;
    };

    $scope.disable = function() {
        $scope.disabled = true;
    };

    $scope.changeUser = function(cUserID) {
        $scope.SelecteduserID = cUserID;
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

    $scope.MasterQuoteFilter = {
        CustomerID: $scope.SelectedCustomer !== undefined ? $scope.SelectedCustomer.CustomerID : 0
    };

    $scope.selectCustomer = function(customer) {
        var selectedCustomer = $scope.Customers.filter(function(i) {
            return i.CustomerID == customer.CustomerID;
        });
        $scope.SelectedCustomer = selectedCustomer[0];
        localStorage.setItem(userID + storedUserSuffix, selectedCustomer[0].UserID);
        localStorage.setItem(userID + storedCustomerSuffix, selectedCustomer[0].CustomerID);
        $scope.MasterQuoteFilter.CustomerID = $scope.SelectedCustomer.CustomerID;
        $scope.CustomerFilter.CustomerID = $scope.SelectedCustomer.CustomerID;
        $scope.SetMasterQuotes(); //set master quote of the selected customer.
    };

    $scope.SetMasterQuotes = function() {
        var customerMasterQuotes = $scope.CustomerMasterQuotes.filter(function(masterQuote) {
            return masterQuote.CustomerID == $scope.SelectedCustomer.CustomerID;
        });
        if (!$scope.SelectedMasterQuote) {
            $scope.SetSelectedMasterQuote(customerMasterQuotes.length > 0 ? customerMasterQuotes[0] : null);
        } else {
            fbWindows.SetMasterQuote($scope.SelectedMasterQuote);
        }
    };

    //set selected master quote.
    $scope.SetSelectedMasterQuote = function(selectedMasterQuote, $event) {
        if ($event) {
            $event.stopPropagation();
        }
        $scope.SelectedMasterQuote = selectedMasterQuote;
        $scope.SelectMasterQuote(selectedMasterQuote);
        $scope.CustomerFilter.ProductTypeID = $scope.productType !== undefined ? $scope.productType.ProductTypeID : 0;
        $scope.getOrderDetails();
        $('[data-toggle="dropdown"]').parent().removeClass('open');
        fbWindows.SetMasterQuote(selectedMasterQuote);
    };

    $scope.getProductTypes = function() {
        fbLoading.showWhile(fbProducts.GetAllProductTypes()).then(function(products) {
            $scope.products = products;
            $scope.getCustomers();
        });
    };



    $scope.getOrderDetails = function() {
        fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
            fbLoading.showWhile(fbQuotes.GetAllOrders(user.UserID, $scope.SelectedMasterQuote.id, $scope.SelectedMasterQuote.MasterQuoteID)).then(function(orders) {
                $scope.orderDetails = orders;
                $scope.buildOrderTrees(orders);
                $scope.$apply();
                $.material.init();
            });
        });
    };

    $scope.buildOrderTrees = function(orderDetails) {
        var orderTree = {};
        var showOrders = false;
        $.each($scope.products, function(index, item) {
            orderTree[item.ProductTypeID] = {};
            orderTree[item.ProductTypeID].products = {};
            orderTree[item.ProductTypeID].productItem = item;
            orderTree[item.ProductTypeID].products.hasItems = false;
        });
        $.each(orderDetails, function(index, item) {
            if (!orderTree[item.ProductTypeID]) {
                orderTree[item.ProductTypeID] = {};
                orderTree[item.ProductTypeID].products = {};
                orderTree[item.ProductTypeID].products.hasItems = false;
            }
            if (!orderTree[item.ProductTypeID].products[item.OrderType]) {
                orderTree[item.ProductTypeID].products[item.OrderType] = {};
                orderTree[item.ProductTypeID].products[item.OrderType].total = 0;
                orderTree[item.ProductTypeID].products[item.OrderType].items = [];
                orderTree[item.ProductTypeID].products[item.OrderType].selected = true;
            }
            orderTree[item.ProductTypeID].products[item.OrderType].OrderName = item.OrderName;
            orderTree[item.ProductTypeID].products[item.OrderType].items.push(item);
            orderTree[item.ProductTypeID].products.hasItems = true;
            showOrders = true;
            orderTree[item.ProductTypeID].products[item.OrderType].total += Number(item.TotalPrice);
        });
        $scope.hasOrders = showOrders;
        $scope.orderTree = orderTree;
    };

    $scope.getQuoteTotal = function() {
        var total = 0;
        if ($scope.orderTree !== undefined && $scope.orderTree !== null) {
            $.each($scope.orderTree, function(index, productGroup) {
                $.each(productGroup.products, function(index, orderGroup) {
                    if (orderGroup.selected) {
                        total += orderGroup.total;
                    }
                });
            });
        }
        return total;
    };

    $scope.ExportPDF = function() {
        var productList = "";
        if ($scope.showExportPanel === true) {
            $.each($scope.orderTree, function(key, value) {
                $.each(value.products, function(key2, value2) {
                    if (value2.selected === false) {
                        $.each(value2.items, function(index, item) {
                            productList += "," + item.OrderID;
                        });
                    }
                });
            });

            var uId = localStorage.getItem("userID");

            var jobName = $scope.SelectedMasterQuote.JobName + " " + $scope.SelectedMasterQuote.ProjectName;
            //GeneratePdfService($scope.SelectedMasterQuote.MasterQuoteID, productList, jobName);
            fbLoading.showWhile(fbQuotes.GenPdf($scope.SelectedMasterQuote.id, productList, uId, jobName,
                $scope.showLinePricing.isChecked, $scope.SelectedMasterQuote.MasterQuoteID)).then(function() {

            });
        }
        $scope.showExportPanel = !$scope.showExportPanel;
    };

    $scope.QBExport = function() {
        fbLoading.showWhile(fbQuotes.GenDataExport($scope.SelectedMasterQuote.MasterQuoteID, $scope.CurrUser.UserID)).then(function(response) {

        });
        $scope.showExportPanel = !$scope.showExportPanel;
    };

    $scope.EagleExport = function() {
        fbLoading.showWhile(fbQuotes.EagleExport($scope.SelectedMasterQuote.MasterQuoteID, $scope.CurrUser.UserID)).then(function(response) {
            if (response.error) {
                toastr.error(response.error);
            } else if (response.success) {
                toastr.success(response.success);
            }
        });
    };


    // Select master quote from the master quote list and redirect to proper product with tree.
    $scope.SelectMasterQuote = function(masterQuote, $event) {
        var selectedMasterQuote = $scope.CustomerMasterQuotes.filter(function(i) {
            return i.MasterQuoteID == masterQuote.MasterQuoteID;
        });
        localStorage.setItem(userID + storedMasterQuoteSuffix, selectedMasterQuote[0].MasterQuoteID);
        localStorage.setItem(userID + storedLMasterQuoteSuffix, selectedMasterQuote[0].id);
        fbWindows.SetMasterQuote(masterQuote);
    };



    $scope.getCustomers = function() {
        fbLoading.showWhile(fbUser.AllCustomerInfo(localStorage.getItem("userID"))).then(function(response) {
            if (!$(".user-header").is(':visible')) {
                $(".user-header").show();
                $(".email-address").text(response.UserEmail);
            }
            $scope.$apply(function() {
                $scope.Users = response.UserDetails;
                $scope.SelecteduserID = localStorage.getItem(userID + storedUserSuffix);
                if (!$scope.SelecteduserID || $scope.SelecteduserID === 'null')
                    $scope.SelecteduserID = $scope.CurrUser.UserID;
                $scope.Customers = response.Customers;
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
                    localStorage.setItem(userID + storedCustomerSuffix, $scope.SelectedCustomer.CustomerID);
                }
                $scope.MasterQuoteFilter.CustomerID = $scope.SelectedCustomer !== null ? $scope.SelectedCustomer.CustomerID : 0;
                $scope.CustomerFilter.CustomerID = $scope.SelectedCustomer !== null ? $scope.SelectedCustomer.CustomerID : 0;

                $scope.CustomerMasterQuotes = response.CustomerMasterQuotes;
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

                $scope.CustomerDoorQuotes = response.CustomerDoorQuotes;

                $scope.CompanyProductPermissions = response.CompanyProductPermissions;
                if (localStorage.getItem("presetProductId")) {
                    var productType = {
                        ProductTypeID: localStorage.getItem("presetProductId"),
                        ProductType: localStorage.getItem("presetProductName")
                    };
                    localStorage.removeItem("presetProductId");
                    $scope.GetStyles2(productType);
                }

                $scope.getOrderDetails();
            });
        });

    };

    fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
        $scope.CurrUser = user;
        $scope.getProductTypes();
        $scope.$apply(function() {});
    });

});