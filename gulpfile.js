
const gulp = require('gulp')
const babel = require('gulp-babel')
const del = require('del')

gulp.task('default', function () {
  del.sync('lib')

  gulp.src([ 'src/*.js' ])
    .pipe(babel())
    .pipe(gulp.dest('lib/'))
})

gulp.task('watch', function () {
  gulp.watch([ 'src/*.js' ],
  [ 'default' ])
})
