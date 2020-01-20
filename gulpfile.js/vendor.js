var gulp = require('gulp');
var mainBowerFiles = require("main-bower-files");
var $ = require('gulp-load-plugins')();
var { options } = require('./options');


var bowerTask = function (cd){
  gulp
    .src(mainBowerFiles())
    .pipe(gulp.dest('./.tmp/vendors'))
    // .pipe($.uglify());
  cd();
};

var vendorJs = function(cd){
  gulp
    .src([
      //NPM
      // './node_modules/bootstrap/dist/js/bootstrap.bundle.js'
      
      // bower 
      './bower_components/jquery/dist/jquery.js',
      './bower_components/vue/dist/vue.js',
      './bower_components/bootstrap4/dist/js/bootstrap.bundle.js'
            
      // 自定
      // '../.tmp/vendors/**/**.js',
    ])
    // .pipe($.order(['vue.js'', 'jquery.js', 'bootstrap.js']))
    .pipe($.order(['vue.js', 'jquery.js',]))
    .pipe($.concat('vendors.js'))
    .pipe($.if(options.env === 'production', $.uglify()))
    .pipe(gulp.dest('./output/assets/js'));
  cd();
};

// 注意：這是 Node.js 的 module.exports
// 並非 ES6 的方法
exports.bowerTask = bowerTask;
exports.vendorJs = vendorJs; 