module.declare([
    "../../vendor/jquery"
],
function(require, exports, module) {
    var $ = require("../../vendor/jquery").jQuery,
        active_class = 'active';

    exports.init = function(element) {
        element.each(function() {

            var toggle = $(this),
                options = $("button", this);

            var click_fn = function(e) {
                var target = $(this);

                // toggle styles
                options.removeClass(active_class);
                target.addClass(active_class);
            };

            toggle.on({
                'click': click_fn,
                'touchstart': click_fn
            }, 'button');

            toggle.on({
                'confirm': function() {
                    var active = $('.'+active_class, toggle),
                        value = active.data('value');

                    // set value
                    toggle.data('value', value);
                },
                'reset': function() {
                    var value = toggle.data('value');

                    options.each(function() {
                        if ($(this).data('value') == value) {
                            $(this).addClass(active_class);
                        } else {
                            $(this).removeClass(active_class);
                        }
                    });
                }
            });
        });
    };
});