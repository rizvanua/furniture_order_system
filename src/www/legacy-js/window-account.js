var isEditMode = false;
var mainQuote = null;
var mf_info = null;
var finTypes = null;
var autoSaver = null;
var selectedCustomer = null;
var isAutoSaving = null;
var userInfo = null;

function getMfInfo(mf) {
    for (var i in mf_info) {
        var info = mf_info[i];
        if (info.manufacturer == mf) {
            return info;
        }
    }
}

function loadQuote(quoteID) {
    ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_WINDOW_SVC.GetQuote(quoteID)).then(function(jsonQuote) {
        if (jsonQuote === null || jsonQuote === "") {
            mainQuote = new Quote();
            mainQuote.id = quoteID;
            if (jsonQuote.LcustomerId) {
                selectedCustomerId = jsonQuote.LcustomerId;
            }
            mainQuote.LcustomerId = selectedCustomerId;

            ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_USER_SVC.CurrUser()).then(function(user) {
                ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_WINDOW_SVC.SaveQuote(mainQuote.id, JSON.stringify(mainQuote),
                    user.UserID, mainQuote.id, mainQuote.WebQuoteID)).then(function(order) {

                    mainQuote.id = order;
                    localStorage.setItem("currentQuoteId", (Config.API.getMode() === Config.API.Modes.OFFLINE) ? mainQuote.id : mainQuote.WebQuoteID);
                    selectedLineItem = 0;
                    getUserOrder();

                });
            });
        } else {
            mainQuote = new Quote(jsonQuote);
            isEditMode = true;
            mainQuote.clearEmptyLines();
        }

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

        ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_WINDOW_SVC.GetMfConfig(0, 0)).then(function(info) {
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
                var info_sub = mf_info[0];
                if (info_sub.manufacturer == "Atrium") {
                    mainQuote.createWindowOrder(info_sub.manufacturer, info_sub.lines[[Object.keys(info_sub.lines)[2]]].name, info_sub);
                } else {
                    mainQuote.createWindowOrder(info_sub.manufacturer, info_sub.lines[[Object.keys(info_sub.lines)[0]]].name, info_sub);
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
        });

    });
}

function setCustomerHeader(quote) {
    var customerId;
    if (quote) {
        customerId = quote.LcustomerId;
    } else {
        customerId = selectedCustomerId;
    }
    ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_USER_SVC.GetCustomer(customerId, quote.customerID)).then(function(customer) {
        var headLine = customer.name;
        var quoteLine = " - ";
        if (quote) {
            if (quote.job && quote.job !== "") {
                quoteLine += " " + quote.job;
            } else {
                quoteLine += " " + quote.id;
            }
            selectedCustomer = customer;
            selectedCustomerId = customerId;
            $('#header-info-customer').html(headLine + quoteLine);
        }
    });
}



function getUserOrder() {
    if (localStorage.getItem("currentQuoteId") && localStorage.getItem("currentQuoteId") !== 0) {
        var quoteID = localStorage.getItem("currentQuoteId");
        loadQuote(quoteID);
    } else {}
    getUserInfo();
}

function setUserHeader(info) {
    var html = "<a><h5><strong>Signed in as: " + info.email + " </strong><span onclick='logout()' style='text-decoration:underline;color:blue;cursor:pointer'>logout</span></h5></a>";
    $('#user-header').html(html);
}

function getUserInfo() {
    ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_USER_SVC.CurrUser()).then(function(info) {
        userInfo = info;
        setUserHeader(info);
    });
}
