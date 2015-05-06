module.exports = function (grunt) {

	var dir     = require('./bower.json').appPath || 'app';
	var distDir = dir + 'Dist';
	var cwd = process.cwd();

	process.chdir('../');
	// grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-html2js');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-text-replace');
	process.chdir( dir );

	grunt.initConfig({
	
    	pkg: grunt.file.readJSON( './../package.json'),
	
    	
		// converts all .html templates in js and write them in .tmp/templates.js
		html2js: {
			options: { base: '' },
			main: {
				src: [ '/**/*.html'],
				dest:  '/.tmp/templates.js'
			},
		},

		// concat all the js files ( except the files in test_runner folder ) to a temp folder
		concat: { 
			generated: { 
				files: [ 
					{ 
						src: [ 
							dir + '/**/*.js',
							dir + '/.tmp/templates.js',
							'!' + dir + '/Gruntfile.js',
						],
						dest: dir + '/.tmp/admin.js'
					} 
				] 
			} 
		},


		replace: {
			// replace the templates url in the client code
			scripts: {
				src: [ dir + '/.tmp/admin.js'],             // source files array (supports minimatch)
				dest: dir + '/.tmp/admin.js',             // destination directory or file
				replacements: [
					// replace all '/client' occurrences with 'client'
					{ from: '/' + dir + '/', to:  '/' + distDir + '/' },

					// { from: 'templateUrl: \'', to: 'templateUrl: \'/'+distDir+'/' }
				]
			},

			// replace the urls in the jsp page
			jsp: {
				src: [ dir + '/admin.jsp'],             // source files array (supports minimatch)
				dest: dir + '/.tmp/admin.jsp',             // destination directory or file
				replacements: [
					// replace all '/client' occurrences with 'client'
					{ from: 'src="/'+dir+'/', to: 'src="/'+distDir+'/' },
					{ from: 'href="/'+dir+'/', to: 'href="/'+distDir+'/' }
				]
			},
		},


		// copy the files to the dist dir
		copy: {
			main: {
				files: [
					{expand:true,flatten:true, src: [ dir + '/.tmp/admin.js'], dest: distDir + '/', filter: 'isFile'},
					{expand:true,flatten:true, src: [ dir + '/.tmp/admin.jsp'], dest: distDir + '/', filter: 'isFile'},
					{expand:true,flatten:true, src: [ dir + '/styles/*.css'], dest: distDir + '/styles/', filter: 'isFile'},
				],
			},
		},

		// watch for any edit of the html, js, css or jsp and rebuild the project
		watch: {
			options: {
				cliArgs: ['--gruntfile', require('path').join( cwd, 'Gruntfile.js' ) ],
			},
			scripts: {
				files: [ dir + '/admin.js', dir + '/styles/*.css', dir + '/**/*.js', dir + '/**/*.html', dir + '/admin.jsp'],
				tasks: ['get-directory','build'],
				options: {
					event: ['all']
				}
			}
		},



  	});

	grunt.registerTask('get-directory', 'get directory', function() {
		console.log( require('path').join( cwd , 'Gruntfile.js' ) );
	});
	// grunt.registerTask('test', ['karma:development']);
	grunt.registerTask('build', [
		'html2js',
		// 'concat',
		// 'replace:scripts',
		// 'replace:jsp',
		// 'replace:testRunner',
		// 'copy',
		// 'usemin'
	]);
};