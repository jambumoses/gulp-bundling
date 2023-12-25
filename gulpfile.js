// babel-core
// babel-preset-env

const gulp = require("gulp");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;
const minifyCss = require("gulp-minify-css");
const less = require("gulp-less");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const sass = require("gulp-sass")(require("sass"));
//const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const browserify = require("browserify");
const babelify = require("babelify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const { notify } = require("browser-sync");

var styleSRC = "src/scss/style.scss";
var styleDIST = "./dist/css/";

var styleWatchFile = "src/scss/**/*.scss";
var jsWatchFile = "src/js/**/*.js";

var jsSRC = "script.js";
var jsFolder = "src/js/";
var jsDIST = "./dist/js/";

var jsFiles = [jsSRC];

var imgSRC = "";
var imgUrl = "src/img/*";
var imgDEST = "./dist/img";

var htmlWatch = "**/*.html";
var phpWatch = "**/*.php";

function css(done) {
  gulp
    .src(styleSRC)
    .pipe(sourcemaps.init())
    .pipe(sass({ errorLogToConsole: true, outputStyle: "compressed" })) // sass compile, and compressed (minimized)
    .on("error", console.error.bind(console))
    /* 
      .pipe(
        autoprefixer({
          browsers: ["last 2 versions"],
          cascade: false,
        })
      ) // installing css browser prefixes (webkit,-o-,-ms-)
   */
    .pipe(rename({ suffix: ".min" })) // rename
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(styleDIST))
    .pipe(browserSync.stream());
  done();
}

function browserSyncFnc(done) {
  browserSync.init({
    /* server: {
        baseDir: "./",
      }, */
    open: false,
    injectChanges: true,
    proxy: "https://gulp.dev",
    https: {
      key: "/users/jamb/.valet/certificates/gulp.dev.key",
      cert: "/users/jamb/.valet/certificates/gulp.dev.crt",
    },
  });
  done();
}

function jsCompiler(done) {
  // browserify
  // transform babelify [env]
  // bundle
  // source
  // rename .min
  // buffer
  // init sourcemaps
  // uglify
  // write sourcemaps
  // dist

  jsFiles.map(function (entry) {
    return browserify({
      entries: [jsFolder + entry],
    })
      .transform(babelify, { presets: ["env"] })
      .bundle()
      .pipe(source(entry))
      .pipe(rename({ extname: ".min.js" }))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(uglify())
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest(jsDIST))
      .pipe(browserSync.stream());
  });

  done();
}

function triggerPlumber(src, url) {
  return gulp.src(src).pipe(plumber()).pipe(gulp.dest(url));
}

function fonts() {
  return triggerPlumber(fontsSRC, fontsUrl);
}

function images() {
  return triggerPlumber(imgSRC, imgUrl);
}

function html() {
  return triggerPlumber(htmlSRC, htmlUrl);
}

// putting all js code in one file
gulp.task("concat", function () {
  return gulp
    .src("src/js/*.js") // or ['file1.js', 'file2.js']
    .pipe(concat("all.js"))
    .pipe(gulp.dest("dist/js/"));
});

//compiling less to css
gulp.task("less", function () {
  return gulp.src(lessSRC).pipe(less()).pipe(gulp.dest(lessDIST));
});

gulp.task("minify-css", function () {
  return gulp
    .src(styleCssSRC)
    .pipe(minifyCss({ keepSpecialComments: 1, keepBreaks: true }))
    .pipe(gulp.dest(styleCssDIST));
});

gulp.task("compress-images", function () {
  return gulp
    .src(imgUrl)
    .pipe(
      imagemin({
        progressive: true,
        optimizationLevel: 7, // 1-7
      })
    )
    .pipe(gulp.dest(imgDEST));
});

gulp.task("browser-sync", browserSyncFnc);

gulp.task("css", css);

gulp.task("js", jsCompiler);

gulp.task("images", images);
gulp.task("html", html);
gulp.task("fonts", fonts);

// default task
//run> gulp gulp

gulp.task("default", gulp.series("css", "js", "images", "html", "fonts"));

//running all tasks at the same time
gulp.task("parallel", gulp.parallel("css", "js", "images", "html", "fonts"));

function watch_files(done) {
  gulp.watch(styleWatchFile, gulp.series("style", reload));
  gulp.watch(jsWatchFile, gulp.series("js", reload));

  gulp.watch(htmlWatch, reload);
  gulp.watch(phpWatch, reload);

  gulp
    .src(jsSRC + "main.min.js")
    .pipe(notify({ message: "Gulp is watching. Happy Coding!" }));
  done();
}

/* watch */
gulp.task("watch", gulp.series(watch_files, "browser-sync"));
