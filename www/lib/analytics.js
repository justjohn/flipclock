module.declare(function(require, exports, module) {
    var environment = require('./core//environment'),
        _gaq = [];

    exports.register = function(root) {
        _gaq.push(['_setAccount', 'UA-28863948-2']);
        _gaq.push(['_setDomainName', 'flipclock.us']);
        _gaq.push(['_setAllowLinker', true]);
        _gaq.push(['_trackPageview']);

        root._gaq = _gaq;

        if (environment.chrome) {
            // TBD: use chrome platform analytics
        } else {
        	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = 'https://ssl.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        }
    }

    exports._gaq = _gaq;
});