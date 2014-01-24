var app, base, coffee, concat, connect, directory, gulp, gutil, hostname, http, lr, open, path, refresh, sass, server, uglify;

gulp = require('gulp');
gutil = require('gulp-util');
coffee = require('gulp-coffee');
concat = require('gulp-concat');
uglify = require('gulp-uglify');
sass = require('gulp-sass');
refresh = require('gulp-livereload');
open = require('gulp-open');
connect = require('connect');
http = require('http');
path = require('path');
lr = require('tiny-lr');

server = lr();

gulp.task('webserver', function() {
    var port = 3000;
    hostname = null;
    base = path.resolve('app');
    directory = path.resolve('app');
    app = connect().use(connect["static"](base)).use(connect.directory(directory));
    http.createServer(app).listen(port, hostname);
});

gulp.task('livereload', function() {
    server.listen(35729, function(err) {
        if (err != null) {
            return console.log(err);
        }
    });
});

gulp.task('scripts', function() {
    gulp.src('app/scripts/src/**/*.js')
               .pipe(concat('app.js'))
               .pipe(uglify())
               .pipe(gulp.dest('app/scripts/js'))
               .pipe(refresh(server));
});

gulp.task('styles', function() {
    gulp.src('app/styles/scss/init.scss')
               .pipe(sass({
                      includePaths: [
                          'app/styles/scss/general', 
                          'app/styles/scss/pages'
                      ]
               }))
               .pipe(concat('styles.css'))
               .pipe(gulp.dest('app/styles/css'))
               .pipe(refresh(server));
});

gulp.task('html', function() {
    gulp.src('*.html')
                .pipe(refresh(server));
});

gulp.task('default', function() {
    gulp.run('webserver', 'livereload', 'scripts', 'styles');
    gulp.watch('app/scripts/src/**', function() {
        return gulp.run('scripts');
    });
    gulp.watch('app/styles/scss/**', function() {
        return gulp.run('styles');
    });
    gulp.watch('app/*.html', function() {
        return gulp.run('html');
    });
});
