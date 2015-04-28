module.exports = function (grunt) {

  // grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.initConfig({
	
    pkg: grunt.file.readJSON('package.json'),
	

    jshint: {
      'beforeconcat': ['client/**/*.js'],
    },

	html2js: {
	    options: {
	      // custom options, see below
	      base: 'client'
	    },
	    main: {
	      src: ['./client/**/*.html'],
	      dest: '.tmp/clientTemplates.js'
	    },
	  },

    concat: { 
    	generated: { 
    		files: [ 
        		{ 
          			src: [ 'client/client.js', 'client/**/*.js', '.tmp/clientTemplates.js', '!client/test_runner/*.js' ] ,
        			dest: 'clientDist/client.js'
          		} 
          	] 
        } 
    },

    replace: {
	  code: {
	    src: ['clientDist/*.js'],             // source files array (supports minimatch)
	    dest: 'clientDist/',             // destination directory or file
	    replacements: [{
	      from: '/client/',                   // string replacement
	      to: ''
	    }]
	  },
	  testRunner: {
	    src: ['clientDist/test_runner/*.js'],             // source files array (supports minimatch)
	    dest: 'clientDist/test_runner/',             // destination directory or file
	    replacements: [{
	      from: '/client/',                   // string replacement
	      to: '/clientDist/'
	    }]
	  }
	},

    watch: {
    	scripts: {
    		files: [ 'client/client.js', 'client/client.css','client/**/*.js', 'client/**/*.html', 'client/client.jsp'],
    		tasks: ['build'],
    		options: {
    			event: ['all']
    		}
    	}
    },

    copy: {
	  main: {
	    files: [
	      {expand:true,flatten:true, src: ['client/client.jsp'], dest: 'clientDist/', filter: 'isFile'},
	      {expand:true,flatten:true, src: ['client/client.css'], dest: 'clientDist/', filter: 'isFile'},
	      {expand:true,flatten:true, src: ['client/test_runner/*.js'], dest: 'clientDist/test_runner', filter: 'isFile'},
	    ],
	  },
	},


  });

  // grunt.registerTask('test', ['karma:development']);
  grunt.registerTask('build', [
	  'html2js',
	  'concat',
	  'copy',
	  'replace',
	  // 'usemin'
	]);
};