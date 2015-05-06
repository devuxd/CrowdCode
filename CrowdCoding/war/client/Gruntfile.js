module.exports = function (grunt) {

	var dir     = require('./bower.json').appPath || 'app';
	var distDir = dir + 'Dist';

console.log(dir,distDir);
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
							'client.js', 
							'**/*.js', 
							'!Gruntfile.js',
							'!test_runner/*.js',
							'.tmp/templates.js',
						],
						dest: '.tmp/client.js'
					} 
				] 
			} 
		},


		replace: {
			// replace the templates url in the client code
			scripts: {
				src: [ '.tmp/client.js'],             // source files array (supports minimatch)
				dest: '.tmp/client.js',             // destination directory or file
				replacements: [
					// replace all '/client' occurrences with 'client'
					{ from: '/' + dir + '/' , to:  '' },

					//  // replace all 'client' occurrences with 'clientDist'
					// { from: dir, to:  distDir }
				]
			},

			// replace the urls in the jsp page
			jsp: {
				src: [ 'client.jsp'],             // source files array (supports minimatch)
				dest: '.tmp/client.jsp',             // destination directory or file
				replacements: [
					// replace all '/client' occurrences with 'client'
					{ from: 'src="/'+dir+'/', to: 'src="/'+distDir+'/' }
				]
			},

			// replace the urls in the test runner files
			testRunner: {
				src: [ 'test_runner/*.js'],       // source files array (supports minimatch)
				dest:  '.tmp/test_runner/',   // destination directory or file
				replacements: [
					{ from: '/' + dir + '/', to: '/' + distDir + '/' }
				]
			}
		},


		// copy the files to the dist dir
		copy: {
			main: {
				files: [
					{expand:true,flatten:true, src: [ '.tmp/client.*'],         dest: '../' + distDir + '/', filter: 'isFile'},
					{expand:true,flatten:true, src: [ 'client.css'],            dest: '../' + distDir + '/', filter: 'isFile'},
					{expand:true,flatten:true, src: [ '.tmp/test_runner/*.js'], dest: '../' + distDir + '/test_runner', filter: 'isFile'},
				],
			},
		},

		// watch for any edit of the html, js, css or jsp and rebuild the project
		watch: {
			scripts: {
				files: [ 'client.js', 'client.css', '**/*.js', '**/*.html', 'client.jsp'],
				tasks: ['build'],
				options: {
					event: ['all']
				}
			}
		},



  	});

	// grunt.registerTask('test', ['karma:development']);
	grunt.registerTask('build', [
		'html2js',
		'concat',
		'replace:scripts',
		'replace:jsp',
		'replace:testRunner',
		'copy',
	]);
};