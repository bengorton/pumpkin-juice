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
jade        = require('gulp-jade');
imagemin    = require('gulp-imagemin');
cache       = require('gulp-cache');
minifyCSS   = require('gulp-minify-css');
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

//compressing images & handle SVG files
gulp.task('images-deploy', function() {
  gulp.src(['app/assets/images/**/*'])
    .pipe(gulp.dest('public/images'))
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
  //the initializer / master SCSS file, which will just be a file that imports everything
  return gulp.src('app/styles/scss/init.scss')
      //include SCSS and list every "include" folder
     .pipe(sass({
        errLogToConsole: true,
        includePaths: [
          'app/styles/scss/'
        ]
     }))
     //catch errors
     .on('error', gutil.log)
     //the final filename of our combined css file
     .pipe(concat('styles.css'))
     //where to save our final, compressed css file
     .pipe(gulp.dest('app/styles'))
     //notify LiveReload to refresh
     //.pipe(connect.reload());
});

//compiling our SCSS files for deployment
gulp.task('styles-deploy', function() {
  //the initializer / master SCSS file, which will just be a file that imports everything
  return gulp.src('app/styles/scss/init.scss')
    //include SCSS includes folder
    .pipe(sass({
      includePaths: [
        'app/styles/scss',
      ]
    }))
   //the final filename of our combined css file
   .pipe(concat('styles.css'))
   .pipe(minifyCSS())
   //where to save our final, compressed css file
   .pipe(gulp.dest('public/styles'));
});

gulp.task('templates', function() {
  gulp.src('./lib/*.jade')
    .pipe(jade({
      locals: ['app/**/*.jade']
    }))
    .pipe(gulp.dest('/public'))
});

gulp.task('assets', ['templates', 'html', 'images-deploy']);

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

//cleans our public directory in case things got deleted
gulp.task('clean', function() {
    del('public');
});

/**
 * the default task is to build but not minify everything in source
 * then run harp on the public directory and set up watchers for
 * source changes.
 */
gulp.task('default', ['serve', 'scripts', 'styles', 'templates', 'assets'], function() {
    //a list of watchers, so it will watch all of the following files waiting for changes
    gulp.watch('app/scripts/src/**', ['scripts']);
    gulp.watch('app/styles/scss/**', ['styles']);
    gulp.watch('app/images/**', ['images']);
    gulp.watch('app/**/*.jade', ['templates']);
});

/**
 * the deploy task is basically the same as default but minifies source
 * for deployment
 */
gulp.task('deploy', ['clean'], function () {
  gulp.start('scripts-deploy', 'styles-deploy', 'html-deploy', 'images-deploy');
});
