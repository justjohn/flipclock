module.declare(function(require, exports, module) {
	var storage = require('./core/storage').storage,
		Q = require('vendor/q'),
		key = "config",
		modes = {
			twelveHour: "12hr",
			twentyFourHour: "24hr"
		},
		timeModeDefault = modes.twelveHour,
		fontDefault = 'default',
		cache = {},
		ready = Q.defer();

	// preload!
	Q.spread([
		storage.get('font'),
		storage.get('timeMode'),
		storage.get('showSeconds')
	], function(font, timeMode, showSeconds) {
		cache = {
			timeMode: timeMode,
			showSeconds: showSeconds,
			font: font
		};

		ready.resolve();
	});

	exports.ready = function() {
		return ready.promise;
	};

	exports.get = function(key) {
		return cache[key];
	};
	exports.set = function(key, value) {
		cache[key] = value;

		// persist
		storage.set(key, value);
	};

	exports.setFont = function(font) {
		this.set('font', font);
	};
	exports.getFont = function() {
		return this.get('font') || fontDefault;
	};

	exports.setTimeMode = function(mode) {
		this.set('timeMode', mode);
	};
	exports.getTimeMode = function() {
		return this.get('timeMode') || timeModeDefault;
	};

	exports.setShowSeconds = function(showSeconds) {
		this.set('showSeconds', showSeconds?"true":"false");
	};
	exports.getShowSeconds = function() {
		return this.get('showSeconds') == "true";
	};

	exports.data = function() {
		return cache;
	};

	exports.modes = modes;
});
