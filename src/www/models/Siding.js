Models.SidingOrders = persistence.define('SidingOrders', {
    OrderID: "INT",
    OrderDate: "DATE",
    DoorQuoteID: "INT",
    LDoorQuoteID: "TEXT",
    SidingID: "INT",
    PriceEach: "INT",
    Quantity: "INT",
    TotalPrice: "INT",
    OrderType: "INT",
    //[ForeignKey("DoorQuoteID")]
    //public DoorQuote DoorQuote { get; set; }
    //[ForeignKey("SidingID")]
    //public Siding Siding { get; set; }
    SyncVersion: "INT",
    Deleted: "BOOL",
    Sync: "BOOL",
    PriceOverride: "INT",
    Notes: "TEXT"
});

Models.SidingOrders.index(['OrderID', 'DoorQuoteID', 'LDoorQuoteID', 'SyncVersion']);

Models.Sidings = persistence.define('Sidings', {
    SidingID: "INT",
    FBSku: "TEXT",
    SortOrder: "INT",
    Manufacturer: "TEXT",
    Collection: "TEXT",
    Style: "TEXT",
    Name: "TEXT",
    Thickness: "TEXT",
    Width: "TEXT",
    Exposure: "TEXT",
    Length: "TEXT",
    Color: "TEXT",
    RGB: "TEXT",
    Price: "INT",
    PhotoName: "TEXT",
    Description1: "TEXT",
    Description2: "TEXT",
    Distributor: "TEXT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.Sidings.index(['SidingID', 'SortOrder', 'SyncVersion']);
