import gulp from "gulp";
import gpug from "gulp-pug";
import del from 'del';
import ws from 'gulp-webserver';
import image from 'gulp-image';
import gulp_sass from "gulp-sass";
import dartSass from 'sass';
import autop from 'gulp-autoprefixer';
import miniCss from 'gulp-csso';
import bro from 'gulp-bro';
import babelify from 'babelify'
import ghPages from 'gulp-gh-pages';

const sass = gulp_sass(dartSass);

const routes = {
  pug: {
    watch: "src/**/*.pug", // 전체 파일중 변경된 사항이 있을때 필요
    // src: "src/**/*.pug", src안에 있는 폴더의 .pug가 붙은 모든 파일
    src: "src/*.pug", // src 안에 .pug가 붙은 파일 index.pug
    dest: 'build'  // 빌드후 만들어질 폴더
  },
  img: {
    src: "src/img/*",
    dest: "build/img"
  },
  scss: {
    watch: "src/scss/*.scss",
    src: "src/scss/*.scss",
    dest: "build/css"
  },
  js: {
    watch: "src/js/*.js",
    src: "src/js/*.js",
    dest: "build/js"
  }
}

export const pug = () => 
  gulp
    .src(routes.pug.src)
    .pipe(gpug())
    .pipe(gulp.dest(routes.pug.dest));

    
// 빌드를 다시 하고싶을때 전체 폴더를 지워준다
const clean = () => del(["build"]);

const webserver = () => gulp.src("build").pipe(ws({ livereload: true, open: true }))

const img = () => 
  gulp
    .src(routes.img.src)
    .pipe(image())
    .pipe(gulp.dest(routes.img.dest));


const styles = () => 
  gulp
    .src(routes.scss.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(autop())
    .pipe(miniCss())
    .pipe(gulp.dest(routes.scss.dest));


const js = () => gulp.src(routes.js.src).pipe(
  bro({
    transform: [
      babelify.configure({ presets: ['@babel/preset-env'] }),
      [ "uglifyify", { global: true }]
    ]
  })
).pipe(gulp.dest(routes.js.dest));


const ghDeploy = () => gulp.src('build/**/*').pipe(ghPages())


const watch = () => {
  gulp.watch(routes.pug.watch, pug);
  gulp.watch(routes.img.src, img);
  gulp.watch(routes.scss.watch, styles);
  gulp.watch(routes.js.watch, js);
};


const prepare = gulp.series([clean, img]);

const assets = gulp.series([pug, styles, js])

const live = gulp.parallel([webserver, watch])

export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, assets, live]);
export const deploy = gulp.series([build, ghDeploy]);
