//initialize all of our variables
var app, base, to5, concat, directory, gulp, gutil, hostname, path, refresh, sass, uglify, imagemin, cache, minifyCSS, del, harp;

//load all of our dependencies
//add more here if you want to include more libraries
gulp        = require('gulp');
to5         = require('gulp-6to5');
gutil       = require('gulp-util');
concat      = require('gulp-concat');
uglify      = require('gulp-uglify');

stylus      = require('gulp-stylus');
jeet        = require('jeet');
rupture     = require('rupture');
minifyCSS   = require('gulp-minify-css');

jade        = require('gulp-jade');
imagemin    = require('gulp-imagemin');
cache       = require('gulp-cache');
harp        = require('harp');
del         = require('del');

gulp.task('serve', function () {
  harp.server(__dirname + '/public', {
    port: 9000
  });
});


//compressing images & handle SVG files
gulp.task('optimize-images', function(tmp) {
  console.log(tmp);
  gulp.src(['app/assets/images/**/*.jpg', 'app/assets/images/**/*.png'])
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
});

//moving images to public
gulp.task('images-deploy', function() {
  gulp.src(['app/assets/images/**/*'])
    .pipe(gulp.dest('public/images'))
});

gulp.task('fonts', function() {
  gulp.src(['app/assets/fonts/**/*'])
    .pipe(gulp.dest('public/fonts'))
});

gulp.task('templates', function() {
  gulp.src('./app/**/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('/public'))
});

gulp.task('assets', ['templates', 'fonts', 'images-deploy']);

//migrating over all HTML files for deployment
gulp.task('html-deploy', function() {
    //grab everything, which should include htaccess, robots, etc
    gulp.src('app/*')
        .pipe(gulp.dest('public'));

    //grab any hidden files too
    gulp.src('app/.*')
        .pipe(gulp.dest('public'));

    gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('public/fonts'));

    //grab all of the styles
    gulp.src(['app/styles/*.css', '!app/styles/styles.css'])
        .pipe(gulp.dest('public/styles'));
});

gulp.task('scripts', function () {
  return gulp.src('app/js/**/*.js')
    .pipe(to5())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('public/js'))
});

gulp.task('scripts-deploy', function () {
  return gulp.src('app/js/**/*.js')
    // es6 6to5 preprocessor
    .pipe(to5())
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/js'))
});

gulp.task('styles', function() {
  return gulp.src('app/styles/app.styl')
    .pipe(stylus({use: [jeet()], compress: false}))
    .pipe(gulp.dest('public/styles'))
});

gulp.task('styles-deploy', function() {
  return gulp.src('app/styles/app.styl')
    .pipe(stylus({
      use: [jeet(), rupture()],
      compress: true
    }))
    .pipe(gulp.dest('public/styles'))
});

//cleans our public directory in case things got deleted
gulp.task('clean', function() {
    del('public');
});

/**
 * the default task is to build but not minify everything in source
 * then run harp on the public directory and set up watchers for
 * source changes.
 */
gulp.task('default', ['scripts', 'styles', 'templates', 'assets'], function() {
    //a list of watchers, so it will watch all of the following files waiting for changes
    gulp.watch('app/scripts/src/**', ['scripts']);
    gulp.watch('app/styles/scss/**', ['styles']);
    gulp.watch('app/images/**', ['images']);
    gulp.watch('app/**/*.jade', ['templates']);
});

gulp.task('run', ['serve', 'default']);

/**
 * the deploy task is basically the same as default but minifies source
 * for deployment
 */
gulp.task('deploy', ['clean'], function () {
  gulp.start('scripts-deploy', 'styles-deploy', 'html-deploy', 'images-deploy');
});
