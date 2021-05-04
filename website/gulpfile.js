const { src, dest, series, watch, parallel, task } = require('gulp')

const babel = require('gulp-babel')
const plumber = require('gulp-plumber')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')
const webServer = require('gulp-webserver')
const browserSync = require('browser-sync').create()
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const ghPages = require('gulp-gh-pages')

const files = {
  js: 'app/js/**/*.js',
  css: ['app/css/**/*.css', 'app/css/**/*.sass', 'app/css/**/*.scss'],
  html: 'app/**/*.html'
}

const DEPENDENCIES = {
  js: [
    `fullpage.js/dist/fullpage.min.js`
  ],
  css: [
    `fullpage.js/dist/fullpage.min.css`
  ]
}

task('deploy', () => src('./dist/**/*').pipe(ghPages()));


// function serve() {
//   webServer({
//       livereload: true,
//       directoryListing: true,
//       open: true,
//       host: 'localhost',
//       port: 21345,
//   })
// }

function syncBrowser() {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
  browserSync.watch("./dist/*").on('change', browserSync.reload)
}

function prepareJs() {
  return src(files.js)
    .pipe(plumber())
    .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(babel())
      .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(dest('dist/js'))
}

function prepareCss() {
  return src(files.css)
    .pipe(plumber())
    .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sass())
      .pipe(autoprefixer())
    .pipe(sourcemaps.write('./'))
    .pipe(dest('dist/css'))
}

function prepareHTML() {
  return src(files.html)
    .pipe(dest('dist'))
}

function watchFiles() {
  watch(files.js, prepareJs)
  watch(files.css, prepareCss)
  watch(files.html, prepareHTML)
}

NODE_MODULES_DIR = 'node_modules'
let getModule = x => `${NODE_MODULES_DIR}/${x}`

function includeJsDependencies() {
  return src(DEPENDENCIES.js.map(getModule))
    .pipe(dest('dist/js'))
}

function includeCssDependencies() {
  return src(DEPENDENCIES.css.map(getModule))
    .pipe(dest('dist/css'))
}

exports.default = series(
  parallel(includeJsDependencies, includeCssDependencies),
  parallel(prepareJs, prepareCss, prepareHTML),
  parallel(watchFiles, syncBrowser)
)
