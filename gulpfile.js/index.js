var gulp = require('gulp');
const $ = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync').create();

var { options } = require('./options');
var { bowerTask, vendorJs } = require('./vendor.js');
console.log(bowerTask, vendorJs);

// production || develop
// # gulp --env production
console.log(options);

// develop
gulp.task("copyHTML", function(){
  return gulp
    .src("./source/**/*.html")
    .pipe(gulp.dest('./output/'))
    .pipe(browserSync.stream())
}); 

gulp.task('jade', function() {
  return gulp
    .src('./source/**/!(_)*.jade') // "!(_)" 檔名前加 "_" 下底線時，檔案不處理 (多半為連結檔)
    .pipe($.plumber())
    // .pipe($.data( function () {
    //   var khData = require("../source/data/data.json")
    //   var menu = require("../source/data/menu.json")
    //   var source = {
    //     'khData': khData,
    //     'menu': menu
    //   };
    //   // console.log('source', source);
    //   return source;
    // }))
    .pipe($.jade({
      pretty : true // false 會壓成單行
    }))
    .pipe(gulp.dest('./output/'))
    .pipe(browserSync.stream())
});

gulp.task('sass', function () {
  var plugins = [
    autoprefixer({
      // 原本 Autoprefixer 設置因新版將 browsers 改成 Browserslist
      // browsers: ['last 3 version', '> 5%']
      Browserslist: ['last 3 version', '> 5%']
    })
  ];
  return gulp
    .src('./source/assets/scss/**/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      outputStyle: 'expanded', // expanded & nested
    }).on('error', $.sass.logError))
    // css 已編譯完成
    .pipe($.postcss(plugins))
    .pipe($.if(options.env === 'production', $.minifyCss()))
    // .pipe($.sourcemaps.write('.'))
    .pipe($.if(options.env !== 'production', $.sourcemaps.write('.')))
    .pipe(gulp.dest('./output/assets/css'))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

gulp.task('babel', function() {
  return gulp
    .src('./source/assets/js/**/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['@babel/env']
    }))
    .pipe($.concat('all.js'))
    .pipe(
      $.if(options.env === 'production', $.uglify({
          compress: { drop_console: true }
        })
      )
    )
    .pipe($.if(options.env !== 'production', $.sourcemaps.write('.')))
    .pipe(gulp.dest('./output/assets/js'))
    .pipe(browserSync.stream())
});

gulp.task('clean', function () {
  return gulp
    .src(
      [
        './.tmp', 
        './output', 
        // './bower_components',
      ], 
      {read: false, allowEmpty: true})
    .pipe($.clean());
});

gulp.task("imageMin", function(){
  return gulp
    .src("./source/assets/img/*")
    .pipe($.if(options.env === "production", $.imagemin()))
    .pipe(gulp.dest('./output/assets/img'))
});

gulp.task('deploy', function() {
  return gulp
    .src('./output/**/*')
    .pipe($.ghPages());
});

gulp.task('build', 
  gulp.series(
    'clean',
    bowerTask,
    vendorJs,
    gulp.parallel(
      'copyHTML',
      'sass', 
      'babel', 
      'imageMin'
    )
  )
);

gulp.task('default', 
  gulp.series(
    'clean',
    bowerTask,
    vendorJs,
    gulp.parallel(
      'copyHTML', 
      // 'jade', 
      'sass', 
      'babel', 
      'imageMin'
    ),
    function(done){

      browserSync.init({
        server: { baseDir: "./output" },
        reloadDebounce: 2000 // 此段加入以後，重新整理的間隔必須超過 2 秒，可以依據需求調整使用
      });

      gulp.watch('./source/assets/scss/**/*.scss', gulp.series('sass'));
      gulp.watch('./source/**/*.html', gulp.series('copyHTML'));
      gulp.watch('./source/**/*.jade', gulp.series('jade'));
      gulp.watch('./source/assets/js/**/*.js', gulp.series('babel'));

      done();
    }
  )
);
