Models.RawGlassOrders = persistence.define('RawGlassOrders', {
    OrderID: "INT",
    OrderDate: "DATE",
    DoorQuoteID: "INT",
    LDoorQuoteID: "TEXT",
    RawGlassID: "INT",
    PriceEach: "INT",
    Quantity: "INT",
    TotalPrice: "INT",
    OrderType: "INT",
    Width: "INT",
    Height: "INT",
    GridWidth: "INT",
    GridHeight: "INT",
    SyncVersion: "INT",
    Deleted: "BOOL",
    Sync: "BOOL",
    PriceOverride: "INT",
    Notes: "TEXT"
});

Models.RawGlassOrders.index(['OrderID', 'DoorQuoteID', 'LDoorQuoteID', 'SyncVersion']);

Models.RawGlass = persistence.define('RawGlass', {
    RawGlassID: "INT",
    FBSku: "TEXT",
    SortOrder: "INT",
    Manufacturer: "TEXT",
    Distributor: "TEXT",
    PricingUnit: "TEXT",
    GlassType: "TEXT",
    GlassThickness: "TEXT",
    Tempered: "BOOL",
    Collection: "TEXT",
    PhotoName: "TEXT",
    Description: "TEXT",
    MaxShortDim: "INT",
    MaxLength: "INT",
    MaxSqFt: "INT",
    Style: "TEXT",
    Name: "TEXT",
    Price: "INT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.RawGlass.index(['RawGlassID', 'SortOrder', 'SyncVersion']);

Models.RawGlassOrderAddOns = persistence.define('RawGlassOrderAddOns', {
    OrderAddOnID: 'INT',
    OrderID: 'INT',
    LOrderID: "TEXT",
    AddOnID: 'INT',
    Price: 'INT',
    SyncVersion: 'INT',
    Sync: "BOOL",
    Deleted: 'BOOL'
});

Models.RawGlassOrderAddOns.index(['OrderAddOnID', 'OrderID', 'LOrderID', 'SyncVersion']);

Models.RawGlassAddOns = persistence.define('RawGlassAddOns', {
    AddOnID: "INT",
    FBSku: "TEXT",
    Type: "TEXT",
    UOM: "TEXT",
    Name: "TEXT",
    BlindCode: "TEXT",
    Color: "TEXT",
    Price: "INT",
    Distributor: "TEXT",
    Manufacturer: "TEXT",
    SortOrder: "INT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.RawGlassAddOns.index(['AddOnID', 'SortOrder', 'SyncVersion']);
