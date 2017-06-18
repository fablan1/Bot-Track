var gulp = require('gulp');
var sass = require('gulp-sass');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify'); // minify js
var cssnano = require('gulp-cssnano'); // minify css
var gulpIf = require('gulp-if'); // filter minify task for specific filetypes
var change = require('change');

var scssFiles = 'templates/scss/**';
var jsFiles = ['app.js','views/*.js'];
var buildFolder = 'build/';

gulp.task('sass', function(){
    return gulp.src(scssFiles)
        .pipe(sass())
        //.pipe(gulpIf('*.css', cssnano())) // minify css
        .pipe(gulp.dest(buildFolder+'css/'))
});

gulp.task('merge-js', function(){
    return gulp.src('index.html')
        .pipe(useref())
        //.pipe(gulpIf('*.js', uglify())) // minify js
        .pipe(gulp.dest('build'))
});

gulp.task('prepareIndex', function()
{
    return gulp.src('index.html')
        .pipe(change(function (content,done)
        {
            var startIndex = content.indexOf('<!-- {HTML_BLOCK} -->');
            var endIndex = content.indexOf('<!-- {/HTML_BLOCK} -->');

            content = content.substr(startIndex+startIndex.length,endIndex);
            console.log(content);

            done(null,content);
        }))
        .pipe(gulp.dest('build/'))
});

gulp.task('watch', function(){

    gulp.watch(scssFiles, ['sass']);
    gulp.watch(jsFiles, ['merge-js']);
});

gulp.task('useref', function(){
    return gulp.src('index.html')
        .pipe(useref())
        //.pipe(gulpIf('*.js', uglify())) // minify js
        .pipe(gulp.dest('build'))

        .pipe(gulpIf('*.css', cssnano())) // minify css
        .pipe(gulp.dest('build'))
});