mainApp.controller("SidingOrderController", function($scope, $http, $location, selectedProductType, productMetaTree,
    fbProducts, fbUser, fbQuotes, $rootScope, $state, fbMetaData, scopes, fbManufacturers, selectedDoor, optimizer, fbIntDoors, fbMoulding, fbSiding, fbLoading) {

    scopes.store('SidingController', $scope);

    var doorNotExists = "DNE";
    $scope.pageSize = pageSize;
    $scope.door = selectedDoor.getDoor();
    $scope.Quantity = 1;
    $scope.Square = '';
    $scope.addMode = true;
    $scope.AddOrderOne = "1";
    $scope.AddOrderTwo = "2";
    $scope.AddOrderThree = "3";


    var item = selectedProductType.getSelectedStyles2();
    $scope.thisItem = item;
    $scope.OrderDetails = item.OrderDetails;
    $scope.SelectedCustomer = item.SelectedCustomer;
    $scope.SelectedDoorQuote = item.SelectedDoorQuote;

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


    $scope.changeOpenPanel = function(item) {
        if ($scope.selectedOptPanel == item) {
            $scope.selectedOptPanel = null;
        } else {
            $scope.selectedOptPanel = item;
        }
    };

    $scope.getClasses = function(orderDetail, flipImage) {
        return getImgClassNames(orderDetail, flipImage);
    };

    $scope.getFrameClassName = function(orderDetail) {
        return getClassNames(orderDetail);
    };

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
    $scope.buildOrderTrees($scope.OrderDetails);



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

    $scope.setLength = function(length) {
        $scope.selectedValues.length = length;
        $scope.getPrices();
    };

    $scope.changeWidth = function(width) {
        $scope.SetValuesForSelectedWidth(width);
        $scope.getPrices();
    };

    $scope.$watch(function(scope) {
        return scope.Quantity;
    }, function(newValue, oldValue) {
        $scope.UpdatePrice();
    });

    $scope.$watch(function(scope) {
        return scope.Square;
    }, function(newValue, oldValue) {
        $scope.UpdateQuantity(newValue);
    });

    $scope.UpdatePrice = function() {
        var priceEach = 0;
        if ($scope.door !== undefined && $scope.door.price !== undefined && $scope.door.price !== doorNotExists)
            priceEach = $scope.door.price;
        $scope.priceEach = priceEach.toFixed(2);
        $scope.totalPrice = getTotalPrice($scope.Quantity, priceEach, $scope.thisItem.SelectedManufacturerSettings);
    };

    $scope.UpdateQuantity = function(newValue) {
        var neededQuantity = 1;
        if (newValue !== undefined && newValue !== '') {
            var selectedWidth = $scope.door.exposure ? Number($scope.door.exposure.replace('"','')) :   $scope.selectedValues.width.replace("'", "").replace('"', '');
            newValue = newValue * 1.05;
            var selectedLength = $scope.selectedValues.length.replace("'", "").replace('"', '');
            var squareFootOfOneBoard = selectedLength * (selectedWidth / 12);
            neededQuantity = Math.ceil(newValue  / squareFootOfOneBoard);
        }
        $scope.Quantity = neededQuantity;
    };

    $scope.SetValuesForSelectedWidth = function(width) {
        if ($scope.door.widths.length > 0) {
            var filteredWidthArray = $scope.door.widths.filter(function(widthItem) {
                return widthItem.width == width;
            });
            $scope.defaultWidthItem = filteredWidthArray.length > 0 ? filteredWidthArray[0] : $scope.door.widths[0];
            $scope.selectedValues.width = $scope.defaultWidthItem.width;
            $scope.selectedValues.color = $scope.defaultWidthItem.colors.length > 0 ? $scope.defaultWidthItem.colors[0] : '';
        }
    };

    $scope.selectedValues = {
        length: '',
        width: '',
        color: ''
    };

    if ($scope.door !== undefined) {
        $scope.selectedValues.length = $scope.door.lengths !== null && $scope.door.lengths.length > 0 ? $scope.door.lengths[0] : '';
        $scope.SetValuesForSelectedWidth();
    }

    $scope.getPrices = function() {
        fbLoading.showWhile(fbSiding.PriceSiding($scope.door, $scope.selectedValues)).then(function(pricing) {
            if (pricing.siding) {
                $scope.door.price = pricing.siding.Price;
                $scope.door.photoName = pricing.siding.PhotoName;
                $scope.door.exposure = pricing.siding.Exposure;
                $scope.door.description1 = pricing.siding.Description1;
                $scope.door.description2 = pricing.siding.Description2;
                $scope.door.rgb = pricing.siding.RGB;
                $scope.SidingID = pricing.siding.SidingID;
            } else {
                $scope.door.price = doorNotExists;
                $scope.door.photoName = '';
                $scope.door.description1 = '';
                $scope.door.description2 = '';
                $scope.SidingID = null;
            }
            $scope.UpdatePrice();
            if ($scope.Square !== "" && $scope.Square !== undefined) {
                $scope.UpdateQuantity($scope.Square);
            }
            $scope.$apply();
        });
    };

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

    $scope.SetCurrentOrderType = function(currentOrderType) {
        $scope.FilterOrder.OrderType = parseInt(currentOrderType);
    };

    $scope.Order = {
        DoorQuoteID: ($scope.SelectedDoorQuote === null || $scope.SelectedDoorQuote === undefined) ? 0 : $scope.SelectedDoorQuote.DoorQuoteID,
        LDoorQuoteID: ($scope.SelectedDoorQuote === null || $scope.SelectedDoorQuote === undefined) ? 0 : $scope.SelectedDoorQuote.id,
        SidingID: 0,
        PriceEach: 0,
        Quantity: 1,
        TotalPrice: 0,
        OrderType: $scope.CurrentOrderType
    };

    $scope.GeneratePdf = function() {
        //GeneratePdfService($scope, GenerateSidingPdfUrl);
    };

    $scope.AddToOrder = function(selected) {
        if ($scope.IsValidOrder()) {
            $scope.Order.DoorQuoteID = $scope.Order.DoorQuoteID;
            $scope.Order.SidingID = $scope.SidingID;
            $scope.Order.PriceEach = $scope.priceEach;
            $scope.Order.Quantity = $scope.Quantity;
            $scope.Order.TotalPrice = $scope.totalPrice;
            $scope.Order.OrderType = selected;
            $scope.Order.Length = $scope.selectedValues.length;

            fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
                fbLoading.showWhile(fbSiding.AddToOrder($scope.Order, $scope.thisItem.Styles2Item.Styles2ID,
                    $scope.thisItem.ProductTypeItem.ProductTypeID, user.UserID)).then(function(response) {

                    $scope.$apply(function() {
                        $scope.OrderDetails.push(response);
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

    $scope.RemoveOrder = function(orderDetail) {
        RemoveOrderService(orderDetail, $scope, selectedProductType);
    };

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
                        var thisTree;
                        if (data.tree !== undefined) {
                            thisTree = $.parseJSON(data.tree);
                        } else {
                            thisTree = $.parseJSON(data.ProductListJson);
                        }
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
                    $scope.SetValuesForSelectedWidth($scope.selectedValues.width);
                    $scope.selectedValues.color = selectedOrder.Color;
                    $scope.door.description1 = selectedOrder.Description1;
                    $scope.door.description2 = selectedOrder.Description2;
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
            $scope.Order.SidingID = $scope.SidingID;
            $scope.Order.PriceEach = $scope.priceEach;
            $scope.Order.Quantity = $scope.Quantity;
            $scope.Order.TotalPrice = $scope.totalPrice;
            $scope.Order.OrderType = $scope.CurrentOrder.OrderType;
            $scope.Order.Length = $scope.selectedValues.length;
            $scope.Order.LOrderID = $scope.CurrentOrder.LOrderID;
            var jsonData = {
                order: $scope.Order,
                style2Id: $scope.thisItem.Styles2Item.Styles2ID,
                productTypeId: $scope.thisItem.ProductTypeItem.ProductTypeID,
                userId: localStorage.getItem("userID")
            };
            fbLoading.showWhile(fbSiding.UpdateOrder(jsonData.order, jsonData.style2Id, jsonData.productTypeId, jsonData.userId)).then(function(orders) {
                $state.go('frontpage');
            });
        }
    };

    $scope.reloadOrders = function() {
        fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
            fbQuotes.GetAllOrders(user.UserID, $scope.thisItem.SelectedMasterQuote.id, $scope.thisItem.SelectedMasterQuote.MasterQuoteID).then(function(orders) {
                $scope.OrderDetails = _.filter(orders, function(rItem) {
                    return rItem.ProductTypeID === 3;
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
                return rItem.ProductTypeID === 3;
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
        if ($scope.SidingID === null) {
            toastr.error("Please select door");
            response = false;
        }
        return response;
    };

    if ($scope.thisItem.SelectedOrderToUpdate !== undefined && $scope.thisItem.SelectedOrderToUpdate.OrderID !== undefined) {
        var orderDetailToUpdate = $scope.thisItem.SelectedOrderToUpdate;
        $scope.thisItem.SelectedOrderToUpdate = {};
        selectedProductType.setSelectedStyles2($scope.thisItem);
        $scope.GetOrderService(orderDetailToUpdate);
    } else {
        $scope.getPrices();
    }

});
