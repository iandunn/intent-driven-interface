module.exports = function ( grunt ) {
	var js_files  = [ 'javascript/**/*.js', '!javascript/*.min.js' ],
		css_files = [ 'css/*.css', '!css/*.min.css' ];

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		uglify: {
			dist: {
				files: {
					'javascript/intent-driven-interface.min.js': js_files
				}
			}
		},

		jshint: {
			files: js_files,

			options: {
				"boss": true,
				"browser": true,
				"curly": true,
				"eqeqeq": true,
				"eqnull": true,
				"es3": true,
				"expr": true,
				"force": true,
				"immed": true,
				"noarg": true,
				"onevar": true,
				"quotmark": "single",
				"trailing": true,
				"undef": true,
				"unused": true,

				"globals": {
					"_": false,
					"Backbone": false,
					"console": false,
					"jQuery": false,
					"idiOptions": true
				}
			}
		},

		cssmin: {
			combine: {
				files: {
					'css/intent-driven-interface.min.css': css_files
				}
			}
		},

		watch: {
			js: {
				files: js_files,
				tasks: [ 'uglify', 'jshint', 'beep:error', 'reset-grunt-error-count' ]
			},

			css: {
				files: css_files,
				tasks: [ 'cssmin' ]
			},

			options: {
				spawn: false
			}
		}
	} );

	/**
	 * Reset Grunt's error count
	 *
	 * We have grunt-beep setup to beep on errors, but we also have `spawn: false` setup for the watch task. That
	 * means that the error count doesn't get reset on it's own, so after one error has been encountered, there'll
	 * be a beep on all subsequent runs, even after the problem has been resolved.
	 *
	 * @see {@link https://github.com/shama/grunt-beep/issues/6 grunt-beep #6}
	 */
	grunt.registerTask( 'reset-grunt-error-count', "Reset Grunt's error count", function() {
		grunt.fail.errorcount = 0;
	} );

	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-beep' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.registerTask( 'default', [ 'uglify', 'cssmin', 'jshint' ] );
};
