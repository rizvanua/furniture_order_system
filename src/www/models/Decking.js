Models.DeckingOrders = persistence.define('DeckingOrders', {
    OrderID: "INT",
    OrderDate: "DATE",
    DoorQuoteID: "INT",
    LDoorQuoteID: "TEXT",
    DeckingID: "INT",
    PriceEach: "INT",
    Quantity: "INT",
    TotalPrice: "INT",
    OrderType: "INT",
    //[ForeignKey("DoorQuoteID")]
    //public DoorQuote DoorQuote { get; set; }
    //[ForeignKey("DeckingID")]
    //public Decking Decking { get; set; }
    SyncVersion: "INT",
    Deleted: "BOOL",
    Sync: "BOOL",
    PriceOverride: "INT",
    Notes: "TEXT"
});

Models.DeckingOrders.index(['OrderID', 'DoorQuoteID', 'LDoorQuoteID', 'SyncVersion']);

Models.Deckings = persistence.define('Deckings', {
    DeckingID: "INT",
    FBSku: "TEXT",
    SortOrder: "INT",
    Manufacturer: "TEXT",
    Collection: "TEXT",
    Style: "TEXT",
    Name: "TEXT",
    Thickness: "TEXT",
    Width: "TEXT",
    Length: "TEXT",
    Color: "TEXT",
    ColorSwatch: "TEXT",
    Price: "INT",
    PhotoName: "TEXT",
    Description1: "TEXT",
    Description2: "TEXT",
    Distributor: "TEXT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.Deckings.index(['DeckingID', 'SortOrder', 'Manufacturer', 'SyncVersion']);
