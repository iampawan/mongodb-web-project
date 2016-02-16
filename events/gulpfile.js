var gulp = require('gulp');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');

var jsFiles = ['*.js', 'src/**/*.js'];

gulp.task('style', function(){
    gulp.src(jsFiles)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', {
            verbose: true
        }));
});

gulp.task('inject', function(){
    var wiredep = require('wiredep').stream;
    var inject = require('gulp-inject');
    
    var injectSrc = gulp.src(['./public/css/*.css',
                              './public/js/*.js'], {read: false});
                             
    var injectOptions = {
        ignorePath: '/public'
    };
    
    var options = {
        bowerJson: require('./bower.json'),
        directory: './bower_components',
        ignorePath: '../../bower_components'
    };
    return gulp.src('./src/views/*.html')
        .pipe(wiredep(options))
        .pipe(inject(injectSrc, injectOptions))
        .pipe(gulp.dest('./src/views'));
});

gulp.task('serve', ['style', 'inject'], function(){
    var options = {
        script: 'app.js',
        delayTime: 1,
        env: {
            'PORT': process.env.PORT
        },
        watch: jsFiles
    };
    
    return nodemon(options)
    .on('restart', function(ev){
        console.log('Restarting... ');
    });
});