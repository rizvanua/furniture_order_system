//TODO: This was added briefly to allow the optimizer to be used during a demo. Remove after an optimizer service has been developed.
function AjaxCall(url, postData, httpmethod, calldatatype, contentType, showLoading, hideLoadingParam, isAsync) {
    var urlBase = "http://fasterbids.com";
    if (hideLoadingParam !== undefined && !hideLoadingParam)
        hideLoading = hideLoadingParam;
    if (contentType === undefined)
        contentType = "application/x-www-form-urlencoded;charset=UTF-8";

    if (showLoading === undefined)
        showLoading = true;

    if (showLoading === false || showLoading.toString().toLowerCase() == "false")
        showLoading = false;
    else
        showLoading = true;

    if (isAsync === undefined)
        isAsync = true;

    return jQuery.ajax({
        type: httpmethod,
        url: urlBase + url,
        data: postData,
        global: showLoading,
        dataType: calldatatype,
        contentType: contentType,
        async: isAsync
            //       beforeSend: function () { if (showLoading) myApp.showPleaseWait(); }
    });
}

// end TODO


mainApp.controller("FilterPageController", function($scope, $http, $location, selectedProductType, productMetaTree,
    fbProducts, fbUser, fbQuotes, $rootScope, $state, fbMetaData, scopes, fbManufacturers, selectedDoor, optimizer, fbLoading, fbWindows) {

    $scope.showingSearch = false;

    $scope.FBConfig = Config;
    $scope.metaTree = productMetaTree.getTree();
    scopes.store('FilterController', $scope);
    $scope.pageSize = pageSize;
    $scope.paginationIndex = 6;

    $scope.pageSize = 5;

    $scope.collectionLimits = {};

    $scope.closeSearch = function() {
        $scope.showingSearch = false;
    };

    if (localStorage.getItem("showFilterPanel")) {
        $scope.showResults = true;
        localStorage.removeItem("showFilterPanel");
    }

    $scope.showFilters = {};

    $scope.toggleShowAll = function(filterType) {
        if ($scope.showFilters[filterType]) {
            $scope.showFilters[filterType] = null;
        } else {
            $scope.showFilters[filterType] = true;
            $scope.setMaterialInit();
        }
    };

    $scope.getDoorShadow = function(leaf) {
        if (leaf.singleWidths && leaf.singleWidths.length === 0 && leaf.bifoldWidths && leaf.bifoldWidths.length > 0) {
            return '';
        }
        return 'shadow';
    };

    $scope.getFilterLimit = function(filterType) {
        if ($scope.showFilters[filterType]) {
            return 1000;
        } else {
            return 5;
        }
    };

    $scope.getCollectionLimit = function(collection) {
        if ($scope.collectionLimits[collection]) {
            return $scope.collectionLimits[collection];
        } else {
            $scope.collectionLimits[collection] = 20;
        }
    };

    var item = selectedProductType.getSelectedStyles2();

    $scope.thisItem = item;
    $scope.styles2 = item;
    $scope.availableStyles = {};
    $scope.styles2Item = item.Styles2Item;

    var productTypeId = item.ProductTypeItem.ProductTypeID;

    $scope.SelectedStyles2ID = $scope.styles2Item.Styles2ID;
    $scope.SelectedStyle2Name = $scope.styles2Item.Style2;
    $scope.productTypes = item.ProductTypes;

    var distributorFilterStringName;

    $scope.SetDistributorString = function() {
        distributorFilterStringName = "distributor_" + $scope.SelectedStyles2ID;
    };

    $scope.SetDistributorString();

    $scope.SetDistributorInStorage = function(manufacturerId) {
        localStorage.setItem(distributorFilterStringName, manufacturerId);
    };

    $scope.getExteriorFilters = function() {
        fbLoading.showWhile(fbMetaData.getExtJsonFilters($scope.thisItem.SelectedManufacturerId)).then(function(filters) {
            $scope.names = filters;
            for (var i in $scope.names) {
                if (i.toLowerCase() == 'caming') {
                    $scope.names[i].order = 10;
                } else {
                    $scope.names[i].order = 1;
                }
            }
            $scope.$apply(function() {
                $scope.setMaterialInit();
            });
        });
    };

    $scope.getAvailableStyles = function() {
        if ($scope.thisItem.SelectedManufacturerId === undefined || $scope.thisItem.SelectedManufacturerId === null) {
            return;
        }
        fbLoading.showWhile(fbManufacturers.getAvailableStyles($scope.thisItem.SelectedManufacturerId, $scope.productType.ProductTypeID)).then(function(availableStyles) {
            $scope.$apply(function() {
                $scope.availableStyles = availableStyles;
            });
        });
    };

    $scope.styleNotAvailable = function(style) {
        if (style === undefined || style === null) {
            return false;
        }
        if ($scope.availableStyles) {
            if (!$scope.availableStyles[style.Styles2ID]) {
                return true;
            } else {
                var st = $scope.availableStyles[style.Styles2ID].filter(function(item) {
                    if (item.Style == style.Style) {
                        return true;
                    }
                });
                if (st.length > 0) {
                    return false;
                } else {
                    return true;
                }
            }
        }
    };


    //controls for breadcrumb

    $scope.GetProductDetails = function(productType) {
        var productTypeId = productType.ProductTypeID;
        var doorQuoteId = $scope.SelectedDoorQuote.DoorQuoteID;
        fbLoading.showWhile(fbMetaData.GetProductListJSON($scope.SelectedDoorQuote, productType, null, localStorage.getItem("userID"), false, $scope.thisItem.SelectedManufacturerId)).then(function(response) {
            $scope.thisItem.ProductTypeItem = productType;
            $scope.thisItem.ProductTypes = response.ProductTypes;
            $scope.thisItem.Styles2Item = response.Styles2[0];
            $scope.thisItem.Styles2List = response.Styles2;
            $scope.SelectedStyles2ID = $scope.thisItem.Styles2Item.Styles2ID;
            $scope.SelectedStyle2Name = $scope.thisItem.Styles2Item.Style2;
            $scope.SetDistributorString();

            $scope.thisItem.Manufacturers = response.Manufacturers;
            $scope.thisItem.ProductListJsonString = $.parseJSON(response.ProductListJson);
            $scope.thisItem.StylesList = response.Styles;
            $scope.thisItem.OrderDetails = response.OrderDetails;
            $scope.thisItem.JsonFilterString = $.parseJSON(response.JsonFilterString);

            $scope.thisItem.ManufacturerSettings = response.ManufacturerSettings;

            selectedProductType.setSelectedStyles2($scope.thisItem);

            $scope.SelectedStyles2ID = $scope.thisItem.Styles2Item.Styles2ID;
            $scope.SelectedStyle2Name = $scope.thisItem.Styles2Item.Style2;
            $scope.SetDistributorString();

            if (!$scope.thisItem) {
                $scope.thisItem = {};
            }

            $scope.Manufacturers = response.Manufacturers;
            $scope.SetManufacturer();
            $scope.productType = $scope.thisItem.ProductTypeItem;
            $scope.styles2Item = $scope.thisItem.Styles2Item;
            $scope.StylesList = $scope.thisItem.StylesList;
            $scope.OrderDetails = $scope.thisItem.OrderDetails;

            if ($scope.thisItem.Styles2Item.Style2 == "Exterior") {
                $scope.getExteriorFilters();
            } else {
                $scope.names = $scope.thisItem.JsonFilterString;
            }

            $scope.tree = $scope.thisItem.ProductListJsonString;

            $scope.clearFilters();

            $scope.initSearch();
            $scope.optimizeMode = false;

            if (productType.ProductType == "Windows") {
                $state.go("windows");
            }

            $scope.$apply(function() {
                $.material.init();
            });

            $scope.getAvailableStyles();
        }, function(error) {
            toastr.error(error);
        });
    };


    $scope.RedirectToFilterPage = function(productType) {
        if (productType.ProductTypeID === 6) {
            var masterQuoteId = $scope.thisItem.SelectedMasterQuote.MasterQuoteID;
            fbLoading.showWhile(fbWindows.GetQuoteIdFromMasterQuoteId($scope.thisItem.SelectedMasterQuote.id, $scope.thisItem.SelectedMasterQuote.MasterQuoteID)).then(function(webquote) {
                fbWindows.SetMasterQuote($scope.thisItem.SelectedMasterQuote);
                localStorage.setItem('currentQuoteId', (Config.API.getMode() === Config.API.Modes.OFFLINE) ? webquote.id : webquote.WebQuoteID);
                $scope.GetProductDetails(productType, false);
            }, function(msg) {
                toastr.error(msg);
            });
        } else {
            $scope.GetProductDetails(productType);
        }
        $scope.optimizeMode = false;
        $scope.showResults = false;
    };

    $scope.getStyles2 = function(productType) {
        console.log("here");
        var masterQuoteId = $scope.thisItem.SelectedMasterQuote.MasterQuoteID;
        var productTypeId = productType.ProductTypeID;
        fbLoading.showWhile(fbQuotes.GetSubQuotes(productTypeId, $scope.thisItem.SelectedMasterQuote.id, $scope.thisItem.SelectedMasterQuote.MasterQuoteID)).then(function(response) {
            $scope.CustomerDoorQuotes = response;
            var doorQuote = response.filter(function(i) {
                return i.ProductTypeID == productType.ProductTypeID &&
                    (i.LMasterQuoteID == $scope.thisItem.SelectedMasterQuote.id && i.MasterQuoteID === $scope.thisItem.SelectedMasterQuote.MasterQuoteID);
            });
            if (doorQuote.length === 0) {
                fbLoading.showWhile(fbQuotes.GetQuote(productType.ProductTypeID, productType.ProductType, $scope.thisItem.SelectedMasterQuote)).then(function(response) {
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
        });
    };


    $scope.changeMasterQuote = function(mQuote) {
        var currentUserId = localStorage.getItem(userID + storedUserSuffix);
        localStorage.setItem(userID + storedMasterQuoteSuffix, mQuote.MasterQuoteID);
        localStorage.setItem(userID + storedLMasterQuoteSuffix, mQuote.id);
        window.location.href = "#/";
    };

    $scope.setLeafImage = function(leaf) {
        var url = "url('http://fbpublicstorage.blob.core.windows.net/uploadfiles/products/'" + leaf.photoName + ")";
        return {
            "background-image": url
        };
    };

    if ($scope.styles2Item.Style2 == "Exterior") {
        $scope.getExteriorFilters();
    } else {
        $scope.names = item.JsonFilterString;
    }

    $scope.GetProducts = function(styles2Item, skipPanelChange) {
        fbLoading.showWhile(fbMetaData.GetTreeAndFilter(styles2Item.Styles2ID, $scope.selectedManufacturer.ManufacturerID)).then(function(jsonData) {

            $scope.$apply(function() {
                $scope.ProductListJsonString = $.parseJSON(jsonData.jtString);
                $scope.JsonFilterString = $.parseJSON(jsonData.jfString);
                $scope.thisItem.ProductListJsonString = $scope.ProductListJsonString;
                $scope.thisItem.JsonFilterString = $scope.JsonFilterString;
                if ($scope.styles2Item.Style2 == "Exterior") {
                    $scope.getExteriorFilters();
                } else {
                    $scope.names = $scope.thisItem.JsonFilterString;
                }
                $scope.tree = $scope.thisItem.ProductListJsonString;
                selectedProductType.setSelectedStyles2($scope.thisItem);
                $scope.clearFilters();
                $scope.setMaterialInit();

                if (!skipPanelChange) {
                    $scope.showResults = true;
                }
            });

        });
    };

    $scope.setMaterialInit = function() {
        setTimeout(function() {
            $.material.init();
        }, 500);
    };

    $scope.filterHead = function(element) {
        var jsonElement = JSON.stringify(element);
        for (var i in $scope.filters) {
            if (jsonElement.indexOf($scope.filters[i]) == -1) {
                return false;
            }
        }
        if ($scope.showingSearch === true) {
            if (jsonElement.toLowerCase().indexOf($scope.searchInfo.fbSearchText.toLowerCase()) == -1) {
                return false;
            }
        }
        return true;
    };

    var styleFilterStringName = "style_filters_" + productTypeId;
    var styleFilter = localStorage.getItem(styleFilterStringName);
    if (styleFilter) {
        $scope.SelectedStyleID = styleFilter.split('|')[0];
        $scope.SelectedStyleName = styleFilter.split('|')[1];
    } else {
        $scope.SelectedStyleName = '';
        $scope.SelectedStyleID = 0;
    }

    $scope.getStyleName = function() {
        if ($scope.SelectedStyleName === '') {
            return 'All';
        }
        return $scope.SelectedStyleName;
    };
    $scope.StyleClick = function(style, style2) {


        if (style2) { //&& style2.Styles2ID != $scope.SelectedStyles2ID) {
            $scope.SelectedStyleID = 0;
            $scope.SelectedStyleName = '';
            $scope.SelectedStyles2ID = style2.Styles2ID;
            $scope.SetDistributorString();
            $scope.SetDistributorInStorage($scope.thisItem.SelectedManufacturerId);
            $scope.GetProducts(style2);
        } else if (style && style.Styles2ID != $scope.SelectedStyles2ID) {
            //Check to see if the product tree we have loaded is the correct one for the selected style, change it if it isn't.
            if (!$scope.styleNotAvailable(style)) {
                $scope.SetDistributorString();
                $scope.SetDistributorInStorage($scope.thisItem.SelectedManufacturerId);
                $scope.styles2Item = style.Styles2;
                $scope.GetProducts(style.Styles2);
            }
        } else {
            //If we do have the correct tree loaded, and it is available for this distributor go to it.
            if (!$scope.styleNotAvailable(style)) {
                $scope.SelectedStyleID = 0;
                $scope.SelectedStyleName = '';
                $scope.showResults = true;
            }
        }
        //set scope info for selected style.
        if (style && !$scope.styleNotAvailable(style)) {
            $scope.SelectedStyleID = style.StyleID;
            $scope.SelectedStyleName = style.Style;
            $scope.SelectedStyles2ID = style.Styles2ID;
            $scope.styles2Item = style.Styles2;
            $scope.thisItem.Styles2Item = $scope.styles2Item;
            selectedProductType.setSelectedStyles2($scope.thisItem);
            localStorage.setItem(styleFilterStringName, $scope.SelectedStyleID + "|" + $scope.SelectedStyleName);
            $scope.setMaterialInit();
        }
    };

    $scope.BackClick = function() {
        if ($scope.showResults === true) {
            $scope.showResults = false;
        } else {
            $state.go('frontpage');
        }
    };

    $scope.RemoveStyle = function() {
        $scope.SelectedStyleName = '';
        $scope.SelectedStyleID = 0;
        localStorage.removeItem(styleFilterStringName);
        //$scope.$apply();
    };

    $scope.SupplierChange = function($event, supplier) {
        if ($($event.target).attr("checked") !== undefined) {
            $scope.filters.manufacturer = supplier;
        } else {
            $scope.filters.manufacturer = '';
        }
        $scope.SetFilters();
    };

    $scope.FilterChange = function(treeName, selectedItem) {
        $scope.SelectedStyleID = 0;
        $scope.SelectedStyleName = '';
        //  $scope.filters[treeName] = selectedItem[treeName] == null ? "" : selectedItem[treeName];
        if ($scope.filters[treeName] == selectedItem) {
            delete $scope.filters[treeName];
        } else {
            $scope.filters[treeName] = selectedItem;
        }
        $scope.SetFilters();
    };

    $scope.ChangeManufacturer = function(manufacturerItem) {
        var selectedManufacturerId = manufacturerItem.ManufacturerID;

        fbLoading.showWhile(fbMetaData.GetTreeAndFilter($scope.SelectedStyles2ID, selectedManufacturerId)).then(function(jsonData) {

            $scope.$apply(function() {
                $scope.selectedManufacturer = manufacturerItem;
                $scope.searchSelectedManufacturer = manufacturerItem;
                $scope.selectedManufacturerPhoto = manufacturerItem.PhotoFileName;
                $scope.thisItem.SelectedManufacturerId = $scope.selectedManufacturer.ManufacturerID;
                $scope.ProductListJsonString = $.parseJSON(jsonData.jtString);
                $scope.JsonFilterString = $.parseJSON(jsonData.jfString);
                $scope.thisItem.ProductListJsonString = $scope.ProductListJsonString;
                $scope.thisItem.JsonFilterString = $scope.JsonFilterString;
                $scope.getAvailableStyles();
                if ($scope.styles2Item.Style2 == "Exterior") {
                    $scope.getExteriorFilters();
                } else {
                    $scope.names = $scope.thisItem.JsonFilterString;
                }
                $scope.tree = $scope.thisItem.ProductListJsonString;
                selectedProductType.setSelectedStyles2($scope.thisItem);
                $scope.clearFilters();
                $scope.SetDistributorInStorage($scope.thisItem.SelectedManufacturerId);
                $scope.setMaterialInit();
            });

        });

        var selectedManufacturerSettings = $scope.thisItem.ManufacturerSettings.filter(function(i) {
            return i.ProductTypeID == productTypeId && i.UserID == localStorage.getItem("userID") && i.ManufacturerID == selectedManufacturerId;
        });
        if (selectedManufacturerSettings.length > 0) {
            $scope.thisItem.SelectedManufacturerSettings = selectedManufacturerSettings[0];
        }
    };

    $scope.searchInfo = {};

    $scope.initSearch = function() {
        $scope.SearchManufacturers = [];
        if (selectedProductType.getSelectedStyles2().Manufacturers.length > 0 && selectedProductType.getSelectedStyles2().Manufacturers[0]._data !== undefined) {
            $scope.SearchManufacturers = _.pluck(selectedProductType.getSelectedStyles2().Manufacturers, '_data');
        } else {
            $scope.SearchManufacturers = selectedProductType.getSelectedStyles2().Manufacturers;
        }
        $scope.searchInfo.searchSelectedManufacturer = $scope.SearchManufacturers[0];

        $scope.SearchExtraFilter = [];

        if ($scope.thisItem.ProductTypeItem.ProductTypeID === 1) {
            $scope.SearchExtraFilter = [];
            if ($scope.metaTree.styles2[$scope.thisItem.ProductTypeItem.ProductTypeID].length > 0 && $scope.metaTree.styles2[$scope.thisItem.ProductTypeItem.ProductTypeID][0]._data !== undefined) {
                $scope.SearchExtraFilter = _.pluck($scope.metaTree.styles2[$scope.thisItem.ProductTypeItem.ProductTypeID], '_data');
            } else {
                $scope.SearchExtraFilter = $scope.metaTree.styles2[$scope.thisItem.ProductTypeItem.ProductTypeID];
            }
            $scope.searchInfo.searchSelectedExtraFilter = $scope.SearchExtraFilter[0];
        } else {
            $scope.SearchExtraFilter = [];
            $scope.searchInfo.searchSelectedExtraFilter = null;
        }


    };

    $scope.SBSearch = function(text, manufacture, extra) {
        $scope.ChangeManufacturer(manufacture);
        if ($scope.thisItem.ProductTypeItem.ProductTypeID === 1) {
            $scope.StyleClick(null, extra);
        } else {
            $scope.StyleClick(null, $scope.metaTree.styles2[0]);
        }
    };

    $scope.initSearch();

    $scope.Manufacturers = item.Manufacturers;

    $scope.SetManufacturer = function() {
        var storedDistributorId = localStorage.getItem(distributorFilterStringName);
        if (storedDistributorId && $scope.Manufacturers.length > 0 && $scope.Manufacturers[0].ManufacturerID != storedDistributorId) {
            var manufacturerItems = $scope.Manufacturers.filter(function(i) {
                return i.ManufacturerID == storedDistributorId;
            });
            if (manufacturerItems.length > 0) {
                $scope.ChangeManufacturer(manufacturerItems[0]);
            }
        } else if ($scope.Manufacturers.length > 0) {
            $scope.selectedManufacturer = $scope.Manufacturers[0];
            $scope.selectedManufacturerPhoto = $scope.Manufacturers[0].PhotoFileName;
            $scope.thisItem.SelectedManufacturerId = $scope.selectedManufacturer.ManufacturerID;

            var selectedManufacturerSettings = $scope.thisItem.ManufacturerSettings.filter(function(i) {
                return i.ProductTypeID == productTypeId && i.UserID == localStorage.getItem("userID") && i.ManufacturerID == $scope.selectedManufacturer.ManufacturerID;
            });

            if (selectedManufacturerSettings.length > 0) {
                $scope.thisItem.SelectedManufacturerSettings = selectedManufacturerSettings[0];
            }

            selectedProductType.setSelectedStyles2($scope.thisItem);
        }
    };
    $scope.SetManufacturer();

    $scope.getClasses = function(orderDetail, flipImage) {
        return getImgClassNames(orderDetail, flipImage);
    };

    $scope.getFrameClassName = function(orderDetail) {
        return getClassNames(orderDetail);
    };

    $scope.filtered = {};
    $scope.tempSum = 0;
    $scope.sum = 0;
    $scope.total = function(l, last, branch) {
        //source: http://jsfiddle.net/Kb27R/4/
        //source: http://stackoverflow.com/questions/22199907/counting-the-total-of-nested-ng-repeats-and-updating-multiple-controllers-models
        //if (first) $scope.sum = 0;
        $scope.tempSum += l;
        if (last) {
            $scope.sum = $scope.tempSum;
            $scope.tempSum = 0;
        }
        return l;
    };

    var filterStringName = "filters_" + productTypeId;

    var jsonFilters = JSON.parse(localStorage.getItem(filterStringName));
    if (jsonFilters) {
        $scope.filters = jsonFilters;

        $scope.selectedItem = [];
        for (var propertyName in $scope.filters) {
            $scope.selectedItem[propertyName] = $scope.filters[propertyName];
        }
    } else {
        $scope.filters = {};
    }

    $scope.RemoveFilter = function(key) {
        delete $scope.filters[key]; // source: http://stackoverflow.com/questions/6485127/how-to-delete-unset-the-properties-of-a-javascript-object
        //$scope.filters[key] = '';
        $scope.selectedItem[key] = null; // source: http://jsfiddle.net/j7urk35y/1/
        $scope.SetFilters();
    };

    $scope.SetFilters = function() {
        localStorage.setItem(filterStringName, JSON.stringify($scope.filters));
    };

    $scope.showOrder = function(leaf) {
        if (!$scope.optimizeTarget) {
            optimizer.setMode(false);
        } else {
            optimizer.setMode(true);
            optimizer.setTrimType($scope.optimizeTarget);
        }
        selectedDoor.setDoor(leaf);
        $state.go($scope.styles2Item.Style2.toLowerCase());
    };

    $scope.productType = item.ProductTypeItem;
    $scope.styles2Item = item.Styles2Item;
    $scope.StylesList = item.StylesList;
    $scope.OrderDetails = item.OrderDetails;
    $scope.tree = item.ProductListJsonString;

    $scope.AddOrderOne = window.AddOrderOne;
    $scope.AddOrderTwo = window.AddOrderTwo;
    $scope.AddOrderThree = window.AddOrderThree;

    $scope.SetCurrentOrderType = function(currentOrderType) {
        $scope.FilterOrder.OrderType = parseInt(currentOrderType);
    };

    // =========================================================Start: Customer Panel=========================================================
    $scope.setCurrentCustomer = function() {
        $scope.Customers = $scope.thisItem.Customers;
        if ($scope.thisItem.SelectedCustomer === undefined || $scope.thisItem.SelectedCustomer === null) {
            var customerID = localStorage.getItem($scope.productType.ProductType + storedCustomerSuffix);
            if (customerID) {
                var currentCustomers = $scope.thisItem.Customers.filter(function(i) {
                    return i.CustomerID == customerID;
                });
                if (currentCustomers.length > 0) {
                    $scope.SelectedCustomer = currentCustomers[0];
                } else {
                    $scope.SelectedCustomer = $scope.thisItem.Customers.length > 0 ? $scope.thisItem.Customers[0] : null;
                }
            } else {

                $scope.SelectedCustomer = $scope.thisItem.Customers.length > 0 ? $scope.thisItem.Customers[0] : null;
            }
        } else {
            $scope.SelectedCustomer = $scope.thisItem.SelectedCustomer;
        }
    };

    $scope.setCurrentCustomer();
    $scope.doorQuote = {};
    $scope.newCustomer = {};

    $scope.CustomerFilter = {
        CustomerID: $scope.SelectedCustomer !== null ? $scope.SelectedCustomer.CustomerID : 0
    };

    $scope.FilterOrder = {
        OrderType: parseInt($scope.AddOrderOne)
    };

    $scope.setCurrentQuote = function() {
        if ($scope.thisItem.SelectedDoorQuote === undefined) {
            var quoteID = localStorage.getItem($scope.productType.ProductType + storedQuoteSuffix);
            if (quoteID) {
                $scope.FilterOrder.DoorQuoteID = quoteID;
                var currentQuotes = $scope.thisItem.CustomerDoorQuotes.filter(function(i) {
                    return i.DoorQuoteID == quoteID;
                });
                if (currentQuotes.length > 0) {
                    $scope.thisItem.SelectedDoorQuote = currentQuotes[0];
                    $scope.SelectedDoorQuote = $scope.thisItem.SelectedDoorQuote;
                    $scope.FilterOrder.DoorQuoteID = $scope.SelectedDoorQuote.DoorQuoteID;
                }

            } else {
                $scope.FilterOrder.DoorQuoteID = $scope.SelectedDoorQuote === null ? 0 : $scope.SelectedDoorQuote.DoorQuoteID;
            }
        } else {
            $scope.SelectedDoorQuote = $scope.thisItem.SelectedDoorQuote;
            $scope.FilterOrder.DoorQuoteID = $scope.SelectedDoorQuote.DoorQuoteID;
        }
    };

    $scope.setCurrentQuote();

    // Select customer from the customer list to see quotes related to that customer
    $scope.SelectCustomer = function(customer) {
        var selectedCustomer = item.Customers.filter(function(i) {
            return i.CustomerID == customer.CustomerID;
        });
        localStorage.setItem($scope.productType.ProductType + storedCustomerSuffix, selectedCustomer[0].CustomerID);
        $scope.SelectedCustomer = selectedCustomer[0];
        $scope.CustomerFilter.CustomerID = $scope.SelectedCustomer.CustomerID;
        $scope.thisItem.SelectedCustomer = $scope.SelectedCustomer;
        selectedProductType.setSelectedStyles2($scope.thisItem);
        $scope.SetDoorQuotes(); //set door quote of the selected customer.
    };

    //set selected door quote in Service so that it can be used on order page.
    $scope.SetSelectedDoorQuoteInItem = function(selectedDoorQuote) {
        $scope.SelectedDoorQuote = selectedDoorQuote;
        $scope.FilterOrder.DoorQuoteID = $scope.SelectedDoorQuote === null ? 0 : $scope.SelectedDoorQuote.DoorQuoteID;
        $scope.thisItem.SelectedDoorQuote = $scope.SelectedDoorQuote;
        selectedProductType.setSelectedStyles2($scope.thisItem);
    };

    // Select door quote from the door quote list to see orders related to that door quote
    $scope.SelectDoorQuote = function(doorQuote, $event) {
        var selectQuote = $event === undefined || $($event.target).closest(".position-fixed").length === 0;
        // length = 0 means it is NOT right-click. When user right clicks we are not selecting door quote.
        if (selectQuote) {
            var selectedDoorQuote = item.CustomerDoorQuotes.filter(function(i) {
                return i.DoorQuoteID == doorQuote.DoorQuoteID;
            });
            localStorage.setItem($scope.productType.ProductType + storedQuoteSuffix, selectedDoorQuote[0].DoorQuoteID);
            $scope.SetSelectedDoorQuoteInItem(selectedDoorQuote[0]);
            $scope.ToggleCustomerPanel();
            //$scope.SetDoorQuotes();//set orders of the selected door quote.    
        }
    };

    $scope.SetDoorQuotes = function() {
        var customerDoorQuotes = item.CustomerDoorQuotes.filter(function(doorQuote) {
            return doorQuote.CustomerID == $scope.SelectedCustomer.CustomerID;
        });
        $scope.SetSelectedDoorQuoteInItem(customerDoorQuotes.length > 0 ? customerDoorQuotes[0] : null);
    };

    $scope.CustomerDoorQuotes = item.CustomerDoorQuotes;
    if ($scope.thisItem.SelectedDoorQuote === undefined) {
        $scope.SetDoorQuotes(); // This will set door quote for the selected customer on page load.
    } else {
        $scope.SelectedDoorQuote = $scope.thisItem.SelectedDoorQuote; // If user comes from order page, set the previously set door quote.
    }

    $scope.thisItem.SelectedDoorQuote = $scope.SelectedDoorQuote;
    $scope.thisItem.SelectedCustomer = $scope.SelectedCustomer;
    selectedProductType.setSelectedStyles2($scope.thisItem);

    $scope.SetDoorQuote = function() {
        var selectedCustomerDoorQuotes = $.grep($scope.CustomerDoorQuotes, function(doorQuoteItem) {
            return doorQuoteItem.CustomerID == $scope.SelectedCustomer.CustomerID;
        });
        if (selectedCustomerDoorQuotes.length > 0) {
            localStorage.setItem($scope.productType.ProductType + storedQuoteSuffix, selectedCustomerDoorQuotes[0].DoorQuoteID);
            $scope.SelectedDoorQuote = selectedCustomerDoorQuotes[0];
            $scope.FilterOrder.DoorQuoteID = $scope.SelectedDoorQuote.DoorQuoteID;
        } else {
            $scope.SelectedDoorQuote = null;
            $scope.FilterOrder.DoorQuoteID = 0;
        }
    };

    // =========================================================End: Customer Panel=========================================================

    $scope.GetSelectedOrder = function(orderDetail) {
        $scope.thisItem.SelectedOrderToUpdate = orderDetail;
        selectedProductType.setSelectedStyles2($scope.thisItem);
        window.location.href = "/door#/" + orderDetail.productType;
    };

    $scope.clearFilters = function() {
        $scope.filters = {};
        $scope.selectedItem = [];
        localStorage.removeItem(filterStringName);
    };

    // Start ================================================== Settings ==========================================================

    $scope.suppliers = $scope.Manufacturers;
    //debugger;

    if ($scope.thisItem.ManufacturerSettings.length === 0) {
        $.each($scope.suppliers, function(index, value) {
            var thisSetting = {};
            thisSetting.OnFactor = 0.5;
            thisSetting.MarkUp = 100;
            thisSetting.ManufacturerID = value.ManufacturerID;
            $scope.thisItem.ManufacturerSettings.push(thisSetting);
        });
    }

    //$scope.settingModel = angular.copy($scope.thisItem.ManufacturerSettings);

    $scope.GetOrderDetails = function() {
        var postInfo = {};
        postInfo.style2Id = $scope.SelectedStyles2ID;
        postInfo.doorQuoteId = $scope.SelectedDoorQuote.DoorQuoteID;
        postInfo.userId = localStorage.getItem("userID");
        postInfo.productTypeId = $scope.thisItem.ProductTypeItem.ProductTypeID;
        var jsonData = JSON.stringify(postInfo);
        /*AjaxCall(GetOrderDetailsUrl, jsonData, "post", "json", "application/json").done(function(response) {
            $scope.OrderDetails = response;
            $scope.$apply();
        });*/
    };

    fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
        $scope.$apply(function() {
            $scope.CurrUser = user;
        });
    });

    // End ==================================================== Settings ==========================================================


    //=========================================================== OPTIMIZER =======================================================
    $scope.windowOrders = {};
    $scope.doorOrders = {};
    $scope.selectedDoorOrders = [];
    $scope.selectedWindowOrders = [];
    $scope.optimizerData = {

    };

    $scope.optimizeMode = false;
    $scope.currentOptimization = {};
    $scope.toggleOptimizer = function(toggle) {
        $scope.optimizeMode = toggle;
    };

    $scope.optimizeTarget = null;

    $scope.addDoorOrder = function() {
        if ($scope.selectedDoorOrders.indexOf($scope.optimizerData.currentDoorOrder) == -1) {
            $scope.selectedDoorOrders.push($scope.optimizerData.currentDoorOrder);
        }
    };

    $scope.addWindowOrder = function() {
        if ($scope.selectedWindowOrders.indexOf($scope.optimizerData.currentWindowOrder) == -1) {
            $scope.selectedWindowOrders.push($scope.optimizerData.currentWindowOrder);
        }
    };

    $scope.searchMolding = function(type) {
        $scope.optimizeTarget = type;
        $scope.toggleOptimizer(false);
        $scope.StyleClick(null, $scope.styles2Item);
    };

    $scope.customLength = {};

    $scope.addCUstomLength = function() {
        var jsonData = JSON.stringify({
            optimizationID: $scope.Optimization.OptimizationID,
            length: $scope.customLength
        });
        AjaxCall('/optimizer/saveCustomLength', jsonData, "post", "json", "application/json").done(function(response) {
            $scope.Optimization.CustomLengths = response;
            $scope.$apply();
        }).fail(function(data) {

        });
    };

    $scope.removeCustomLength = function(length) {
        var jsonData = JSON.stringify({
            optimizationID: $scope.Optimization.OptimizationID,
            lengthID: length.OptimizationCustomLengthID
        });
        AjaxCall('/optimizer/removeCustomLength', jsonData, "post", "json", "application/json").done(function(response) {
            $scope.Optimization.CustomLengths = response;
            $scope.$apply();
        }).fail(function(data) {

        });
    };

    $scope.getOptimizationByMasterQuote = function() {
        var masterId = $scope.thisItem.SelectedMasterQuote.MasterQuoteID;

        AjaxCall("/optimizer/GetOptimizationByMQ", {
            MasterQuoteID: masterId
        }, "post", "json").done(function(response) {
            $scope.Optimization = response;
            if ($scope.Optimization.CasingName) {
                $scope.getMouldingInfo($scope.Optimization.CasingName, "Casing");
            }
            if ($scope.Optimization.HeaderName) {
                $scope.getMouldingInfo($scope.Optimization.HeaderName, "Header");
            }
            if ($scope.Optimization.SillName) {
                $scope.getMouldingInfo($scope.Optimization.SillName, "Sill");
            }
            if ($scope.Optimization.ApronName) {
                $scope.getMouldingInfo($scope.Optimization.ApronName, "Apron");
            }
            if ($scope.Optimization.LinerName) {
                $scope.getMouldingInfo($scope.Optimization.LinerName, "Liners");
            }
            if ($scope.Optimization.OtherName) {
                $scope.getMouldingInfo($scope.Optimization.OtherName, "Other");
            }
            if ($scope.Optimization.SecondHeaderName) {
                $scope.getMouldingInfo($scope.Optimization.SecondHeaderName, "SecondHeader");
            }
            if ($scope.Optimization.SecondCasingName) {
                $scope.getMouldingInfo($scope.Optimization.SecondCasingName, "SecondCasing");
            }
            $scope.$apply();
        }).fail(function(data) {
            toastr.error("Sorry, there are some errors while logging you out. Please try again later.");
        });
    };

    $scope.getOptimizableOrders = function() {
        var masterId = $scope.thisItem.SelectedMasterQuote.MasterQuoteID;
        AjaxCall('/optimizer/GetAvailableOrders', {
            masterQuoteId: masterId
        }, "post", "json").done(function(response) {
            $scope.windowOrders = response.windows;
            $scope.doorOrders = response.doors;
            $scope.toggleOptimizer(true);
            $scope.getOptimizationByMasterQuote();
            $scope.$apply();
        }).fail(function(data) {});
    };

    $scope.getMouldingInfo = function(name, type) {
        AjaxCall("/moulding/GetMouldingInfoByName", {
            name: name
        }, "post", "json").done(function(response) {
            if (type == "Casing") {
                $scope.Casing = response;
            } else if (type == "Header") {
                $scope.Header = response;
            } else if (type == "Sill") {
                $scope.Sill = response;
            } else if (type == "Apron") {
                $scope.Apron = response;
            } else if (type == "Liners") {
                $scope.Liners = response;
            } else if (type == "Other") {
                $scope.Other = response;
                $scope.customLength.MouldingName = response.name;
                $scope.customLength.MouldingWidth = response.width;
            } else if (type == "SecondHeader") {
                $scope.SecondHeader = response;
            } else if (type == "SecondCasing") {
                $scope.SecondCasing = response;
            }
            $scope.$apply();
        }).fail(function(data) {
            toastr.error("Sorry, there are some errors while logging you out. Please try again later.");
        });
    };

    $scope.SetAsOptimizer = function(molding) {
        var type = $scope.optimizeTarget;
        $scope.optimizeTarget = null;
        var name = molding.name;
        // var type = localStorage.getItem("mouldingType");
        var qId = $scope.thisItem.SelectedMasterQuote.MasterQuoteID;
        var data = JSON.stringify({
            MasterQuoteId: qId,
            mType: type,
            mName: name
        });
        AjaxCall("/moulding/SetForOptimizer", data, "post", "json", "application/json").done(function(pricing) {
            //window.location.href = "/Optimizer";
            toastr.success("Molding has been set as " + type);
            $scope.getOptimizableOrders();
        }).fail(function(data) {
            toastr.error(ajaxFailError);
        });
        return null;
    };

    $scope.Optimize = function() {
        var url = "/moulding/optimizeNew?masterQuoteID=" + $scope.thisItem.SelectedMasterQuote.MasterQuoteID;
        $.each($scope.selectedWindowOrders, function(index, item) {
            url += "&windowOrders=" + item.type;
        });
        $.each($scope.selectedDoorOrders, function(index, item) {
            url += "&doorOrders=" + item.type + "&";
        });
        if (getPdf === true) {
            url += "&returnPdf=true";
            window.location.href = url;
        } else {
            if (addToOrder === true) {
                url += "&addToOrder=true";
            }
            AjaxCall(url, null, "get", "json").done(function(results) {
                $scope.OptimizedOrders = results;
                $scope.$apply(function() {
                    if (!addToOrder) {
                        $("#optimizerModal").modal("show");
                    } else {
                        toastr.success("Moldings have been added to the order.");
                    }
                });
            }).fail(function(data) {
                console.log(data);
                //debugger;
            });
        }

    };

    //Pagination Area
    $scope.start = 0;
    $scope.currentPages = {};
    $scope.pageSize = 20;

    $scope.numberOfPages = function(collectionIndex) {
        return Math.ceil($scope.tree[collectionIndex].leaves.length / $scope.pageSize);
    };

    $scope.getStartIndex = function(collectionIndex) {
        if (!$scope.currentPages[collectionIndex]) {
            $scope.currentPages[collectionIndex] = 0;
        }
        var index = $scope.currentPages[collectionIndex];
        return index;
    };

    $scope.pageUp = function(collectionIndex) {
        $scope.currentPages[collectionIndex] = $scope.currentPages[collectionIndex] + 1;

    };

    $scope.pageDown = function(collectionIndex) {
        $scope.currentPages[collectionIndex] = $scope.currentPages[collectionIndex] - 1;
    };

    var toOptimizer = localStorage.getItem('goToOptimizer');
    if (localStorage.getItem('goToOptimizer') == 'true') {
        $scope.getOptimizableOrders();
        localStorage.removeItem('goToOptimizer');
    }

    $scope.getAvailableStyles();
});
