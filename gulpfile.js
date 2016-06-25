const path        = require('path');
const del         = require('del');
const url         = require('url');
const fs          = require('fs');

const gulp        = require('gulp');
var gutil         = require("gulp-util");
const webserver   = require('gulp-webserver');
const less        = require('gulp-less');
const shell       = require('gulp-shell');       
const webpack     = require("webpack");

// Configuration
const webpackConfig = require("./webpack.config.js");
const appSpecificGulpConfig = {
  dist: './dist',
  src: './app',
  appJs: '',
  appLess: '',
  appHtml: '',
};

// Task definitions
gulp.task('serve', ['build'], function() {
  
  gulp.src('./dist').pipe( webserver( {
    livereload: true,
    directoryListing: true,
    open: '/index.html'
  }));

});

const watcher = gulp.watch(
  ['index.html', 'app/**/*'], 
  ['build']
);
watcher.on('change', function(event) {
  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
});

gulp.task('build', ['less', 'lint', 'webpack:build-dev'], function() {
  // TODO build task should be async 

  gulp.src( ['./index.html', './app/**/*.html'])
    .pipe(gulp.dest('./dist'));

  gulp.src('./app/**/*.js')
    .pipe(gulp.dest('./dist'));

});

// modify some webpack config options
webpackConfig.devtool = "sourcemap";
webpackConfig.debug   = true;

// create a single instance of the compiler to allow caching
var devCompiler = webpack(webpackConfig);

gulp.task('webpack:build-dev', function(callback) {
  devCompiler.run(function(err, stats) {
    if(err) throw new gutil.PluginError("webpack:build-dev", err);
    gutil.log("[webpack:build-dev]", stats.toString({
      colors: true
    }));
    callback();
  });
});

gulp.task('lint', shell.task([
  'node node_modules/eslint/bin/eslint.js ./app/**/*.js',
]));

gulp.task('less', function () {
  return gulp.src('./app/less/**/*.less')
    .pipe(less( {} ))
    .pipe(gulp.dest('./dist/css'));
    // .pipe(reload( {stream:true } ));
});

// gulp.task('test', shell.task([
//   'gulp serve &', // find a way to serve before running tests
//   'karma start karma.conf.js',
// ]))

// note: possible concurrency issues
// note: string templating may not work here
// gulp.task('docker-build', shell.task([
//   "docker build -t ${dockerImageName} .",
// ]));
// gulp.task('docker', ['docker-build'], shell.task([
//   "docker run -it --rm -p 3000:3000 -p 3001:3001 ${dockerImageName}",
// ]));

// this almost works - check the spec and protractor error reporting
// gulp.task('e2e', shell.task([
//   'gulp serve &', // find a way to serve before running tests
//   'protractor protractor.config.js',
// ]));
// gulp.task('webdriver-update', shell.task([
//   'webdriver-manager update',
// ]));


// gulp.task('clean-css', function() {
//   return del([ './css/**/*', ]);

// });

// gulp.task('clean-js', function() {
//   return del([ './js/**/*', ]);

// });

// gulp.task('ts', ['clean-js'], function() {
//   const tsResult = tsProject.src(['typescript/**/*.ts'])  
//     .pipe(ts(tsProject));

//   return tsResult.js.pipe(gulp.dest('js'))
//     .pipe(reload( {stream:true } ));
// });
