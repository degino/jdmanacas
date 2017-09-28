/*
  Gulpfile de exemplo para algumas ações clássicas de otimização.
 */

const gulp = require('gulp');
const RevAll = require('gulp-rev-all');
const gulpsync = require('gulp-sync')(gulp);
const uncss = require('gulp-uncss');
const $ = require('gulp-load-plugins')({
  rename: {
    'gulp-rev-delete-original': 'revdel',
    'gulp-if': 'if',
    'gulp-twig': 'twig',
    'gulp-sass': 'sass',
    'gulp-clean-css': 'cleanCSS',
    'gulp-rev-css-url': 'overrideCSS'
  }
});

/* Tasks base */
gulp.task('copy', () => {
  return gulp.src(['site/assets/{img,fonts}/**/*', 'site/*.yaml', 'site/src/**/*', 'site/vendor/**/*'], { base: 'site' })
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', () => {
  return gulp.src('dist/', { read: false })
    .pipe($.clean());
});

/* SASS - SCSS */
gulp.task('sass', () => {
  return gulp.src(['site/assets/sass/**/*.sass', 'site/assets/sass/**/*.scss'])
    .pipe($.sass())
    .pipe(gulp.dest('site/assets/css'));
});

gulp.task('uncss', () => {
  return gulp.src(['dist/**/*.css'])
    .pipe(uncss({
      html: ['dist/**/*.html']
    }))
    .pipe(gulp.dest('dist/'));
});

/* watch */
gulp.task('sass:watch', () => {
  return gulp.watch(['site/assets/sass/**/*.sass', 'site/assets/sass/**/*.scss'], gulpsync.sync(['sass']));
});

/* Minificação */
gulp.task('minify-js', () => {
  return gulp.src('site/**/*.js')
    .pipe($.uglify())
    .pipe(gulp.dest('dist/'))
});

gulp.task('minify-css', () => {
  return gulp.src('site/**/*.css')
    .pipe($.cleanCSS())
    //.pipe($.cssnano({ safe: true }))
    .pipe(gulp.dest('dist/'))
});

gulp.task('minify-html', () => {
  return gulp.src('site/**/*.html')
    .pipe($.htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist/'))
});

gulp.task('comp-twig', function () {
  return gulp.src('site/**/*.html')
    .pipe($.twig({
      data: {
        title: 'Gulp and Twig',
        benefits: [
          'Fast',
          'Flexible',
          'Secure'
        ]
      }
    }))
    .pipe(gulp.dest('dist/'));
});

/* Concatenação */
gulp.task('useref', () => {
  return gulp.src('site/views/base.html')
    .pipe($.useref())
    .pipe($.if('*.html', $.inlineSource()))
    .pipe($.if('*.html', $.htmlmin({ collapseWhitespace: true })))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano({ safe: true })))
    .pipe(gulp.dest('dist/views/'));
});

/* Imagens */
gulp.task('imagemin', () => {
  return gulp.src('site/assets/img/*')
    .pipe($.imagemin({
      progressive: true,
      svgoPlugins: [
        { removeViewBox: false },
        { cleanupIDs: false }
      ]
    }))
    .pipe(gulp.dest('dist/assets/img'));
});

/* Revisão de arquivos */
gulp.task('rev', () => {
  return gulp.src(['dist/**/*.{css,js,jpg,jpeg,png,svg}'])
    .pipe($.rev())
    .pipe($.revdel())
    .pipe($.overrideCSS())
    .pipe(gulp.dest('dist/'))
    .pipe($.rev.manifest())
    .pipe(gulp.dest('dist/'))
});

gulp.task('rev-all', () => {
  return gulp.src(['dist/**/*.{css,js,jpg,jpeg,png,svg,html}'])
    .pipe(RevAll.revision({
      includeFilesInManifest: ['.html', '.yaml', '.js', '.css'],
      dontRenameFile: ['.html'],
      dontUpdateReference: ['.html']
    }))
    .pipe($.revdel())
    .pipe(gulp.dest('dist/'))
});

// gulp.task('watch', () => {
//   gulp.watch([
//     'site/src/**/*', 
//     'site/view/**/*',
//     'site/assets/**/*.js',
//     'site/assets/**/*.scss',
//     'site/assets/**/*.css',
//     'site/assets/**/*.{jpg,png,gif}',
//   ], ['clean', 'copy', 'build']);
// });

/* Alias */
gulp.task('min-sass', $.sequence('sass'));
gulp.task('minify', $.sequence('min-sass', ['minify-js', 'minify-css', 'minify-html']));
gulp.task('build', $.sequence(['minify', 'imagemin'], 'useref', 'rev-all'));
gulp.task('default', gulpsync.sync(['clean', 'copy', 'build']));