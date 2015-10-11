var gulp = require('gulp');
var jade = require('gulp-jade');
var less = require('gulp-less');
var watch = require('gulp-watch');
var serve = require('gulp-serve');

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

gulp.task('watch:styles', function watchPages(cb) {
  return watch('./src/*.less', function () {
    compileStyles().pipe(watch('./src/*.less')).on('end', cb);
  });
});

gulp.task('copy:assets', function copyAssets() {
  gulp.src('./assets/**')
    .pipe(gulp.dest('./dist/'));
});

gulp.task('serve', serve('dist'));

gulp.task('default', ['pages','styles']);
gulp.task('watch', ['watch:pages','watch:styles','serve']);
