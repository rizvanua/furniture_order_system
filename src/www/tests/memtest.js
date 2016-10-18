console.log("Starting Load of Large JSON Object...");
console.log(window.performance.memory);
setTimeout(function() {
    $.ajax({
        type: 'GET',
        url: 'https://fbpublicstorage.blob.core.windows.net/core/JsonTrees_543.json',
        success: function(data) {
            console.log(data);
            var tree = JSON.parse(data.updates[0].tree);
            console.log(tree);
            setTimeout(function() {
                console.log(window.performance.memory);
                console.log("Test Done!");
                setTimeout(function() {
                    //data = null;
                    //tree = null;
                    //console.log("Marking Object For G/C");
                    //setTimeout(function() {
                    //    console.log(window.performance.memory);
                    //}, 3000);
                }, 3000);
            }, 3000);
        },
        error: function(data) {
            deferred.reject();
        }
    });
}, 3000);
