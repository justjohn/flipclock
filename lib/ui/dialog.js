module.declare([
    {jquery: "vendor/jquery"},
    {twig: "vendor/twig"},
],
function(require, exports, module) {
    var $ = require("jquery").jQuery,
        twig = require("twig").twig,
        count = 0,
        load_callback,
        config = {
            active_dialog_class: "active_dialog"
        };

    twig({
        id: 'dialog',
        href: "/templates/dialog.twig"
    });

    exports.show = function(id) {
        // Show about box
        $('#' + id).addClass(config.active_dialog_class);
    };
    exports.hide = function(e) {
        if (e && e.returnValue === false) return false;
        // Hide dialog
        $("." + config.active_dialog_class).removeClass(config.active_dialog_class);
    };

    exports.create = function(params, callback) {
        count ++;
        var id   = params.id,
            href = params.template,
            data = params.data,
            container = params.container;

        twig({
            href: href,
            load: function(template) {
                var content = template.render(data || {});

                content = twig({ref: 'dialog'}).render({
                    "id":      id,
                    "content": content
                });

                content = $(content);
                container && container.append(content);
                callback  && callback(content);

                count--;

                if (count === 0 && load_callback) {
                    load_callback();
                    load_callback = undefined;
                }
            }
        });

        return exports;
    };

    exports.complete = function(callback) {
        if (count > 0) {
            load_callback = callback;
        } else {
            callback();
        }
    };
});
