Models.WebQuotes = persistence.define('WebQuotes', {
    WebQuoteID: "INT",
    localQuoteID: "INT",
    customerID: "INT",
    LcustomerID: "TEXT",
    fromDroid: "BOOL",
    project: "TEXT",
    job: "TEXT",
    createdOn: "TEXT",
    userID: "INT",
    jsonQuote: "TEXT",
    MasterQuoteID: "INT",
    LMasterQuoteID: "TEXT",
    //[ForeignKey("MasterQuoteID")]
    //public MasterQuote MasterQuote { get; set; }
    DoorQuoteID: "INT",
    LDoorQuoteID: "TEXT",
    //[ForeignKey("DoorQuoteID")]
    //public DoorQuote DoorQuote { get; set; }
    SyncVersion: "INT",
    Sync: "BOOL",
    Deleted: "BOOL"
});

Models.WebQuotes.index(['WebQuoteID', 'customerID', 'LcustomerID', 'userID', 'MasterQuoteID', 'LMasterQuoteID', 'DoorQuoteID', 'LDoorQuoteID', 'SyncVersion']);

Models.EnergyValues = persistence.define('EnergyValues', {
    EnergyValueID: "INT",
    glass: "TEXT",
    grid: "TEXT",
    sqftGreaterThan: "INT",
    sqftLessThan: "INT",
    shgc: "INT",
    uValue: "INT",
    series: "TEXT",
    manufacturer: "TEXT",
    type: "TEXT",
    SyncVersion: "INT",
    Deleted: "BOOL"
});

Models.EnergyValues.index(['EnergyValueID', 'SyncVersion']);

Models.WindowOrderNames = persistence.define('WindowOrderNames', {
    WindowOrderNameID: "INT",
    WebQuoteID: "INT",
    LWebQuoteID: "TEXT",
    Name: "TEXT",
    SyncVersion: "INT",
    Deleted: "BOOL",
    Sync: "BOOL"
});

Models.WindowOrderNames.index(['WindowOrderNameID', 'WebQuoteID', 'LWebQuoteID', 'SyncVersion']);
