var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    pump = require('pump');

gulp.task('compress', function (cb) {
    pump([
          gulp.src('app/js/background.js'),
          uglify(),
          gulp.dest('dist')
    ],
      cb
    );
});