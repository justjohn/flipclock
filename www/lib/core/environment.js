module.declare(function(require, exports, module) {
	var $ = require('vendor/jquery').jQuery;

	exports.ieBrowser = window.navigator.userAgent.indexOf("MSIE") >= 0;
	exports.chromeBrowser = typeof chrome !== "undefined";

	// chrome store app
	exports.chrome = typeof chrome !== "undefined" && typeof chrome.storage !== "undefined";
	exports.animate = true;

	exports.init = function() {

		exports.canFullscreen = (function() {
			var elem = document.body;

			if (this.chrome ||
					elem.requestFullscreen ||
					elem.mozRequestFullScreen ||
					elem.webkitRequestFullscreen) {
				return true;
			}

			return false;
		})();


		if (exports.chromeBrowser) {
			$("html").addClass("chrome-backface-fix");
		}

		if (exports.ieBrowser) {
			$("html").addClass("disable-animation");
			exports.animate = false;
		}

		if (exports.canFullscreen) {
			$("html").addClass("fullscreen-capable");
		}

		// keep the current state updated
		setInterval(function environmentUpdate() {
			if (exports.isFullscreen()) {
				$("html").addClass("fullscreen-enabled");
			} else {
				$("html").removeClass("fullscreen-enabled");
			}
		}, 100);
	};

	exports.isFullscreen = function() {
		if (this.chrome) {
			return chrome.app.window.current().isFullscreen();
		} else if ("mozFullScreenElement" in document) {
			return document.mozFullScreenElement !== null;
		} else if ("webkitFullscreenElement" in document) {
			return document.webkitFullscreenElement !== null;
		} else if ("fullscreenElement" in document) {
			return document.fullscreenElement !== null;
		}

		return false;
	};

	exports.fullscreen = function() {
		var elem = document.body;
		if (this.chrome) {
			chrome.app.window.current().fullscreen();
		} else if (elem.requestFullscreen) {
			elem.requestFullscreen();
		} else if (elem.mozRequestFullScreen) {
			elem.mozRequestFullScreen();
		} else if (elem.webkitRequestFullscreen) {
			elem.webkitRequestFullscreen();
		} else {
			// unsupported
			return false;
		}

		$("html").addClass("fullscreen-enabled");
	};

	exports.restore = function() {
		var elem = document;
		if (this.chrome) {
			chrome.app.window.current().restore();
		} else if (elem.cancelFullscreen) {
			elem.cancelFullscreen();
		} else if (elem.mozCancelFullScreen) {
			elem.mozCancelFullScreen();
		} else if (elem.webkitCancelFullScreen) {
			elem.webkitCancelFullScreen();
		} else {
			return false;
		}

		$("html").removeClass("fullscreen-enabled");
	};
});