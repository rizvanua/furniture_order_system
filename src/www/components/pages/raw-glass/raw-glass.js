mainApp.controller("RawGlassController", function($scope, $http, $location, selectedProductType, productMetaTree,
    fbProducts, fbUser, fbQuotes, $rootScope, $state, fbMetaData, scopes, fbManufacturers, selectedDoor, fbRawGlass, fbLoading) {

    scopes.store('RawGlassController', $scope);

    var doorNotExists = "DNE";

    $scope.pageSize = pageSize;
    $scope.door = selectedDoor.getDoor();
    $scope.Quantity = 1;
    $scope.addMode = true;
    $scope.productImagesPath = "http://fbpublicstorage.blob.core.windows.net/uploadfiles/products/";
    $scope.ProductTypeImagePath = "http://fbpublicstorage.blob.core.windows.net/uploadfiles/producttypes/";
    $scope.ManufacturerImagePath = "http://fbpublicstorage.blob.core.windows.net/uploadfiles/Manufacturers/";

    $scope.temperedValues = [{
        Name: 'Annealed',
        Value: false
    }, {
        Name: 'Tempered',
        Value: true
    }];

    $scope.selectedAddOns = {
        PatternCharges: [],
        GlassAdds: []
    };
    $scope.pricingValues = {};

    $scope.calculateDims = function() {
        if (!isNaN($scope.glassWidth) && !isNaN($scope.glassHeight)) {
            $scope.selectedValues.Width = $scope.glassWidth;
            $scope.selectedValues.Height = $scope.glassHeight;
            var roundedWidth = Math.ceil(Number($scope.selectedValues.Width));
            var roundedHeight = Math.ceil(Number($scope.selectedValues.Height));
            roundedHeight += roundedHeight % 2;
            roundedWidth += roundedWidth % 2;
            $scope.pricingValues.width = roundedWidth;
            $scope.pricingValues.height = roundedHeight;
            $scope.pricingValues.SqFt = (roundedHeight * roundedWidth) / 144;

            $scope.selectedValues.TotalSqFt = (Number($scope.selectedValues.Width) * Number($scope.selectedValues.Height)) / 144;
            if ($scope.checkDims()) {
                $scope.UpdatePrice();
            }
        }
    };

    $scope.checkDims = function() {
        var shortLength, longLength;
        var width = Number($scope.selectedValues.Width);
        var height = Number($scope.selectedValues.Height);
        var sqft = Number($scope.selectedValues.TotalSqFt);
        var correct = true;
        if (width > height) {
            longLength = width;
            shortLength = height;
        } else {
            longLength = height;
            shortLength = width;
        }
        if (longLength > Number($scope.door.maxLength)) {
            toastr.error("Max side length for this glass is " + $scope.door.maxLength + " inches.");
            correct = false;
        }
        if (shortLength > Number($scope.door.maxShortLength)) {
            toastr.error("Max short side length for this glass is " + $scope.door.maxShortLength + " inches.");
            correct = false;
        }
        if (sqft > Number($scope.door.maxSF)) {
            toastr.error("Max square footage for this glass is " + $scope.door.maxSF + " square feet.");
            correct = false;
        }
        return correct;
    };


    $scope.$watch(function(scope) {
        return scope.Quantity;
    }, function(newValue, oldValue) {
        $scope.UpdatePrice();
        //$scope.$apply();
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
        window.location.href = "#/tree";
    };


    $scope.GetProductDetails = function(productType) {
        var doorQuoteId = $scope.SelectedDoorQuote.DoorQuoteID;
        fbMetaData.GetProductListJSON($scope.SelectedDoorQuote, productType, null, localStorage.getItem("userID")).then(function(response) {
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
            AjaxCall(GetWindowIdUrl, { masterId: masterQuoteId }, "post", "json").done(function(response) {
                if (response.error) {
                    toastr.error(response.error);
                    return;
                } else {
                    localStorage.setItem('currentQuoteId', response);
                    window.location.href = "/window";
                }
            }).fail(function(data) {
                toastr.error(ajaxFailError);
            });
        } else {
            $scope.GetProductDetails(productType);
        }
    };


    $scope.getStyles2 = function(productType) {
        var masterQuoteId = $scope.thisItem.SelectedMasterQuote.MasterQuoteID;
        var productTypeId = productType.ProductTypeID;
        fbQuotes.GetSubQuotes(productTypeId, $scope.thisItem.SelectedMasterQuote.id, $scope.thisItem.SelectedMasterQuote.MasterQuoteID).then(function(response) {
            $scope.CustomerDoorQuotes = response;
            var doorQuote = response.filter(function(i) {
                return i.ProductTypeID == productType.ProductTypeID &&
                    (i.LMasterQuoteID == $scope.thisItem.SelectedMasterQuote.id && i.MasterQuoteID == $scope.thisItem.SelectedMasterQuote.MasterQuoteID);
            });
            if (doorQuote.length === 0) {
                fbQuotes.GetQuote(productType.ProductTypeID, productType.ProductType, $scope.thisItem.SelectedMasterQuote).then(function(response) {
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



    $scope.refreshAccessories = function(accessoryName, accessoryType) {
        var test = accessoryName;
    };

    $scope.getAddOns = function() {
        fbLoading.showWhile(fbRawGlass.GetGlassAddOns($scope.door.distributor, $scope.door.style)).then(function(addOns) {
            $scope.breakoutAddOns(addOns);
        });
    };

    $scope.consolidateAddOns = function() {
        $scope.allAddOns = [];
        if ($scope.selectedValues.GridType) {
            $scope.allAddOns.push($scope.selectedValues.GridType);
        }
        if ($scope.selectedValues.UnitThickness) {
            $scope.allAddOns.push($scope.selectedValues.UnitThickness);
        }
        if ($scope.selectedValues.SpacerType) {
            $scope.allAddOns.push($scope.selectedValues.SpacerType);
        }
        if ($scope.selectedAddOns.PatternCharges) {
            $scope.selectedAddOns.PatternCharges.forEach(function(addOn) {
                $scope.allAddOns.push(addOn);
            });
        }
        if ($scope.selectedAddOns.GlassAdds) {
            $scope.selectedAddOns.GlassAdds.forEach(function(addOn) {
                $scope.allAddOns.push(addOn);
            });
        }
    };

    $scope.checkGlassType2 = function() {
        if ($scope.door.glassTypes2.length === 0) {
            return false;
        }
        if ($scope.door.glassTypes2.length === 1 && $scope.door.glassTypes2[0] === '') {
            return false;
        }
        return true;
    };

    $scope.breakoutAddOns = function(addons) {
        $scope.availableUnitThicknesses = [];
        $scope.availableSpacerTypes = [];
        $scope.availablePatternCharges = [];
        $scope.availableGridTypes = [];
        $scope.availableGlassAdds = [];
        $scope.availableEdgeworks = [];
        for (var i in addons) {
            var addOn = addons[i];
            if (addOn.Thickness == $scope.selectedValues.GlassThickness || addOn.Thickness === "") {
                switch (addOn.Type.trim()) {
                    case "Pattern Charges":
                        $scope.availablePatternCharges.push(addOn);
                        break;
                    case "Unit Overall Thickness":
                        $scope.availableUnitThicknesses.push(addOn);
                        break;
                    case "Grid Type":
                        $scope.availableGridTypes.push(addOn);
                        break;
                    case "Glass adds":
                        $scope.availableGlassAdds.push(addOn);
                        break;
                    case "Spacer Type":
                        $scope.availableSpacerTypes.push(addOn);
                        break;
                    case "Edgework":
                        $scope.availableEdgeworks.push(addOn);
                }
            }
        }
        $scope.setDefaultAddOns();
    };

    $scope.setDefaultAddOns = function() {
        $scope.selectedValues.UnitThickness = $scope.availableUnitThicknesses[0];
        $scope.selectedValues.SpacerType = $scope.availableSpacerTypes[0];
        $scope.selectedValues.GridType = $scope.availableGridTypes[0];
        $scope.$apply();
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
            orderTree.products[item.OrderType].total += item.TotalPrice;
        });
        $scope.orderTree = orderTree;
    };

    $scope.getAddOnPrice = function(addOn) {
        if (addOn.UOM === "sqft") {
            return addOn.Price * $scope.pricingValues.SqFt;
        } else if (addOn.UOM === "per box") {
            return addOn.Price * ($scope.selectedValues.GridWidth * $scope.selectedValues.GridHeight);
        } else if (addOn.UOM === "lineal inch") {
            return addOn.Price * ((2 * $scope.selectedValues.Width) + (2 * $scope.selectedValues.Height));
        } else if (addOn.UOM === "percent add") {
            return (addOn.Price / 100) * ($scope.door.price * $scope.selectedValues.TotalSqFt);
        } else {
            return addOn.Price;
        }
    };

    $scope.UpdatePrice = function() {
        var priceEach = 0;
        if ($scope.door !== undefined && $scope.door.price !== undefined && $scope.door.price != doorNotExists)
            priceEach = $scope.door.price * $scope.pricingValues.SqFt;
        if ($scope.selectedValues.GridType) {
            priceEach += $scope.getAddOnPrice($scope.selectedValues.GridType);
        }
        if ($scope.selectedValues.UnitThickness) {
            priceEach += $scope.getAddOnPrice($scope.selectedValues.UnitThickness);
        }
        if ($scope.selectedValues.SpacerType) {
            priceEach += $scope.getAddOnPrice($scope.selectedValues.SpacerType);
        }
        if ($scope.selectedAddOns.PatternCharges) {
            $scope.selectedAddOns.PatternCharges.forEach(function(addOn) {
                priceEach += $scope.getAddOnPrice(addOn);
            });
        }
        if ($scope.selectedAddOns.GlassAdds) {
            $scope.selectedAddOns.GlassAdds.forEach(function(addOn) {
                priceEach += $scope.getAddOnPrice(addOn);
            });
        }
        $scope.priceEach = priceEach.toFixed(2);
        $scope.totalPrice = getTotalPrice($scope.Quantity, priceEach, $scope.thisItem.SelectedManufacturerSettings);
    };

    $scope.changeThickness = function() {
        $scope.getAddOns();
    };

    $scope.selectedValues = {
        GlassType: $scope.door.glassTypes[0],
        GlassType2: $scope.door.glassTypes2[0].glassType2,
        GlassThickness: $scope.door.glassThicknesses[0],
        Tempered: false,
        TotalSqFt: 0,
        GridWidth: 1,
        GridHeight: 1

    };



    $scope.getPrices = function() {
        fbLoading.showWhile(fbRawGlass.PriceGlass($scope.door, $scope.selectedValues)).then(function(pricing) {
            if (pricing.rawGlass) {
                $scope.door.price = pricing.rawGlass.Price;
                $scope.door.description = pricing.rawGlass.Discription;
                $scope.door.maxLength = pricing.rawGlass.MaxLength;
                $scope.door.maxSF = pricing.rawGlass.MaxSqFt;
                $scope.door.maxShortLength = pricing.rawGlass.MaxShortDim;
                $scope.RawGlassID = pricing.rawGlass.RawGlassID;
                $scope.door.photoName = pricing.rawGlass.PhotoName;
            } else {
                $scope.door.price = doorNotExists;
                $scope.door.photoName = '';
                $scope.RawGlassID = null;
            }
            $scope.UpdatePrice();
        });
    };

    var item = selectedProductType.getSelectedStyles2();
    $scope.thisItem = item;
    $scope.OrderDetails = item.OrderDetails;
    $scope.SelectedCustomer = item.SelectedCustomer;
    $scope.SelectedDoorQuote = item.SelectedDoorQuote;
    $scope.buildOrderTrees($scope.OrderDetails);
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
        DoorQuoteID: $scope.SelectedDoorQuote === null ? 0 : $scope.SelectedDoorQuote.DoorQuoteID
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

        $scope.FilterOrder.DoorQuoteID = $scope.SelectedDoorQuote === null ? 0 : $scope.SelectedDoorQuote.DoorQuoteID;
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

    $scope.SelectedOrderDetails = null;

    $scope.SelectOrder = function(orderDetail) {
        $scope.SelectedOrderDetails = orderDetail;
        $scope.ShowMouldingModal(false);
    };


    // =========================================================End: Calculate raw glass Panel=========================================================

    $scope.Order = {
        DoorQuoteID: $scope.SelectedDoorQuote === null ? 0 : $scope.SelectedDoorQuote.DoorQuoteID,
        RawGlassID: 0,
        PriceEach: 0,
        Quantity: 1,
        TotalPrice: 0,
        OrderType: $scope.CurrentOrderType,
        Length: $scope.selectedValues.length,
        Width: $scope.selectedValues.Width
    };

    $scope.AddToOrder = function(selected) {
        if ($scope.IsValidOrder()) {
            $scope.Order.DoorQuoteID = ($scope.SelectedDoorQuote === null || $scope.SelectedDoorQuote === undefined) ? 0 : $scope.SelectedDoorQuote.DoorQuoteID;
            $scope.Order.LDoorQuoteID = ($scope.SelectedDoorQuote === null || $scope.SelectedDoorQuote === undefined) ? 0 : $scope.SelectedDoorQuote.id;
            $scope.Order.RawGlassID = $scope.RawGlassID;
            $scope.Order.PriceEach = $scope.priceEach;
            $scope.Order.Quantity = $scope.Quantity;
            $scope.Order.TotalPrice = $scope.totalPrice;
            $scope.Order.OrderType = selected;
            $scope.Order.Height = $scope.selectedValues.Height;
            $scope.Order.Width = $scope.selectedValues.Width;
            $scope.Order.GridWidth = $scope.selectedValues.GridWidth;
            $scope.Order.GridHeight = $scope.selectedValues.GridHeight;
            $scope.consolidateAddOns();
            if (isNaN($scope.selectedValues.Width) || $scope.selectedValues.Width <= 0) {
                toastr.error("Please enter a valid width value.");
                return;
            }
            if (isNaN($scope.selectedValues.Height) || $scope.selectedValues.Height <= 0) {
                toastr.error("Please enter a valid height value.");
                return;
            }
            fbUser.CurrUser().then(function(user) {
                fbRawGlass.AddToOrder($scope.Order,
                    $scope.thisItem.Styles2Item.Styles2ID,
                    $scope.thisItem.ProductTypeItem.ProductTypeID,
                    user.UserID, $scope.allAddOns).then(function(response) {
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
        var data = {
            id: localStorage.getItem("userID"),
            id1: $scope.thisItem.Styles2Item.Styles2ID,
            id2: $scope.thisItem.ProductTypeItem.ProductTypeID,
            id3: currentOrderDetail.OrderID
        };
        AjaxCall(GetMouldingOrderUrl, data, "post", "json").done(function(response) {
            var selectedOrder = response;
            var tree; // = scopes.get('FamilyController').tree;
            var thisCollection;
            var distributorName = currentOrderDetail.Distributor;
            var getTree = currentOrderDetail.Styles2ID != $scope.thisItem.Styles2Item.Styles2ID || (!tree) || (tree[0].leaves[0].distributor != distributorName);
            if (!getTree) {
                thisCollection = tree.filter(function(i) {
                    return i.collection == selectedOrder.Collection;
                });
                $scope.SetUpdateOrderValues(thisCollection, selectedOrder);
            } else {
                data = {
                    id: currentOrderDetail.Styles2ID,
                    id1: localStorage.getItem("userID"),
                    id2: $scope.thisItem.ProductTypeItem.ProductTypeID,
                    id3: distributorName
                };
                AjaxCall(GetOnlyProductListJsonUrl, data, "post", "json").done(function(innerResponse) {
                    var thisTree = $.parseJSON(innerResponse.ProductListJson);
                    thisCollection = thisTree.filter(function(i) {
                        return i.collection == selectedOrder.Collection;
                    });
                    $scope.SetUpdateOrderValues(thisCollection, selectedOrder);
                }).fail(function(failResponse) {
                    toastr.error(ajaxFailError);
                });
            }
        }).fail(function(failResponse) {
            toastr.error(ajaxFailError);
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
                    $scope.selectedValues.Width = selectedOrder.Width;
                    $scope.selectedValues.Height = selectedOrder.Height;
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
            var jsonData = JSON.stringify({
                order: $scope.Order,
                style2Id: $scope.thisItem.Styles2Item.Styles2ID,
                productTypeId: $scope.thisItem.ProductTypeItem.ProductTypeID,
                userId: localStorage.getItem("userID")
            });
            fbRawGlass.UpdateOrder(jsonData.order, jsonData.style2Id, jsonData.productTypeId, jsonData.userId).then(function(orders) {
                $state.go('frontpage');
            });
        }
    };

    $scope.reloadOrders = function() {
        fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
            fbQuotes.GetAllOrders(user.UserID, $scope.thisItem.SelectedMasterQuote.id, $scope.thisItem.SelectedMasterQuote.MasterQuoteID).then(function(orders) {
                $scope.OrderDetails = _.filter(orders, function(rItem) {
                    return rItem.ProductTypeID === 8;
                });
                $scope.buildOrderTrees($scope.OrderDetails);
                $scope.$apply();
            });
        });
    };

    // End ======================================================= Update Order ==================================================

    $scope.IsValidOrder = function() {
        var response = true;
        if ($scope.SelectedDoorQuote === null) {
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
    $scope.getAddOns();
});
