const gulp = require('gulp');
const jade = require('gulp-jade');
const stylus = require('gulp-stylus');
const plumber = require('gulp-plumber');
const watch = require('gulp-watch');
const nib = require('nib');
const server = require('gulp-live-server');
const clean = require('gulp-clean');
const sequence = require('run-sequence');
const emailBuilder = require('gulp-email-builder');

gulp.task("build:templates", () => {
    return gulp.src("src/*.jade")
        .pipe(plumber())
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest("dev"));
});

gulp.task("build:styles", () => {
    return gulp.src("src/*.styl")
        .pipe(plumber())
        .pipe(stylus({
            use: nib(),
            compress: false
        }))
        .pipe(gulp.dest("dev"));
});

gulp.task("clean:dev", () => {
   return gulp.src(["dev", "dist"], {read: false})
        .pipe(clean());
});
gulp.task("clean", ["clean:dev"]);
gulp.task("build", ["build:templates", "build:styles"]);

gulp.task("dist", () => {
    const options = {};

    return sequence("clean", "build", () => {
        return gulp.src("dev/*.html")
            .pipe(emailBuilder(options))
            .pipe(gulp.dest("dist"));
    });
});

gulp.task("watch", () => {
    gulp.start("build");

    watch("src/**/*.jade", () => gulp.start("build:templates"));
    watch("src/**/*.styl", () => gulp.start("build:styles"));
});


gulp.task("serve:dev", () => {
    const _server = server.static(["dev", "public"]);

    sequence("clean", "watch", () => {
        watch("src/**/*", (file) => {
            _server.notify.apply(_server, [file]);
        });

        _server.start();
    });
});