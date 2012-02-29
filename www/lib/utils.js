module.declare(function(require, exports, module) {
    exports.parseTimeOutOfParams = function(data) {
        var tmp = '',
            params = {},
            // Is this a parsable date?
            isDate = true;

        for (var i=0, l=data.length; i < l; i++) {
            var chr = data.charAt(i);
            switch (chr) {
                case 'h':
                    params.hours = parseInt(tmp);
                    tmp = '';
                    isDate = false;
                    break;
                case 'm':
                    params.minutes = parseInt(tmp);
                    tmp = '';
                    isDate = false;
                    break;
                case 's':
                    params.seconds = parseInt(tmp);
                    tmp = '';
                    isDate = false;
                    break;
                default:
                    tmp += chr;
            }
        }
        if (isDate) {
            params.time = data;
        }

        return params;
    }
});
