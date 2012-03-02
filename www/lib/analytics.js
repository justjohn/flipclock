module.declare(function(require, exports, module) {
    exports.register = function(root) {
        root._gaq = root._gaq || [];
        root._gaq.push(['_setAccount', 'UA-28863948-2']);
        root._gaq.push(['_setDomainName', 'flipclock.us']);
        root._gaq.push(['_setAllowLinker', true]);
        root._gaq.push(['_trackPageview']);

    	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    }
});