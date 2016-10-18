Models = {};

Models.MasterQuote = persistence.define('MasterQuote', {
    MasterQuoteID: "INT",
    CustomerID: "INT",
    LCustomerID: "TEXT",
    JobName: "TEXT",
    ProjectName: "TEXT",
    CreatedDateTime: "TEXT",
    //[ForeignKey("CustomerID")]
    //public Customer Customer { get; set; }
    SyncVersion: "INT",
    Sync: "BOOL",
    Deleted: "BOOL"
});

Models.MasterQuote.index(['MasterQuoteID', 'CustomerID', 'LCustomerID', 'SyncVersion']);

Models.ImageDBVersion = persistence.define('ImageDBVersion', {
    ImageDBLocation: "TEXT",
    LastChanged: "INT",
    Tag: "TEXT"
});

Models.ImageDBVersion.index(['ImageDBLocation', 'LastChanged', 'Tag']);

Models.LuProductTypes = persistence.define('LuProductTypes', {
    ProductTypeID: "INT",
    ProductType: "TEXT",
    PhotoFileName: "TEXT",
    IsDoorType: "BOOL",
    SortOrder: "INT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.LuProductTypes.index(['ProductTypeID', 'ProductType', 'PhotoFileName', 'SortOrder', 'SyncVersion']);

Models.LuStyles2 = persistence.define('LuStyles2', {
    Styles2ID: "INT",
    Style2: "TEXT",
    PhotoFileName: "TEXT",
    ProductTypeID: "INT",
    SortOrder: "INT",
    //[ForeignKey("ProductTypeID")]
    //public LuProductType ProductType { get; set; }
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.LuStyles2.index(['Styles2ID', 'Style2', 'PhotoFileName', 'ProductTypeID', 'SortOrder', 'SyncVersion']);

Models.LuStyles = persistence.define('LuStyles', {
    StyleID: "INT",
    Style: "TEXT",
    PhotoFileName: "TEXT",
    Styles2ID: "INT",
    SortOrder: "INT",
    //[ForeignKey("Styles2ID")]
    //public LuStyles2 Styles2 { get; set; }
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.LuStyles.index(['StyleID', 'Style', 'PhotoFileName', 'Styles2ID', 'SortOrder', 'SyncVersion']);

Models.Customers = persistence.define('Customers', {
    CustomerID: "INT",
    UserID: "INT",
    name: "TEXT",
    street: "TEXT",
    city: "TEXT",
    state: "TEXT",
    zip: "TEXT",
    phone: "TEXT",
    email: "TEXT",
    createdAt: "TEXT",
    isAutoSaveCustomer: "BOOL",
    SyncVersion: "INT",
    Deleted: "BOOL",
    Sync: "BOOL"
});

Models.Customers.index(['CustomerID', 'UserID', 'SyncVersion']);

Models.Users = persistence.define('Users', {
    UserID: "INT",
    firstName: "TEXT",
    lastName: "TEXT",
    Email: "TEXT",
    Phone: "TEXT",
    agreedToTerms: "BOOL",
    CompanyID: "INT",
    //public string productKey { get; set; }
    //public virtual Company company { get; set; }
    jsonConfigInfo: "TEXT",
    //public bool forgotPassword { get; set; }
    //[NotMapped]
    //public ICollection<Group> Groups { get; set; }
    //[NotMapped]
    //public string GroupsData { get; set; }
    UserTypeID: "INT",
    //[ForeignKey("UserTypeID")]
    //public LuUserType LuUserTypes { get; set; }
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.Users.index(['UserID', 'CompanyID', 'UserTypeID', 'SyncVersion']);

Models.CompanyProductPermissions = persistence.define('CompanyProductPermissions', {
    CompanyProductID: "INT",
    CompanyID: "INT",
    ProductTypeID: "INT",
    //[ForeignKey("CompanyID")]
    //public Company Company { get; set; }
    //[ForeignKey("ProductTypeID")]
    //public LuProductType ProductType { get; set; }
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.CompanyProductPermissions.index(['CompanyProductID', 'CompanyID', 'ProductTypeID', 'SyncVersion']);

Models.Companies = persistence.define('Companies', {
    CompanyID: "INT",
    name: "TEXT",
    address1: "TEXT",
    address2: "TEXT",
    city: "TEXT",
    website: "TEXT",
    state: "TEXT",
    zip: "TEXT",
    phone: "TEXT",
    fabColorCode: "TEXT",
    requestedManufacturerInfo: "TEXT",
    //public virtual ICollection<User> users { get; set; }
    //public virtual ICollection<Manufacturer> mfs { get; set; }
    //public ICollection<LuProductType> ProductTypes { get; set; }
    //[NotMapped]
    //public long[] AssignedPermissions { get; set; }
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.Companies.index(['CompanyID', 'SyncVersion']);

Models.UserGroups = persistence.define('UserGroups', {
    UserGroupID: "INT",
    UserID: "INT",
    GroupID: "INT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.UserGroups.index(['UserGroupID', 'UserID', 'GroupID', 'SyncVersion']);


Models.Groups = persistence.define('Groups', {
    GroupID: "INT",
    GroupName: "TEXT",
    CompanyID: "INT",
    CreatedBy: "INT",
    CreatedDate: "DATE",
    Address: "TEXT",
    Address2: "TEXT",
    City: "TEXT",
    State: "TEXT",
    Zip: "TEXT",
    Phone: "TEXT",
    SyncVersion: "INT",
    Deleted: "BOOL"

});

Models.OrderNames = persistence.define('OrderNames', {
    OrderNameID: "INT",
    DoorQuoteID: "INT",
    LDoorQuoteID: "TEXT",
    OrderType: "INT",
    Name: "TEXT",
    SyncVersion: "INT",
    Deleted: "BOOL",
    Sync: "BOOL"
});

Models.OrderNames.index(['OrderNameID', 'DoorQuoteID', 'LDoorQuoteID', 'SyncVersion']);

Models.DoorQuotes = persistence.define('DoorQuotes', {
    DoorQuoteID: "INT",
    MasterQuoteID: "INT",
    LMasterQuoteID: "TEXT",
    CustomerID: "INT",
    LCustomerID: "TEXT",
    ProductTypeID: "INT",
    JobName: "TEXT",
    ProjectName: "TEXT",
    CreatedDateTime: "DATE",
    SyncVersion: "INT",
    Sync: "BOOL",
    Deleted: "BOOL"
});

Models.DoorQuotes.index(['DoorQuoteID', 'MasterQuoteID', 'LMasterQuoteID', 'CustomerID', 'LCustomerID', 'ProductTypeID', 'SyncVersion']);

Models.Manufacturers = persistence.define('Manufacturers', {
    ManufacturerID: "INT",
    name: "TEXT",
    PhotoFileName: "TEXT",
    ProdutTypeID: "INT",
    //[ForeignKey("ProdutTypeID")]
    //public LuProductType productType { get; set; }
    //public virtual ICollection<ProductLine> productLines { get; set; }
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.Manufacturers.index(['ManufacturerID', 'ProdutTypeID', 'SyncVersion']);

Models.JsonTrees = persistence.define('JsonTrees', {
    JsonTreeID: "INT",
    tree: "TEXT",
    Styles2ID: "INT",
    createdOn: "INT",
    ManufacturerID: "INT",
    //[ForeignKey("ManufacturerID")]
    //public Manufacturer Manufacturer { get; set; }
    //[ForeignKey("Styles2ID")]
    //public LuStyles2 Styles2 { get; set; }
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.JsonTrees.index(['JsonTreeID', 'Styles2ID', 'ManufacturerID', 'SyncVersion']);

Models.JsonFilters = persistence.define('JsonFilters', {
    JsonFiltersID: "INT",
    Styles2ID: "INT",
    filters: "TEXT",
    ManufacturerID: "INT",
    //[ForeignKey("ManufacturerID")]
    //public Manufacturer Manufacturer { get; set; }
    createdOn: "DATE",
    //[ForeignKey("Styles2ID")]
    //public LuStyles2 Styles2 { get; set; }
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.JsonFilters.index(['JsonFiltersID', 'Styles2ID', 'ManufacturerID', 'SyncVersion']);

Models.Settings = persistence.define('Settings', {
    SettingID: "INT",
    UserID: "INT",
    //[ForeignKey("UserID")]
    //[ScriptIgnore]
    //public User User { get; set; }
    ManufacturerID: "INT",
    //[ScriptIgnore]
    //[ForeignKey("ManufacturerID")]
    //public Manufacturer Manufacturer { get; set; }
    ProductTypeID: "INT",
    //[ScriptIgnore]
    //[ForeignKey("ProductTypeID")]
    //public LuProductType LuProductType { get; set; }
    OnFactor: "INT",
    MarkUp: "INT",
    LMasterQuoteID: "TEXT",
    MasterQuoteID: "INT",
    //[ScriptIgnore]
    //[ForeignKey("MasterQuoteID")]
    //public MasterQuote MasterQuote { get; set; }

    //public List<SettingsLine> Lines { get; set; }

    /*public SettingsLine getSettingsLine(string lineName)
    {
        foreach (SettingsLine sl in this.Lines)
        {
            if (sl.Name == lineName)
            {
                return sl;
            }
        }
        return null;
    }*/
    SyncVersion: "INT",
    Sync: "BOOL",
    Deleted: "BOOL"
});

Models.Settings.index(['SettingID', 'UserID', 'ManufacturerID', 'ProductTypeID', 'LMasterQuoteID', 'MasterQuoteID', 'SyncVersion']);

Models.LuStyleManufacturer = persistence.define('LuStyleManufacturer', {
    LuStylesManufacturersID: "INT",
    StyleID: "INT",
    ManufacturerID: "INT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.LuStyleManufacturer.index(['LuStylesManufacturersID', 'StyleID', 'ManufacturerID', 'SyncVersion']);

Models.DataPermissions = persistence.define('DataPermissions', {
    DataPermissionID: "INT",
    ManufacturerID: "INT",
    CompanyID: "INT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.DataPermissions.index(['DataPermissionID', 'ManufacturerID', 'CompanyID', 'SyncVersion']);

Models.LastSync = persistence.define('LastSync', {
    LastSyncID: "INT",
    SDate: "DATE"
});

Models.LastSync.index(['LastSyncID']);

Models.SettingsLines = persistence.define('SettingsLines', {
    SettingsLineID: "INT",
    OnFactor: "INT",
    MarkUp: "INT",
    Name: "TEXT",
    MasterQuoteID: "INT",
    LMasterQuoteID: "TEXT",
    ManufacturerID: "INT",
    //[ScriptIgnore]
    //public Setting Parent { get; set; }
    //    SettingID: "INT",
    //    LSettingID: "TEXT",
    OnFactorGroupID: "INT",
    LOnFactorGroupID: "TEXT",
    SyncVersion: "INT",
    Sync: "BOOL",
    Deleted: "BOOL"
});

Models.SettingsLines.index(['SettingsLineID', 'OnFactorGroupID', 'LOnFactorGroupID', 'SyncVersion']);

Models.OnFactorGroups = persistence.define('OnFactorGroups', {
    OnFactorGroupID: "INT",
    DefaultOnFactor: "INT",
    DefaultMarkup: "INT",
    Name: "TEXT",
    UserID: "INT",
    //[ScriptIgnore]
    //public User User { get; set; }
    ManufacturerID: "INT",
    //public Manufacturer Manufacturer { get; set; }
    SyncVersion: "INT",
    GroupID: "INT",
    Sync: "BOOL",
    Deleted: "BOOL"
});

Models.OnFactorGroups.index(['OnFactorGroupID', 'UserID', 'ManufacturerID', 'SyncVersion']);

Models.ImageVersions = persistence.define('ImageVersions', {
    ImageVersionID: "INT",
    utcLastMod: "INT",
    path: "TEXT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.ImageVersions.index(['ImageVersionID', 'SyncVersion']);

Models.WindowCoreData = persistence.define('WindowCoreData', {
    Manufacturer: "TEXT",
    JSON: "TEXT",
    DateLoaded: "DATE"
});

Models.WindowCoreData.index(['Manufacturer']);

Models.WindowMfConfig = persistence.define('WindowMfConfig', {
    MfConfigID: "INT",
    JSON: "TEXT",
    DateLoaded: "DATE"
});

Models.WindowMfConfig.index(['MfConfigID']);

Models.WindowDBLastUpdated = persistence.define('WindowDBLastUpdated', {
    WindowDataVersionID: "INT",
    utcLastMod: "INT"
});

Models.WindowDBLastUpdated.index(['WindowDataVersionID']);

Models.WindowDoorDims = persistence.define('WindowDoorDims', {
    DoorDimID: "INT",
    JSON: "TEXT",
    DateLoaded: "DATE"
});

Models.WindowDoorDims.index(['DoorDimID']);

Models.TimeBomb = persistence.define('TimeBomb', {
    TimeBombID: "INT",
    Date: "DATE"
});

Models.TimeBomb.index(['TimeBombID']);

Models.ImageDatabase = persistence.define('ImageDatabase', {
    ImgUrl: "TEXT",
    Base64: "TEXT"
});

Models.ImageDatabase.index(['ImgUrl']);
