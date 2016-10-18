mainApp.service('selectedProductType', function($state) {
    var productType;
    var styles2;
    return {
        getSelectedProductType: function() {
            return productType;
        },
        setSelectedProductType: function(s) {
            productType = s;
        },
        getSelectedStyles2: function() {
            if (styles2 === undefined && $state.current !== undefined && $state.current !== null && $state.current.name !== 'frontpage') {
                $state.go('frontpage');
            }
            return styles2;
        },
        setSelectedStyles2: function(s) {
            styles2 = s;
        }
    };
});

mainApp.service('productMetaTree', function() {
    var metaTree;
    return {
        getTree: function() {
            return metaTree;
        },
        setTree: function(tree) {
            metaTree = tree;
        }

    };

});

mainApp.factory('scopes', function($rootScope) {
    var mem = {};

    return {
        store: function(key, value) {
            mem[key] = value;
        },
        get: function(key) {
            return mem[key];
        }
    };
});

mainApp.service('selectedDoor', function() {
    var door;
    return {
        getDoor: function() {
            return door;
        },
        setDoor: function(d) {
            door = d;
        }
    };
});

mainApp.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
});

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

mainApp.factory('scopes', function($rootScope) {
    var mem = {};

    return {
        store: function(key, value) {
            //$rootScope.$emit('scope.stored', key);
            mem[key] = value;
        },
        get: function(key) {
            return mem[key];
        }
    };
});

mainApp.service('selectedDoor', function() {
    var door;
    return {
        getDoor: function() {
            return door;
        },
        setDoor: function(d) {
            door = d;
        }
    };
});

mainApp.service('optimizer', function() {
    var optimizeMode = false;
    var trimType;
    return {
        getMode: function() {
            return optimizeMode;
        },
        getTrimType: function() {
            return trimType;
        },
        setMode: function(mode) {
            optimizeMode = mode;
        },
        setTrimType: function(type) {
            trimType = type;
        }
    };
});
