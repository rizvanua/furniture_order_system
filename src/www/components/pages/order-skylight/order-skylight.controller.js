mainApp.controller("SkylightOrderController", function($scope, $http, $location, selectedProductType, productMetaTree,
    fbProducts, fbUser, fbQuotes, $rootScope, $state, fbMetaData, scopes, fbManufacturers, selectedDoor, optimizer, fbIntDoors, fbMoulding, fbSkylight, fbLoading) {

    scopes.store('SkylightController', $scope);

    $scope.pageSize = pageSize;
    $scope.selectedBlind = {};
    var doorNotExists = "DNE";
    $scope.door = selectedDoor.getDoor();

    if (!$scope.door) {
        $scope.door = {};
    }

    $scope.Quantity = 1;
    $scope.addMode = true;
    var item = selectedProductType.getSelectedStyles2();
    $scope.thisItem = item;
    $scope.OrderDetails = item.OrderDetails;
    $scope.SelectedCustomer = item.SelectedCustomer;
    $scope.SelectedDoorQuote = item.SelectedDoorQuote;
    $scope.showFactoryBlinds = false;

    $scope.showBlinds = function() {
        $scope.showFactoryBlinds = !$scope.showFactoryBlinds;
    };

    $scope.clearBlinds = function() {
        $scope.selectedBlind.blind = undefined;
        $scope.UpdatePrice();
    };

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
            /*AjaxCall(GetWindowIdUrl, { masterId: masterQuoteId }, "post", "json").done(function (response) {
                if (response.error) {
                    toastr.error(response.error);
                    return;
                } else {
                    localStorage.setItem('currentQuoteId', response);
                    window.location.href = "/window";
                }
            }).fail(function (data) {
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

    $scope.dimensionString = function() {
        if ($scope.selectedValues.invertDims) {
            return $scope.selectedValues.height + " x " + $scope.selectedValues.width;
        } else {
            return $scope.selectedValues.width + " x " + $scope.selectedValues.height;
        }
    };

    $scope.getSinglePrice = function(price) {
        return getTotalPrice(1, price, $scope.thisItem.SelectedManufacturerSettings);
    };

    $scope.sortDimensions = function(value) {
        if (value.height) {
            return value.height;
        }
        return value;
    };

    $scope.setWidth = function(width) {
        $scope.SetValuesForSelectedWidth(width);
        $scope.getPrices();
    };

    $scope.setHeight = function(height, type) {
        $scope.selectedValues.height = height.height;
        $scope.getPrices();
    };

    $scope.$watch(function(scope) {
        return scope.Quantity;
    }, function(newValue, oldValue) {
        $scope.UpdatePrice();
    });

    $scope.UpdatePrice = function() {
        var priceEach = 0;
        if ($scope.door !== undefined && $scope.door.price !== undefined && $scope.door.price !== doorNotExists)
            priceEach = $scope.door.price;
        if ($scope.selectedBlind.blind !== undefined && $scope.selectedBlind.blind !== null) {
            priceEach += $scope.selectedBlind.blind.Price;
        }
        $scope.priceEach = priceEach.toFixed(2);
        $scope.totalPrice = getTotalPrice($scope.Quantity, priceEach, $scope.thisItem.SelectedManufacturerSettings);
    };

    $scope.changeGlassType = function() {
        $scope.setValuesForSelectedGlass();
        $scope.getPrices();
    };

    $scope.setValuesForSelectedGlass = function() {
        var filteredGlassArray = $scope.door.glassLeafs.filter(function(item) {
            if (!$scope.selectedValues) {
                return false;
            }
            return item.glassType == $scope.selectedValues.glassType;
        });
        $scope.defaultGlassItem = filteredGlassArray.length > 0 ? filteredGlassArray[0] : $scope.door.glassLeafs[0];
        $scope.selectedValues.glassType = $scope.defaultGlassItem.glassType;
        var arrayIndex = -1;
        arrayIndex = $scope.defaultGlassItem.widths.indexOf($scope.selectedValues.width);
        if (arrayIndex > -1) {
            $scope.selectedValues.width = $scope.defaultGlassItem.widths[arrayIndex];
        } else {
            $scope.selectedValues.width = $scope.defaultGlassItem.widths.length > 0 ? $scope.defaultGlassItem.widths[0] : '';
        }

        if ($scope.defaultGlassItem.heights.length > 0) {
            var filteredHeightArray = $scope.defaultGlassItem.heights.filter(function(heightItem) {
                var currentHeight = defaultValue;
                if ($scope.selectedValues.height !== "" && $scope.selectedValues.height !== undefined) {
                    currentHeight = $scope.selectedValues.height;
                }
                return (heightItem.height == currentHeight && heightItem.width == $scope.selectedValues.width);
            });
            $scope.selectedValues.height = filteredHeightArray.length > 0 ? filteredHeightArray[0].height : $scope.defaultGlassItem.heights[0].height;
        }

        arrayIndex = $scope.defaultGlassItem.glassColors.indexOf($scope.selectedValues.glassColor);
        if (arrayIndex > -1) {
            $scope.selectedValues.glassColor = $scope.defaultGlassItem.glassColors[arrayIndex];
        } else {
            $scope.selectedValues.glassColor = $scope.defaultGlassItem.glassColors.length > 0 ? $scope.defaultGlassItem.glassColors[0] : '';
        }
        arrayIndex = $scope.defaultGlassItem.energyPackages.indexOf($scope.selectedValues.energyPackage);
        if (arrayIndex > -1) {
            $scope.selectedValues.energyPackage = $scope.defaultGlassItem.energyPackages[arrayIndex];
        } else {
            $scope.selectedValues.energyPackage = $scope.defaultGlassItem.energyPackages.length > 0 ? $scope.defaultGlassItem.energyPackages[0] : '';
        }
        arrayIndex = $scope.defaultGlassItem.dimensions.indexOf($scope.selectedValues.dimension);
        if (arrayIndex > -1) {
            $scope.selectedValues.dimension = $scope.defaultGlassItem.dimensions[arrayIndex];
        } else {
            $scope.selectedValues.dimension = $scope.defaultGlassItem.dimensions.length > 0 ? $scope.defaultGlassItem.dimensions[0] : '';
        }
        arrayIndex = $scope.defaultGlassItem.operations.indexOf($scope.selectedValues.operation);
        if (arrayIndex > -1) {
            $scope.selectedValues.operation = $scope.defaultGlassItem.operations[arrayIndex];
        } else {
            $scope.selectedValues.operation = $scope.defaultGlassItem.operations.length > 0 ? $scope.defaultGlassItem.operations[0] : '';
        }
        arrayIndex = $scope.defaultGlassItem.operatorTypes.indexOf($scope.selectedValues.operatorType);
        if (arrayIndex > -1) {
            $scope.selectedValues.operatorType = $scope.defaultGlassItem.operatorTypes[arrayIndex];
        } else {
            $scope.selectedValues.operatorType = $scope.defaultGlassItem.operatorTypes.length > 0 ? $scope.defaultGlassItem.operatorTypes[0] : '';
        }
        arrayIndex = $scope.defaultGlassItem.finishes.indexOf($scope.selectedValues.finish);
        if (arrayIndex > -1) {
            $scope.selectedValues.finish = $scope.defaultGlassItem.finishes[arrayIndex];
        } else {
            $scope.selectedValues.finish = $scope.defaultGlassItem.finishes.length > 0 ? $scope.defaultGlassItem.finishes[0] : '';
        }
        arrayIndex = $scope.defaultGlassItem.qtyPriceDiscounts.indexOf($scope.selectedValues.qtyPriceDiscount);
        if (arrayIndex > -1) {
            $scope.selectedValues.qtyPriceDiscount = $scope.defaultGlassItem.qtyPriceDiscounts[arrayIndex];
        } else {
            $scope.selectedValues.qtyPriceDiscount = $scope.defaultGlassItem.qtyPriceDiscounts.length > 0 ? $scope.defaultGlassItem.qtyPriceDiscounts[0] : '';
        }
        arrayIndex = $scope.defaultGlassItem.colors.indexOf($scope.selectedValues.color);
        if (arrayIndex > -1) {
            $scope.selectedValues.color = $scope.defaultGlassItem.colors[arrayIndex];
        } else {
            $scope.selectedValues.color = $scope.defaultGlassItem.colors.length > 0 ? $scope.defaultGlassItem.colors[0] : '';
        }
        arrayIndex = $scope.defaultGlassItem.thicknesses.indexOf($scope.selectedValues.thickness);
        if (arrayIndex > -1) {
            $scope.selectedValues.thickness = $scope.defaultGlassItem.thicknesses[arrayIndex];
        } else {
            $scope.selectedValues.thickness = $scope.defaultGlassItem.thicknesses.length > 0 ? $scope.defaultGlassItem.thicknesses[0] : '';
        }
    };


    var defaultValue = '25.5"';
    $scope.SetValuesForSelectedWidth = function(width) {

        if (!$scope.defaultGlassItem.heights || $scope.defaultGlassItem.heights.length === 0) {
            $scope.selectedValues.height = null;
            return;
        }

        var filteredByWidth = $scope.defaultGlassItem.heights.filter(function(heightItem) {
            return heightItem.width == $scope.selectedValues.width;
        });

        var filteredHeightArray = filteredByWidth.filter(function(heightItem) {
            return heightItem.height == $scope.selectedValues.height;
        });
        $scope.selectedValues.height = filteredHeightArray.length > 0 ? filteredHeightArray[0].height : filteredByWidth[0].height;
    };

    $scope.selectedValues = {
        style: $scope.door.style,
        width: '',
        height: '',
        glassType: '',
        glassColor: '',
        energyPackage: '',
        dimension: '',
        operation: '',
        operatorType: '',
        finish: '',
        qtyPriceDiscount: '',
        color: '',
        thickness: '',
        invertDims: false
    };

    //  if ($scope.door != undefined && $scope.door.widths.length > 0) {
    //      $scope.SetValuesForSelectedWidth(defaultValue);
    //  }

    if ($scope.door.glassLeafs) {
        $scope.setValuesForSelectedGlass();
    }

    $scope.getPrices = function() {
        fbLoading.showWhile(fbSkylight.PriceSkylight($scope.door, $scope.selectedValues)).then(function(pricing) {
            console.log(pricing);
            if (pricing.skylight) {
                $scope.door.price = pricing.skylight.Price;
                $scope.door.size = pricing.skylight.Size;
                $scope.door.dimension = pricing.skylight.Dimension;
                $scope.door.FactoryBlinds = pricing.skylight.FactoryBlinds;
                $scope.door.photoName = pricing.skylight.PhotoName;
                $scope.SkylightID = pricing.skylight.SkylightID;
                $scope.selectedValues.energyPackage = pricing.skylight.EnergyPackage;
                $scope.selectedValues.operation = pricing.skylight.Operation;
            } else {
                $scope.door.price = doorNotExists;
                $scope.door.photoName = '';
                $scope.SkylightID = null;
            }
            $scope.UpdatePrice();
            $scope.$apply();
        });
    };


    $scope.buildOrderTrees($scope.OrderDetails);
    $scope.AddOrderOne = "1";
    $scope.AddOrderTwo = "2";
    $scope.AddOrderThree = "3";
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
        PriceEach: 0,
        Quantity: 1,
        TotalPrice: 0,
        OrderType: $scope.CurrentOrderType,
        invertDimensions: false
    };

    $scope.GeneratePdf = function() {
        //GeneratePdfService($scope, GenerateSkylightPdfUrl);
    };

    $scope.AddToOrder = function(selected) {
        if ($scope.IsValidOrder()) {
            $scope.Order.DoorQuoteID = $scope.Order.DoorQuoteID;
            $scope.Order.SkylightID = $scope.SkylightID;
            $scope.Order.PriceEach = $scope.priceEach;
            $scope.Order.Quantity = $scope.Quantity;
            $scope.Order.TotalPrice = $scope.totalPrice;
            $scope.Order.OrderType = selected;
            $scope.Order.invertDimensions = $scope.selectedValues.invertDims;
            if ($scope.selectedBlind.blind) {
                $scope.Order.SkylightBlindID = $scope.selectedBlind.blind.SkylightBlindID;
            } else {
                $scope.Order.SkylightBlindID = null;
            }
            fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
                fbLoading.showWhile(fbSkylight.AddToOrder($scope.Order, $scope.thisItem.Styles2Item.Styles2ID,
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
        //RemoveOrderService(orderDetail, $scope, selectedProductType);
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
                    $scope.selectedValues.width = selectedOrder.Width;
                    $scope.selectedValues.height = selectedOrder.Height;
                    $scope.selectedValues.glassType = selectedOrder.GlassType;
                    $scope.selectedValues.glassColor = selectedOrder.GlassColor;
                    $scope.selectedValues.energyPackage = selectedOrder.EnergyPackage;
                    $scope.selectedValues.dimension = selectedOrder.Dimension;
                    $scope.selectedValues.operation = selectedOrder.Operation;
                    $scope.selectedValues.operatorType = selectedOrder.OperatorType;
                    $scope.selectedValues.finish = selectedOrder.Finish;
                    $scope.selectedValues.qtyPriceDiscount = selectedOrder.QtyPriceDiscount;
                    $scope.selectedValues.color = selectedOrder.Color;
                    $scope.selectedValues.thickness = selectedOrder.Thickness;
                    $scope.FilterOrder.OrderType = selectedOrder.OrderType;
                    $scope.Quantity = selectedOrder.Quantity;
                    $scope.door.price = selectedOrder.DoorPrice;
                    $scope.selectedBlind.blind = selectedOrder.Blinds;
                    $scope.selectedValues.invertDims = selectedOrder.invertDimensions;
                    $scope.setValuesForSelectedGlass();
                    $scope.getPrices();
                });
            }
        }
    };

    $scope.UpdateOrder = function($event) {
        if ($scope.IsValidOrder()) {
            $scope.Order.DoorQuoteID = $scope.CurrentOrder.DoorQuoteID;
            $scope.Order.OrderID = $scope.CurrentOrder.OrderID;
            $scope.Order.SkylightID = $scope.SkylightID;
            $scope.Order.PriceEach = $scope.priceEach;
            $scope.Order.Quantity = $scope.Quantity;
            $scope.Order.TotalPrice = $scope.totalPrice;
            $scope.Order.OrderType = $scope.CurrentOrder.OrderType;
            $scope.Order.LOrderID = $scope.CurrentOrder.LOrderID;
            if ($scope.selectedBlind.blind) {
                $scope.Order.SkylightBlindID = $scope.selectedBlind.blind.SkylightBlindID;
            } else {
                $scope.Order.SkylightBlindID = null;
            }
            var jsonData = {
                order: $scope.Order,
                style2Id: $scope.thisItem.Styles2Item.Styles2ID,
                productTypeId: $scope.thisItem.ProductTypeItem.ProductTypeID,
                userId: localStorage.getItem("userID")
            };
            fbLoading.showWhile(fbSkylight.UpdateOrder(jsonData.order, jsonData.style2Id, jsonData.productTypeId, jsonData.userId)).then(function(orders) {
                $state.go('frontpage');
            });
        }
    };

    $scope.reloadOrders = function() {
        fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
            fbQuotes.GetAllOrders(user.UserID, $scope.thisItem.SelectedMasterQuote.id, $scope.thisItem.SelectedMasterQuote.MasterQuoteID).then(function(orders) {
                $scope.OrderDetails = _.filter(orders, function(rItem) {
                    return rItem.ProductTypeID === 7;
                });
                $scope.buildOrderTrees($scope.OrderDetails);
                $scope.$apply();
            });
        });
        /*AjaxCall(getAllOrders, { userID: localStorage.getItem("userID"), masterQuoteID: $scope.thisItem.SelectedMasterQuote.MasterQuoteID }, "post", "json").done(function (response) {
            $scope.OrderDetails = _.filter(response, function (rItem) {
                return rItem.ProductTypeID === 7;
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
        if ($scope.SkylightID === null) {
            toastr.error("Please select skylight");
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
