mainApp.controller("WindowsController", function($scope, $http, $location, selectedProductType, productMetaTree,
    fbProducts, fbUser, fbQuotes, $rootScope, $state, fbMetaData, scopes, fbManufacturers,
    selectedDoor, optimizer, fbIntDoors, fbMoulding, fbSkylight, fbWindows, fbLoading) {

    $scope.FBConfig = Config;
    $scope.isFirstSave = true;

    var item = selectedProductType.getSelectedStyles2();

    $scope.thisItem = item;
    $scope.Quantity = 1;
    $scope.quoteSaved = false;
    $scope.productLineConfig = null;
    $scope.$watch('Quantity', function() {
        setQty(null, $scope.Quantity);
    });

    masterId = item.SelectedMasterQuote.MasterQuoteID;

    $scope.windowTypes = ["Slider", "Single Hung", "Picture", "Casement", "Awning", "Patio Door", "Geo", "Radius"];

    $scope.selectedType = "Slider";

    $scope.subTypes = {
        Picture: ["Picture", "Pic Bay"],
        "Single Hung": ["Single Hung", "Double Hung", "SH Bay","Garden"],
        Slider: ["Slider", "xox", "Slider Fixed", "Double Slider"],
        Casement: ["Casement", "Case Fixed", "Case Bay"],
        Awning: ["Awning"],
        "Patio Door": ["Patio Door", "3 Panel", "4 Panel"],
        Geo: ["Triangle", "Right Tri", "Parallelogram", "Octagon", "Trapezoid", "Gable"],
        Radius: ["Half Round", "Round Top", "Arch Top", "Qtr Round", "Qtr Rnd Top", "Full Round"]
    };

    $scope.locations = ["Kitchen", "Dining room", "Living room", "Den",
        "Bed 1", "Bed 2", "Bed 3", "Bed 4", "Bonus room", "Office",
        "Closet", "Open", "Clerestory", "Laundry", "Mud room", "Garage", "Bath", "Master", "Entry", "Greatroom", "Powder"
    ];

    $scope.obscures = {
        "none": {
            "name": "none",
            "thickness": {
                "num": 0,
                "denom": 1
            }
        },
        "obscure": {
            "name": "p516"
        },
        "obscure_2": {
            "name": "Delta Frost",
            "thickness": {
                "num": 5,
                "denom": 32
            }
        },
        "obscure_3": {
            "name": "Glue Chip",
            "thickness": {
                "num": 1,
                "denom": 8
            }
        },
        "obscure_4": {
            "name": "Narrow Reed",
            "thickness": {
                "num": 5,
                "denom": 32
            }
        },
        "obscure_5": {
            "name": "Rain Glass",
            "thickness": {
                "num": 1,
                "denom": 8
            }
        },
        "obscure_6": {
            "name": "Satin Etch",
            "thickness": {
                "num": 1,
                "denom": 8
            }
        }
    };

    $scope.editGrid = false;

    $scope.selectedLine = {};

    $scope.mfIndex = 1;

    $(document).on('window.linechange', function(arg1, arg2) {
        if ($scope.productLineConfig != arg2) {
            $scope.productLineConfig = arg2;
            $scope.$apply();
        }
    });

    $scope.buildMfPanel = function() {
        $scope.mfInfo = mf_info;
        launchOptions();
        $scope.mfIndex = mfIndex;
        $("#optionModal").modal("show");
        $scope.setMaterial();
    };

    $scope.$on('$locationChangeStart', function(event) {
        if ($scope.quoteSaved === false) {
            console.log("Quote not saved!");
        }
    });

    $scope.getMfsInOrder = function() {
        if (mainQuote) {
            return mainQuote.getMfNamesInOrder();
        }
    };

    $scope.removeWindow = function() {
        removeWindow();
    };

    $scope.changeSelectedOrder = function(mf, line, isVendorCost) {
        changeSelectedLine(mf, line);
        if (!isVendorCost) {
            $scope.togglePricing(true);
        } else {
            $scope.toggleVendorPricing(true);
        }
    };

    $scope.getOrdersByMf = function(mf) {
        if (mainQuote) {
            var orders = mainQuote.getOrdersByMf(mf);
            return orders;
        }
    };

    $scope.isEditMode = function() {
        return isEditMode;
    };

    $scope.isInOrder = function(mf, line) {
        var order = mainQuote.getOrder(mf, line);
        if (order !== null) {
            return true;
        } else {
            return false;
        }
    };


    $scope.getOrder = function(mf, line) {
        return mainQuote.getOrder(mf, line);
    };


    $scope.checkOrderField = function(mf, line, fieldName, value) {
        var order = $scope.getOrder(mf, line);
        if (order) {
            if (order[fieldName] == value) {
                return true;
            }
        }
    };

    $scope.getSelectedWindow = function() {
        var li = getCurrentLineItem();
        if (mainQuote && li) {
            var selectedWindow = li.getWindowById(selectedWindowId);
            return selectedWindow;
        }
    };

    $scope.getGridValue = function() {
        var window = $scope.getSelectedWindow();
        if (window) {
            var gridName = window.gridPattern;
            if (gridName) {
                return gridName;
            }
        }
        return "Grid";

    };

    $scope.showInBuild = function(index) {
        showInBuild(index);
    };

    $scope.getObscureValue = function() {
        var win = $scope.getSelectedWindow();
        if (win) {
            var obs = win.getOption('obscure');
            if (obs && obs.selected) {
                var name = $scope.obscures[obs.priceKey.split('_t')[0]].name;
                if (name) {
                    return name;
                }
            }
        }
        return "OBSCURE";
    };

    $scope.setTemper = function(type) {
        setTemperType(type);
    };

    $scope.getTemperValue = function() {
        var win = $scope.getSelectedWindow();
        if (win) {
            switch (win.temperType) {
                case 'Tempered':
                    return 'Temp-All';
                case 'Tempered Left':
                    return 'Temp-Lft';
                case 'Tempered Right':
                    return 'Temp-Rgt';
                case 'Tempered Top':
                    return 'Temp-Top';
                case 'Tempered Bottom':
                    return 'Temp-Bot';
            }

        }
        return "TEMPER";
    };

    $scope.setLocation = function(loc) {
        locPushed(loc);
    };

    $scope.changeGlobalOpening = function(opening) {
        changeGlobalOpening(opening);
    };

    $scope.changeGridType = function(type) {
        changeGridType(type);
    };

    $scope.changeGlobalGridPattern = function(pattern) {
        changeGlobalGridPattern(pattern);
    };

    $scope.setFrameType = function(frame) {
        setFrameType(frame);
    };

    $scope.getOpeningValue = function() {
        if (mainQuote) {
            var opening = mainQuote.quoteDetails.isNet;
            if (opening) {
                return "Net Opening";
            } else {
                return "Rough Opening";
            }
        }
    };

    $scope.getGridTypeValue = function() {
        if (mainQuote) {
            var typeName = gridType[mainQuote.quoteDetails.gridType];
            if (!typeName || typeName === '') {
                typeName = 'Grid Type';
            }
            return typeName;
        }
    };

    $scope.getGlobalGridPattern = function() {
        if (mainQuote) {
            var pattern = mainQuote.quoteDetails.gridPattern;
            if (!pattern || pattern.toLowerCase() === "none") {
                pattern = "Global Grid";
            }
            return pattern;
        }
    };

    $scope.getGlobalFrame = function() {
        if (mainQuote && finTypes !== null) {
            var frame = finTypes[mainQuote.quoteDetails.finType];
            return frame;
        }
    };

    $scope.getLocationValue = function() {
        if (mainQuote) {
            var line = getCurrentLineItem();
            if (line && line.location && line.location !== '') {
                return line.location;
            }
        }

        return "Location";
    };

    $scope.mapOptSelected = function(mf, line, opt, priceKey) {
        var option = $scope.getMapOption(opt, mf, line);
        if (option && option.selectedKeys.indexOf(priceKey) >= 0) {
            return true;
        }
    };

    $scope.setDynamicOption = function(optionName, optionKey, mf, line, element) {
        setDynamicOption(optionName, optionKey, mf, line, element);
    };

    $scope.togglePricing = function(value) {
        $scope.orderList = mainQuote.windowOrderList;
        togglePricing(value);
    };

    $scope.toggleVendorPricing = function(value) {
        $scope.orderList = mainQuote.windowOrderList;
        toggleVendorCost(value);
    };

    $scope.loadQuote = function(quoteId) {
        fbLoading.showWhile(fbWindows.GetQuote(quoteId)).then(function(jsonQuote) {
            if (jsonQuote === "" || jsonQuote.isNew === true || jsonQuote.windowOrderList === null) {
                if (jsonQuote === "") {
                    jsonQuote = {};
                }
                isEditMode = false;
                mainQuote = new Quote();
                mainQuote.id = (quoteId === "undefined") ? 0 : quoteId;
                if (jsonQuote.LcustomerId) {
                    selectedCustomerId = jsonQuote.LcustomerId;
                }
                if (jsonQuote.customerId) {
                    mainQuote.customerId = jsonQuote.customerId;
                }
                mainQuote.LcustomerId = selectedCustomerId;
                fbLoading.showWhile(fbUser.CurrUser()).then(function(user) {
                    fbLoading.showWhile(fbWindows.SaveQuote(mainQuote.id, JSON.stringify(mainQuote), user.UserID, mainQuote.id, mainQuote.WebQuoteID)).then(function(order) {
                        mainQuote.id = order;
                        localStorage.setItem("currentQuoteId", (Config.API.getMode() === Config.API.Modes.OFFLINE) ? mainQuote.id : mainQuote.WebQuoteID);
                        selectedLineItem = 0;
                        var quoteID = localStorage.getItem("currentQuoteId");
                        getUserInfo();
                    });
                });

            } else {
                mainQuote = new Quote(jsonQuote);
                isEditMode = true;
                mainQuote.clearEmptyLines();
            }

            $scope.orderList = mainQuote.windowOrderList;
            $('#customer-panel').modal('hide');
            if (localStorage.getItem("lineIndex")) {
                selectedLineItem = parseInt(localStorage.getItem("lineIndex"));
                if (!mainQuote.windowOrderList || mainQuote.windowOrderList.length === 0) {
                    selectedLineItem = 0;
                } else {
                    if (selectedLineItem > mainQuote.windowOrderList[0].lineItem.length) {
                        selectedLineItem = 0;
                    }
                }
            }

            fbLoading.showWhile(fbWindows.GetMfConfig($scope.thisItem.SelectedMasterQuote.id, $scope.thisItem.SelectedMasterQuote.MasterQuoteID)).then(function(info) {
                var activeInfos = [];
                finTypes = info.frameTypes;
                setFrameTypeList(finTypes);
                //pick out which manufacturers are currently being used and price them.
                for (var i in info.configs) {
                    var orders = mainQuote.getOrdersByMf(info.configs[i].manufacturer);
                    if (orders && orders.length > 0) {
                        for (var j in orders) {
                            orders[j].calculateOrderPrice(mainQuote.quoteDetails.taxPercentage, null, 1, null, info.configs[i]);
                        }
                        activeInfos.push(info.configs[i]);
                    }
                }

                //mf_info = activeInfos;
                mf_info = info.configs;

                if (!mainQuote.windowOrderList || mainQuote.windowOrderList.length === 0) {
                    var mfInfo = mf_info[0];
                    if (mfInfo.manufacturer == "Atrium") {
                        mainQuote.createWindowOrder(mfInfo.manufacturer, mfInfo.lines[[Object.keys(mfInfo.lines)[2]]].name, mfInfo);
                    } else {
                        mainQuote.createWindowOrder(mfInfo.manufacturer, mfInfo.lines[[Object.keys(mfInfo.lines)[0]]].name, mfInfo);
                    }
                }

                if (mf_info.length > 0) {
                    setMFPanel(mf_info[0], 0);
                    drawLineItemOnCanvas();
                }

                if (localStorage.getItem("cycleItems")) {
                    cycleWindowsOnCanvas();
                    localStorage.removeItem("cycleItems");
                }

                initializePage();

                $scope.$apply();

            });

        });

    };

    $scope.getMapOption = function(opt, mf, line) {
        var order = $scope.getOrder(mf, line);
        if (order && order.mapsOptionList) {
            $.each(order.mapsOptionList, function(index, option) {
                if (option.name == opt.name) {
                    return option;
                }
            });
            if (!opt.isMultiSelect) {
                var mapOpt = new MapsOption(opt);
                order.mapsOptionList.push(mapOpt);
            }
            return opt;
        }
    };

    $scope.setGlassType = function(mf, line) {
        var glass = $scope.getOrder(mf, line).glassType;
        mainQuote.updateGlassType(mf, line, glass);
    };


    $scope.setMaterial = function() {
        setTimeout(function() {
            $.material.init();
        }, 300);
    };

    $scope.ChangeWindowType = function(type) {
        $scope.selectedType = type;
    };

    $scope.addWindow = function(type, subtype) {
        addNewWindow(type, subtype);
    };

    $scope.toggleGridPattern = function(pattern) {
        toggleGrid(pattern);
    };

    $scope.setObscure = function(obscure) {
        setObscure(obscure);
    };

    $scope.changeMfIndex = function(newIndex) {
        $scope.mfIndex = newIndex;
        showNextMf(newIndex);
        $scope.setMaterial();
    };

    $scope.nextLine = function() {
        var qty = nextLine();
        $scope.Quantity = qty;
    };

    $scope.backLine = function() {
        var qty = backLine();
        $scope.Quantity = qty;
    };

    $scope.goToLastLine = function() {
        showLastLine();
    };

    var quoteID = localStorage.getItem("currentQuoteId");

    $scope.loadQuote(quoteID);



});
