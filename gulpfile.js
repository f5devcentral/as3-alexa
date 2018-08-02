// Require all plugins
'use strict';
//var modules = require('./gulp-tasks/modules.js');
const gulp = require('gulp');
const babel = require('gulp-babel');
const ngAnnotate = require('gulp-ng-annotate');
const sourcemaps = require('gulp-sourcemaps');
const log = require('fancy-log');
const uglify = require('gulp-uglify');
const stream = require('merge-stream');
const less = require('gulp-less');
const path = require('path');


gulp.task('clientjs', function() {
    const client = gulp.src('app/src/components/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['env']
    }))
    .on('error', log)
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('app/components'));

    // For now just babelify the entry file
    const entry = gulp.src('app/src/app.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['env']
    }))
    .on('error', log)
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('app'));

    return stream(client, entry);
});

gulp.task('less', function () {
    return gulp.src('app/assets/styles/**/*.less')
    .pipe(less({
        paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('app/assets/styles'));
});

gulp.task('default', ['clientjs', 'less'], function() {
    gulp.watch(['app/src/components/**/*', 'app/src/app.js'], ['clientjs']);
    gulp.watch(['app/assets/styles/**/*'], ['less']);
});
