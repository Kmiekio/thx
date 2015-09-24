'use strict';

var gulp = require('gulp');

// load plugins
var $ = require('gulp-load-plugins')();
var gutil = require('gulp-util');
var runSequence = require('run-sequence');
var pjson = require('./package.json');

// paths to resources
var paths = {
  scss: 'build/scss/style.scss',
  scripts: 'build/js/**/*.js',
  main: 'build/js/main.js',
  plugins: ['bower_components/modernizr/modernizr.js'],
  images: 'build/images/**/*',
  php: '**/*.php',
  css: '**/*.css',
  js: 'js/**/*.js'
}

// destinations for resources
var dest = {
  css: '',
  scripts: 'js',
  images: 'images'
}

// process scss file
gulp.task('styles', function () {
  return gulp.src(paths.scss)
    .pipe($.rubySass({
      style: 'expanded',
      precision: 10
    }))
    .pipe($.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest(dest.css))
    .pipe($.size());
});

// perform jshint on javascript files
gulp.task('jshint', function () {
  return gulp.src(paths.scripts)
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'))
    .pipe($.size());
});

// uglify, rename and move destination of the main.js file
gulp.task('jsmain', function(){
  return gulp.src(paths.main)
    .pipe(gulp.dest(dest.scripts))
    .pipe($.size())
    .pipe($.uglify())
    .pipe($.rename('main.min.js'))
    .pipe(gulp.dest(dest.scripts))
    .pipe($.size())
});

// Combine the list of plugins (uncompressed) used via bower, concat, move, uglify, move
gulp.task('jsplugins', function(){
  return gulp.src(paths.plugins)
    .pipe($.concat('plugins.js'))
    .pipe(gulp.dest(dest.scripts))
    .pipe($.size())
    .pipe($.uglify())
    .pipe($.rename('plugins.min.js'))
    .pipe(gulp.dest(dest.scripts))
    .pipe($.size())
});

// compress images
gulp.task('images', function () {
  return gulp.src(paths.images)
    .pipe(($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(dest.images))
    .pipe($.size());
});

// Clean up dist and temporary
gulp.task('clean', function(){
  return gulp.src(['.tmp', 'dist'], { read: false }).pipe($.clean());
})

gulp.task('build', ['jshint', 'styles', 'jsmain', 'jsplugins', 'images']);

gulp.task('default', ['clean'], function(){
  gulp.start('build');
});

/* TODO - add in a deploy task to move everything into a dist dir
        - clean up and remove non-theme files
        - use gulp shell to commit to dist branch
        - https://gist.github.com/jonathanmoore/faf90b9297939c550663
        - https://github.com/nfroidure/buildbranch
        - https://github.com/OverZealous/run-sequence
*/
// gulp.task('deploy')

gulp.task('watch', function(){
  $.livereload.listen();
  gulp.watch([
      paths.php,
      paths.css,
      paths.scss,
      paths.js
    ]).on('change', function(file){
      $.livereload.changed(file.path);
    });

  gulp.watch(paths.scss, ['styles']);
  gulp.watch(paths.main, ['jshint', 'jsmain']);
  gulp.watch(paths.plugins, ['jsplugins']);
  gulp.watch(paths.images, ['images']);
});
