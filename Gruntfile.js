module.exports = function (grunt) 
{
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        sourceMap: true
      },
      build: {
        src: './bundle.js',
        dest: './bundle.min.js'
      }
    },

    browserify: {
      build: {
        src: './index.js',
        dest: './bundle.js'
      }
    },

    jshint: {
      options: {
        browserify: true,
        camelcase: true,
        curly: false,
        ignores: [
          './demo/lib/fpsmeter.js'
        ],
        immed: true,
        indent: 2,
        newcap: true,
        quotmark: 'single',
        maxlen: 80,
        globals: {
          console: true,
          document: true,
          window: true,
          navigator: true
        },
        // "Expected an assignment or function call and instead saw an 
        // expression."
        '-W030': true
      },
      all: [
        './index.js',
        './Gruntfile.js',
        './demo/**/*.js'
      ],
    }

  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint', 'browserify', 'uglify']);
};