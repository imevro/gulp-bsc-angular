"use strict"

var gulp = require("gulp"),
    $ = require("gulp-load-plugins")(),
    args = require("yargs").argv,
    Sequence = require("run-sequence"),
    del = require("del");

var minifyHtml = require("gulp-minify-html");

gulp.task("clean:tmp", function() {
  return del(".tmp");
});

gulp.task("clean:dist", function() {
  return del("dist");
});

// scripts
gulp.task("coffee", function() {
  return gulp.src(["app/scripts/**/*.coffee"])
    .pipe($.changed(".tmp/scripts"))
    .pipe($.sourcemaps.init())
    .pipe($.coffeelint({
      max_line_length: { level: "ignore" },
      no_interpolation_in_single_quotes: { level: "error" }
    }))
    .pipe($.coffeelint.reporter())
    .pipe($.coffee())
    .pipe($.if((args.env == "production"), $.uglify()))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(".tmp/scripts"));
});

// sass
gulp.task("sass", function() {
  return gulp.src("app/styles/*.scss")
    .pipe($.changed(".tmp/styles"))
    .pipe($.if((args.env == "production"), $.sass({ outputStyle: "compressed" }), $.sass()))
    .pipe($.autoprefixer())
    .pipe(gulp.dest(".tmp/styles"));
});

// fonts
gulp.task("fonts", function() {
  return gulp.src("app/fonts/**/*.*")
    .pipe(gulp.dest("dist" + "/fonts"));
});

// images
gulp.task("svg", function() {
  return gulp.src("app/images/**/*.svg")
    .pipe($.svgmin())
    .pipe(gulp.dest("dist/images"));
});

gulp.task("images", function() {
  return gulp.src("app/images/**/*.{jpg,jpeg,png,gif,ico}")
    .pipe(gulp.dest("dist/images"));
});

// templates
gulp.task("templates", function() {
  var assets = $.useref.assets();

  return gulp.src("app/*.html")
    .pipe(assets)
    .pipe($.rev())
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe(gulp.dest("dist"));
});

gulp.task("templates:views", function() {
  return gulp.src("app/views/**/*.html")
    .pipe(minifyHtml({empty: true}))
    .pipe(gulp.dest("dist/views"));
});

// livereload
gulp.task("livereload", function() {
  return gulp.src(["app/*.html", "app/views/**/*.html"])
    .pipe($.connect.reload());
});

gulp.task("livereload:sass", function() {
  Sequence("sass", "livereload");
});

gulp.task("livereload:coffee", function() {
  Sequence("coffee", "livereload");
});

gulp.task("livereload:images", function() {
  Sequence("images", "livereload");
});

// env
gulp.task("build", function() {
  Sequence("clean:dist", "sass", "coffee", ["fonts", "svg", "images"], ["templates", "templates:views"]);
});

// watch
gulp.task("watch", function() {
  Sequence("clean:tmp", "sass", "coffee", function() {
    $.connect.server({
      livereload: true,
      root: ["app", ".tmp"],
      port: 3000
    });

    gulp.watch(["app/*.html", "app/views/**/*.html"], ["livereload"]);
    gulp.watch("app/styles/**/*.scss", ["livereload:sass"]);
    gulp.watch("app/scripts/**/*.coffee", ["livereload:coffee"]);
    gulp.watch("app/images/**/*", ["livereload:images"]);
  })
});