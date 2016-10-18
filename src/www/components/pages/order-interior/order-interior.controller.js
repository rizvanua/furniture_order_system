mainApp.controller("InteriorOrderController", function($scope, $http, $q, $location, selectedProductType, productMetaTree,
    fbProducts, fbUser, fbQuotes, $rootScope, $state, fbMetaData, scopes, fbManufacturers, selectedDoor, optimizer, fbIntDoors, fbLoading) {

    scopes.store('InteriorOrderController', $scope);
    $scope.handingImgName = "";

    $scope.FBConfig = Config;
    var item = selectedProductType.getSelectedStyles2();
    $scope.thisItem = item;
    var inSwing = "Inswing";
    var outSwing = "Outswing";
    var leftHanding = "Left Hand";
    var rightHanding = "Right Hand";
    var singleDoor = "Single";
    var doubleDoor = "Double";

    $scope.heightAdjust = false;

    $scope.goBack = function() {
        localStorage.setItem("showFilterPanel", true);
        window.history.back();
    };

    var selectedMFs = item.Manufacturers.filter(function(mf) {
        if (mf.ManufacturerID == item.SelectedManufacturerId) {
            return true;
        }
    });
    if (selectedMFs.length > 0) {
        $scope.selectedManufacturer = selectedMFs[0];
    }
    $scope.door = selectedDoor.getDoor();
    $scope.pageSize = pageSize;
    var doorNotExists = "DNE";

    fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
        $scope.$apply(function() {
            $scope.CurrUser = user;
        });
    });

    var initialCallNotNeeded = $scope.thisItem.SelectedOrderToUpdate !== undefined && $scope.thisItem.SelectedOrderToUpdate.OrderID !== undefined;
    var isExteriorDoorType = $scope.door !== undefined && $scope.door.species !== undefined;
    if (initialCallNotNeeded || isExteriorDoorType) {
        $scope.door = undefined;
    }

    $scope.currentAccessory = {};
    $scope.Quantity = 1;
    $scope.JambImage = '';
    $scope.addMode = true;


    $scope.setSwingImage = function() {
        if ($scope.selectedValues.doorHanding == leftHanding) {
            if ($scope.selectedValues.doorSwing == inSwing) {
                if ($scope.selectedValues.type == singleDoor) {
                    $scope.handingImgName = "lh_inswing.png";
                } else {
                    $scope.handingImgName = "lha_inswing.png";
                }
            } else {
                if ($scope.selectedValues.type == singleDoor) {
                    $scope.handingImgName = "lhr_outswing.png";
                } else {
                    $scope.handingImgName = "lhra_outswing.png";
                }
            }
        } else {
            if ($scope.selectedValues.doorSwing == inSwing) {
                if ($scope.selectedValues.type == singleDoor) {
                    $scope.handingImgName = "rh_inswing.png";
                } else {
                    $scope.handingImgName = "rha_inswing.png";
                }
            } else {
                if ($scope.selectedValues.type == singleDoor) {
                    $scope.handingImgName = "rhr_outswing.png";
                } else {
                    $scope.handingImgName = "rhra_outswing.png";
                }
            }
        }
    };

    $scope.changeHanding = function(handing) {
        $scope.selectedValues.doorHanding = handing;
        $scope.setSwingImage();
    };

    $scope.changeSwing = function(swing) {
        $scope.selectedValues.doorSwing = swing;
        $scope.setSwingImage();
    };

    $scope.imgHeight = 0;

    $scope.getImgHeight = function() {
        var imgHeight = 340;
        if ($scope.selectedValues.type == "Double") {
            imgHeight = imgHeight - 155;
        }
        $scope.imgHeight = {
            height: imgHeight + "px"
        };
    };


    // ============== BreadCrumb Logic =====================================

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
        fbLoading.showWhile(fbMetaData.GetProductListJSON($scope.SelectedDoorQuote,
            productType, null, localStorage.getItem("userID"))).then(function(response) {

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

    $scope.getClasses = function(orderDetail, flipImage) {
        return getImgClassNames(orderDetail, flipImage);
    };

    $scope.sortDimensions = function(value) {
        var vals = 0;
        if (value.width) {
            vals = value.width.split("\'");
        } else {
            vals = value.split("\'");
        }
        var total = Number(vals[0] * 100) + Number(vals[1]);
        return total;
    };

    $scope.getClasses = function(orderDetail, flipImage) {
        return getImgClassNames(orderDetail, flipImage);
    };

    $scope.getFrameClassName = function(orderDetail) {
        return getClassNames(orderDetail);
    };


    $scope.changeJambType = function() {
        var jamb;
        for (var i in $scope.jambTree) {
            jamb = $scope.jambTree[i];
            if (jamb.jambType == $scope.selectedValues.jambType) {
                $scope.currentJamb = jamb;
                $scope.selectedValues.jambWidth = jamb.widths[0];
                break;
            }
        }
        $scope.getPrices();
    };

    $scope.getBrickMouldClass = function() {
        var className = '';
        if ($scope.currentJamb !== null && $scope.currentJamb !== undefined) {
            var filteredDoorTypeArray = $scope.currentJamb.doorTypes.filter(function(thisItem) {
                return thisItem.type == $scope.selectedValues.type;
            });
            if (filteredDoorTypeArray.length > 0) {
                var jambPicName = filteredDoorTypeArray[0].jambPic;
                if (jambPicName.toLowerCase() == 'dark brown')
                    className = 'door-brick-dark';
                if (jambPicName.toLowerCase() == 'light brown')
                    className = 'door-brick-medium';
                if (jambPicName.toLowerCase() == 'grey')
                    className = 'door-brick-primed';


            }
        }
        return className;
    };

    $scope.getClassName = function() {
        var className = '';
        if ($scope.currentJamb !== null && $scope.currentJamb !== undefined && $scope.currentJamb.doorTypes !== undefined && $scope.selectedValues.jambType != "-1") {
            var filteredDoorTypeArray = $scope.currentJamb.doorTypes.filter(function(thisItem) {
                return thisItem.type == $scope.selectedValues.type;
            });

            if (filteredDoorTypeArray.length > 0) {
                var jambPicName = filteredDoorTypeArray[0].jambPic;
                switch ($scope.selectedValues.type) {
                    case "Single":
                        if (jambPicName.toLowerCase() == 'dark brown')
                            className = 'door-frame-dark';
                        if (jambPicName.toLowerCase() == 'light brown')
                            className = 'door-frame-medium';
                        if (jambPicName.toLowerCase() == 'grey')
                            className = 'door-frame-primed';
                        break;
                    case "Double":
                        if (jambPicName.toLowerCase() == 'dark brown')
                            className = 'door-frame-dark-double';
                        if (jambPicName.toLowerCase() == 'light brown')
                            className = 'door-frame-medium-double';
                        if (jambPicName.toLowerCase() == 'grey')
                            className = 'door-frame-primed-double';
                        break;
                }
            }
        }
        if ($scope.selectedValues.type != 'Bifold') {
            className += " shadow";
        }
        return className;

    };

    $scope.setWidth = function(width, type) {
        $scope.selectedValues.width = width;
        $scope.selectedValues.type = type;
        $scope.getPrices();
    };
    $scope.setHeight = function(height, type) {
        $scope.selectedValues.height = height;
        $scope.selectedValues.type = type;
        $scope.getPrices();
    };

    $scope.$watch(function(scope) {
        return scope.Quantity;
    }, function(newValue, oldValue) {
        $scope.UpdatePrice();
    });

    $scope.UpdatePrice = function() {

        if ($scope.door === undefined) {
            return;
        }

        var priceEach = 0;
        if ($scope.door !== undefined && $scope.door.price !== undefined && $scope.door.price != doorNotExists)
            priceEach = $scope.door.price;
        if ($scope.currentJamb && $scope.currentJamb.price != doorNotExists) {
            priceEach += $scope.currentJamb.price;
        }
        if ($scope.selectedHingeColor) {
            priceEach += Number($scope.selectedHingeColor.Price);
        }

        var currentAccessoryPrice = 0.00;
        var allAccessories = $scope.consolidateAccessories();

        $scope.door.Accessories = allAccessories;

        if (allAccessories.length > 0) {
            for (var i = 0; i < allAccessories.length; i++) {
                currentAccessoryPrice += allAccessories[i].Price;
            }
            $scope.currentAccessory.Price = currentAccessoryPrice.toFixed(2);
            priceEach += currentAccessoryPrice;
            $scope.currentAccessory.Names = $.map($scope.orderAcc.accessories, function(obj) {
                return obj.AccessoryName + (obj.species !== '' ? ', ' + obj.species : '') + (obj.finish !== '' ? ', ' + obj.finish : '');
            }).join(' | ');
        } else {
            if (currentAccessoryPrice > 0) {
                $scope.currentAccessory.Price = currentAccessoryPrice;
            } else {
                $scope.currentAccessory.Price = doorNotExists;
                $scope.currentAccessory.Names = '';
            }
        }
        $scope.priceEach = priceEach.toFixed(2);
        $scope.totalPrice = getTotalPrice($scope.Quantity, priceEach, $scope.thisItem.SelectedManufacturerSettings);
        console.log($scope.priceEach);
    };

    $scope.getDoubleWidth = function() {
        var feet = 0;
        var inches = 0;
        var split = $scope.selectedValues.width.split("'");
        inches = Number(split[1]);
        inches += Number(split[0]) * 12;
        inches = inches * 2;
        feet += Math.floor(inches / 12);
        inches = inches % 12;
        var widthString = feet + "'" + inches;
        return widthString;
    };

    $scope.getSingleWidth = function() {
        var feet = 0;
        var inches = 0;
        var split = $scope.selectedValues.width.split("'");
        inches = Number(split[1]);

        inches += Number(split[0]) * 12;
        inches = inches / 2;
        feet += Math.floor(inches / 12);
        inches = inches % 12;
        var widthString = feet + "'" + inches;
        return widthString;
    };

    $scope.ChangeDoorType = function(type) {
        $scope.selectedValues.type = type;
        var width;
        if ($scope.selectedValues.type == "Single") {
            dWidth = $scope.getSingleWidth();
            width = $scope.door.singleWidths.filter(function(item) {
                if (item === dWidth) {
                    return true;
                }
            });
            if (width.length > 0) {
                $scope.selectedValues.width = width[0];
            } else {
                $scope.selectedValues.width = $scope.door.singleWidths.length > 0 ? $scope.door.singleWidths[0] : '-1';
            }
        } else if ($scope.selectedValues.type == "Bifold") {
            dWidth = $scope.selectedValues.width;
            width = $scope.door.bifoldWidths.filter(function(item) {
                if (item === dWidth) {
                    return true;
                }
            });
            if (width.length > 0) {
                $scope.selectedValues.width = width[0];
            } else {
                $scope.selectedValues.width = $scope.door.bifoldWidths.length > 0 ? $scope.door.bifoldWidths[0] : '-1';
            }
        } else {
            dWidth = $scope.getDoubleWidth();
            width = $scope.door.doubleWidths.filter(function(item) {
                if (item === dWidth) {
                    return true;
                }
            });
            if (width.length > 0) {
                $scope.selectedValues.width = width[0];
            } else {
                $scope.selectedValues.width = $scope.door.doubleWidths.length > 0 ? $scope.door.doubleWidths[0] : '-1';
            }
        }
        //JambTypes dropdown will be changed because DoorType is changed. We'll check whether any JambTypes exists for the selected DoorType, if not set to DEFAULT otherwise set to first JambType.
        var newJambTypes = $scope.jambTree.filter(function(jambitem) {
            var filteredDoorTypeArray = jambitem.doorTypes.filter(function(thisItem) {
                return thisItem.type == $scope.selectedValues.type;
            });
            return filteredDoorTypeArray.length > 0;
        });
        var currJambType = _.find(newJambTypes, function(jt) {
            return jt.jambType === $scope.selectedValues.jambType;
        });
        if (currJambType !== undefined) {
            $scope.selectedValues.jambType = currJambType.jambType;
        } else if (newJambTypes.length > 0) {
            $scope.selectedValues.jambType = newJambTypes[0].jambType;
        } else {
            $scope.selectedValues.jambType = "-1";
        }

        $scope.changeJambType();
        $scope.getImgHeight();

        $scope.heightAdjust = true;
        setTimeout(function() {
            $scope.heightAdjust = false;
        }, 500);
        $scope.getHingeTypes();
        $scope.getDoorDefaults();
        $scope.setSwingImage();
    };

    $scope.defaultWidth = '';
    $scope.defaultHeight = '';

    if ($scope.door !== undefined) {
        var filteredWidthArray;
        if (($scope.door.singleWidths.length > 0)) {
            filteredWidthArray = $scope.door.singleWidths.filter(function(widthItem) {
                return widthItem.width == "2'6";
            });
            $scope.defaultWidth = filteredWidthArray.length > 0 ? filteredWidthArray[0].width : $scope.door.singleWidths[0].width;

        } else if ($scope.door.doubleWidths.length > 0) {
            filteredWidthArray = $scope.door.doubleWidths.filter(function(widthItem) {
                return widthItem.width == "5'0";
            });
            $scope.defaultWidth = filteredWidthArray.length > 0 ? filteredWidthArray[0].width : $scope.door.doubleWidths[0].width;

        } else if ($scope.door.bifoldWidths.length > 0) {
            filteredWidthArray = $scope.door.bifoldWidths.filter(function(widthItem) {
                return widthItem.width == "2'6";
            });
            $scope.defaultWidth = filteredWidthArray.length > 0 ? filteredWidthArray[0].width : $scope.door.bifoldWidths[0].width;

        }
        var filteredHeightArray = $scope.door.height.filter(function(heightItem) {
            return heightItem == "6'8";
        });
        $scope.defaultHeight = filteredHeightArray.length > 0 ? filteredHeightArray[0] : $scope.door.height[0];
    }

    $scope.selectedValues = {
        width: $scope.defaultWidth,
        type: 'Single', //$scope.currentJamb.doorTypes[0].type,
        doorHanding: "Left Hand",
        height: $scope.defaultHeight,
        jambWidth: '', //$scope.currentJamb.widths[0],
        jambType: '', //$scope.currentJamb.jambType,
        core: $scope.door !== undefined ? $scope.door.core[0] : '',
        surface: 'Textured'
    };

    $scope.getPrices = function() {
        $(".door-image").hide();
        if ($scope.selectedValues.fireRating === undefined) {
            $scope.selectedValues.fireRating = "";
        }

        if ($scope.selectedValues.specialGroup === undefined) {
            $scope.selectedValues.specialGroup = "";
        }
        fbIntDoors.PriceDoor($scope.door, $scope.selectedValues).then(function(pricing) {
            var reloadJambs = false;
            $(".door-image").show();
            if (pricing.door) {
                $scope.door.price = pricing.door.price;
                $scope.door.photoName = pricing.door.photoName;
                if ($scope.addMode === true && $scope.door.fireRating !== pricing.door.fireRating) {
                    $scope.door.fireRating = pricing.door.fireRating;
                    $scope.getHingeTypes();
                    $scope.refreshAllAccessories();
                    reloadJambs = true;
                }
                $scope.selectedValues.fireRating = $scope.door.fireRating;
                if ($scope.addMode === true && $scope.selectedValues.specialGroup != pricing.door.specialGroup) {
                    $scope.door.specialGroup = pricing.door.specialGroup;
                    $scope.selectedValues.specialGroup = $scope.door.specialGroup;
                    $scope.getHingeTypes();
                    $scope.refreshAllAccessories();
                    reloadJambs = true;
                }
//                $scope.selectedValues.specialGroup = $scope.door.specialGroup;

                $scope.selectedValues.surface = pricing.door.surface;
                $scope.DoorID = pricing.door.DoorID;
                if (reloadJambs === true) {
                    $scope.getJambTree();
                }
            } else {
                if (!$scope.door) {
                    $scope.door = {};
                }
                $scope.door.price = doorNotExists;
                $scope.door.photoName = '';
                $scope.DoorID = null;
            }
            if (pricing.jamb) {
                $scope.currentJamb.price = pricing.jamb.price;
                $scope.JambID = pricing.jamb.JambID;
            } else {
                if ($scope.currentJamb) {
                    $scope.currentJamb.price = doorNotExists;
                }
                $scope.JambID = null;
            }
            $scope.UpdatePrice();
            $scope.$apply();
        });
    };


    $scope.OrderDetails = item.OrderDetails;
    $scope.SelectedCustomer = item.SelectedCustomer;
    $scope.SelectedDoorQuote = item.SelectedDoorQuote;
    $scope.buildOrderTrees($scope.OrderDetails);
    $scope.AddOrderOne = window.AddOrderOne;
    $scope.AddOrderTwo = window.AddOrderTwo;
    $scope.AddOrderThree = window.AddOrderThree;

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
        DoorID: 0,
        JambID: null,
        PriceEach: 0,
        Quantity: 1,
        TotalPrice: 0,
        IsLeftHand: true,
        OrderType: $scope.CurrentOrderType
    };

    $scope.GeneratePdf = function() {
        //GeneratePdfService($scope, GeneratePdfUrl);
    };


    $scope.getJambTree = function() {
        var deferred = $q.defer();
        var jsonData = JSON.stringify({
            fireRating: $scope.selectedValues.fireRating,
            specialGroup: $scope.selectedValues.specialGroup,
            manufacturerId: $scope.selectedManufacturer.ManufacturerID
        });
        fbLoading.showWhile(fbIntDoors.GetJambTree($scope.selectedValues.fireRating,
            $scope.selectedValues.specialGroup, $scope.selectedManufacturer.ManufacturerID)).then(function(filters) {

            $scope.jambTree = filters;
            $scope.currentJamb = $scope.jambTree[0];
            $scope.selectedValues = {
                width: $scope.defaultWidth,
                type: $scope.currentJamb.doorTypes[0].type,
                doorHanding: "Left Hand",
                height: $scope.defaultHeight,
                jambWidth: $scope.currentJamb.widths[0],
                jambType: $scope.currentJamb.jambType,
                core: $scope.door !== undefined && $scope.door !== null ? $scope.door.core[0] : '',
                surface: 'Textured',
                specialGroup: $scope.selectedValues.specialGroup,
                fireRating: $scope.selectedValues.fireRating
            };
            $scope.selectedValues.doorSwing = inSwing;
            $scope.selectedValues.doorHanding = leftHanding;
            $scope.setSwingImage();
            $scope.getPrices();
            if ($scope.door && $scope.door.singleWidths.length === 0) {
                $scope.ChangeDoorType('Bifold');
            }
            deferred.resolve();

        });
        return deferred.promise;
    };

    $scope.getJambTree();

    // Start ===================================================== Accessories ===================================================

    $scope.previewModifiers = [];

    $scope.AccessoryAdd = function($item, $model) {
        if ($item.PreviewModifier && $item.PreviewModifier !== '') {
            $scope.previewModifiers.push($item.PreviewModifier);
        }
        $scope.UpdatePrice();
    };

    $scope.AccessoryRemove = function($item, $model) {
        if ($item.PreviewModifier && $item.PreviewModifier !== '') {
            var index = $scope.previewModifiers.indexOf($item.PreviewModifier);
            if (index >= 0) {
                $scope.previewModifiers.splice(index, 1);
            }
        }
        $scope.UpdatePrice();
    };

    $scope.InteriorOrderAccessorySearch = {
        accessoryName: '',
        height: '',
        type: ''
    };

    //Group all accessories into one list for saving and calculating pricing.
    $scope.availableAccessories = [];
    $scope.availableBoreAccessories = [];
    $scope.availablePrepAccessories = [];
    $scope.availableMiscAccessories = [];
    $scope.availableHingeTypes = {};
    $scope.orderAcc = {};
    $scope.orderAcc.accessories = [];

    $scope.getDefaultAccessories = function(accessoryList, accessoryType) {
        if (!$scope.defaults) {
            return;
        }
        var activeAccessories;
        var defAcc = [];
        if ($scope.defaults.accessories) {
            defAcc = $scope.defaults.accessories.filter(function(item) {
                if (item.AccessoryType == accessoryType) {
                    return true;
                }
            });
        }

        if (accessoryType == "Jamb") {
            // accessoryList = $scope.availableJambAccessories;
            //activeAccessories = $scope.orderAcc.accessories.boreOptions;
            //  $scope.orderAcc.accessories.jambAccessory = $scope.availableJambAccessories[0];
        } else if (accessoryType == "Hinge") {
            //   $scope.availableHingeAccessories = filteredArray;
            //   $scope.orderAcc.accessories.hingeAcessory = $scope.availableHingeAccessories[0];
        } else if (accessoryType == "Bore") {
            accessoryList = $scope.availableBoreAccessories;
            if (!$scope.orderAcc.accessories.boreOptions) {
                $scope.orderAcc.accessories.boreOptions = [];
            }
            activeAccessories = $scope.orderAcc.accessories.boreOptions;
        } else if (accessoryType == "Special Prep") {
            if (!$scope.orderAcc.accessories.prepOptions) {
                $scope.orderAcc.accessories.prepOptions = [];
            }
            accessoryList = $scope.availablePrepAccessories;
            activeAccessories = $scope.orderAcc.accessories.prepOptions;
        } else if (accessoryType == "Misc") {
            if (!$scope.orderAcc.accessories.miscOptions) {
                $scope.orderAcc.accessories.miscOptions = [];
            }
            accessoryList = $scope.availableMiscAccessories;
            activeAccessories = $scope.orderAcc.accessories.miscOptions;
        }
        $.each(defAcc, function(index, defItem) {
            var currentAcc = accessoryList.filter(function(item) {
                if (item.AccessoryID == defItem.AccessoryID) {
                    return true;
                }
            });
            if (currentAcc.length > 0) {
                activeAccessories.push(currentAcc[0]);
            }

        });

    };


    $scope.consolidateAccessories = function() {
        var accessories = [];
        if (!$scope.orderAcc) {
            return accessories;
        }
        $scope.previewModifiers = [];
        var acc;
        if ($scope.orderAcc.accessories.boreOptions) {
            for (var i in $scope.orderAcc.accessories.boreOptions) {
                acc = $scope.orderAcc.accessories.boreOptions[i];
                accessories.push(acc);
                if (acc.PreviewModifier && acc.PreviewModifier !== '') {
                    $scope.previewModifiers.push(acc.PreviewModifier);
                }
            }
        }
        if ($scope.orderAcc.accessories.prepOptions) {
            for (var j in $scope.orderAcc.accessories.prepOptions) {
                acc = $scope.orderAcc.accessories.prepOptions[j];
                accessories.push(acc);
                if (acc.PreviewModifier && acc.PreviewModifier !== '') {
                    $scope.previewModifiers.push(acc.PreviewModifier);
                }
            }
        }
        if ($scope.orderAcc.accessories.miscOptions) {
            for (var k in $scope.orderAcc.accessories.miscOptions) {
                acc = $scope.orderAcc.accessories.miscOptions[k];
                accessories.push(acc);
                if (acc.PreviewModifier && acc.PreviewModifier !== '') {
                    $scope.previewModifiers.push(acc.PreviewModifier);
                }
            }
        }
        return accessories;
    };

    $scope.getHingeTypes = function() {
        var deferred = $q.defer();
        var fireRating = $scope.door && $scope.door.fireRating !== undefined ? $scope.door.fireRating : '';
        var specialGroup = $scope.door && $scope.door.specialGroup !== undefined ? $scope.door.specialGroup : '';
        fbLoading.showWhile(fbIntDoors.GetHingeTypes($scope.selectedManufacturer.name,
            $scope.selectedValues.type, fireRating, specialGroup)).then(function(response) {

            $scope.availableHingeTypes = response;
            $scope.selectedHingeType = response[0];

            $scope.getHingeColors().then(function() {
                deferred.resolve();
            });


        });
        return deferred.promise;
    };

    $scope.getDoorDefaults = function() {
        if (!initialCallNotNeeded && $scope.door !== undefined && $scope.door !== null) {
            $scope.defaults = {};
            var params = {
                style: $scope.door.style[0],
                manufacturer: $scope.selectedManufacturer.name,
                type: $scope.selectedValues.type,
                collection: $scope.door.collection
            };
            fbLoading.showWhile(fbIntDoors.GetDefaults($scope.door.style[0], $scope.selectedManufacturer.name,
                $scope.selectedValues.type, $scope.door.collection)).then(function(defaults) {

                if (defaults.accessories) {
                    $scope.defaults.accessories = defaults.accessories;
                }
                $scope.refreshAllAccessories();
                if (defaults.jamb) {
                    $scope.defaults.jamb = defaults.jamb.jambType;
                    $scope.selectedValues.jambType = $scope.defaults.jamb;
                    $scope.changeJambType();
                }

            });
        }
    };

    $scope.getHingeTypes();

    $scope.getHingeColors = function() {
        var deferred = $q.defer();
        fbLoading.showWhile(fbIntDoors.GetHingeColors($scope.selectedManufacturer.name,
            $scope.selectedHingeType, $scope.selectedValues.type, $scope.door.specialGroup, $scope.door.fireRating)).then(function(response) {

            $scope.availableHingeAccessories = response;
            $scope.selectedHingeColor = response[0];
            $scope.UpdatePrice();
            $scope.$apply();
            deferred.resolve();

        });
        return deferred.promise;
    };

    $scope.refreshAllAccessories = function() {
        $scope.refreshAccessories('', 'Jamb');
        $scope.refreshAccessories('', 'Hinge');
        $scope.refreshAccessories('', 'Bore');
        $scope.refreshAccessories('', 'Special Prep');
        $scope.refreshAccessories('', 'Misc');
    };

    $scope.refreshAccessories = function(accessoryName, accessoryType) {
        var InteriorOrderAccessorySearch = {};
        InteriorOrderAccessorySearch.accessoryName = accessoryName;
        InteriorOrderAccessorySearch.height = $scope.selectedValues.height;
        InteriorOrderAccessorySearch.type = $scope.selectedValues.type;
        InteriorOrderAccessorySearch.accessoryType = accessoryType;
        InteriorOrderAccessorySearch.jambType = $scope.selectedValues.jambType;
        InteriorOrderAccessorySearch.distributor = $scope.selectedManufacturer.name;
        if ($scope.door && $scope.door.fireRating) {
            InteriorOrderAccessorySearch.fireRating = $scope.door.fireRating;
        }

        if ($scope.door && $scope.door.specialGroup) {
            InteriorOrderAccessorySearch.specialGroup = $scope.door.specialGroup;
        }
        if (accessoryType != "Jamb" || InteriorOrderAccessorySearch.jambType) {
            fbLoading.showWhile(fbIntDoors.GetAccessories(InteriorOrderAccessorySearch)).then(function(response) {

                var filteredArray = response.filter(function(obj) {
                    var match = true;
                    $scope.orderAcc.accessories.filter(function(acc) {
                        if (acc.ExtAccessoryID == obj.ExtAccessoryID) {
                            match = false;
                            return;
                        }
                    });
                    return match;
                });

                if (accessoryType == "Jamb") {
                    $scope.availableJambAccessories = filteredArray;
                } else if (accessoryType == "Bore") {
                    $scope.availableBoreAccessories = filteredArray;

                } else if (accessoryType == "Special Prep") {
                    $scope.availablePrepAccessories = filteredArray;
                } else if (accessoryType == "Misc") {
                    console.log($scope.selectedValues.jambType);
                    console.log(response);
                    $scope.availableMiscAccessories = filteredArray;
                } else {
                    $scope.availableAccessories = filteredArray;
                }

                if (!$scope.CurrentOrder) {
                    $scope.getDefaultAccessories(filteredArray, accessoryType);
                }

                $scope.$apply();
            });
        }
    };

    $scope.refreshAccessories('', 'Hinge');
    $scope.getDoorDefaults();
    // End ======================================================= Accessories ===================================================

    $scope.AddToOrder = function(selected) {
        if ($scope.IsValidOrder()) {
            $scope.Order.DoorID = $scope.DoorID;
            $scope.Order.JambID = $scope.JambID;
            $scope.Order.PriceEach = $scope.priceEach;
            $scope.Order.Quantity = $scope.Quantity;
            $scope.Order.TotalPrice = $scope.totalPrice;
            $scope.Order.IsLeftHand = $scope.selectedValues.doorHanding == "Left Hand";
            $scope.Order.OrderType = selected;
            $scope.Order.DoorSwing = $scope.selectedValues.doorSwing;
            $scope.Order.HingeType = $scope.selectedHingeType;
            if ($scope.selectedHingeColor) {
                $scope.Order.HingeColor = $scope.selectedHingeColor.ColorName;
            }
            fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
                fbLoading.showWhile(fbIntDoors.AddToOrder($scope.Order, $scope.thisItem.Styles2Item.Styles2ID,
                    $scope.thisItem.ProductTypeItem.ProductTypeID, user.UserID, $scope.consolidateAccessories())).then(function(response) {
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
        if (orderDetail.productType == "Interior") {
            $scope.GetOrderService(orderDetail);
        } else {
            $scope.thisItem.SelectedOrderToUpdate = orderDetail;
            selectedProductType.setSelectedStyles2($scope.thisItem);
            window.location.href = "/door#/" + orderDetail.productType;
        }
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
                $scope.$apply(function() {
                    $scope.door = leaf[0];
                    $scope.CurrentOrder = selectedOrder;
                    $scope.addMode = false;
                    $scope.getJambTree().then(function() {
                        for (var i in $scope.jambTree) {
                            var jamb = $scope.jambTree[i];
                            if (jamb.jambType == selectedOrder.JambType) {
                                $scope.currentJamb = jamb;
                                break;
                            }
                        }


                        $scope.selectedValues.width = selectedOrder.Width;
                        $scope.selectedValues.type = selectedOrder.DoorType;
                        $scope.selectedValues.doorHanding = selectedOrder.DoorHanding;
                        $scope.selectedValues.height = selectedOrder.Height;
                        $scope.selectedValues.doorSwing = selectedOrder.DoorSwing;
                        if (selectedOrder.JambType !== undefined && selectedOrder.JambType !== null) {
                            $scope.selectedValues.jambWidth = selectedOrder.JambWidth;
                            $scope.selectedValues.jambType = selectedOrder.JambType;
                        } else {
                            $scope.selectedValues.jambWidth = -1;
                            $scope.selectedValues.jambType = -1;
                        }
                        $scope.selectedValues.core = selectedOrder.Core;
                        $scope.selectedValues.surface = selectedOrder.Surface;
                        $scope.orderAcc.accessories = selectedOrder.Accessories;
                        $scope.FilterOrder.OrderType = selectedOrder.OrderType;
                        $scope.Quantity = selectedOrder.Quantity;
                        $scope.door.price = selectedOrder.DoorPrice;
                        $scope.currentJamb.price = selectedOrder.JambPrice;
                        $scope.breakOutAccessories(selectedOrder.Accessories);
                        var hingeColors = $scope.availableHingeAccessories.filter(function(acc) {
                            if (selectedOrder.HingeColor.indexOf(acc.ColorName) >= 0) {
                                return true;
                            }
                        });
                        if (hingeColors.length > 0) {
                            $scope.selectedHingeColor = hingeColors[0];
                        }
                        $scope.selectedHingeType = selectedOrder.HingeType;
                        $scope.getPrices();
                    });
                });
            }
        }
    };

    $scope.breakOutAccessories = function(accessories) {

        var boreOptions = accessories.filter(function(obj) {
            var match = false;
            if (obj.type == "Bore") {
                match = true;
            }
            return match;
        });
        $scope.orderAcc.accessories.boreOptions = boreOptions;

        var prepOptions = accessories.filter(function(obj) {
            var match = false;
            if (obj.type == "Special Prep") {
                match = true;
            }
            return match;
        });
        $scope.orderAcc.accessories.prepOptions = prepOptions;

        var miscOptions = accessories.filter(function(obj) {
            var match = false;
            if (obj.type == "Misc") {
                match = true;
            }
            return match;
        });
        $scope.orderAcc.accessories.miscOptions = miscOptions;

    };

    $scope.UpdateOrder = function($event) {
        if ($scope.IsValidOrder()) {
            $scope.Order.id = $scope.CurrentOrder.LOrderID;
            $scope.Order.DoorID = $scope.DoorID;
            $scope.Order.LDoorQuoteID = $scope.CurrentOrder.LDoorQuoteID;
            $scope.Order.OrderID = $scope.CurrentOrder.OrderID;
            $scope.Order.JambID = $scope.JambID;
            $scope.Order.PriceEach = Number($scope.priceEach);
            $scope.Order.Quantity = Number($scope.Quantity);
            $scope.Order.TotalPrice = Number($scope.totalPrice);
            $scope.Order.IsLeftHand = $scope.selectedValues.doorHanding == "Left Hand";
            $scope.Order.OrderType = $scope.CurrentOrder.OrderType;
            $scope.Order.DoorQuoteID = $scope.CurrentOrder.DoorQuoteID;
            $scope.Order.DoorSwing = $scope.selectedValues.doorSwing;
            $scope.Order.HingeType = $scope.selectedHingeType;
            if ($scope.selectedHingeColor) {
                $scope.Order.HingeColor = $scope.selectedHingeColor.ColorName;
            }
            var jsonData = JSON.stringify({
                order: $scope.Order,
                style2Id: $scope.thisItem.Styles2Item.Styles2ID,
                productTypeId: $scope.thisItem.ProductTypeItem.ProductTypeID,
                userId: localStorage.getItem("userID"),
                accessories: $scope.consolidateAccessories()
            });
            fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
                fbLoading.showWhile(fbIntDoors.UpdateOrder($scope.Order, $scope.thisItem.Styles2Item.Styles2ID,
                    $scope.thisItem.ProductTypeItem.ProductTypeID, user.UserID, $scope.consolidateAccessories())).then(function(response) {

                    //$scope.reloadOrders();
                    $scope.$apply(function() {
                        $scope.addMode = false;
                        $scope.OrderDetails = $scope.OrderDetails.map(function(element, index) {
                            if (element.OrderID == $scope.CurrentOrder.OrderID)
                                return response;
                            return element;
                        });
                        $scope.thisItem.OrderDetails = $scope.OrderDetails;
                        selectedProductType.setSelectedStyles2($scope.thisItem);
                    });

                });
            });
        }
    };

    $scope.astragalClass = function() {
        if ($scope.previewModifiers.indexOf('astragal') >= 0) {
            var className = '';
            if ($scope.currentJamb !== null && $scope.currentJamb !== undefined && $scope.selectedValues.jambType != "-1") {
                var filteredDoorTypeArray = $scope.currentJamb.doorTypes.filter(function(thisItem) {
                    return thisItem.type == $scope.selectedValues.type;
                });

                if (filteredDoorTypeArray.length > 0) {
                    var jambPicName = filteredDoorTypeArray[0].jambPic;
                    if (jambPicName.toLowerCase() == 'dark brown')
                        className = 'doorAstragalDark';
                    if (jambPicName.toLowerCase() == 'light brown')
                        className = 'doorAstragalMedium';
                    if (jambPicName.toLowerCase() == 'grey')
                        className = 'doorAstragalGray';
                }
            }
            return className;
        }
    };


    $scope.reloadOrders = function() {
        fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
            fbQuotes.GetAllOrders(user.UserID, $scope.thisItem.SelectedMasterQuote.id, $scope.thisItem.SelectedMasterQuote.MasterQuoteID).then(function(orders) {
                $scope.OrderDetails = _.filter(orders, function(rItem) {
                    return rItem.ProductTypeID === 1;
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
                return rItem.ProductTypeID === 1;
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
        if (($scope.SelectedDoorQuote === null || $scope.SelectedDoorQuote === undefined) && $scope.addMode === true) {
            toastr.error("Sorry, there are not any door quotes selected. Please add those and then try to add order.");
            response = false;
        }
        if ($scope.DoorID === null) {
            toastr.error("Please select door");
            response = false;
        }
        return response;
    };

    if (initialCallNotNeeded) {
        var orderDetail = $scope.thisItem.SelectedOrderToUpdate;
        $scope.thisItem.SelectedOrderToUpdate = {};
        selectedProductType.setSelectedStyles2($scope.thisItem);
        $scope.GetOrderService(orderDetail);
    } else {
        $scope.getPrices();
    }

});
