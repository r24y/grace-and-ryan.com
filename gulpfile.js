var gulp = require('gulp');
var jade = require('gulp-jade');
var less = require('gulp-less');
var watch = require('gulp-watch');
var serve = require('gulp-serve');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var babelify = require('babelify');

function pages() {
  return gulp.src('./src/*.jade')
    .pipe(jade({
      // locals go here
    }))
    .pipe(gulp.dest('./dist/'));
}

gulp.task('pages', pages);

function compileStyles() {
  return gulp.src('./src/*.less')
    .pipe(less())
    .pipe(gulp.dest('./dist/'));
}

gulp.task('styles', compileStyles);

gulp.task('watch:pages', function watchPages(cb) {
  return watch('./src/*.jade', function () {
    pages().pipe(watch('./src/*.jade')).on('end', cb);
  });
});

gulp.task('watch:styles', function watchStyles(cb) {
  return watch('./src/*.less', function () {
    compileStyles().pipe(watch('./src/*.less')).on('end', cb);
  });
});

function copyAssets() {
  return gulp.src('./assets/**')
    .pipe(gulp.dest('./dist/'));
}

function js() {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './src/main.js',
    debug: true,
    // defining transforms here will avoid crashing your stream
    transform: [babelify]
  });

  return b.bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        // .pipe(uglify())
        .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/js/'));
}

gulp.task('javascript', js);

gulp.task('copy:assets', copyAssets);

gulp.task('watch:assets', function watchAssets(cb) {
  return watch('./assets/**', function () {
    copyAssets().pipe(watch('./assets/**')).on('end', cb);
  });
});

gulp.task('watch:js', function watchJs(cb) {
  return watch('./src/**/*.js', function () {
    js().pipe(watch('./src/**/*.js')).on('end', cb);
  });
});

gulp.task('serve', serve('dist'));

gulp.task('default', ['pages','styles','javascript','copy:assets']);
gulp.task('watch', ['watch:pages','watch:styles','watch:assets','watch:js','serve']);
