module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.initConfig({
    	pkg: grunt.file.readJSON('package.json'),
    	less: {
    		development : {
				options: {
					report: 'min',
					yuicompress: false,
					paths: ["www/css"]
				},
				files: {
					"www/css/app.css": "www/css/app.less"
				}
			}
    	},
    	watch: {
			scripts: {
				files: ['**/*.less'],
				tasks: ['less'],
				options: {
					spawn: false,
				},
			},
		},

	});

}