module.declare(function(require, exports, module) {
	var $ = require('vendor/jquery').jQuery;

	exports.chromeBrowser = typeof chrome !== "undefined";
	exports.chrome = typeof chrome !== "undefined" && typeof chrome.storage !== "undefined";

	if (exports.chromeBrowser) {
		$("html").addClass("chrome-browser");
	}
});