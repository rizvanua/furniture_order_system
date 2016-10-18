var selectedCustomerId = null;
var nCustomers = null;
var editQuoteId = null;
var editCustomerId = null;

function launchCustomers(element) {
    var custId = null;
    if (isDemo == "true") {
        return;
    }
    if (!mainQuote) {
        custId = 0;
    } else {
        custId = mainQuote.customerId;
    }
    if (!mainQuote) {
        $('#customer-close').hide();
    } else {
        $('#customer-close').show();
    }

    getCustomers();
    //  setCustomerHeader(mainQuote);
    changeSelectedCustomer(custId, null);
    $('#customer-panel').modal('show');

}

function saveCustomer() {
    var customer = {};
    customer.email = $('#cust-email').val();
    if (editCustomerId) {
        customer.CustomerID = editCustomerId;
        editCustomerId = null;
    }
    customer.UserID = localStorage.getItem("userID");
    customer.name = $('#cust-name').val();
    customer.street = $('#cust-street').val();
    customer.city = $('#cust-city').val();
    customer.state = $('#cust-state').val();
    customer.zip = $('#cust-zip').val();
    customer.phone = $('#cust-phone').val();
    customer.isAutoSaveCustomer = false;
    if (customer.email === "" || customer.name === "") {
        $('#customer-error').html("Customer name and email required");
    } else {
        $('#customer-error').html("");
    }
    /*netSaveCustomer(customer, function(customer) {
        getCustomers();
        changeSelectedCustomer(customer.CustomerID, null);
        $('#myModal').modal('hide');
    });*/
}




function bindCustomerToDialog(customer) {
    editCustomerId = customer.CustomerID;
    customerModal();
    $('#cust-email').val(customer.email);
    $('#cust-name').val(customer.name);
    $('#cust-street').val(customer.street);
    $('#cust-city').val(customer.city);
    $('#cust-state').val(customer.state);
    $('#cust-zip').val(customer.zip);
    $('#cust-phone').val(customer.phone);
}

function newQuote(job, project) {
    //var customer = getCustomerById(selectedCustomerId);
    if (isDemo == "true") {
        return;
    }
    $('.modal-title').html("New quote");
    var html = '<h4 id="modal-heading">Enter quote information</h4><h4><strong>Customer - ' + selectedCustomer.name;
    html += '</strong></h4><input id="job-name" placeholder="Job Name" class="form-control" style="margin-bottom: 10px; font-size: x-large;height: 50px" />';
    html += '<input id="project-name" placeholder="Project Name" class="form-control" style="margin-bottom: 10px; font-size: x-large;height: 50px" />';
    $('#modal-ok-btn').unbind('click');
    $('#modal-ok-btn').on('click', function() {

        if (editQuoteId) {
            var id = editQuoteId;
            var job = $('#job-name').val();
            var project = $('#project-name').val();
            var row = $('#' + editQuoteId);
            //netEditQuote(id, project, job, function() {});
            ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_WINDOW_SVC.EditQuote(id, project, job));
            var jobCell = $(row).children()[1];
            $(jobCell).html(job);
            var rowCell = $(row).children()[2];
            $(rowCell).html(project);
            editQuoteId = null;
        } else {
            mainQuote = new Quote();
            mainQuote.job = $('#job-name').val();
            mainQuote.project = $('#project-name').val();
            mainQuote.customerId = selectedCustomerId;

            ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_WINDOW_SVC.SaveQuote(mainQuote.id,
                JSON.stringify(mainQuote), user.UserID, mainQuote.id, mainQuote.WebQuoteID)).then(function(order) {

                mainQuote.id = order;
                $('#customer-panel').modal('hide');
                localStorage.setItem("currentQuoteId", (Config.API.getMode() === Config.API.Modes.OFFLINE) ? mainQuote.id : mainQuote.WebQuoteID);
                selectedLineItem = 0;
                getUserOrder();
                $('#numpad_value').val("");
                $('#myModal').modal('hide');

            });

        }


    });
    if (!job) {
        job = "";
    }
    if (!project) {
        project = "";
    }

    $('#login-modal-body').html(html);
    $('#project-name').val(project);
    $('#job-name').val(job);
    $('#myModal').modal({
        backdrop: true,
        keyboard: true // to prevent closing with Esc button (if you want this too)
    });
    $('#myModal').modal('show');

}


function customerModal() {
    $('.modal-title').html("New quote");
    var html = '<h4 id="modal-heading">Enter customer information</h4>';
    html += '<input id="cust-name" placeholder="Name" class="form-control" style="margin-bottom: 10px; font-size: x-large;height: 50px" />';
    html += '<input id="cust-email" placeholder="Email" class="form-control" style="margin-bottom: 10px; font-size: x-large;height: 50px" />';
    html += '<input id="cust-phone" placeholder="Phone" class="form-control" style="margin-bottom: 10px; font-size: x-large;height: 50px" />';
    html += '<input id="cust-street" placeholder="Street" class="form-control" style="margin-bottom: 10px; font-size: x-large;height: 50px" />';
    html += '<input id="cust-city" placeholder="City" class="form-control" style="margin-bottom: 10px; font-size: x-large;height: 50px" />';
    html += '<input id="cust-state" placeholder="State" class="form-control" style="margin-bottom: 10px; font-size: x-large;height: 50px" />';
    html += '<input id="cust-zip" placeholder="Zip" class="form-control" style="margin-bottom: 10px; font-size: x-large;height: 50px" />';
    html += '<p style="color:red" id="customer-error"></p>';

    $('#modal-ok-btn').unbind('click');
    $('#modal-ok-btn').on('click', function() {

        saveCustomer();
    });

    $('#login-modal-body').html(html);
    $('#myModal').modal({
        backdrop: true,
        keyboard: true // to prevent closing with Esc button (if you want this too)
    });
    $('#myModal').modal('show');

}


function deleteModalOkay() {
    if (editQuoteId) {
        /*netDeleteQuote(editQuoteId, function() {
            showErrorMessage("Quote deleted");
            $('#' + editQuoteId).remove();
        });*/
        editQuoteId = null;
    } else if (editCustomerId) {
        /*netDeleteCustomer(editCustomerId, function() {
            showErrorMessage("Customer Deleted");
            //   removeCustomerFromLocalList(editCustomerId);
            $('#' + editCustomerId).remove();
            editCustomerId = null;

        });*/
    }
    $('#myModal').modal('hide');
}

function changeSelectedCustomer(customerID, element) {
    selectedCustomerId = customerID;
    bindCustomers(nCustomers);
    fillInCustomerDetails();
    /*netGetQuoteInfoForCustomer(selectedCustomerId, function(json) {
        populateQuoteTable(json);
    });*/
}

function getCustomerById(customerId) {
    for (var i in nCustomers) {
        if (nCustomers[i].CustomerID == customerId) {
            return nCustomers[i];
        }
    }
}


function quoteSelected(quoteId, fromDroid) {
    localStorage.setItem("currentQuoteId", quoteId);
    if (fromDroid) {
        droidDialog.dialog('open');
    } else {
        getUserOrder();
        $('#numpad_value').val("");
        $('#customer-panel').modal('hide');
    }
}

function fillInCustomerDetails() {
    var targetCust = getCustomerById(selectedCustomerId);
    if (targetCust) {
        selectedCustomer = targetCust;
    }
    if (selectedCustomer) {
        var html = selectedCustomer.name + "<br/>" + (selectedCustomer.street === null ? "" : selectedCustomer.street) + "<br />" +
            (selectedCustomer.city === null ? "" : (selectedCustomer.city + ", ")) + (selectedCustomer.state === null ? "" : selectedCustomer.state) +
            "<br/>" + (selectedCustomer.phone === null ? "" : selectedCustomer.phone) + "<br/>" + (selectedCustomer.email === null ? "" : selectedCustomer.email);
        $('#customer_details').html(html);
    } else {
        //  alert("customer not found");
    }
}

function compareCustomer(a, b) {
    if (a.name.toLowerCase() < b.name.toLowerCase())
        return -1;
    if (a.name.toLowerCase() > b.name.toLowerCase())
        return 1;
    return 0;
}

function bindCustomers(customers) {
    var customerColumn = $('#customer_entries');
    var html = "";
    if (customers) {
        customers.sort(compareCustomer);
    }
    customerColumn.html(html);
    // html += '<div id="-1" class="customerRow" onclick="changeSelectedCustomer(-1)" style="padding:10px">Droid Quotes</div>';
    for (var c in customers) {
        if (!selectedCustomerId || selectedCustomerId === 0) {
            selectedCustomerId = customers[c].CustomerID;
            selectedCustomer = customers[c];
            setCustomerHeader();
            /*netGetQuoteInfoForCustomer(selectedCustomerId, function(json) {
                populateQuoteTable(json);
            });*/
        }
        if (selectedCustomerId == customers[c].CustomerID) {
            html += '<div id="' + customers[c].CustomerID + '" class="customerRow Hover" onclick="changeSelectedCustomer(' + customers[c].CustomerID + ')" style="padding:10px;background-color:Gray;Color:White">' + customers[c].name + '</div>';
        } else {
            html += '<div id="' + customers[c].CustomerID + '" class="customerRow Hover" onclick="changeSelectedCustomer(' + customers[c].CustomerID + ')" style="padding:10px">' + customers[c].name + '</div>';
        }
    }
    customerColumn.append(html);
}

function getCustomers() {
    ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_USER_SVC.CurrUser()).then(function(user) {
        ANGULAR_EXTERN_LOADING_SVC.showWhile(ANGULAR_EXTERN_USER_SVC.GetCustomers(user.UserID)).then(function(customers) {
            bindCustomers(customers);
            nCustomers = customers;
            if (!selectedCustomerId) {
                selectedCustomerId = nCustomers[0].id;
            }
        });
    });
}

function ToJavaScriptDate(value) {
    var pattern = /Date\(([^)]+)\)/;
    var results = pattern.exec(value);
    var dt = new Date(parseFloat(results[1]));
    return (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear();
}

function populateQuoteTable(quotes) {
    var table = $('#quoteTable');
    table.html("<tr style='border: 1px solid Black' ><th style='padding:5px'>#</th><th>Job</th><th>Project</th><th>Date</th></tr>");

    var row = "";
    for (var j in quotes) {
        var highlight = "";
        var index = quotes.length - (Number(j) + 1);
        var date = ToJavaScriptDate(quotes[index].createdOn);
        if (mainQuote && quotes[index].id == mainQuote.id) {
            highlight = "style='background-color:Gray;Color:White'";
        }
        row = "<tr id='" + quotes[index].id + "' class='quoteRow Hover' " + highlight + " onclick='quoteSelected(" + quotes[index].id + "," + quotes[index].fromDroid + ")' ><td style='border-bottom: 1px solid Black'>" + quotes[index].id + "</td><td style='padding:5px;border-bottom: 1px solid Black' id='job'>" + (quotes[index].job === null ? "" : quotes[index].job) + "</td><td style='padding:5px;border-bottom: 1px solid Black' id='project'>" + (quotes[index].project === null ? "" : quotes[index].project) + "</td><td style='padding:5px;border-bottom: 1px solid Black'>" + date + "</td></tr>";
        table.append(row);
    }
}

function newCustomer() {
    customerModal();
}
