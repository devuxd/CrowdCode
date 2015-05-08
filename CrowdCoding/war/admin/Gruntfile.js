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
	
    	pkg: grunt.file.readJSON( '../package.json'),
	
    	
		// converts all .html templates in js and write them in .tmp/templates.js
		html2js: {
			options: { base: '' },
			main: {
				src: [ '**/*.html'],
				dest:  '.tmp/templates.js'
			},
		},

		// concat all the js files ( except the files in test_runner folder ) to a temp folder
		concat: { 
			generated: { 
				files: [ 
					{ 
						src: [ 
							'admin.js', 
							'**/*.js', 
							'!Gruntfile.js',
							'.tmp/templates.js',
						],
						dest: '.tmp/admin.js'
					} 
				] 
			} 
		},


		replace: {
			// replace the templates url in the client code
			scripts: {
				src: [ '.tmp/admin.js'],             // source files array (supports minimatch)
				dest: '.tmp/admin.js',             // destination directory or file
				replacements: [
					// replace all '/client' occurrences with 'client'
					{ from: '/' + dir + '/', to:  '/' + distDir + '/' },

					// { from: 'templateUrl: \'', to: 'templateUrl: \'/'+distDir+'/' }
				]
			},

			// replace the urls in the jsp page
			jsp: {
				src: [ 'admin.jsp'],             // source files array (supports minimatch)
				dest: '.tmp/admin.jsp',             // destination directory or file
				replacements: [
					// replace all '/client' occurrences with 'client'
					{ from: 'src="/'+dir+'/', to: 'src="/'+distDir+'/' }, 
					{ from: 'href="/'+dir+'/', to: 'href="/'+distDir+'/' },
				]
			},
		},


		// copy the files to the dist dir
		copy: {
			main: {
				files: [
					{expand:true,flatten:true, src: [ '.tmp/admin.*'],         dest: '../' + distDir + '/', filter: 'isFile'},
					{expand:true,flatten:true, src: [ 'styles/*.css'],            dest: '../' + distDir + '/', filter: 'isFile'},
				],
			},
		},

		// watch for any edit of the html, js, css or jsp and rebuild the project
		watch: {
			scripts: {
				files: [ 'admin.js', 'styles/*.css', '**/*.js', '/**/*.html', 'admin.jsp'],
				tasks: ['build'],
				options: {
					event: ['all']
				}
			}
		},



  	});

	grunt.registerTask('build', [
		'html2js',
		'concat',
		'replace:scripts',
		'replace:jsp',
		'copy',
		// 'usemin'
	]);
};