module.declare([ { jquery: "vendor/jquery" } ], function(require, exports, module) {
    var $ = require("jquery").jQuery,
        config = {
            active_dialog_class: "active_dialog"
        };

    exports.show = function(id) {
        // Show about box
        $('#' + id).addClass(config.active_dialog_class);
    };
    exports.hide = function(e) {
        if (e && e.returnValue === false) return false;
        // Hide dialog
        $("." + config.active_dialog_class).removeClass(config.active_dialog_class);
    };
});
