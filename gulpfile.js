'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var browserSync = require('browser-sync');
var del = require('del');
var cache = require('gulp-cached');
var htmlmin = require('gulp-htmlmin');
var cachebust = require('gulp-cache-bust');

var paths = {
  src: {
    html: 'src/**/*.html',
    css: 'src/assets/sass/styles.scss',
    js: 'src/assets/scripts/*.js',
    img: 'src/assets/images/**/*.+(png|jpg|jpeg|gif|svg)'
  },
  build: {
    html: 'build',
    css: 'build/css',
    js: 'build/scripts',
    img: 'build/images'
  },
  watch: {
    html: 'src/**/*.html',
    scss: 'src/assets/sass/**/*.scss'
  },
  clean: './build'
};

var serverConfig = {
  server: {
    baseDir: './build'
  },
  host: 'localhost',
  port: 9000,
  logPrefix: 'NASA',
  notify: false
};

// Assembling HTML
gulp.task('bundleHtml', function() {
  return gulp
    .src(paths.src.html)
    .pipe(cache('html'))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(
      cachebust({
        type: 'timestamp'
      })
    )
    .pipe(gulp.dest(paths.build.html))
    .pipe(browserSync.reload({ stream: true }));
});

// Assembling CSS
gulp.task('bundleCss', function() {
  return gulp
    .src(paths.src.css)
    .pipe(
      sass({
        outputStyle: 'expanded'
      }).on('error', sass.logError)
    )
    .pipe(concat('styles.min.css'))
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
      })
    )
    .pipe(cssnano())
    .pipe(
      cachebust({
        type: 'timestamp'
      })
    )
    .pipe(gulp.dest(paths.build.css))
    .pipe(browserSync.reload({ stream: true }));
});

// Assembling JavaScript
gulp.task('bundleJS', function() {
  return gulp.src(paths.src.js).pipe(gulp.dest(paths.build.js));
});

// Optimizing images
gulp.task('bundleImg', function() {
  return gulp
    .src(paths.src.img)
    .pipe(cache('img'))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        use: [pngquant()],
        interlaced: true
      })
    )
    .pipe(gulp.dest(paths.build.img))
    .pipe(browserSync.reload({ stream: true }));
});

// Watching for changes in SRC files
gulp.task('watch', function() {
  gulp.watch(paths.watch.html, ['bundleHtml']);
  gulp.watch(paths.watch.scss, ['bundleCss']);
  gulp.watch(paths.src.js, ['bundleJS']);
  gulp.watch(paths.src.img, ['bundleImg']);
});

// BrowserSync server
gulp.task('webServer', function() {
  browserSync(serverConfig);
});

// Cleaning build dir
gulp.task('clean:build', function() {
  return del.sync(paths.clean);
});

// General build task
gulp.task('build', ['bundleImg', 'bundleCss', 'bundleJS', 'bundleHtml']);

// Default task to run
gulp.task('start', ['clean:build', 'build', 'webServer', 'watch']);
