module.declare(function(require, exports, module) {
	var Q = require('vendor/q'),
		environment = require('./environment');

	exports.storage = {};
	exports.storage.get = function(key) {
		var defer = Q.defer();

		if (environment.chrome) {
			chrome.storage.sync.get(key, function(objs) {
				defer.resolve(objs[key]);
			});
		} else {
			defer.resolve(localStorage[key]);
		}

		return defer.promise;
	};

	exports.storage.set = function(key, value) {
		var defer = Q.defer();

		if (environment.chrome) {
			chrome.storage.sync.set({
				key: value

			}, defer.resolve);
		} else {
			localStorage[key] = value;
			defer.resolve();
		}

		return defer.promise;
	};
});