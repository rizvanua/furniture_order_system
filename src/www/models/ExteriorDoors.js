Models.ExtAccessories = persistence.define('ExtAccessories', {
    ExtAccessoryID: "INT",
    FBSku: "TEXT",
    PreviewModifier: "TEXT",
    SortOrder: "INT",
    JambType: "TEXT",
    AccessoryType: "TEXT",
    AccessoryName: "TEXT",
    height: "TEXT",
    photoName: "TEXT",
    distributor: "TEXT",
    type: "TEXT",
    species: "TEXT",
    finish: "TEXT",
    colorName: "TEXT",
    colorCode: "TEXT",
    Price: "TEXT",
    sideliteAdd: "TEXT",
    fireRating: "TEXT",
    specialGroup: "TEXT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.ExtAccessories.index(['ExtAccessoryID', 'SortOrder', 'SyncVersion']);

Models.ExtJsonFilters = persistence.define('ExtJsonFilters', {
    ExtJsonFiltersID: "INT",
    Styles2ID: "INT",
    filters: "TEXT",
    ManufacturerID: "INT",
    createdOn: "DATE",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.ExtJsonFilters.index(['ExtJsonFiltersID', 'Styles2ID', 'ManufacturerID', 'SyncVersion']);

//Models.ExtJsonFilters.hasOne("Styles2", Models.LuStyles2);
//Models.ExtJsonFilters.hasOne("Manufacturer", Models.Manufacturer);

Models.ExtJambFilters = persistence.define('ExtJambFilters', {
    ExtJambFiltersID: "INT",
    filters: "TEXT",
    createdOn: "DATE",
    ManufacturerID: "INT",
    fireRating: "TEXT",
    specialGroup: "TEXT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.ExtJambFilters.index(['ExtJambFiltersID', 'ManufacturerID', 'SyncVersion']);

//Models.ExtJambFilters.hasOne("Manufacturer", Models.Manufacturer);

Models.ExteriorDoor = persistence.define('ExteriorDoor', {
    ExteriorDoorID: "INT",
    FBSku: "TEXT",
    SortOrder: "INT",
    width: "TEXT",
    height: "TEXT",
    price: "INT",
    panels: "TEXT",
    caming: "TEXT",
    style: "TEXT",
    glass: "TEXT",
    collection: "TEXT",
    idNumber: "TEXT",
    name: "TEXT",
    mutt: "TEXT",
    sticking: "TEXT",
    panelType: "TEXT",
    thickness: "TEXT",
    waterbarrier: "BOOL",
    ultraBlock: "BOOL",
    finish: "TEXT",
    warranty: "TEXT",
    species: "TEXT",
    stock: "TEXT",
    Distributor: "TEXT",
    manufacturer: "TEXT",
    photoName: "TEXT",
    sideliteKey: "INT",
    type: "TEXT",
    fireRating: "TEXT",
    specialGroup: "TEXT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.ExteriorDoor.index(['ExteriorDoorID', 'SortOrder', 'SyncVersion']);

Models.ExteriorSill = persistence.define('ExteriorSill', {
    ExteriorSillID: "INT",
    FBSku: "TEXT",
    SortOrder: "INT",
    name: "TEXT",
    height: "TEXT",
    swing: "TEXT",
    type: "TEXT",
    width: "TEXT",
    price: "INT",
    oneSideliteAdd: "INT",
    twoSideliteAdd: "INT",
    distributor: "TEXT",
    fireRating: "TEXT",
    specialGroup: "TEXT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.ExteriorSill.index(['ExteriorSillID', 'SortOrder', 'SyncVersion']);

Models.ExteriorJamb = persistence.define('ExteriorJamb', {
    ExteriorJambID: "INT",
    FBSku: "TEXT",
    SortOrder: "INT",
    jambType: "TEXT",
    height: "TEXT",
    type: "TEXT",
    width: "TEXT",
    price: "INT",
    sideliteAdd: "INT",
    doubleSideliteAdd: "INT",
    transomAdd: "INT",
    distributor: "TEXT",
    SyncVersion: "INT",
    fireRating: "TEXT",
    specialGroup: "TEXT",
    JambPic: "TEXT",
    Deleted: "BOOL"
});

Models.ExteriorJamb.index(['ExteriorJambID', 'SortOrder', 'SyncVersion']);

Models.Sidelite = persistence.define('Sidelite', {
    SideliteID: "INT",
    FBSku: "TEXT",
    SortOrder: "INT",
    width: "TEXT",
    height: "TEXT",
    price: "INT",
    panels: "TEXT",
    caming: "TEXT",
    style: "TEXT",
    glass: "TEXT",
    collection: "TEXT",
    idNumber: "TEXT",
    name: "TEXT",
    mutt: "TEXT",
    sticking: "TEXT",
    panelType: "TEXT",
    thickness: "TEXT",
    waterbarrier: "BOOL",
    ultraBlock: "BOOL",
    warranty: "TEXT",
    species: "TEXT",
    stock: "TEXT",
    Distributor: "TEXT",
    manufacturer: "TEXT",
    photoName: "TEXT",
    DoorID: "INT",
    sideliteKey: "INT",
    SyncVersion: "INT",
    fireRating: "TEXT",
    specialGroup: "TEXT",
    Deleted: "BOOL"
});

Models.Sidelite.index(['SideliteID', 'SortOrder', 'DoorID', 'SyncVersion']);

//Models.Sidelite.hasMany('doors', Models.ExteriorDoor, 'ExteriorDoorID');
//Models.ExteriorDoor.hasMany('sidelites', Models.Sidelite, 'SideliteID');

Models.ExtAccessoryModel = persistence.define('ExtAccessoryModel', {
    ExtAccessoryID: "INT",
    AccessoryName: "TEXT",
    PreviewModifier: "TEXT",
    Price: "INT",
    species: "TEXT",
    finish: "TEXT",
    AccessoryType: "TEXT",
    JambType: "TEXT",
    colorName: "TEXT",
    colorCode: "TEXT",
    sideliteAdd: "INT",
    distributor: "TEXT",
    type: "TEXT",
    height: "TEXT",
    photoName: "TEXT",
    SortOrder: "INT",
    FBSku: "TEXT",
    fireRating: "TEXT",
    specialGroup: "TEXT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.ExtAccessoryModel.index(['ExtAccessoryID', 'SortOrder', 'SyncVersion']);

Models.ExtOrders = persistence.define('ExtOrders', {
    ExtOrderID: "INT",
    OrderDate: "DATE",
    DoorQuoteID: "INT",
    LDoorQuoteID: "TEXT",
    ExtDoorID: "INT",
    ExtJambID: "INT",
    AccessoryID: "INT",
    LeftSideliteID: "INT",
    RightSideliteID: "INT",
    SillID: "INT",
    PriceEach: "INT",
    Quantity: "INT",
    TotalPrice: "INT",
    IsLeftHand: "BOOL",
    OrderType: "INT",
    DoorSwing: "TEXT",
    HingeType: "TEXT",
    HingeColor: "TEXT",
    SyncVersion: "INT",
    Sync: "BOOL",
    Deleted: "BOOL",
    PriceOverride: "INT",
    Notes: "TEXT"
});

Models.ExtOrders.index(['ExtOrderID', 'DoorQuoteID', 'LDoorQuoteID', 'SyncVersion']);

Models.ExtOrderAccessories = persistence.define('ExtOrderAccessories', {
    OrderAccessoryID: "INT",
    ExtOrderID: "INT",
    LExtOrderID: "TEXT",
    ExtAccessoryID: "INT",
    Price: "INT",
    //[ForeignKey("ExtOrderID")]
    //public ExtOrder ExtOrder { get; set; }
    //[ForeignKey("ExtAccessoryID")]
    //public ExtAccessories ExtAccessory { get; set; }
    SyncVersion: "INT",
    Sync: "BOOL",
    Deleted: "BOOL"
});

Models.ExtOrderAccessories.index(['OrderAccessoryID', 'ExtOrderID', 'LExtOrderID', 'SyncVersion']);

Models.SideliteFilters = persistence.define('SideliteFilters', {
    SideliteFiltersID: "INT",
    filters: "TEXT",
    ManufacturerID: "INT",
    //[ForeignKey("ManufacturerID")]
    //public Manufacturer Manufacturer { get; set; }
    createdOn: "DATE",
    fireRating: "TEXT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.SideliteFilters.index(['SideliteFiltersID', 'ManufacturerID', 'SyncVersion']);

//Models.ExtOrders.hasOne("Sill", Models.ExteriorSill);
//Models.ExtOrders.hasOne("LeftSidelite", Models.Sidelite);
//Models.ExtOrders.hasOne("RightSidelite", Models.Sidelite);
//Models.ExtOrders.hasOne("Door", Models.ExteriorDoor);
//Models.ExtOrders.hasOne("Jamb", Models.ExteriorJamb);
