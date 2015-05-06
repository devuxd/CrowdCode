module.exports = function (grunt) {

	var dir     = require('./bower.json').appPath || 'app';
	var distDir = dir + 'Dist';

	process.chdir('../');
	// grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-html2js');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-text-replace');

	grunt.initConfig({
	
    	pkg: grunt.file.readJSON( './package.json'),
	
    	// lint all the js files
    	jshint: { 'beforeconcat': [ dir + '/**/*.js'] },

		// converts all .html templates in js and write them in .tmp/templates.js
		html2js: {
			options: { base: '' },
			main: {
				src: [ dir + '/**/*.html'],
				dest:  dir + '/.tmp/templates.js'
			},
		},

		// concat all the js files ( except the files in test_runner folder ) to a temp folder
		concat: { 
			generated: { 
				files: [ 
					{ 
						src: [ 
							dir + '/client.js', 
							dir + '/**/*.js', 
							'!' + dir + '/Gruntfile.js',
							'!' + dir + '/test_runner/*.js',
							dir + '/.tmp/templates.js',
							// dir + '/test_runner/testRunner.js',
						],
						dest: dir + '/.tmp/client.js'
					} 
				] 
			} 
		},


		replace: {
			// replace the templates url
			scripts: {
				src: [ dir + '/.tmp/client.js'],             // source files array (supports minimatch)
				dest: dir + '/.tmp/client.js',             // destination directory or file
				replacements: [
					// replace all '/client' occurrences with 'client'
					{ from: '/' + dir, to:  dir },

					 // replace all 'client' occurrences with 'clientDist'
					{ from: dir, to:  distDir }
				]
			},

			// replace the templates url
			jsp: {
				src: [ dir + '/client.jsp'],             // source files array (supports minimatch)
				dest: dir + '/.tmp/client.jsp',             // destination directory or file
				replacements: [
					// replace all '/client' occurrences with 'client'
					{ from: 'src="/'+dir+'/', to: 'src="/'+distDir+'/' }
				]
			},


			testRunner: {
				src: [ dir + '/test_runner/*.js'],       // source files array (supports minimatch)
				dest:  dir + '/.tmp/test_runner/',   // destination directory or file
				replacements: [
					{ from: '/' + dir + '/', to: '/' + distDir + '/' }
				]
			}
		},



		copy: {
			main: {
				files: [
					{expand:true,flatten:true, src: [ dir + '/.tmp/client.js'], dest: distDir + '/', filter: 'isFile'},
					{expand:true,flatten:true, src: [ dir + '/.tmp/client.jsp'], dest: distDir + '/', filter: 'isFile'},
					{expand:true,flatten:true, src: [ dir + '/client.css'], dest: distDir + '/', filter: 'isFile'},
					{expand:true,flatten:true, src: [ dir + '/.tmp/test_runner/*.js'], dest: distDir + '/test_runner', filter: 'isFile'},
				],
			},
		},

 //    watch: {
 //    	scripts: {
 //    		files: [ 'client/client.js', 'client/client.css','client/**/*.js', 'client/**/*.html', 'client/client.jsp'],
 //    		tasks: ['build'],
 //    		options: {
 //    			event: ['all']
 //    		}
 //    	}
 //    },



  });

  // grunt.registerTask('test', ['karma:development']);
  grunt.registerTask('build', [
	  'html2js',
	  'concat',
	  'replace:scripts',
	  'replace:jsp',
	  'replace:testRunner',
	  'copy',
	  // 'usemin'
	]);
};