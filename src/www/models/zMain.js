Models.Create = function(model, data) {

    var deferred = Q.defer();

    data.Sync = true;

    var rec = new model(data);
    persistence.add(rec);

    persistence.flush(function() {
        deferred.resolve(rec);
    });

    return deferred.promise;

};

Models.Alter = function(model, data) {

    var deferred = Q.defer();

    persistence.transaction(function(tx) {
        model.findBy(tx, 'id', data.id, function(rec) {
            var aData = (data._data !== undefined && data._data !== null) ? data._data : data;
            rec = _.extend(rec, aData);
            rec.Sync = true;
            persistence.flush(tx, function() {
                deferred.resolve(rec);
            });
        });
    });

    return deferred.promise;

};

Models.Delete = function(model, data) {

    var deferred = Q.defer();

    persistence.transaction(function(tx) {
        model.findBy(tx, 'id', data.id, function(rec) {
            rec.Deleted = true;
            rec.Sync = true;
            persistence.flush(tx, function() {
                deferred.resolve(rec);
            });
        });
    });

    return deferred.promise;

};

Models.SyncListTwoWay = [{
    name: "Customers",
    model: Models.Customers,
    index: "CustomerID",
    ref: [],
    dep: [{
        remote: "CustomerID",
        local: "LCustomerID",
        model: Models.DoorQuotes
    }, {
        remote: "CustomerID",
        local: "LCustomerID",
        model: Models.MasterQuote
    }, {
        remote: "customerID",
        trueRemote: "CustomerID",
        local: "LcustomerID",
        model: Models.WebQuotes
    }]
}, {
    name: "MasterQuote",
    model: Models.MasterQuote,
    index: "MasterQuoteID",
    ref: [{
        remote: "CustomerID",
        local: "LCustomerID",
        model: Models.Customers
    }],
    dep: [{
        remote: "MasterQuoteID",
        local: "LMasterQuoteID",
        model: Models.DoorQuotes
    }, {
        remote: "MasterQuoteID",
        local: "LMasterQuoteID",
        model: Models.Settings
    }, {
        remote: "MasterQuoteID",
        local: "LMasterQuoteID",
        model: Models.WebQuotes
    }]
}, {
    name: "DoorQuotes",
    model: Models.DoorQuotes,
    index: "DoorQuoteID",
    ref: [{
        remote: "MasterQuoteID",
        local: "LMasterQuoteID",
        model: Models.MasterQuote
    }, {
        remote: "CustomerID",
        local: "LCustomerID",
        model: Models.Customers
    }],
    dep: [{
        remote: "DoorQuoteID",
        local: "LDoorQuoteID",
        model: Models.ExtOrders
    }, {
        remote: "DoorQuoteID",
        local: "LDoorQuoteID",
        model: Models.SkylightOrders
    }, {
        remote: "DoorQuoteID",
        local: "LDoorQuoteID",
        model: Models.MouldingOrders
    }, {
        remote: "DoorQuoteID",
        local: "LDoorQuoteID",
        model: Models.DeckingOrders
    }, {
        remote: "DoorQuoteID",
        local: "LDoorQuoteID",
        model: Models.SidingOrders
    }, {
        remote: "DoorQuoteID",
        local: "LDoorQuoteID",
        model: Models.DoorOrders
    }, {
        remote: "DoorQuoteID",
        local: "LDoorQuoteID",
        model: Models.OrderNames
    }, {
        remote: "DoorQuoteID",
        local: "LDoorQuoteID",
        model: Models.WebQuotes
    }]
}, {
    name: "RawGlassOrders",
    model: Models.RawGlassOrders,
    index: "OrderID",
    ref: [{
        remote: "DoorQuoteID",
        local: "LDoorQuoteID",
        model: Models.DoorQuotes
    }],
    dep: [{
        remote: "OrderID",
        local: "LOrderID",
        model: Models.RawGlassOrderAddOns
    }]
}, {
    name: "RawGlassOrderAddOns",
    model: Models.RawGlassOrderAddOns,
    index: "OrderAddOnID",
    ref: [{
        remote: "OrderID",
        local: "LOrderID",
        model: Models.RawGlassOrders
    }],
    dep: []
}, {
    name: "ExtOrders",
    model: Models.ExtOrders,
    index: "ExtOrderID",
    ref: [{
        remote: "DoorQuoteID",
        local: "LDoorQuoteID",
        model: Models.DoorQuotes
    }],
    dep: [{
        remote: "ExtOrderID",
        local: "LExtOrderID",
        model: Models.ExtOrderAccessories
    }]
}, {
    name: "SkylightOrders",
    model: Models.SkylightOrders,
    index: "OrderID",
    ref: [{
        remote: "DoorQuoteID",
        local: "LDoorQuoteID",
        model: Models.DoorQuotes
    }],
    dep: []
}, {
    name: "MouldingOrders",
    model: Models.MouldingOrders,
    index: "OrderID",
    ref: [{
        remote: "DoorQuoteID",
        local: "LDoorQuoteID",
        model: Models.DoorQuotes
    }],
    dep: []
}, {
    name: "DeckingOrders",
    model: Models.DeckingOrders,
    index: "OrderID",
    ref: [{
        remote: "DoorQuoteID",
        local: "LDoorQuoteID",
        model: Models.DoorQuotes
    }],
    dep: []
}, {
    name: "SidingOrders",
    model: Models.SidingOrders,
    index: "OrderID",
    ref: [{
        remote: "DoorQuoteID",
        local: "LDoorQuoteID",
        model: Models.DoorQuotes
    }],
    dep: []
}, {
    name: "DoorOrders",
    model: Models.DoorOrders,
    index: "OrderID",
    ref: [{
        remote: "DoorQuoteID",
        local: "LDoorQuoteID",
        model: Models.DoorQuotes
    }],
    dep: [{
        remote: "OrderID",
        local: "LOrderID",
        model: Models.OrderAccessories
    }]
}, {
    name: "OrderNames",
    model: Models.OrderNames,
    index: "OrderNameID",
    ref: [{
        remote: "DoorQuoteID",
        local: "LDoorQuoteID",
        model: Models.DoorQuotes
    }],
    dep: []
}, {
    name: "ExtOrderAccessories",
    model: Models.ExtOrderAccessories,
    index: "OrderAccessoryID",
    ref: [{
        remote: "ExtOrderID",
        local: "LExtOrderID",
        model: Models.ExtOrders
    }],
    dep: []
}, {
    name: "Settings",
    model: Models.Settings,
    index: "SettingID",
    ref: [{
        remote: "MasterQuoteID",
        trueRemote: "MasterQuoteID",
        local: "LMasterQuoteID",
        model: Models.MasterQuote
    }],
    dep: [{
        //    remote: "SettingID",
        //    local: "LSettingID",
        //    model: Models.SettingsLines
    }]
}, {
    name: "OrderAccessories",
    model: Models.OrderAccessories,
    index: "OrderAccessoryID",
    ref: [{
        remote: "OrderID",
        local: "LOrderID",
        model: Models.DoorOrders
    }],
    dep: []
}, {
    name: "OnFactorGroups",
    model: Models.OnFactorGroups,
    index: "OnFactorGroupID",
    ref: [],
    dep: [{
        remote: "OnFactorGroupID",
        local: "LOnFactorGroupID",
        model: Models.SettingsLines
    }]
}, {
    name: "SettingsLines",
    model: Models.SettingsLines,
    index: "SettingsLineID",
    ref: [
        //   {remote: "SettingID",
        //   local: "LSettingID",
        //   model: Models.Settings},
        {
            remote: "OnFactorGroupID",
            local: "LOnFactorGroupID",
            model: Models.OnFactorGroups
        }, {
            remote: "MasterQuoteID",
            local: "LMasterQuoteID",
            model: Models.MasterQuote
        }
    ],
    dep: []
}, {
    name: "WebQuotes",
    model: Models.WebQuotes,
    index: "WebQuoteID",
    ref: [{
        remote: "MasterQuoteID",
        local: "LMasterQuoteID",
        model: Models.MasterQuote
    }, {
        remote: "DoorQuoteID",
        local: "LDoorQuoteID",
        model: Models.DoorQuotes
    }, {
        remote: "customerID",
        trueRemote: "CustomerID",
        local: "LcustomerID",
        model: Models.Customers
    }],
    dep: [{
        remote: "WebQuoteID",
        local: "LWebQuoteID",
        model: Models.WindowOrderNames
    }]
}, {
    name: "WindowOrderNames",
    model: Models.WindowOrderNames,
    index: "WindowOrderNameID",
    ref: [{
        remote: "WebQuoteID",
        local: "LWebQuoteID",
        model: Models.WebQuotes
    }],
    dep: []
}];

Models.SyncListBasic = [{
    name: "Groups",
    model: Models.Groups,
    index: "GroupID"
}, {
    name: "RawGlassAddOns",
    model: Models.RawGlassAddOns,
    index: "AddOnID"
}, {
    name: "RawGlass",
    model: Models.RawGlass,
    index: "RawGlassID"
}, {
    name: "SkylightBlinds",
    model: Models.SkylightBlinds,
    index: "SkylightBlindID"
}, {
    name: "Users",
    model: Models.Users,
    index: "UserID"
}, {
    name: "ExtAccessories",
    model: Models.ExtAccessories,
    index: "ExtAccessoryID"
}, {
    name: "ExtJsonFilters",
    model: Models.ExtJsonFilters,
    index: "ExtJsonFiltersID"
}, {
    name: "ExtJambFilters",
    model: Models.ExtJambFilters,
    index: "ExtJambFiltersID"
}, {
    name: "ExteriorDoor",
    model: Models.ExteriorDoor,
    index: "ExteriorDoorID"
}, {
    name: "ExteriorSill",
    model: Models.ExteriorSill,
    index: "ExteriorSillID"
}, {
    name: "ExteriorJamb",
    model: Models.ExteriorJamb,
    index: "ExteriorJambID"
}, {
    name: "Sidelite",
    model: Models.Sidelite,
    index: "SideliteID"
}, {
    name: "ExtAccessoryModel",
    model: Models.ExtAccessoryModel,
    index: "ExtAccessoryID"
}, {
    name: "LuProductTypes",
    model: Models.LuProductTypes,
    index: "ProductTypeID"
}, {
    name: "LuStyles2",
    model: Models.LuStyles2,
    index: "Styles2ID"
}, {
    name: "LuStyles",
    model: Models.LuStyles,
    index: "StyleID"
}, {
    name: "CompanyProductPermissions",
    model: Models.CompanyProductPermissions,
    index: "CompanyProductID"
}, {
    name: "Companies",
    model: Models.Companies,
    index: "CompanyID"
}, {
    name: "UserGroups",
    model: Models.UserGroups,
    index: "UserGroupID"
}, {
    name: "Mouldings",
    model: Models.Mouldings,
    index: "MouldingID"
}, {
    name: "Skylights",
    model: Models.Skylights,
    index: "SkylightID"
}, {
    name: "Doors",
    model: Models.Doors,
    index: "DoorID"
}, {
    name: "Jambs",
    model: Models.Jambs,
    index: "JambID"
}, {
    name: "Deckings",
    model: Models.Deckings,
    index: "DeckingID"
}, {
    name: "Sidings",
    model: Models.Sidings,
    index: "SidingID"
}, {
    name: "Manufacturers",
    model: Models.Manufacturers,
    index: "ManufacturerID"
}, {
    name: "JsonTrees",
    model: Models.JsonTrees,
    index: "JsonTreeID",
    chunk: 5
}, {
    name: "JsonFilters",
    model: Models.JsonFilters,
    index: "JsonFiltersID",
    chunk: 5
}, {
    name: "LuStyleManufacturer",
    model: Models.LuStyleManufacturer,
    index: "LuStylesManufacturersID"
}, {
    name: "DataPermissions",
    model: Models.DataPermissions,
    index: "DataPermissionID"
}, {
    name: "JambFilters",
    model: Models.JambFilters,
    index: "JambFiltersID"
}, {
    name: "DoorDefaults",
    model: Models.DoorDefaults,
    index: "DoorDefaultID"
}, {
    name: "Accessories",
    model: Models.Accessories,
    index: "AccessoryID"
}, {
    name: "SideliteFilters",
    model: Models.SideliteFilters,
    index: "SideliteFiltersID"
}, {
    name: "EnergyValues",
    model: Models.EnergyValues,
    index: "EnergyValueID"
}];
