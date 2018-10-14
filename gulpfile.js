"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var mqpacker = require("css-mqpacker");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var del = require("del");
var run = require("run-sequence");

gulp.task("clean", function() {
    return del("build");
});

gulp.task("copy", function() {
    return gulp.src([
        "fonts/**/*.{woff,woff2}",
        "img/**",
        "*.html"
    ], {
        base: "."
    })
        .pipe(gulp.dest("build"));
});

gulp.task("style", function() {
    gulp.src("sass/style.scss")
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer({browsers: [
                    "last 2 versions"
                ]}),
            mqpacker({
                sort: false
            })
        ]))
        .pipe(gulp.dest("build/css"))
        .pipe(minify())
        .pipe(rename("style.min.css"))
        .pipe(gulp.dest("build/css"))
        .pipe(server.stream());
});


gulp.task("symbols", function() {
    return gulp.src("build/img/*.svg")
        .pipe(svgmin())
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename("symbols.svg"))
        .pipe(gulp.dest("build/img"));
});

gulp.task("html:copy", function() {
    return gulp.src("*.html")
        .pipe(gulp.dest("build"));
});

gulp.task("html:update", ["html:copy"], function(done) {
    server.reload();
    done();
});

gulp.task("serve", function() {
    server.init({
        server: "build/",
        notify: false,
        open: true,
        cors: true,
        ui: false
    });

    gulp.watch("sass/**/*.{scss,sass}", ["style"]);
    gulp.watch("*.html", ["html:update"]);
});

gulp.task ("build", function(fn) {
    run(
        "clean",
        "copy",
        "style",
        "symbols",
        fn
    );
});
