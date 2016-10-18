mainApp.controller("MouldingOrderController", function($scope, $http, $location, selectedProductType, productMetaTree,
    fbProducts, fbUser, fbQuotes, $rootScope, $state, fbMetaData, scopes, fbManufacturers, selectedDoor, optimizer, fbIntDoors, fbMoulding, fbLoading) {

    scopes.store('MoldingController', $scope);

    var doorNotExists = "DNE";
    $scope.pageSize = pageSize;
    $scope.door = selectedDoor.getDoor();
    $scope.Quantity = 1;
    $scope.addMode = true;
    $scope.optimizeMode = false;

    if (optimizer && optimizer.getMode() === true) {
        $scope.optimizeMode = true;
    }

    $scope.getFrameClassName = function(orderDetail) {
        return getClassNames(orderDetail);
    };

    $scope.getClasses = function(orderDetail, flipImage) {
        return getImgClassNames(orderDetail, flipImage);
    };

    $scope.sortDimensions = function(value) {
        var vals = [];
        if (value.width) {
            vals = value.width.split("\'");
        } else {
            vals = value.split("\'");
        }
        var total = Number(vals[0] * 100) + Number(vals[1]);
        return total;
    };

    $scope.setLength = function(length, width) {
        $scope.selectedValues.length = length;
        $scope.selectedValues.width = width;
        $scope.getPrices();
    };

    $scope.$watch(function(scope) {
        return scope.Quantity;
    }, function(newValue, oldValue) {
        $scope.UpdatePrice();
        //$scope.$apply();
    });

    fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
        $scope.$apply(function() {
            $scope.CurrUser = user;
        });
    });

    // ============== BreadCrumb Logic =====================================
    $scope.goBack = function() {
        localStorage.setItem("showFilterPanel", true);
        window.history.back();
    };

    $scope.StyleClick = function(style) {
        var styleFilterStringName = "style_filters_" + $scope.thisItem.ProductTypeItem.ProductTypeID;
        if (style) {
            $scope.SelectedStyleID = style.StyleID;
            $scope.SelectedStyleName = style.Style;
            localStorage.setItem(styleFilterStringName, $scope.SelectedStyleID + "|" + $scope.SelectedStyleName);
        } else {
            localStorage.removeItem(styleFilterStringName);
        }
        localStorage.setItem("showFilterPanel", true);
        //window.location.href = "#/tree";
        $state.go('filter');
    };


    $scope.GetProductDetails = function(productType) {
        var doorQuoteId = $scope.SelectedDoorQuote.DoorQuoteID;
        fbLoading.showWhile(fbMetaData.GetProductListJSON($scope.SelectedDoorQuote, productType, null, localStorage.getItem("userID"))).then(function(response) {
            if (productType.ProductType == "Windows") {
                $state.go('window');
            }
            $scope.thisItem.ProductTypeItem = productType;
            $scope.thisItem.ProductTypes = response.ProductTypes;
            $scope.thisItem.Styles2Item = response.Styles2[0];
            $scope.thisItem.Styles2List = response.Styles2;
            $scope.thisItem.Manufacturers = response.Manufacturers;
            $scope.thisItem.ProductListJsonString = $.parseJSON(response.ProductListJson);
            $scope.thisItem.StylesList = response.Styles;
            $scope.thisItem.OrderDetails = response.OrderDetails;
            $scope.thisItem.JsonFilterString = $.parseJSON(response.JsonFilterString);
            $scope.thisItem.SelectedDoorQuote = $scope.SelectedDoorQuote;
            $scope.thisItem.ManufacturerSettings = response.ManufacturerSettings;
            selectedProductType.setSelectedStyles2($scope.thisItem);
            $state.go('filter');
        });
    };


    $scope.RedirectToFilterPage = function(productType) {
        if (productType.ProductTypeID == 6) {
            var masterQuoteId = $scope.SelectedMasterQuote.MasterQuoteID;
            /*AjaxCall(GetWindowIdUrl, {
                masterId: masterQuoteId
            }, "post", "json").done(function(response) {
                if (response.error) {
                    toastr.error(response.error);
                    return;
                } else {
                    localStorage.setItem('currentQuoteId', response);
                    window.location.href = "/window";
                }
            }).fail(function(data) {
                toastr.error(ajaxFailError);
            });*/
        } else {
            $scope.GetProductDetails(productType);
        }
    };



    $scope.getStyles2 = function(productType) {
        var masterQuoteId = $scope.thisItem.SelectedMasterQuote.MasterQuoteID;
        var productTypeId = productType.ProductTypeID;
        fbLoading.showWhile(fbQuotes.GetSubQuotes(productTypeId, $scope.thisItem.SelectedMasterQuote.id,
            $scope.thisItem.SelectedMasterQuote.MasterQuoteID)).then(function(response) {

            $scope.CustomerDoorQuotes = response;
            var doorQuote = response.filter(function(i) {
                return i.ProductTypeID == productType.ProductTypeID &&
                    (i.LMasterQuoteID == $scope.thisItem.SelectedMasterQuote.id && i.MasterQuoteID == $scope.thisItem.SelectedMasterQuote.MasterQuoteID);
            });
            if (doorQuote.length === 0) {
                fbLoading.showWhile(fbQuotes.GetQuote(productType.ProductTypeID,
                    productType.ProductType, $scope.thisItem.SelectedMasterQuote)).then(function(response) {

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


    $scope.changeOpenPanel = function(item) {
        if ($scope.selectedOptPanel == item) {
            $scope.selectedOptPanel = null;
        } else {
            $scope.selectedOptPanel = item;
        }
    };

    $scope.changeMasterQuote = function(mQuote) {
        var currentUserId = localStorage.getItem(userID + storedUserSuffix);
        localStorage.setItem(userID + storedMasterQuoteSuffix, mQuote.MasterQuoteID);
        localStorage.setItem(userID + storedLMasterQuoteSuffix, mQuote.id);
        $state.go('frontpage');
    };

    $scope.changeDistributor = function(dist) {
        var key = "distributor_" + $scope.thisItem.Styles2Item.Styles2ID;
        localStorage.setItem(key, dist.ManufacturerID);
        fbLoading.showWhile(fbMetaData.GetTreeAndFilter($scope.thisItem.Styles2Item.Styles2ID, dist.ManufacturerID)).then(function(jsonData) {
            $scope.thisItem.SelectedManufacturerId = dist.ManufacturerID;
            $scope.ProductListJsonString = $.parseJSON(jsonData.jtString);
            $scope.JsonFilterString = $.parseJSON(jsonData.jfString);
            $scope.thisItem.ProductListJsonString = $scope.ProductListJsonString;
            $scope.thisItem.JsonFilterString = $scope.JsonFilterString;
            selectedProductType.setSelectedStyles2($scope.thisItem);
            $state.go('filter');
        });
    };

    // ============== End BreadCrumb Logic =====================================



    $scope.buildOrderTrees = function(orderDetails) {
        var orderTree = {};
        orderTree.products = {};
        $.each(orderDetails, function(index, item) {

            if (!orderTree.products[item.OrderType]) {
                orderTree.products[item.OrderType] = {};
                orderTree.products[item.OrderType].total = 0;
                orderTree.products[item.OrderType].items = [];

            }
            orderTree.products[item.OrderType].items.push(item);
            orderTree.products.hasItems = true;
            orderTree.products[item.OrderType].total += Number(item.TotalPrice);
        });
        $scope.orderTree = orderTree;
    };



    $scope.UpdatePrice = function() {
        var priceEach = 0;
        if ($scope.door !== undefined && $scope.door.price !== undefined && $scope.door.price !== doorNotExists)
            priceEach = $scope.door.price;
        $scope.priceEach = priceEach.toFixed(2);
        $scope.totalPrice = getTotalPrice($scope.Quantity, priceEach, $scope.thisItem.SelectedManufacturerSettings);
    };



    $scope.SetAsOptimizer = function() {
        var name = $scope.door.name;
        var type = optimizer.getTrimType();
        var qId = $scope.SelectedDoorQuote.MasterQuoteID;
        var width = $scope.selectedValues.width;
        var data = JSON.stringify({
            MasterQuoteId: qId,
            mType: type,
            mName: name,
            mWidth: width
        });
        AjaxCall("/moulding/SetForOptimizer", data, "post", "json", "application/json").done(function(pricing) {
            //window.location.href = "/Optimizer";
            localStorage.setItem('goToOptimizer', true);
            optimizer.setMode(false);
            toastr.success("Molding has been set as " + type);
            window.history.back();
        }).fail(function(data) {
            localStorage.setItem('goToOptimizer', true);
            optimizer.setMode(false);
            toastr.success("Molding has been set as " + type);
            window.history.back();
        });
        return null;
    };

    $scope.defaultLength = '';

    if ($scope.door !== undefined && $scope.door.lengths !== null && $scope.door.lengths.length > 0) {
        $scope.defaultLength = $scope.door.lengths[0].length;
    }

    $scope.selectedValues = {
        length: $scope.defaultLength,
        width: $scope.door ? $scope.door.heights[0] : ""
    };


    $scope.getPrices = function() {
        var jsonData = JSON.stringify({
            moulding: $scope.door,
            parameters: $scope.selectedValues
        });
        fbLoading.showWhile(fbMoulding.PriceMoulding($scope.door, $scope.selectedValues)).then(function(pricing) {
            if (pricing.moulding) {
                $scope.door.price = pricing.moulding.Price;
                $scope.door.stockcode = pricing.moulding.StockCode;
                $scope.door.photoName = pricing.moulding.PhotoName;
                $scope.door.description = pricing.moulding.Discription;
                $scope.MouldingID = pricing.moulding.MouldingID;
            } else {
                $scope.door.price = doorNotExists;
                $scope.door.photoName = '';
                $scope.MouldingID = null;
            }
            $scope.UpdatePrice();
            $scope.$apply();
        });
    };

    var item = selectedProductType.getSelectedStyles2();
    $scope.thisItem = item;
    $scope.OrderDetails = item.OrderDetails;
    $scope.SelectedCustomer = item.SelectedCustomer;
    $scope.SelectedDoorQuote = item.SelectedDoorQuote;
    $scope.buildOrderTrees($scope.OrderDetails);
    $scope.AddOrderOne = window.AddOrderOne;
    $scope.AddOrderTwo = window.AddOrderTwo;
    $scope.AddOrderThree = window.AddOrderThree;
    var selectedMFs = item.Manufacturers.filter(function(mf) {
        if (mf.ManufacturerID == item.SelectedManufacturerId) {
            return true;
        }
    });
    if (selectedMFs.length > 0) {
        $scope.selectedManufacturer = selectedMFs[0];
    }
    $scope.FilterOrder = {
        OrderType: parseInt($scope.AddOrderOne),
        DoorQuoteID: ($scope.SelectedDoorQuote === null || $scope.SelectedDoorQuote === undefined) ? 0 : $scope.SelectedDoorQuote.DoorQuoteID
    };

    //debugger;
    //$scope.FilterOrderForMoulding = {
    //    OrderType: parseInt($scope.AddOrderOne),
    //    DoorQuoteID: $scope.SelectedDoorQuote == null ? 0 : $scope.SelectedDoorQuote.DoorQuoteID
    //};

    $scope.SetCurrentOrderType = function(currentOrderType) {
        $scope.FilterOrder.OrderType = parseInt(currentOrderType);
    };

    //$scope.SetCurrentOrderTypeForMoulding = function (currentOrderType) {
    //    debugger;
    //    $scope.FilterOrderForMoulding.OrderType = parseInt(currentOrderType);
    //};

    // =========================================================Start: Calculate moulding Panel=========================================================

    $scope.Customers = item.Customers;
    if ($scope.thisItem.SelectedCustomer === undefined) {
        $scope.SelectedCustomer = item.Customers.length > 0 ? item.Customers[0] : null;
    } else {
        $scope.SelectedCustomer = $scope.thisItem.SelectedCustomer;
    }

    $scope.CustomerFilter = {
        CustomerID: $scope.SelectedCustomer !== null ? $scope.SelectedCustomer.CustomerID : 0
    };

    //set selected door quote in Service so that it can be used on order page.
    $scope.SetSelectedDoorQuote = function(selectedDoorQuote) {
        $scope.SelectedDoorQuote = selectedDoorQuote;

        $scope.FilterOrder.DoorQuoteID = ($scope.SelectedDoorQuote === null || $scope.SelectedDoorQuote === undefined) ? 0 : $scope.SelectedDoorQuote.DoorQuoteID;
    };

    // Select door quote from the door quote list to see orders related to that door quote
    $scope.SelectDoorQuote = function(doorQuote) {
        var selectedDoorQuote = $scope.CustomerDoorQuotes.filter(function(i) {
            return i.DoorQuoteID == doorQuote.DoorQuoteID;
        });
        $scope.SetSelectedDoorQuote(selectedDoorQuote[0]);
    };

    $scope.SetPageLoadDoorQuotes = function() {
        var customerDoorQuotes = $scope.CustomerDoorQuotes.filter(function(doorQuote) {
            return doorQuote.CustomerID == $scope.SelectedCustomer.CustomerID;
        });
        $scope.SetSelectedDoorQuote(customerDoorQuotes.length > 0 ? customerDoorQuotes[0] : null);
    };

    $scope.GenerateMouldingPdf = function() {
        generateMouldingPdfService($scope, GenerateMouldingOrderPdfUrl);
    };

    function generateMouldingPdfService($scope, action) {
        var item = selectedProductType.getSelectedStyles2();
        $scope.thisItem = item;

        $("#masterQuoteId").val($scope.SelectedDoorQuote.MasterQuoteID);
        $("#orderTypeId").val($scope.FilterOrder.OrderType);
        $("#mouldingName").val($scope.door.name);
        $("#onfactor").val($scope.thisItem.SelectedManufacturerSettings.OnFactor);
        $("#markup").val($scope.thisItem.SelectedManufacturerSettings.MarkUp);

        $(".generatemouldingpdf").closest("form").attr("action", action);
        $(".generatemouldingpdf").click();
    }

    $scope.SelectedOrderDetails = null;

    $scope.SelectOrder = function(orderDetail) {
        $scope.SelectedOrderDetails = orderDetail;
        $scope.ShowMouldingModal(false);
    };

    $scope.ShowMouldingModal = function(show) {
        if (show === undefined)
            show = true;
        $("#mouldingModal").modal(show ? "show" : "hide");
    };

    // =========================================================End: Calculate moulding Panel=========================================================

    $scope.Order = {
        DoorQuoteID: ($scope.SelectedDoorQuote === null || $scope.SelectedDoorQuote === undefined) ? 0 : $scope.SelectedDoorQuote.DoorQuoteID,
        LDoorQuoteID: ($scope.SelectedDoorQuote === null || $scope.SelectedDoorQuote === undefined) ? 0 : $scope.SelectedDoorQuote.id,
        MouldingID: 0,
        PriceEach: 0,
        Quantity: 1,
        TotalPrice: 0,
        OrderType: $scope.CurrentOrderType,
        Length: $scope.selectedValues.length,
        Width: $scope.selectedValues.width
    };

    $scope.GeneratePdf = function() {
        //GeneratePdfService($scope, GenerateMouldingPdfUrl);
    };

    $scope.AddToOrder = function(selected) {
        if ($scope.IsValidOrder()) {
            $scope.Order.DoorQuoteID = $scope.Order.DoorQuoteID;
            $scope.Order.MouldingID = $scope.MouldingID;
            $scope.Order.PriceEach = $scope.priceEach;
            $scope.Order.Quantity = $scope.Quantity;
            $scope.Order.TotalPrice = $scope.totalPrice;
            $scope.Order.OrderType = selected;
            $scope.Order.Length = $scope.selectedValues.length;
            $scope.Order.Width = $scope.selectedValues.width;
            fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
                fbLoading.showWhile(fbMoulding.AddToOrder($scope.Order, $scope.thisItem.Styles2Item.Styles2ID,
                    $scope.thisItem.ProductTypeItem.ProductTypeID, user.UserID)).then(function(order) {

                    $scope.$apply(function() {
                        $scope.OrderDetails.push(order);
                        $scope.thisItem.OrderDetails = $scope.OrderDetails;
                        selectedProductType.setSelectedStyles2($scope.thisItem);
                        $scope.buildOrderTrees($scope.OrderDetails);
                    });

                    toastr.success("Order added successfully");

                    $.event.trigger({
                        type: "item_added_to_order",
                        message: "item added to order",
                        time: new Date()
                    });

                });
            });
        }
    };

    //$scope.RemoveOrder = function(orderDetail) {
    //    RemoveOrderService(orderDetail, $scope, selectedProductType);
    //};

    // Start ===================================================== Update Order ==================================================

    $scope.CurrentOrder = {};
    $scope.GetSelectedOrder = function(orderDetail) {
        $scope.GetOrderService(orderDetail);
    };

    $scope.GetOrderService = function(currentOrderDetail) {
        var userId = localStorage.getItem("userID");
        var styles2Id = currentOrderDetail.Styles2ID;
        var productTypeId = $scope.thisItem.ProductTypeItem.ProductTypeID;
        var orderId = currentOrderDetail.LOrderID;
        fbLoading.showWhile(fbQuotes.GetOrder(userId, styles2Id, productTypeId, orderId, currentOrderDetail.OrderID)).then(function(order) {
            if (order) {
                var thisCollection;
                fbLoading.showWhile(fbMetaData.GetProductJSON(styles2Id, productTypeId, order.Distributor)).then(function(data) {
                    if (data) {
                        var thisTree = $.parseJSON(data.tree);
                        thisCollection = thisTree.filter(function(i) {
                            return i.collection == order.Collection;
                        });
                        $scope.SetUpdateOrderValues(thisCollection, order);
                    }
                });
            }
        });
    };




    $scope.SetUpdateOrderValues = function(thisCollection, selectedOrder) {
        if (thisCollection.length > 0) {
            var leaf = thisCollection[0].leaves.filter(function(i) {
                return i.name == selectedOrder.Name;
            });
            if (leaf.length > 0) {
                var masterQuoteId = $scope.thisItem.SelectedMasterQuote.MasterQuoteID;
                var productTypeId = selectedOrder.ProductTypeID;
                $scope.$apply(function() {
                    var doorQuote = $scope.thisItem.CustomerDoorQuotes.filter(function(i) {
                        return i.ProductTypeID == productTypeId && i.MasterQuoteID == masterQuoteId;
                    });
                    $scope.SelectedDoorQuote = doorQuote[0];
                    $scope.CurrentOrder = selectedOrder;
                    $scope.addMode = false;
                    $scope.door = leaf[0];
                    $scope.selectedValues.length = selectedOrder.Length;
                    $scope.selectedValues.width = selectedOrder.Width;
                    $scope.selectedValues.width = selectedOrder.Width;
                    $scope.FilterOrder.OrderType = selectedOrder.OrderType;
                    $scope.Quantity = selectedOrder.Quantity;
                    $scope.getPrices();
                });
            }
        }
    };

    $scope.UpdateOrder = function($event) {
        if ($scope.IsValidOrder()) {
            $scope.Order.DoorQuoteID = $scope.CurrentOrder.DoorQuoteID;
            $scope.Order.OrderID = $scope.CurrentOrder.OrderID;
            $scope.Order.MouldingID = $scope.MouldingID;
            $scope.Order.PriceEach = $scope.priceEach;
            $scope.Order.Quantity = $scope.Quantity;
            $scope.Order.TotalPrice = $scope.totalPrice;
            $scope.Order.OrderType = $scope.CurrentOrder.OrderType;
            $scope.Order.Length = $scope.selectedValues.length;
            $scope.Order.Width = $scope.selectedValues.width;
            $scope.Order.LOrderID = $scope.CurrentOrder.LOrderID;
            var jsonData = {
                order: $scope.Order,
                style2Id: $scope.thisItem.Styles2Item.Styles2ID,
                productTypeId: $scope.thisItem.ProductTypeItem.ProductTypeID,
                userId: localStorage.getItem("userID")
            };
            fbLoading.showWhile(fbMoulding.UpdateOrder(jsonData.order, jsonData.style2Id, jsonData.productTypeId, jsonData.userId)).then(function(orders) {
                $state.go('frontpage');
            });
        }
    };

    $scope.reloadOrders = function() {
        fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
            fbQuotes.GetAllOrders(user.UserID, $scope.thisItem.SelectedMasterQuote.id, $scope.thisItem.SelectedMasterQuote.MasterQuoteID).then(function(orders) {
                $scope.OrderDetails = _.filter(orders, function(rItem) {
                    return rItem.ProductTypeID === 2;
                });
                $scope.buildOrderTrees($scope.OrderDetails);
                $scope.$apply();
            });
        });
        /*AjaxCall(getAllOrders, {
            userID: localStorage.getItem("userID"),
            masterQuoteID: $scope.thisItem.SelectedMasterQuote.MasterQuoteID
        }, "post", "json").done(function(response) {
            $scope.OrderDetails = _.filter(response, function(rItem) {
                return rItem.ProductTypeID === 2;
            });
            $scope.buildOrderTrees($scope.OrderDetails);
            $scope.$apply();
            $.material.init();
            $.event.trigger({
                type: "item_added_to_order",
                message: "item added to order",
                time: new Date()
            });
        });*/
    };

    // End ======================================================= Update Order ==================================================

    $scope.IsValidOrder = function() {
        var response = true;
        if (($scope.SelectedDoorQuote === null || $scope.SelectedDoorQuote === undefined)) {
            toastr.error("Sorry, there are not any door quotes selected. Please add those and then try to add order.");
            response = false;
        }
        if ($scope.MouldingID === null) {
            toastr.error("Please select door");
            response = false;
        }
        return response;
    };

    if ($scope.thisItem.SelectedOrderToUpdate !== undefined && $scope.thisItem.SelectedOrderToUpdate.OrderID !== undefined) {
        var orderDetail = $scope.thisItem.SelectedOrderToUpdate;
        $scope.thisItem.SelectedOrderToUpdate = {};
        selectedProductType.setSelectedStyles2($scope.thisItem);
        $scope.GetOrderService(orderDetail);
    } else {
        $scope.getPrices();
    }

});
