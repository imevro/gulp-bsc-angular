"use strict"

var gulp = require("gulp"),
    $ = require("gulp-load-plugins")(),
    args = require("yargs").argv,
    Sequence = require('run-sequence');

var minifyHtml = require("gulp-minify-html");

gulp.task("clean", function() {
  return gulp.src([".tmp", "dist"], { read: false })
    .pipe($.rimraf())
});

// scripts
gulp.task("coffee", function() {
  return gulp.src(["app/scripts/**/*.coffee"])
    .pipe($.coffeelint({
      max_line_length: { level: "ignore" },
      no_interpolation_in_single_quotes: { level: "error" }
    }))
    .pipe($.coffeelint.reporter())
    .pipe($.coffee())
    .pipe($.ngAnnotate())
    .pipe($.if((args.env == "production"), $.uglify()))
    .pipe(gulp.dest(".tmp/scripts"))
});

// sass
gulp.task("sass", function() {
  return gulp.src("app/styles/*.scss")
    .pipe($.sass({ outputStyle: "compressed" }))
    .pipe(gulp.dest(".tmp/styles"))
});

// fonts
gulp.task("fonts", function() {
  return gulp.src("app/fonts/**/*.*")
    .pipe(gulp.dest("dist" + "/fonts"))
});

// images
gulp.task("svg", function() {
  return gulp.src("app/images/**/*.svg")
    .pipe($.svgmin())
    .pipe(gulp.dest("dist/images"));
});

gulp.task("favicon", function() {
  return gulp.src("app/favicon.ico")
    .pipe(gulp.dest("dist"))
})

gulp.task("images", function() {
  return gulp.src("app/images/**/*.{jpg,png,gif}")
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

gulp.task("views", function() {
  return gulp.src("app/views/**/*.html")
    .pipe(minifyHtml({empty: true}))
    .pipe(gulp.dest("dist/views"));
});

// livereload
gulp.task("livereload", function() {
  return gulp.src(["app/*.html", "app/views/**/*.html"])
    .pipe($.connect.reload())
});

// env
gulp.task("build", function() {
  Sequence("clean", ["sass", "coffee"], ["fonts", "svg", "images"], ["templates", "views"]);
});

// watch
gulp.task("watch", function() {
  Sequence("clean", ["sass", "coffee"], function() {
    $.connect.server({
      livereload: true,
      root: ["app", ".tmp"],
      port: 3000
    })

    gulp.watch(["app/*.html", "app/views/**/*.html"], ["livereload"]);
    gulp.watch("app/styles/**/*.scss", ["sass", "livereload"]);
    gulp.watch("app/scripts/**/*.coffee", ["coffee", "livereload"]);
    gulp.watch("app/images/**/*", ["images", "livereload"]);
  })
});