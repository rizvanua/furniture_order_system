var Config = {
    API: {
        Protocol: "http://",
        //Host: "f4784c9019f24c19855fd8004ce08715.cloudapp.net",
        Host: "fasterbids.com",
        //Host: "fbsync.cloudapp.net",
        //Host: "localhost:8080",
        Base: "",
        Mode: null,
        Modes: {
            ONLINE: 1,
            OFFLINE: 2,
            HYBRID: 3
        }
    },
    Sync: {
        Basic: {
            Interval: 1000 * 10,
            RecordLimit: 2000,
            Tag: 1
        },
        TwoWay: {
            Interval: 1000 * 10,
            RecordLimit: 2000,
            Tag: 2
        },
        Image: {
            BlobHost: "http://fbpublicstorage.blob.core.windows.net",
            Tag: 4,
            Interval: 1000 * 10
        },
        WindowData: {
            Tag: 3,
            Interval: 1000 * 10
        },
        TimeBombLength: 1000 * 60 * 60 * 24 * 14,
        LocalDataUrl: "http://localhost:9898"
    },
    DOM: {
        LoadingOverlay: 'loadingOverlay'
    },
    Paths: {
        ProductImagePath: "http://fbpublicstorage.blob.core.windows.net/uploadfiles/products/",
        ProductTypeImagePath: "http://fbpublicstorage.blob.core.windows.net/uploadfiles/producttypes/",
        DistImagePath: "http://fbpublicstorage.blob.core.windows.net/uploadfiles/Distributors/",
        StyleImagesPath: "http://fbpublicstorage.blob.core.windows.net/uploadfiles/styles/",
        CompanyImagePath: "https://fbpublicstorage.blob.core.windows.net/uploadfiles/CompanyLogos/",
        HandingImagesPath: "http://fbpublicstorage.blob.core.windows.net/uploadfiles/Handing icons/",
        ManufacturerImagePath: "http://fbpublicstorage.blob.core.windows.net/uploadfiles/Manufacturers/",
        WindowIconPath: "assets/img/windows/"
    },
    UPaths: {
        Base: "http://fbpublicstorage.blob.core.windows.net",
        ProductImagePath: "/uploadfiles/products/",
        ProductTypeImagePath: "/uploadfiles/producttypes/",
        DistImagePath: "/uploadfiles/Distributors/",
        StyleImagesPath: "/uploadfiles/styles/",
        CompanyImagePath: "/uploadfiles/CompanyLogos/",
        HandingImagesPath: "/uploadfiles/Handing icons/",
        ManufacturerImagePath: "/uploadfiles/Manufacturers/",
        UIImagePath: "/uploadfiles/UI_Images/",
        WindowIconPath: "/uploadfiles/WindowIcons/"
    },
    DB: {
        ImageDB: {
            Name: "FasterbidsDB",
            Version: 2
        }
    },
    StaticImages: {
        BlackXBtn: null
    },
    Loading: {
        TimeToError: 1000 * 60
    }
};

Config.API.Base = Config.API.Protocol + Config.API.Host;

Config.API.Endpoints = {
    MetaData: {
        GetProductJSON: Config.API.Base + "/door/GetProductJson",
        GetProductListJSON: Config.API.Base + "/door/GetProductListJson",
        GetExtJsonFilters: Config.API.Base + "/ExteriorDoor/getJsonFilters",
        GetTreeAndFilter: Config.API.Base + "/door/GetJsonTreeAndFilter",
        LoadSettings: Config.API.Base + "/door/GetSettings",
        SaveSettings: Config.API.Base + "/door/SaveSettings"
    },
    User: {
        CurrUser: Config.API.Base + "/user/getUserInfo",
        GetPermittedMfs: Config.API.Base + "/user/getUserMfPermissions",
        GetCustomers: Config.API.Base + "/door/GetCustomers",
        SaveCustomer: Config.API.Base + "/website/saveCustomer",
        GetCustomers: Config.API.Base + "/door/GetCustomers",
        SaveCustomer: Config.API.Base + "/website/saveCustomer",
        GetCustomer: Config.API.Base + "/website/getCustomerInfo",
        DeleteCustomer: Config.API.Base + "/website/deleteCustomer",
        Impersonate: Config.API.Base + "/user/Impersonate",
        GetCompleteUserList: Config.API.Base + "/user/GetCompleteUserList"
    },
    Products: {
        GetAllProductTypes: Config.API.Base + "/door/GetAllProductTypes",
        GetProductMetaTree: Config.API.Base + "/door/GetProductMetaTree"
    },
    Quotes: {
        GetAllOrders: Config.API.Base + "/door/GetAllProductsForQuote",
        ManageMasterQuote: Config.API.Base + "/door/AddMasterQuote",
        GetQuote: Config.API.Base + "/door/GetQuote",
        GetSubQuotes: Config.API.Base + "/door/GetSubQuotes",
        GetOrder: Config.API.Base + "/door/GetOrder",
        GetAvailableQuotes: Config.API.Base + "/door/AvailableQuotes",
        OverrideOrderPrice: Config.API.Base + "/door/OverrideOrderPrice",
        SaveNotes: Config.API.Base + "/door/SaveNotes",
        RenameWindowOrder: Config.API.Base + "/door/RenameWindowOrder",
        RenameOrder: Config.API.Base + "/door/RenameOrder",
        CloneOrder: Config.API.Base + "/door/CloneItem",
        CloneOrderCard: Config.API.Base + "/door/CloneOrder",
        DeleteOrder: Config.API.Base + "/door/RemoveItem",
        DeleteOrderCard: Config.API.Base + "/door/RemoveOrder",
        DeleteMasterQuote: Config.API.Base + "/door/DeleteMasterQuote",
        EpicorEagleExport: Config.API.Base + "/Quote/ExportToEagle"
    },
    Manufacturers: {
        GetAvailableStyles: Config.API.Base + "/door/getAvailableStyles",
        getAll: Config.API.Base + "/door/GetAllManufacturers"
    },
    IntDoors: {
        PriceDoor: Config.API.Base + "/door/priceDoor",
        GetJambTree: Config.API.Base + "/door/GetJambTree",
        GetDefaults: Config.API.Base + "/door/getDefaults",
        GetAccessories: Config.API.Base + "/door/GetAccessories",
        GetHingeTypes: Config.API.Base + "/door/getHingeNames",
        GetHingeColors: Config.API.Base + "/door/getHingeColors",
        AddToOrder: Config.API.Base + "/door/AddToOrder",
        UpdateOrder: Config.API.Base + "/door/UpdateOrder"
    },
    ExtDoors: {
        PriceDoor: Config.API.Base + "/ExteriorDoor/priceDoor",
        GetJambFilters: Config.API.Base + "/ExteriorDoor/getExtJambFilters",
        GetAvailableSills: Config.API.Base + "/ExteriorDoor/getAvailableSills",
        GetAllSidelites: Config.API.Base + "/ExteriorDoor/getAllSidelites",
        GetSidelites: Config.API.Base + "/ExteriorDoor/getSidelites",
        GetHingeNames: Config.API.Base + "/ExteriorDoor/getHingeNames",
        GetHingeColors: Config.API.Base + "/ExteriorDoor/getHingeColors",
        GetAccessories: Config.API.Base + "/ExteriorDoor/GetAccessories",
        GetSill: Config.API.Base + "/ExteriorDoor/getSill",
        AddToOrder: Config.API.Base + "/ExteriorDoor/AddToOrder",
        UpdateOrder: Config.API.Base + "/ExteriorDoor/UpdateOrder"
    },
    Moulding: {
        PriceMoulding: Config.API.Base + "/Moulding/priceDoor",
        AddToOrder: Config.API.Base + "/Moulding/AddToOrder",
        UpdateOrder: Config.API.Base + "/Moulding/UpdateOrder"
    },
    Siding: {
        PriceSiding: Config.API.Base + "/Siding/priceDoor",
        AddToOrder: Config.API.Base + "/Siding/AddToOrder",
        UpdateOrder: Config.API.Base + "/Siding/UpdateOrder"
    },
    Decking: {
        PriceDecking: Config.API.Base + "/Decking/priceDoor",
        AddToOrder: Config.API.Base + "/Decking/AddToOrder",
        UpdateOrder: Config.API.Base + "/Decking/UpdateOrder"
    },
    Skylight: {
        PriceSkylight: Config.API.Base + "/Skylight/priceDoor",
        AddToOrder: Config.API.Base + "/Skylight/AddToOrder",
        UpdateOrder: Config.API.Base + "/Skylight/UpdateOrder",
        GetBlinds: Config.API.Base + "/Skylight/GetBlinds"
    },
    Windows: {
        GetQuoteIdFromMasterQuoteId: Config.API.Base + "/Window/getQuoteIdByMaster",
        GetQuote: Config.API.Base + "/Website/getQuote",
        GetMfConfig: Config.API.Base + "/Window/getMFConfig",
        GetDoorDims: Config.API.Base + "/Website/getDoorDimensions",
        GetWindow: Config.API.Base + "/Window/getWindow",
        GetClosestWindow: Config.API.Base + "/Window/getClosestWindow",
        GetClosestDoor: Config.API.Base + "/Window/getClosestDoor",
        EditQuote: Config.API.Base + "/Website/editQuote",
        SaveQuote: Config.API.Base + "/Website/saveQuote"
    },
    Auth: {
        Login: Config.API.Base + "/user/login",
        Forgot: Config.API.Base + "/user/forgotpassword",
        Reset: Config.API.Base + "/user/resetpassword"
    },
    RawGlass: {
        PriceGlass: Config.API.Base + "/RawGlass/PriceGlass",
        GetAddOns: Config.API.Base + "/RawGlass/GetGlassAddOns",
        AddToOrder: Config.API.Base + "/RawGlass/AddToOrder",
        UpdateOrder: Config.API.Base + "/RawGlass/UpdateOrder",
        GetOrder: Config.API.Base + "/RawGlass/GetOrder"
    },
    CompanyAdmin: {
        NewUser: Config.API.Base + "/CompanyAdmin/CreateUser",
        AllCompanyInfo: Config.API.Base + "/CompanyAdmin/GetCompanyInfo",
        EditCompany: Config.API.Base + "/CompanyAdmin/EditCompanyInfo",
        DeleteGroup: Config.API.Base + "/CompanyAdmin/Delete",
        NewGroup: Config.API.Base + "/CompanyAdmin/CreateGroup",
        DeleteUser: Config.API.Base + "/CompanyAdmin/DeleteUser",
        GetSettings: Config.API.Base + "/CompanyAdmin/GetSettings",
        SaveSettings: Config.API.Base + "/CompanyAdmin/SaveSettings"
    },
    SuperAdmin: {
        Companies: Config.API.Base + "/SuperAdmin/Companies",
        DataPermissions: Config.API.Base + "/SuperAdmin/DataPermissions",
        ExportStatus: Config.API.Base + "/SuperAdmin/ExportStatus",
        RunFullExport: Config.API.Base + "/SuperAdmin/RunFullExport",
        ChangeDataPermissions: Config.API.Base + "/SuperAdmin/ChangeDataPermissions"
    }
};

Config.API.setMode = function(mode) {
    Config.API.Mode = mode;
    localStorage.setItem('offlineMode', mode);
};

Config.API.getMode = function() {
    Config.API.Mode = Number(localStorage.getItem("offlineMode"));
    if (Config.API.Mode === undefined || Config.API.Mode === null || Config.API.Mode === "null" || Config.API.Mode === "undefined") {
        Config.API.setMode(Config.API.Modes.ONLINE);
    }
    return Config.API.Mode;
};



var storedUserSuffix = "_User";
var storedCustomerSuffix = "_Customer";
var storedMasterQuoteSuffix = "_MasterQuote";
var storedLMasterQuoteSuffix = "_LMasterQuote";

var storedQuoteSuffix = "_Quote";
var pageSize = 5;

var InteriorOrderStyle2Name = "Interior";
var ExteriorOrderStyle2Name = "Exterior";
var MouldingOrderStyle2Name = "Moulding";
var SkylightOrderStyle2Name = "Skylight";
var DeckingOrderStyle2Name = "Decking";
var SidingOrderStyle2Name = "Siding";
var WindowOrderStyle2Name = "Window";
var RawGlassOrderStyle2Name = "Raw Glass";

var InteriorDoorStyles2Id = 3;
var ExteriorDoorStyles2Id = 4;
var MouldingStyles2Id = 5;
var SkylightStyles2Id = 7;
var DeckingStyles2Id = 8;
var SidingStyles2Id = 9;
var RawGlassStyles2Id = 11;

var MouldingProductTypeId = 2;
var SkylightProductTypeId = 7;
var DeckingProductTypeId = 4;
var SidingProductTypeId = 3;
var DoorsProductTypeId = 1;
var WindowProductTypeId = 6;
var RawGlassProductTypeId = 8;

var CompanyAdminUserType = 2;


var userID = localStorage.getItem("userID");
