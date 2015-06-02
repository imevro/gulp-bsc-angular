var del         = require('del');
var args        = require('yargs').argv;
var sequence    = require('run-sequence');

var gulp        = require('gulp');
var $           = require('gulp-load-plugins')();
var connectHistoryFallback = require('connect-history-api-fallback');

// Clean up
gulp.task('clean:publish', function() {
  return del('.publish');
});

gulp.task('clean:tmp', function() {
  return del('.tmp');
});

gulp.task('clean:dist', function() {
  return del('dist');
});

// Scripts
gulp.task('scripts', function() {
  return gulp.src('app/scripts/**/**.js')
    .pipe($.plumber())
    .pipe($.jshint())
    .pipe($.jscsWithReporter('.jscsrc'))
    .pipe($.jscsWithReporter.reporter('console'))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if((args.env == 'production'), $.jshint.reporter('fail')))
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/scripts'));
});

// Sass
gulp.task('sass', function() {
  return gulp.src('app/styles/app.scss')
    .pipe($.plumber())
    .pipe($.if((args.env == 'production'), $.sass({ outputStyle: 'compressed' }), $.sass())) // compressed for production
    .pipe($.autoprefixer())
    .pipe(gulp.dest('.tmp/styles'));
});

// Assets like svg
gulp.task('assets', function() {
  return gulp.src('app/assets/**/*.svg')
    .pipe($.plumber())
    .pipe($.svgmin())
    .pipe(gulp.dest('dist/assets'));
});

// Templates
gulp.task('templates', function() {
  var assets = $.useref.assets();

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe($.rev())
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe(gulp.dest('dist'));
});

gulp.task('templates:views', function() {
  return gulp.src('app/views/**/*.html')
    .pipe($.minifyHtml({ empty: true }))
    .pipe(gulp.dest('dist/views'));
});

// Livereload
gulp.task('livereload', function() {
  return gulp.src(['app/*.html', 'app/views/**/*.html'])
    .pipe($.connect.reload());
});

gulp.task('livereload:sass', function() {
  sequence('sass', 'livereload');
});

gulp.task('livereload:scripts', function() {
  sequence('scripts', 'livereload');
});

gulp.task('livereload:images', function() {
  sequence('images', 'livereload');
});

// Build
gulp.task('build', function() {
  sequence('clean:dist', ['sass', 'scripts', 'assets'], ['templates', 'templates:views']);
});

// Release
gulp.task('ghpages', function() {
  return gulp.src('dist/**/*')
    .pipe($.ghPages());
})

gulp.task('deploy:ghpages', function() {
  sequence(['clean:tmp', 'clean:publish', 'clean:dist'], ['sass', 'scripts', 'assets'], ['templates', 'templates:views'], 'ghpages');
});

// Watch
gulp.task('watch', function() {
  sequence('clean:tmp', ['sass', 'scripts'], function() {
    $.connect.server({
      livereload: true,
      root: ['.tmp', 'app', 'bower_components'],
      port: 3000,
      middleware: function(connect, opt) {
        return [connectHistoryFallback()];
      }
    });

    gulp.watch('app/**/*.html', ['livereload']);
    gulp.watch('app/scripts/**/*.js', ['livereload:scripts']);
    gulp.watch('app/styles/**/*.scss', ['livereload:sass']);
    gulp.watch('app/images/**/*', ['livereload:images']);
  })
});