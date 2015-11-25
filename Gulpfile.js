var gulp = require('gulp'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify');

gulp.task('build', function() {
	return gulp.src('jquery.time-to.js')
		.pipe(uglify({
			preserveComments: 'license'
		}))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('.'))
});
