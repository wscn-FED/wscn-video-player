var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var babel = require('gulp-babel');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglify');
var del = require('del');
var runSequence = require('run-sequence');
var open = require('gulp-open');
var webserver = require('gulp-webserver');
var autoprefixer = require('gulp-autoprefixer');
var DIR = {
  sass: './src/scss/*.scss',
  js: './src/js/*.js'
}


gulp.task('webserver', function() {
  gulp.src('./')
    .pipe(webserver({
      livereload: true,
      open: true,
      port: 8080
    }))
});

gulp.task('sass', function() {
  return gulp.src(DIR.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      flexbox: true
    }))
    .pipe(gulp.dest('./dist'))
});

gulp.task('sass:watch', function() {
  gulp.watch(DIR.sass, ['sass']);
});

gulp.task('babel', function() {
  gulp.src(DIR.js)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('./dist'))
});


gulp.task('babel:watch', function() {
  gulp.watch(DIR.js, ['babel']);
});


gulp.task('compression', function() {
  gulp.src('./dist/video.css')
    .pipe(cssnano())
    .pipe(rename('ws-video.min.css'))
    .pipe(gulp.dest('./build'))

  return gulp.src('./dist/*.js')
    .pipe(uglify())
    .pipe(rename('ws-video.min.js'))
    .pipe(gulp.dest('./build'));
});

gulp.task('watch', ['sass:watch', 'babel:watch']);

gulp.task('open', function() {
  gulp.src('./index.html')
    .pipe(open({app: 'chrome'}))
});

gulp.task('default', function(cb) {
  runSequence(
    ['sass', 'babel'],
    'watch',
    'open',
    'webserver',
    cb
  )
});


gulp.task('clean:build', function(){
  del.sync(['./build'])
});

gulp.task('build', function(cb) {
  runSequence(
    'clean:build',
    'sass',
    'babel',
    'compression',
    cb
  )
});
