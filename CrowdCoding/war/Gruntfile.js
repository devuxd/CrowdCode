module.exports = function (grunt) {

  // grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-usemin');

  grunt.initConfig({
	
    pkg: grunt.file.readJSON('package.json'),
	

    jshint: {
      'beforeconcat': ['client/**/*.js'],
    },


    useminPrepare: {
      html: 'client/client.jsp',
      options: {
      	dest: 'client_dist/'
      }
    },

    usemin: {
      html: 'client_dist/client.jsp',
    }

  });

  // grunt.registerTask('test', ['karma:development']);
  grunt.registerTask('build', [
	  'useminPrepare',
	  'concat',
	  // 'cssmin:generated',
	  // 'uglify:generated',
	  // 'filerev',
	  'usemin'
	]);
};