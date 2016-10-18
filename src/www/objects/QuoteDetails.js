 function QuoteDetails(obj) {
     this.id = null;
     this.quote_id = null;
     this.gridType = "none";
     this.gridPattern = "none";
     this.glassType = "lowe_1";
     this.finType = "fin_1";
     this.taxType = null;
     this.taxPercentage = 0;
     this.taxSelected = null;
     this.exchangeRate = 1;
     this.isNet = false;
     this.glassColor = "none";
     this.screenType = "Attached";


     for (var prop in obj) {
         this[prop] = obj[prop];
     }

 }
