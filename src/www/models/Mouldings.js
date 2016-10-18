Models.Mouldings = persistence.define('Mouldings', {
    MouldingID: "INT",
    StockCode: "TEXT",
    Style: "TEXT",
    FBSku: "TEXT",
    SortOrder: "INT",
    Ext: "TEXT",
    BundleQty: "TEXT",
    Name: "TEXT",
    Width: "TEXT",
    Height: "TEXT",
    LiftSize: "TEXT",
    LinkUrl: "TEXT",
    Collection: "TEXT",
    PageOrder: "INT",
    Material: "TEXT",
    Type: "TEXT",
    Length: "TEXT",
    Manufacturer: "TEXT",
    Price: "INT",
    PhotoName: "TEXT",
    Distributor: "TEXT",
    Discription: "TEXT",
    OnFactorGroup: "TEXT",
    Finish: "TEXT",
    SyncVersion: "INT",
    Deleted: "BOOL",
    PriceOverride: "INT",
    Notes: "TEXT"
});

Models.Mouldings.index(['MouldingID', 'SortOrder', 'SyncVersion']);

Models.MouldingOrders = persistence.define('MouldingOrders', {
    OrderID: "INT",
    OrderDate: "DATE",
    DoorQuoteID: "INT",
    LDoorQuoteID: "TEXT",
    MouldingID: "INT",
    PriceEach: "INT",
    Quantity: "INT",
    TotalPrice: "INT",
    OrderType: "INT",
    Length: "INT",
    Width: "TEXT",
    //[ForeignKey("DoorQuoteID")]
    //public DoorQuote DoorQuote { get; set; }
    //[ForeignKey("MouldingID")]
    //public Moulding Moulding { get; set; }
    SyncVersion: "INT",
    Deleted: "BOOL",
    Sync: "BOOL"
});

Models.MouldingOrders.index(['OrderID', 'DoorQuoteID', 'LDoorQuoteID', 'SyncVersion']);
