mainApp.filter('manufacturePhoto', function() {

    return function(input, params) {

        if (typeof params === "undefined") {
            return "";
        }

        var obj = _.find(params, function(manu) {
            return input === manu.name;
        });

        if (typeof obj === "undefined") {
            return "";
        }

        return obj.PhotoFileName;

    };
});
