module.declare(function(require, exports, module) {
	var Q = require('vendor/q'),
		environment = require('./environment');

	exports.get = function(key) {
		var defer = Q.defer();

		if (environment.chrome) {
			chrome.storage.sync.get(null, function(objs) {
				console.log("Got storage for ", objs);
				defer.resolve(objs[key]);
			});
		} else {
			defer.resolve(localStorage[key]);
		}

		return defer.promise;
	};

	exports.set = function(key, value) {
		var defer = Q.defer();
		console.log("Set", key, value);

		if (environment.chrome) {
			var obj = {};
			obj[key] = value;
			chrome.storage.sync.set(obj, defer.resolve);
		} else {
			localStorage[key] = value;
			defer.resolve();
		}

		return defer.promise;
	};
});