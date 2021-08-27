'use strict';

/* Plugins */
const { src, dest } = require('gulp');
const gulp = require('gulp');
const browsersync = require("browser-sync").create();
const fileinclude = require("gulp-file-include");
const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require("gulp-autoprefixer");
const group_media = require("gulp-group-css-media-queries");
const clean_css = require("gulp-clean-css");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify-es").default;
const imagemin = require("gulp-imagemin"); // Old version

/* Path*/
let project_folder = "dist/";
let source_folder = "#src/";
let path = {
    build: {
        html: project_folder,
        css: project_folder + "css/",
        js: project_folder + "js/",
        img: project_folder + "img/",
        fonts: project_folder + "fonts/",
    },
    src: {
        html: [source_folder + "*.html", "!" + source_folder + "blocks/"],
        css: source_folder + "scss/style.scss",
        js: source_folder + "js/script.js",
        img: source_folder + "img/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts: source_folder + "fonts/*.{eot,woff,woff2,ttf,svg}",
    },
    watch: {
        html: source_folder + "**/*.html",
        css: source_folder + "scss/**/*.scss",
        js: source_folder + "js/**/*.js",
        img: source_folder + "img/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts: source_folder + "fonts/*.{eot,woff,woff2,ttf,svg}",
    },
    clean: "./" + project_folder
}

/* Tasks */

function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        port: 3000,
        notify: false
    })
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: "expanded"
            }).on('error', scss.logError)
        )
        .pipe(
            group_media()
        )
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: true
            })
        )
        .pipe(dest(path.build.css))
        .pipe(
            clean_css()
        )
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(
            uglify()
        )
        .pipe(
            rename({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

function images() {
    return src(path.src.img)
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 95, progressive: true }),
            imagemin.optipng({ optimizationLevel: 3 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

function fonts() {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
}

function watchFiles(params) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
    gulp.watch([path.watch.fonts], fonts);
}

let build = gulp.series(gulp.parallel(js, css, html, images, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.images = images;
exports.hs = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
