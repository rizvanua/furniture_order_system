Models.DoorOrders = persistence.define('DoorOrders', {
    OrderID: "INT",
    OrderDate: "DATE",
    DoorQuoteID: "INT",
    LDoorQuoteID: "TEXT",
    DoorID: "INT",
    JambID: "INT",
    PriceEach: "INT",
    Quantity: "INT",
    TotalPrice: "INT",
    IsLeftHand: "BOOL",
    OrderType: "INT",
    DoorSwing: "TEXT",
    HingeColor: "TEXT",
    HingeType: "TEXT",
    //[ForeignKey("DoorQuoteID")]
    //public DoorQuote DoorQuote { get; set; }
    //[ForeignKey("DoorID")]
    //public Door Door { get; set; }
    //[ForeignKey("JambID")]
    //public Jamb Jamb { get; set; }
    SyncVersion: "INT",
    Deleted: "BOOL",
    Sync: "BOOL",
    PriceOverride: "INT",
    Notes: "TEXT"
});

Models.DoorOrders.index(['OrderID', 'DoorQuoteID', 'LDoorQuoteID', 'SyncVersion']);

Models.Doors = persistence.define('Doors', {
    DoorID: "INT",
    FBSku: "TEXT",
    SortOrder: "INT",
    width: "TEXT",
    height: "TEXT",
    price: "INT",
    style2: "TEXT",
    type: "TEXT",
    collection: "TEXT",
    panelType: "TEXT",
    style: "TEXT",
    name: "TEXT",
    material: "TEXT",
    finish: "TEXT",
    surface: "TEXT",
    sticking: "TEXT",
    stock: "BOOL",
    thickness: "TEXT",
    core: "TEXT",
    fireRating: "TEXT",
    prefit: "TEXT",
    edge: "TEXT",
    page: "TEXT",
    photoName: "TEXT",
    manufacturer: "TEXT",
    Distributor: "TEXT",
    specialGroup: "TEXT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.Doors.index(['DoorID', 'SortOrder', 'SyncVersion']);

Models.Jambs = persistence.define('Jambs', {
    JambID: "INT",
    FBSku: "TEXT",
    SortOrder: "INT",
    jambType: "TEXT",
    type: "TEXT",
    location: "TEXT",
    height: "TEXT",
    width: "TEXT",
    price: "INT",
    JambPic: "TEXT",
    distributor: "TEXT",
    previewModifier: "TEXT",
    fireRating: "TEXT",
    specialGroup: "TEXT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.Jambs.index(['JambID', 'SortOrder', 'SyncVersion']);

Models.JambFilters = persistence.define('JambFilters', {
    fireRating: "TEXT",
    specialGroup: "TEXT",
    manufacturerID: "INT",
    JambFiltersID: "INT",
    filters: "TEXT",
    createdOn: "DATE",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.JambFilters.index(['manufacturerID', 'JambFiltersID', 'SyncVersion']);

Models.DoorDefaults = persistence.define('DoorDefaults', {
    DoorDefaultID: "INT",
    StyleID: "INT",
    MfID: "INT",
    Name: "TEXT",
    Collection: "TEXT",
    Type: "TEXT",
    DefaultAccessory: "TEXT",
    DefaultJamb: "TEXT",
    DefaultJambWidth: "TEXT",
    DefaultSill: "TEXT",
    SpecialGroup: "TEXT",
    Location: "TEXT",
    //[ForeignKey("MfID")]
    //public Manufacturer Manufacturer { get; set; }
    //[ForeignKey("StyleID")]
    //public LuStyles Style { get; set; }
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.DoorDefaults.index(['DoorDefaultID', 'StyleID', 'MfID', 'SyncVersion', 'Collection', 'Type']);

Models.Accessories = persistence.define('Accessories', {
    AccessoryID: "INT",
    PreviewModifier: "TEXT",
    AccessoryName: "TEXT",
    AccessoryType: "TEXT",
    Price: "INT",
    JambType: "TEXT",
    FireRating: "TEXT",
    Height: "TEXT",
    Type: "TEXT",
    ColorCode: "TEXT",
    ColorName: "TEXT",
    PhotoName: "TEXT",
    Distributor: "TEXT",
    FbSku: "TEXT",
    SortOrder: "INT",
    SpecialGroup: "TEXT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.Accessories.index(['AccessoryID', 'SortOrder', 'SyncVersion']);

Models.OrderAccessories = persistence.define('OrderAccessories', {
    OrderAccessoryID: "INT",
    OrderID: "INT",
    LOrderID: "TEXT",
    AccessoryID: "INT",
    Price: "INT",
    //[ForeignKey("OrderID")]
    //public Order Order { get; set; }
    //[ForeignKey("AccessoryID")]
    //public Accessory Accessory { get; set; }
    SyncVersion: "INT",
    Deleted: "BOOL",
    Sync: "BOOL"
});

Models.OrderAccessories.index(['OrderAccessoryID', 'OrderID', 'LOrderID', 'SyncVersion']);
