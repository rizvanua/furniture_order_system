mainApp.controller("ExteriorOrderController", function($scope, $q, $http, $location, selectedProductType, productMetaTree,
    fbProducts, fbUser, fbQuotes, $rootScope, $state, fbMetaData, scopes, fbManufacturers, selectedDoor, optimizer, fbIntDoors,
    fbExtDoors, fbLoading) {

    scopes.store('ExtOrderController', $scope);

    $scope.FBConfig = Config;

    var doorNotExists = "DNE";
    var inSwing = "Inswing";
    var outSwing = "Outswing";
    var leftHanding = "Left Hand";
    var rightHanding = "Right Hand";
    var singleDoor = "Single";
    var doubleDoor = "Double";
    $scope.AddOrderOne = "1";
    $scope.AddOrderTwo = "2";
    $scope.AddOrderThree = "3";
    $scope.search = {};

    var item = selectedProductType.getSelectedStyles2();

    fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
        $scope.$apply(function() {
            $scope.CurrUser = user;
        });
    });

    $scope.thisItem = item;
    $scope.door = selectedDoor.getDoor();

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

    var initialCallNotNeeded = $scope.thisItem.SelectedOrderToUpdate !== undefined && $scope.thisItem.SelectedOrderToUpdate.OrderID !== undefined;
    var isInteriorDoorType = $scope.door !== undefined && $scope.door.bifoldWidths !== undefined;
    if (initialCallNotNeeded || isInteriorDoorType) {
        $scope.door = undefined;
    }

    $scope.setMaterialInit = function() {
        setTimeout(function() {
            $.material.init();
        }, 500);
    };


    $scope.showBreakdown = true;
    $scope.Accessories = window.VarAccessories;
    $scope.currentAccessory = {};
    $scope.Quantity = 1;
    $scope.JambImage = '';
    $scope.selectedSideliteDirection = "Both";
    $scope.availableSidelites = [];
    $scope.showingSidelitePanel = false;
    $scope.leftSidelite = null;
    $scope.rightSidelite = null;
    $scope.availableSills = [];
    $scope.currentSill = {};
    $scope.sillType = "";
    $scope.imgHeight = 0;
    $scope.currentAccessory = {};
    $scope.addMode = true;
    $scope.handingImgName = "";
    $scope.showLargeImage = false;
    $scope.imageCoords = [];
    $scope.popupImgSrc = "";

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

    $scope.getDoorDefaults = function() {
        if (!initialCallNotNeeded) {
            $scope.defaults = {};
            var params = {
                style: $scope.door.style[0],
                manufacturer: $scope.selectedManufacturer.name,
                type: $scope.selectedValues.type,
                collection: $scope.door.collection
            };
            fbLoading.showWhile(fbIntDoors.GetDefaults($scope.door.style[0],
                $scope.selectedManufacturer.name, $scope.selectedValues.type, $scope.door.collection)).then(function(defaults) {

                console.log(JSON.stringify(defaults));

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
        fbLoading.showWhile(fbQuotes.GetSubQuotes(productTypeId, $scope.thisItem.SelectedMasterQuote.id, $scope.thisItem.SelectedMasterQuote.MasterQuoteID)).then(function(response) {
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

    $scope.getClasses = function(orderDetail, flipImage) {
        return getImgClassNames(orderDetail, flipImage);
    };

    $scope.showBigImage = function(event) {
        $scope.popupImgSrc = event.currentTarget.src;
        $scope.imageCoords[1] = event.clientX + 10;
        $scope.imageCoords[0] = event.clientY - 200;
        $scope.showLargeImage = true;
    };

    $scope.hideBigImage = function() {
        $scope.showLargeImage = false;
    };

    $scope.changeHanding = function(handing) {
        $scope.selectedValues.doorHanding = handing;
        $scope.setSwingImage();
    };

    $scope.changeSwing = function(swing) {
        $scope.selectedValues.doorSwing = swing;
        $scope.setSwingImage();
        $scope.getAvailableSills();
    };

    $scope.getBrickMouldingClass = function() {

        if (($scope.selectedManufacturer.name != 'Alliance Door' && $scope.selectedManufacturer.name != 'Wild River') || $scope.previewModifiers.indexOf('add brickmold') >= 0) {
            if ($scope.previewModifiers.indexOf('no brickmold') >= 0) {
                return "";
            }
            if ($scope.selectedValues.jambType !== undefined && $scope.selectedValues.jambType !== null) {
                if ($scope.selectedValues.jambType.toLowerCase().indexOf('primed') >= 0 || $scope.selectedValues.jambType.toLowerCase().indexOf('weatherguard') >= 0 || $scope.selectedValues.jambType.toLowerCase().indexOf('composite') >= 0) {
                    return 'door-brick-primed';
                } else if ($scope.selectedValues.jambType == '-1') {
                    return "";
                } else {
                    return 'door-brick-medium';
                }
            }
        }
    };

    $scope.consolidateAccessories = function() {

        var accessories = [];
        if (!$scope.orderAcc) {
            return accessories;
        }
        var i = 0;
        if ($scope.orderAcc.accessories.jambOptions) {
            for (i = 0; i < $scope.orderAcc.accessories.jambOptions.length; i++) {
                accessories.push($scope.orderAcc.accessories.jambOptions[i]);
            }
        }
        if ($scope.orderAcc.accessories.boreOptions) {
            for (i = 0; i < $scope.orderAcc.accessories.boreOptions.length; i++) {
                accessories.push($scope.orderAcc.accessories.boreOptions[i]);
            }
        }
        if ($scope.orderAcc.accessories.prepOptions) {
            for (i = 0; i < $scope.orderAcc.accessories.prepOptions.length; i++) {
                accessories.push($scope.orderAcc.accessories.prepOptions[i]);
            }
        }
        if ($scope.orderAcc.accessories.miscOptions) {
            for (i = 0; i < $scope.orderAcc.accessories.miscOptions.length; i++) {
                accessories.push($scope.orderAcc.accessories.miscOptions[i]);
            }
        }
        return accessories;
    };


    $scope.getFrameClasses = function(isMainDoor, skipSill) {
        var className = "";

        if ($scope.isSillBronze()) {
            className += ' bronzeSill';
        } else {
            className += ' graySill';
        }

        if ($scope.selectedValues.jambType !== undefined && $scope.selectedValues.jambType !== null) {
            var test = $scope.selectedValues.jambType.toLowerCase();
            if (test != '-1') {
                if ($scope.selectedValues.jambType.toLowerCase().indexOf('primed') >= 0 || $scope.selectedValues.jambType.toLowerCase().indexOf('weatherguard') >= 0 || $scope.selectedValues.jambType.toLowerCase().indexOf('composite') >= 0) {
                    className += ' doorBorderGray';
                } else {
                    className += " doorBorderMedium";
                }
            }
            if (isMainDoor && $scope.selectedValues.doorHanding == 'Right Hand' && $scope.selectedValues.type == 'Single') {
                className += " flipImage";
            }
        }

        return className;
    };

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

    $scope.getFrameClassName = function(orderDetail) {
        return getClassNames(orderDetail);
    };

    $scope.getImgHeight = function() {
        var imgHeight = 340;
        if ($scope.rightSidelite) {
            imgHeight = imgHeight - 89;
        }
        if ($scope.leftSidelite) {
            imgHeight = imgHeight - 89;
        }
        if ($scope.selectedValues.type == "Double") {
            if ($scope.leftSidelite) {
                imgHeight = imgHeight + 30;
            }
            if ($scope.rightSidelite) {
                imgHeight = imgHeight + 30;
            }
            imgHeight = imgHeight - 155;
        }
        $scope.imgHeight = {
            height: imgHeight + "px"
        };
    };

    $scope.getExtJambs = function() {
        var deferred = $q.defer();
        var fireRating = $scope.selectedValues ? $scope.selectedValues.fireRating : "";
        var specGroup = $scope.selectedValues ? $scope.selectedValues.specialGroup : "";
        fbLoading.showWhile(fbExtDoors.GetJambFilters(fireRating, specGroup, $scope.selectedManufacturer.ManufacturerID)).then(function(jambs) {
            $scope.jambTree = jambs;
            $scope.currentJamb = $scope.jambTree[0];
            var width = $scope.currentJamb.widths[0].width;

            $scope.selectedValues = {
                width: $scope.defaultWidth,
                type: $scope.currentJamb.doorTypes[0].type,
                doorHanding: "Left Hand",
                height: $scope.defaultHeight,
                jambWidth: width,
                jambType: $scope.currentJamb.jambType,
                accessory: '-1',
                surface: 'Textured',
                sillType: $scope.sillType,
                specialGroup: $scope.door.specialGroup,
                fireRating: $scope.door.fireRating,
                glass: $scope.door.glass.length > 0 ? $scope.door.glass[0] : null
            };
            if ($scope.door.caming && $scope.door.caming.length > 0) {
                $scope.selectedValues.caming = $scope.door.caming[0];
            }
            $scope.selectedValues.doorSwing = inSwing;
            $scope.selectedValues.doorHanding = leftHanding;
            $scope.setSwingImage();

            $scope.getAvailableSills().then(function() {
                $scope.getHingeTypes().then(function() {
                    deferred.resolve();
                });
            });
            $scope.getImgHeight();
        });
        return deferred.promise;
    };

    $scope.getExtJambs("Single");

    $scope.getAvailableSills = function() {
        var deferred = $q.defer();
        fbLoading.showWhile(fbExtDoors.GetAvailableSills($scope.thisItem.SelectedManufacturerId,
            $scope.selectedValues.doorSwing,
            $scope.selectedValues.jambWidth,
            $scope.door ? $scope.door.fireRating : null,
            $scope.door ? $scope.door.specialGroup : null)).then(function(sills) {

            if (!$scope.sillType && sills.length > 0) {
                $scope.selectedValues.sillType = sills[0];
            }

            $scope.availableSills = sills;

            if (!initialCallNotNeeded) {
                $scope.getPrices();
            }

            $scope.$apply();
            deferred.resolve();
        }, function(message) {
            console.log(message);
            deferred.resolve();
        });
        return deferred.promise;
    };

    $scope.changeJambWidth = function() {
        $scope.getAvailableSills();
    };

    $scope.getSill = function() {
        var jsonData = JSON.stringify({
            width: $scope.selectedValues.jambWidth,
            name: $scope.sillType,
            type: $scope.selectedValues.type
        });
        fbLoading.showWhile(fbExtDoors.GetSill($scope.selectedValues.jambWidth, $scope.sillType, $scope.selectedValues.type)).then(function(sill) {
            $scope.currentSill = sill;
            $scope.$apply();
        }, function(message) {
            console.log(message);
        });
    };

    $scope.showSidelitePanel = function(toggle) {
        if ($scope.showingSidelitePanel !== true) {
            $scope.showingSidelitePanel = toggle;
            if (toggle === true) {
                $scope.getAllSidelites();
            }
        }
    };

    $scope.closeSidelight = function() {
        $scope.showingSidelitePanel = false;
    };

    $scope.currentPage = 0;
    $scope.pageSize = 20;

    $scope.pageUp = function() {
        var length = $scope.availableSidelites.length;
        if ($scope.currentPage < (length / $scope.pageSize)) {
            $scope.currentPage++;
        }
    };

    $scope.pageDown = function() {
        var length = $scope.availableSidelites.length;
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };

    $scope.changeSideliteDirection = function(direction, $event) {
        $event.stopPropagation();
        $scope.selectedSideliteDirection = direction;
    };

    $scope.addSidelites = function(lite, $event) {
        $event.stopPropagation();
        if ($scope.selectedSideliteDirection == "Left") {
            $scope.leftSidelite = lite;
            $scope.rightSidelite = null;
        }
        if ($scope.selectedSideliteDirection == "Right") {
            $scope.leftSidelite = null;
            $scope.rightSidelite = lite;
        }
        if ($scope.selectedSideliteDirection == "Both") {
            $scope.leftSidelite = lite;
            $scope.rightSidelite = lite;
        }
        $scope.showSidelitePanel(false);
        $scope.getImgHeight();
        $scope.UpdatePrice();
        $('#mainView').scrollTop(0);
    };

    $scope.getPhotoSuffix = function(photoName) {
        if ($scope.orderAcc && $scope.orderAcc.accessories && $scope.orderAcc.accessories.boreOptions) {
            var bolt = $scope.orderAcc.accessories.boreOptions.filter(function(item) {
                if (item.PreviewModifier !== undefined && item.PreviewModifier !== null && item.PreviewModifier.toLowerCase().indexOf("dead bolt") >= 0) {
                    return true;
                }
            });
            if (bolt.length > 0) {
                var values = photoName.split('.');
                var newString = values[0] + "_DB." + values[1];
                return newString;
            }
        }
        return photoName;
    };

    $scope.getAllSidelites = function($event) {
        if ($event) {
            $event.stopPropagation();
        }
        fbLoading.showWhile(fbExtDoors.GetAllSidelites(item.SelectedManufacturerId,
            $scope.selectedValues.height, $scope.door.species, $scope.door.manufacturer)).then(function(json) {

            $scope.availableSidelites = json.sidelites;
            $scope.names = JSON.parse(json.filters.filters);

            if ($scope.door.glass[0] !== '') {
                $scope.filters.glass = $scope.door.glass[0];
            }

            $scope.$apply();
            $.material.init();
        }, function(message) {
            console.log(message);
        });
    };

    $scope.getSidelites = function() {
        var jsonData = JSON.stringify({
            doorId: $scope.DoorID
        });
        fbLoading.showWhile(fbExtDoors.GetSidelites($scope.DoorID)).then(function(lites) {
            $scope.availableSidelites = lites;
            $scope.UpdatePrice();
            $scope.$apply();
        }, function(message) {
            console.log(message);
        });
    };

    $scope.filters = {};

    $scope.FilterChange = function(treeName, selectedItem) {
        if ($scope.filters[treeName] == selectedItem) {
            delete $scope.filters[treeName];
        } else {
            $scope.filters[treeName] = selectedItem;
        }
    };

    $scope.clearFilters = function() {
        $scope.filters = {};
    };

    $scope.showFilters = {};

    $scope.toggleShowAll = function(filterType) {
        if ($scope.showFilters[filterType]) {
            $scope.showFilters[filterType] = null;
        } else {
            $scope.showFilters[filterType] = true;
            $scope.setMaterialInit();
        }
    };

    $scope.getFilterLimit = function(filterType) {
        if ($scope.showFilters[filterType]) {
            return 1000;
        } else {
            return 5;
        }
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

    $scope.changeJambType = function() {
        var jamb;
        for (var i in $scope.jambTree) {
            jamb = $scope.jambTree[i];
            if (jamb.jambType == $scope.selectedValues.jambType) {
                $scope.currentJamb = jamb;
                if (jamb.widths.indexOf($scope.selectedValues.jambWidth) == -1) {
                    $scope.selectedValues.jambWidth = jamb.widths[0].width;
                }
                break;
            }
        }
        $scope.getPrices();
    };

    $scope.getCurrentJambPicName = function() {
        var filteredDoorTypeArray = $scope.currentJamb.doorTypes.filter(function(thisItem) {
            return thisItem.type == $scope.selectedValues.type;
        });
        return filteredDoorTypeArray.length > 0 ? filteredDoorTypeArray[0].jambPic : '';
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
        //$scope.$apply();
    });

    $scope.UpdatePrice = function() {
        var priceEach = 0;
        var price = 0;
        if ($scope.door !== undefined && $scope.door.price !== undefined && $scope.door.price != doorNotExists) {
            priceEach += $scope.door.price;
        }
        if ($scope.currentJamb !== undefined && $scope.currentJamb.price != doorNotExists) {
            price = $scope.currentJamb.price;
            if ($scope.leftSidelite && $scope.rightSidelite) {
                if ($scope.currentJamb.doubleSideliteAdd) {
                    price += $scope.currentJamb.doubleSideliteAdd;
                }
            } else if ($scope.leftSidelite || $scope.rightSidelite) {
                if ($scope.currentJamb.sideliteAdd) {
                    price += $scope.currentJamb.sideliteAdd;
                }
            }
            priceEach += price;
        }
        if ($scope.leftSidelite) {
            priceEach += $scope.leftSidelite.price;
        }
        if ($scope.currentSill) {
            price = $scope.currentSill.price;
            if ($scope.leftSidelite && $scope.rightSidelite) {
                if ($scope.currentSill.twoSideliteAdd) {
                    price += $scope.currentSill.twoSideliteAdd;
                }
            } else if ($scope.leftSidelite || $scope.rightSidelite) {
                if ($scope.currentSill.oneSideliteAdd) {
                    price += $scope.currentSill.oneSideliteAdd;
                }
            }
            priceEach += price;
        }
        if ($scope.rightSidelite) {
            priceEach += $scope.rightSidelite.price;
        }
        if ($scope.selectedHingeColor) {
            priceEach += Number($scope.selectedHingeColor.Price);
        }
        var currentAccessoryPrice = 0.00;
        var allAccessories = $scope.consolidateAccessories();
        if (allAccessories.length > 0) {
            for (var i = 0; i < allAccessories.length; i++) {
                currentAccessoryPrice += Number(allAccessories[i].Price);
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
        var dWidth;
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
        $scope.getImgHeight();
        $scope.changeJambType();
        $scope.setSwingImage();
        $scope.getHingeTypes();
        $scope.getDoorDefaults();
        $scope.UpdatePrice();
    };

    $scope.defaultWidth = '';
    $scope.defaultHeight = '';

    if ($scope.door !== undefined) {
        var filteredWidthArray = $scope.door.singleWidths.filter(function(widthItem) {
            return widthItem == "3'0";
        });
        $scope.defaultWidth = filteredWidthArray.length > 0 ? filteredWidthArray[0] : $scope.door.singleWidths[0];

        var filteredHeightArray = $scope.door.height.filter(function(heightItem) {
            return heightItem == "6'8";
        });
        $scope.defaultHeight = filteredHeightArray.length > 0 ? filteredHeightArray[0] : $scope.door.height[0];
    }

    $scope.isSillBronze = function() {
        if ($scope.currentSill !== undefined && $scope.currentSill.name !== undefined && $scope.currentSill.name.indexOf("Bronze") == -1) {
            return false;
        } else {
            return true;
        }
    };

    $scope.clearSidelites = function() {
        $scope.leftSidelite = null;
        $scope.rightSidelite = null;
        $scope.getImgHeight();
        $scope.UpdatePrice();
    };

    $scope.getPrices = function() {
        var jsonData = JSON.stringify({
            door: $scope.door,
            parameters: $scope.selectedValues,
            sill: $scope.currentSill
        });
        fbLoading.showWhile(fbExtDoors.PriceDoor($scope.door, $scope.selectedValues, $scope.currentSill)).then(function(pricing) {
            if (pricing.door) {
                var reloadJambs = false;
                $scope.door.price = pricing.door.price;
                $scope.door.photoName = pricing.door.photoName;
                $scope.selectedValues.surface = pricing.door.surface;
                if ($scope.addMode === true && $scope.door.fireRating != pricing.door.fireRating) {
                    $scope.door.fireRating = pricing.door.fireRating;
                    $scope.getHingeTypes();
                    reloadJambs = true;
                }
                $scope.selectedValues.fireRating = $scope.door.fireRating;
                if ($scope.addMode === true && $scope.selectedValues.specialGroup != pricing.door.specialGroup) {
                    $scope.door.specialGroup = pricing.door.specialGroup;
                    reloadJambs = true;
                }
                if ($scope.selectedValues.specialGroup != $scope.door.specialGroup) {
                    $scope.selectedValues.specialGroup = $scope.door.specialGroup;
                    $scope.getHingeTypes();
                    reloadJambs = true;
                }

                $scope.DoorID = pricing.door.ExteriorDoorID;
                $scope.door.species[0] = pricing.door.species;
                $scope.door.manufacturer = pricing.door.manufacturer;
                if (reloadJambs === true) {
                    $scope.getExtJambs();
                    $scope.refreshAllAccessories();
                }
            } else {
                $scope.door.price = doorNotExists;
                $scope.door.photoName = '';
                $scope.DoorID = null;
            }
            if (pricing.jamb) {
                $scope.currentJamb.price = pricing.jamb.price;
                $scope.currentJamb.doubleSideliteAdd = pricing.jamb.doubleSideliteAdd;
                $scope.currentJamb.sideliteAdd = pricing.jamb.sideliteAdd;
                //$scope.selectedValues.jambWidth = $scope.currentJamb.widths[0];
                $scope.JambID = pricing.jamb.ExteriorJambID;
            } else {
                $scope.currentJamb.price = doorNotExists;
                $scope.JambID = null;
            }
            if (pricing.sill) {
                $scope.currentSill = pricing.sill;
                //  $scope.setSillColor()
            }
            $scope.UpdatePrice();
            $scope.$apply();
        });
    };

    $scope.AddOrderOne = window.AddOrderOne;
    $scope.AddOrderTwo = window.AddOrderTwo;
    $scope.AddOrderThree = window.AddOrderThree;

    $scope.OrderDetails = item.OrderDetails;
    $scope.SelectedCustomer = item.SelectedCustomer;
    $scope.SelectedDoorQuote = item.SelectedDoorQuote;
    $scope.buildOrderTrees($scope.OrderDetails);
    $scope.FilterOrder = {
        OrderType: parseInt($scope.AddOrderOne),
        DoorQuoteID: ($scope.SelectedDoorQuote === null || $scope.SelectedDoorQuote === undefined) ? 0 : $scope.SelectedDoorQuote.DoorQuoteID
    };

    $scope.SetCurrentOrderType = function(currentOrderType) {
        $scope.FilterOrder.OrderType = parseInt(currentOrderType);
    };



    $scope.Order = {
        UserID: localStorage.getItem("userID"),
        DoorID: 0,
        DoorQuoteID: ($scope.SelectedDoorQuote === null || $scope.SelectedDoorQuote === undefined) ? 0 : $scope.SelectedDoorQuote.DoorQuoteID,
        LDoorQuoteID: ($scope.SelectedDoorQuote === null || $scope.SelectedDoorQuote === undefined) ? 0 : $scope.SelectedDoorQuote.id,
        JambID: null,
        LeftSideliteID: null,
        RightSideliteID: null,
        PriceEach: 0,
        Quantity: 1,
        TotalPrice: 0,
        IsLeftHand: true,
        OrderType: $scope.CurrentOrderType
    };

    $scope.GeneratePdf = function() {
        //GeneratePdfService($scope, GeneratePdfUrl);
    };

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

    $scope.selectedValues = {};

    $scope.ExteriorOrderAccessorySearch = {
        accessoryName: '',
        height: '',
        type: ''
    };

    $scope.availableAccessories = [];
    $scope.availableBoreAccessories = [];
    $scope.availablePrepAccessories = [];
    $scope.availableMiscAccessories = [];
    $scope.availableJambAccessories = [];
    $scope.orderAcc = {};
    $scope.orderAcc.accessories = [];
    $scope.$watch('selectedValues.jambType', function() {
        $scope.refreshAccessories('', 'Jamb');
    });

    $scope.availableHingeTypes = {};

    $scope.getHingeTypes = function() {
        var deferred = $q.defer();
        fbLoading.showWhile(fbExtDoors.GetHingeNames($scope.selectedManufacturer.name,
            $scope.selectedValues.type,
            $scope.door.fireRating,
            $scope.door.specialGroup)).then(function(response) {
            $scope.availableHingeTypes = response;
            $scope.selectedHingeType = response[0];
            $scope.$apply();
            $scope.getHingeColors().then(function() {

                deferred.resolve();
            });

        });
        return deferred.promise;
    };

    $scope.changeHingeColor = function(acc) {
        $scope.selectedHingeColor = acc;
        $scope.UpdatePrice();
    };

    $scope.getHingeColors = function() {
        var deferred = $q.defer();
        fbLoading.showWhile(fbExtDoors.GetHingeColors($scope.selectedManufacturer.name,
            $scope.selectedHingeType,
            $scope.selectedValues.type,
            $scope.door.fireRating,
            $scope.door.specialGroup,
            $scope.selectedValues.height)).then(function(response) {

            $scope.availableHingeAccessories = response;
            $scope.changeHingeColor(response[0]);
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
        $scope.ExteriorOrderAccessorySearch = {};
        $scope.ExteriorOrderAccessorySearch.accessoryName = accessoryName;
        $scope.ExteriorOrderAccessorySearch.height = $scope.selectedValues.height;
        $scope.ExteriorOrderAccessorySearch.type = $scope.selectedValues.type;
        $scope.ExteriorOrderAccessorySearch.accessoryType = accessoryType;
        $scope.ExteriorOrderAccessorySearch.jambType = $scope.selectedValues.jambType;
        $scope.ExteriorOrderAccessorySearch.distributor = $scope.selectedManufacturer.name;
        if ($scope.door && $scope.door.fireRating) {
            $scope.ExteriorOrderAccessorySearch.fireRating = $scope.door.fireRating;
        }
        if ($scope.door && $scope.door.specialGroup) {
            $scope.ExteriorOrderAccessorySearch.specialGroup = $scope.door.specialGroup;
        }
        if (accessoryType != "Jamb" || $scope.ExteriorOrderAccessorySearch.jambType) {
            fbLoading.showWhile(fbExtDoors.GetAccessories($scope.ExteriorOrderAccessorySearch)).then(function(response) {

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
                    $scope.availableMiscAccessories = filteredArray;
                } else {
                    $scope.availableAccessories = filteredArray;
                }

                if (!$scope.CurrentOrder) {
                    $scope.getDefaultAccessories(filteredArray, accessoryType);
                }
            });
        }
    };

    $scope.refreshAccessories('', 'Hinge');
    $scope.getDoorDefaults();
    // End ======================================================= Accessories ===================================================


    $scope.AddToOrder = function(selected) {
        if ($scope.IsValidOrder()) {
            $scope.Order.ExtDoorID = $scope.DoorID;
            $scope.Order.ExtJambID = $scope.JambID;
            if ($scope.leftSidelite) {
                $scope.Order.LeftSideliteID = $scope.leftSidelite.SideliteID;
            } else {
                $scope.Order.LeftSideliteID = null;
            }
            if ($scope.rightSidelite) {
                $scope.Order.RightSideliteID = $scope.rightSidelite.SideliteID;
            } else {
                $scope.Order.RightSideliteID = null;
            }
            $scope.Order.SillID = $scope.currentSill.ExteriorSillID;
            $scope.Order.PriceEach = $scope.priceEach;
            $scope.Order.Quantity = $scope.Quantity;
            $scope.Order.HingeType = $scope.selectedHingeType;
            $scope.Order.HingeColor = $scope.selectedHingeColor.colorName + " " + $scope.selectedHingeColor.colorCode;
            $scope.Order.TotalPrice = $scope.totalPrice;
            $scope.Order.IsLeftHand = $scope.selectedValues.doorHanding == "Left Hand";
            $scope.Order.OrderType = selected;
            $scope.Order.DoorSwing = $scope.selectedValues.doorSwing;
            var jsonData = JSON.stringify({
                order: $scope.Order,
                style2Id: $scope.thisItem.Styles2Item.Styles2ID,
                productTypeId: $scope.thisItem.ProductTypeItem.ProductTypeID,
                userId: localStorage.getItem("userID"),
                accessories: $scope.consolidateAccessories()
            });
            fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
                fbLoading.showWhile(fbExtDoors.AddToOrder($scope.Order, $scope.thisItem.Styles2Item.Styles2ID,
                    $scope.thisItem.ProductTypeItem.ProductTypeID, user.UserID, $scope.consolidateAccessories())).then(function(response) {
                    $scope.$apply(function() {
                        $scope.OrderDetails.push(response);
                        $scope.thisItem.OrderDetails = $scope.OrderDetails;
                        selectedProductType.setSelectedStyles2($scope.thisItem);
                        $scope.buildOrderTrees($scope.OrderDetails);
                    });
                    toastr.success('Order added successfully');
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
        if (orderDetail.productType == "Exterior") {
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
                    $scope.getExtJambs().then(function() {
                        for (var i in $scope.jambTree) {
                            var jamb = $scope.jambTree[i];
                            if (jamb.jambType == selectedOrder.JambType) {
                                $scope.currentJamb = jamb;
                                break;
                            }
                        }

                        $scope.door = leaf[0];
                        $scope.selectedValues.width = selectedOrder.Width;
                        $scope.selectedValues.type = selectedOrder.DoorType;
                        $scope.selectedValues.doorHanding = selectedOrder.DoorHanding;
                        $scope.selectedValues.height = selectedOrder.Height;
                        $scope.selectedValues.sillType = selectedOrder.sill.name;
                        $scope.leftSidelite = selectedOrder.leftSidelite;
                        $scope.rightSidelite = selectedOrder.rightSidelite;
                        $scope.getImgHeight();
                        $scope.selectedValues.doorSwing = selectedOrder.DoorSwing;

                        if (selectedOrder.JambType !== null) {
                            $scope.selectedValues.jambWidth = selectedOrder.JambWidth;
                            $scope.selectedValues.jambType = selectedOrder.JambType;
                        } else {
                            $scope.selectedValues.jambWidth = -1;
                            $scope.selectedValues.jambType = -1;
                        }

                        $scope.breakOutAccessories(selectedOrder.ExtAccessories);

                        $scope.FilterOrder.OrderType = selectedOrder.OrderType;
                        $scope.Quantity = selectedOrder.Quantity;
                        $scope.door.price = selectedOrder.DoorPrice;
                        $scope.currentJamb.price = selectedOrder.JambPrice;
                        var hingeColors = $scope.availableHingeAccessories.filter(function(acc) {
                            if (selectedOrder.HingeColor.indexOf(acc.colorName) >= 0) {
                                return true;
                            }
                        });
                        if (hingeColors.length > 0) {
                            $scope.selectedHingeColor = hingeColors[0];
                        }
                        $scope.selectedHingeType = selectedOrder.HingeType;

                        $scope.getPrices();
                        //      $scope.ChangeDoorType(selectedOrder.DoorType);
                    });
                });
            }
        }
    };

    $scope.breakOutAccessories = function(accessories) {

        var jambOpts = accessories.filter(function(obj) {
            var match = false;
            if (obj.AccessoryType == "Jamb") {
                match = true;
            }
            return match;
        });
        $scope.orderAcc.accessories.jambOptions = jambOpts;

        var hingeOpts = accessories.filter(function(obj) {
            var match = false;
            if (obj.AccessoryType == "Hinge") {
                match = true;
            }
            return match;
        });
        $scope.orderAcc.accessories.hingeAccessory = hingeOpts;

        var boreOptions = accessories.filter(function(obj) {
            var match = false;
            if (obj.AccessoryType == "Bore") {
                match = true;
            }
            return match;
        });
        $scope.orderAcc.accessories.boreOptions = boreOptions;

        var prepOptions = accessories.filter(function(obj) {
            var match = false;
            if (obj.AccessoryType == "Special Prep") {
                match = true;
            }
            return match;
        });
        $scope.orderAcc.accessories.prepOptions = prepOptions;

        var miscOptions = accessories.filter(function(obj) {
            var match = false;
            if (obj.AccessoryType == "Misc") {
                match = true;
            }
            return match;
        });
        $scope.orderAcc.accessories.miscOptions = miscOptions;

    };

    $scope.UpdateOrder = function($event) {
        if ($scope.IsValidOrder()) {

            $scope.Order.ExtDoorID = $scope.DoorID;
            $scope.Order.ExtOrderID = $scope.CurrentOrder.OrderID;
            $scope.Order.ExtJambID = $scope.JambID;
            if ($scope.leftSidelite) {
                $scope.Order.LeftSideliteID = $scope.leftSidelite.SideliteID;
            } else {
                $scope.Order.LeftSideliteID = null;
            }
            if ($scope.rightSidelite) {
                $scope.Order.RightSideliteID = $scope.rightSidelite.SideliteID;
            } else {
                $scope.Order.RightSideliteID = null;
            }
            $scope.Order.id = $scope.CurrentOrder.LOrderID;
            $scope.Order.SillID = $scope.currentSill.ExteriorSillID;
            $scope.Order.AccessoryID = $scope.AccessoryID;
            $scope.Order.PriceEach = $scope.priceEach;
            $scope.Order.Quantity = $scope.Quantity;
            $scope.Order.TotalPrice = $scope.totalPrice;
            $scope.Order.HingeType = $scope.selectedHingeType;
            $scope.Order.HingeColor = $scope.selectedHingeColor.colorName + " " + $scope.selectedHingeColor.colorCode;
            $scope.Order.IsLeftHand = $scope.selectedValues.doorHanding == "Left Hand";
            $scope.Order.OrderType = $scope.CurrentOrder.OrderType;
            $scope.Order.DoorQuoteID = $scope.CurrentOrder.DoorQuoteID;
            $scope.Order.DoorSwing = $scope.selectedValues.doorSwing;
            fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
                fbLoading.showWhile(fbExtDoors.UpdateOrder($scope.Order, $scope.thisItem.Styles2Item.Styles2ID,
                    $scope.thisItem.ProductTypeItem.ProductTypeID, user.UserID, $scope.consolidateAccessories())).then(function(response) {

                    $scope.$apply(function() {
                        //$scope.reloadOrders();
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
        if ($scope.DoorID === null) {
            toastr.error("Please select door");
            response = false;
        }
        return response;
    };

    if (initialCallNotNeeded) {
        var currentOrderDetail = $scope.thisItem.SelectedOrderToUpdate;
        $scope.thisItem.SelectedOrderToUpdate = {};
        selectedProductType.setSelectedStyles2($scope.thisItem);
        $scope.GetOrderService(currentOrderDetail);
    }

});
