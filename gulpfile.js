'use strict'

var gulp      = require('gulp'),
  to5         = require('gulp-6to5'),
  concat      = require('gulp-concat'),
  uglify      = require('gulp-uglify'),
  flatten     = require('gulp-flatten'),
  stylus      = require('gulp-stylus'),
  jeet        = require('jeet'),
  nib         = require('nib'),
  rupture     = require('rupture'),
  minifyCSS   = require('gulp-minify-css'),
  jade        = require('gulp-jade'),
  imagemin    = require('gulp-imagemin'),
  cache       = require('gulp-cache'),
  harp        = require('harp'),
  livereload  = require('gulp-livereload'),
  del         = require('del');

gulp.task('serve', function () {
  harp.server(__dirname + '/public', {
    port: 9000
  });
  livereload.listen();
});

//compressing images & handle SVG files
gulp.task('optimize-images', function(tmp) {
  console.log(tmp);
  gulp.src(['app/assets/images/**/*.jpg', 'app/assets/images/**/*.png'])
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
});

/**
 * jade compiler
 */
gulp.task('templates', function() {
  gulp.src(['./app/*.jade'])
    .pipe(jade({pretty:true}))
    .pipe(gulp.dest('public'));
  gulp.src(['./app/layout/sections/**/*.jade'])
    .pipe(jade({pretty:true}))
    .pipe(gulp.dest('public'));
});

/**
 * es6 compile and concat
 */
gulp.task('scripts', function () {
  gulp.src('app/vendor/**/*.js')
    .pipe(gulp.dest('public/js'));
  return gulp.src('app/**/*.js')
    .pipe(to5())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('public/js'))
});

gulp.task('scripts-deploy', function () {
  gulp.src('app/vendor/**/*.js')
    .pipe(gulp.dest('public/js'));
  return gulp.src('app/js/**/*.js')
    // es6 6to5 preprocessor
    .pipe(to5())
    .pipe(concat('app.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(gulp.dest('public/js'))
});

/**
 * stylus compliation, deploy version
 * compresses
 */
gulp.task('styles', function() {
  return gulp.src('app/styles/app.styl')
    .pipe(stylus({use: [jeet(), nib(), rupture()], compress: false}))
    .pipe(gulp.dest('public/styles'))
});

gulp.task('styles-deploy', function() {
  return gulp.src('app/styles/app.styl')
    .pipe(stylus({
      use: [jeet(), nib(), rupture()],
      compress: true
    }))
    .pipe(gulp.dest('public/styles'))
});


/**
 * clean up public
 */
gulp.task('clean', function() {
    del('public');
});

/**
 * run all the assets tasks
 */
gulp.task('assets', function() {
  gulp.src(['app/assets/fonts/**/*'])
    .pipe(gulp.dest('public/fonts'))

  gulp.src(['app/assets/images/**/*'])
    .pipe(gulp.dest('public/images'))
});

/**
 * the default task is to build but not minify everything in source
 * then run harp on the public directory and set up watchers for
 * source changes.
 */
gulp.task('default', ['scripts', 'styles', 'templates', 'assets', 'serve'], function() {
    //a list of watchers, so it will watch all of the following files waiting for changes
    gulp.watch('app/**/*.js', ['scripts']);
    gulp.watch('app/styles/**/*', ['styles']);
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch('app/**/*.jade', ['templates']);
});
/**
 * the deploy task is basically the same as default but minifies source
 * for deployment
 */
gulp.task('deploy', ['clean'], function () {
  gulp.start('scripts-deploy', 'styles-deploy', 'html-deploy', 'images-deploy');
});
