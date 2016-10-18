mainApp.directive('ordercard', function($rootScope, selectedProductType, fbWindows, fbManufacturers, fbQuotes, fbMetaData, $state, ModalService, $sanitize, fbLoading, selectedDoor) {
    return {
        restrict: 'E',
        transclude: false,
        scope: {
            orders: '=',
            productItem: '=',
            selectedCustomer: '=',
            customerDoorQuotes: '=',
            selectedMasterQuote: '=',
            reload: '&'
        },
        link: function(scope, element, attrs) {
            scope.BlindImagePath = "http://fbpublicstorage.blob.core.windows.net/uploadfiles/SkylightBlinds/";
            scope.FBConfig = Config;

            var item = selectedProductType.getSelectedStyles2();

            scope.getItemCardText = function(item) {
                var text = item.Distributor;
                if (item.Location) {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.Location;
                }
                if (item.productType == 'Moulding') {
                    text += item.Height + " x " + item.Width + " x " + item.Length + ", " + item.Material;
                }
                if (item.Surface) {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.Surface;
                }

                if (item.Thickness) {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.Thickness;
                }

                if (item.Core) {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.Core;
                }

                if (item.Sticking) {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.Sticking;
                }
                if (item.panelType) {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.panelType;
                }

                if (item.JambWidth) {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.JambWidth;
                }
                if (item.JambType) {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.JambType;
                }
                if (item.DoorHanding) {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.DoorHanding;
                }
                if (item.DoorSwing) {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.DoorSwing;
                }
                if (item.HingeColor) {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.HingeColor;
                }
                if (item.HingeType) {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.HingeType;
                }
                if (item.sill) {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.sill.name;
                }
                if (item.GlassType !== '' && item.GlassType !== undefined) {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.HingeColor;
                }
                if (item.GlassColor !== '' && item.GlassColor !== undefined) {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.GlassColor;
                }
                if (item.EnergyPackage !== '' && item.EnergyPackage !== undefined && item.EnergyPackage !== 'N/A') {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.EnergyPackage;
                }
                if (item.Operation !== '' && item.Operation !== undefined) {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.Operation;
                }
                if (item.OperatorType !== '' && item.OperatorType !== undefined && item.OperatorType !== 'None') {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.Operation;
                }
                if (item.Finish !== '' && item.Finish !== undefined) {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.Finish;
                }
                if (item.Color !== '' && item.Color !== undefined && item.productType !== 'Decking') {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.Color;
                }
                if (item.Exposure !== '' && item.Exposure !== undefined) {
                    if (text !== "") {
                        text += ", ";
                    }
                    text += item.Exposure;
                }
                if (item.OutsideCurb) {
                    text += ", outside curb";
                }
                if (item.Accessories) {
                    item.Accessories.forEach(function(acc) {
                        text += ", " + acc.AccessoryName;
                    });
                }

                if (item.ExtAccessories) {
                    item.ExtAccessories.forEach(function(acc) {
                        text += ", " + acc.AccessoryName;
                    });
                }
                return text;
            };

            scope.buildContextMenu = function(order) {
                var html = "<ul id='contextmenu-node'><li class='contextmenu-item'";
                html += 'ng-click="clickedItem1()" ngclipboard data-clipboard-text="' + $sanitize(scope.getItemCardText(order)) + '"> Copy Text </li></ul>';
                scope.contextmenu = html;
                return html;
            };

            scope.clickedItem1 = function() {
                toastr.success("Item copied to clipboard.");
            };

            scope.getSillPrice = function(item) {
                var price = item.sill ? item.sill.price : 0;
                var sls = 0;
                if (item.leftSidelite) {
                    sls++;
                }
                if (item.rightSidelite) {
                    sls++;
                }
                if (sls == 1) {
                    price += item.sill.oneSideliteAdd;
                }
                if (sls == 2) {

                    price += item.sill.twoSideliteAdd;
                }
                return price;
            };

            scope.getJambPrice = function(item) {
                var price = item.JambPrice;
                var sls = 0;
                if (item.leftSidelite) {
                    sls++;
                }
                if (item.rightSidelite) {
                    sls++;
                }
                if (sls == 1) {
                    price += item.JambOneSidelite;
                }
                if (sls == 2) {

                    price += item.JambTwoSidelite;
                }
                return price;
            };


            scope.changeOpenPanel = function(item) {
                if (scope.selectedOptPanel == item) {
                    scope.selectedOptPanel = null;
                } else {
                    scope.selectedOptPanel = item;
                }
            };

            scope.togglePricing = function(order) {
                if (order.showPricing === true) {
                    order.showPricing = false;
                } else {
                    order.showPricing = true;
                }
            };

            scope.itemize = function(order) {
                order.showPricing = true;
                order.itemizePricing = !order.itemizePricing;
            };

            scope.getClasses = function(orderDetail, flipImage) {
                return getImgClassNames(orderDetail, flipImage);
            };

            scope.getBrickMouldingClass = function(orderDetail) {
                var modifiers = scope.getPreviewModifiers(orderDetail);
                if ((orderDetail.Manufacturer != 'Alliance Door' && orderDetail.Manufacturer != 'Wild River')) { //|| $scope.previewModifiers.indexOf('add brickmold') >= 0) {
                    if (modifiers.indexOf('no brickmold') >= 0) {
                        return "";
                    }
                    if (orderDetail.JambType !== undefined && orderDetail.JambType !== null) {
                        if (orderDetail.JambType.toLowerCase().indexOf('primed') >= 0 || orderDetail.JambType.toLowerCase().indexOf('weatherguard') >= 0 || orderDetail.JambType.toLowerCase().indexOf('composite') >= 0) {
                            return 'door-brick-primed-thumb shadow';
                        } else if (orderDetail.JambType == '-1') {
                            return "shadow";
                        } else {
                            return 'shadow door-brick-medium-thumb';
                        }
                    }
                }
            };

            scope.getPreviewModifiers = function(orderDetail) {
                var mods = [];
                if (orderDetail.ExtAccessories) {
                    $.each(orderDetail.ExtAccessories, function(item) {
                        if (item.PreviewModifier && item.PreviewModifier !== '') {
                            mods.push(item.PreviewModifier);
                        }
                    });
                }
                if (orderDetail.Accessories) {
                    $.each(orderDetail.Accessories, function(item) {
                        if (item.PreviewModifier && item.PreviewModifier !== '') {
                            mods.push(item.PreviewModifier);
                        }
                    });
                }
                return mods;
            };

            scope.getFrameClassName = function(orderDetail) {
                return getClassNames(orderDetail);
            };

            scope.cloneOrder = function(order) {
                if (typeof order.items[0] !== 'undefined') {

                    var maxOrder = 1;
                    for (var i in scope.orders) {
                        var ord = scope.orders[i];
                        if (ord.items) {
                            ord.items.forEach(function(ordItem) {
                                if (ordItem.OrderType >= maxOrder) {
                                    maxOrder = ordItem.OrderType + 1;
                                }
                            });
                        }
                    }

                    fbLoading.showWhile(fbQuotes.CloneOrderCard(order, maxOrder)).then(function() {
                        scope.reload();
                    });
                }
            };

            scope.removeOrder = function(order) {
                if (typeof order.items[0] !== 'undefined') {
                    fbLoading.showWhile(fbQuotes.DeleteOrderCard(order)).then(function() {
                        scope.reload();
                    });
                }
            };

            scope.renameOrder = function(order) {
                if (typeof order.items[0] !== 'undefined') {
                    //var name = prompt("Please enter a new name", "");
                    ModalService.showModal({
                        templateUrl: 'components/modals/rename-modal/rename-modal.html',
                        controller: "RenameModalController"
                    }).then(function(modal) {
                        modal.element.modal();
                        modal.close.then(function(name) {
                            if (name !== null && name !== '') {
                                if (order.items[0].ProductTypeID === WindowProductTypeId) {
                                    fbLoading.showWhile(fbQuotes.RenameWindowOrder(order.items[0].LWebQuoteID, order.items[0].DoorQuoteID, name)).then(function() {
                                        scope.reload();
                                    });
                                } else {
                                    fbLoading.showWhile(fbQuotes.RenameOrder(order.items[0].LDoorQuoteID, order.items[0].DoorQuoteID, order.items[0].OrderType, name)).then(function() {
                                        scope.reload();
                                    });
                                }
                            }
                        });
                    });
                }
            };

            scope.removeItem = function(item) {
                fbLoading.showWhile(fbQuotes.DeleteOrder(item)).then(function() {
                    scope.reload();
                });
            };

            scope.cloneItem = function(item) {
                fbLoading.showWhile(fbQuotes.CloneOrder(item)).then(function() {
                    scope.reload();
                });
            };

            scope.getTotalItems = function(order) {
                var total = 0;
                order.items.forEach(function(i) {
                    total += i.Quantity;
                });
                return total;
            };

            scope.AddOrderNotes = function(order) {
                ModalService.showModal({
                    templateUrl: 'components/modals/notes-modal/notes-modal.html',
                    controller: "NotesModalController",
                    inputs: {
                        order: order
                    }
                }).then(function(modal) {
                    modal.element.modal();
                    modal.close.then(function(res) {
                        scope.reload();
                    });
                });
            };

            scope.OverridePrice = function(order) {
                ModalService.showModal({
                    templateUrl: 'components/modals/override-modal/override-modal.html',
                    controller: "OverrideModalController",
                    inputs: {
                        order: order
                    }
                }).then(function(modal) {
                    modal.element.modal();
                    modal.close.then(function(res) {
                        scope.reload();
                    });
                });
            };

            scope.GetSelectedOrder = function(orderDetail) {
                var dQuote = {};
                fbWindows.SetMasterQuote(scope.selectedMasterQuote);
                dQuote.DoorQuoteID = orderDetail.DoorQuoteID;
                dQuote.id = orderDetail.LDoorQuoteID;
                dQuote.LWebQuoteID = orderDetail.LWebQuoteID;
                dQuote.LMasterQuoteID = scope.selectedMasterQuote.id;
                dQuote.MasterQuoteID = scope.selectedMasterQuote.MasterQuoteID;
                var pType = {};
                pType.ProductTypeID = orderDetail.ProductTypeID;
                var isWindowEdit = pType.ProductTypeID == WindowProductTypeId ? true : false;
                fbLoading.showWhile(fbMetaData.GetProductListJSON(dQuote, pType, null, localStorage.getItem("userID"), isWindowEdit)).then(function(response) {
                    var thisItem = {};
                    var pTypeItem = response.ProductTypes.filter(function(product) {
                        if (product.ProductTypeID == orderDetail.ProductTypeID) {
                            return true;
                        }
                    });
                    if (pTypeItem.length > 0) {
                        thisItem.ProductTypeItem = pTypeItem[0];
                    }
                    thisItem.SelectedCustomer = scope.selectedCustomer;
                    thisItem.CustomerDoorQuotes = scope.customerDoorQuotes;
                    thisItem.ProductTypes = response.ProductTypes;
                    var filterStyles2 = response.Styles2.filter(function(sty) {
                        if (sty.Styles2ID === orderDetail.Styles2ID) {
                            return true;
                        }
                    });
                    thisItem.Styles2Item = filterStyles2[0];
                    thisItem.Styles2List = response.Styles2;
                    thisItem.Manufacturers = response.Manufacturers;
                    var mfs = response.Manufacturers.filter(function(item) {
                        if (item.name.toLowerCase() == orderDetail.Distributor.toLowerCase()) {
                            return true;
                        }
                    });
                    if (mfs.length > 0) {
                        thisItem.SelectedManufacturerId = mfs[0].ManufacturerID;
                    }
                    thisItem.SelectedMasterQuote = scope.selectedMasterQuote;
                    thisItem.ProductListJsonString = $.parseJSON((response.ProductListJson !== undefined &&
                        response.ProductListJson !== null && response.ProductListJson !== "") ? response.ProductListJson : "{}");
                    thisItem.StylesList = response.Styles;
                    thisItem.OrderDetails = response.OrderDetails;
                    thisItem.JsonFilterString = $.parseJSON((response.JsonFilterString !== undefined &&
                        response.JsonFilterString !== null && response.JsonFilterString !== "") ? response.JsonFilterString : "{}");
                    thisItem.SelectedOrderToUpdate = orderDetail;
                    thisItem.ManufacturerSettings = response.ManufacturerSettings;
                    var mfSettings = response.ManufacturerSettings.filter(function(setting) {
                        if (setting.ManufacturerID == thisItem.SelectedManufacturerId) {
                            return true;
                        }
                    });
                    if (mfSettings.length > 0) {
                        thisItem.SelectedManufacturerSettings = mfSettings[0];
                    }
                    selectedProductType.setSelectedStyles2(thisItem);
                    if (orderDetail.ProductTypeID == 6) {
                        console.log(orderDetail);
                        localStorage.setItem('currentQuoteId', (Config.API.getMode() === Config.API.Modes.OFFLINE) ? orderDetail.LWebQuoteID : orderDetail.DoorQuoteID);
                        $state.go("windows");
                    }
                    $state.go(thisItem.Styles2Item.Style2.toLowerCase());
                });
            };

            fbLoading.showWhile(fbManufacturers.getAll()).then(function(manufacturers) {
                scope.Manufacturers = manufacturers;
                scope.$apply();
            });


        },
        templateUrl: 'components/directives/order-card/order-card.html'
    };
});
