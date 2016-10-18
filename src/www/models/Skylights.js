Models.SkylightOrders = persistence.define('SkylightOrders', {
    OrderID: "INT",
    OrderDate: "DATE",
    DoorQuoteID: "INT",
    LDoorQuoteID: "TEXT",
    SkylightID: "INT",
    SkylightBlindID: "INT",
    PriceEach: "INT",
    Quantity: "INT",
    TotalPrice: "INT",
    OrderType: "INT",
    invertDimensions: "BOOL",
    //[ForeignKey("DoorQuoteID")]
    //public DoorQuote DoorQuote { get; set; }
    //[ForeignKey("SkylightID")]
    //public Skylight Skylight { get; set; }
    SyncVersion: "INT",
    Deleted: "BOOL",
    Sync: "BOOL",
    PriceOverride: "INT",
    Notes: "TEXT"
});

Models.SkylightOrders.index(['OrderID', 'DoorQuoteID', 'LDoorQuoteID', 'SyncVersion']);

Models.Skylights = persistence.define('Skylights', {
    SkylightID: "INT",
    FBSku: "TEXT",
    SortOrder: "INT",
    Manufacturer: "TEXT",
    Style: "TEXT",
    Name: "TEXT",
    Width: "TEXT",
    Height: "TEXT",
    Price: "INT",
    GlassType: "TEXT",
    GlassColor: "TEXT",
    EnergyPackage: "TEXT",
    Size: "TEXT",
    Operation: "TEXT",
    OperatorType: "TEXT",
    Material: "TEXT",
    PhotoName: "TEXT",
    Dimension: "TEXT",
    Finish: "TEXT",
    QtyPriceDiscount: "TEXT",
    Collection: "TEXT",
    Color: "TEXT",
    Thickness: "TEXT",
    Distributor: "TEXT",
    Reversible: "BOOL",
    OutsideCurb: "BOOL",
    SyncVersion: "INT",
    Deleted: "BOOL",
    FactoryBlinds: "BOOL"
});

Models.Skylights.index(['SkylightID', 'SortOrder', 'SyncVersion']);

Models.SkylightBlinds = persistence.define('SkylightBlinds', {
    SkylightBlindID: "INT",
    FBSku: "TEXT",
    Type: "TEXT",
    BlindType: "TEXT",
    BlindCode: "TEXT",
    Color: "TEXT",
    Price: "INT",
    Stock: "TEXT",
    Distributor: "TEXT",
    Manufacturer: "TEXT",
    Description: "TEXT",
    Description2: "TEXT",
    Description3: "TEXT",
    Description4: "TEXT",
    PhotoName: "TEXT",
    Delivery: "TEXT",
    SortOrder: "INT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.SkylightBlinds.index(['SkylightBlindID', 'SortOrder', 'SyncVersion']);
