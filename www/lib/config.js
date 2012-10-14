module.declare(function(require, exports, module) {
	// store config in LocalStorage
	var storage = window.localStorage,
		key = "config",
		modes = {
			twelveHour: "12hr",
			twentyFourHour: "24hr"
		},
		timeModeDefault = modes.twelveHour,
		fontDefault = 'default';

	exports.get = function(key) {
		return storage[key];
	};
	exports.set = function(key, value) {
		storage[key] = value;
	};

	exports.setFont = function(font) {
		exports.set('font', font);
	};
	exports.getFont = function() {
		return storage.font || fontDefault;
	};

	exports.setTimeMode = function(mode) {
		exports.set('timeMode', mode);
	};
	exports.getTimeMode = function() {
		return storage.timeMode || timeModeDefault;
	};

	exports.setShowSeconds = function(showSeconds) {
		exports.set('showSeconds', showSeconds?"true":"false");
	};
	exports.getShowSeconds = function() {
		return storage.showSeconds == "true";
	};

	exports.data = function() {
		return {
			timeMode: exports.getTimeMode(),
			showSeconds: exports.getShowSeconds(),
			font: exports.getFont()
		};
	};

	exports.modes = modes;
});
