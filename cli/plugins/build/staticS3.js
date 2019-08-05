'use strict';

const babili = require('gulp-babili');
const debug = require('gulp-debug');
const del = require('del');
const ejs = require('gulp-ejs');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const minifyCss = require('gulp-minify-css');
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const usemin = require('gulp-usemin');

class StaticS3 {

  constructor(config, stage) {
    this.config = config;
    this.stage = stage;
    // Set build path
    switch (stage.toLowerCase()) {
      case 'stage':
        this.buildPath = 'build/stage/';
        break;
      case 'prod':
        this.buildPath = 'build/prod/';
        break;
      default:
        this.buildPath = 'build/dev/';
        break;
    }

    // this.config = {
    // }
    // this.marked = marked;
    // this.marked.setOptions(this.config.marked);
    // this.slack = require('gulp-slack')(this.config.slack);
    console.log(`Using target: ${stage} from ${this.config.src} to ${this.buildPath}`)
  }

  /**
 * Constructs .html views from .ejs templates in src/views
 *
 * @returns
 * @memberof Tasks
 */
  _compileViews() {
    return new Promise((resolve, reject) => {
      let pageData = {};

      // See https://github.com/mde/ejs for options
      gulp.src(`${this.config.src}/views/**/*.html`, pageData)

        .on('error', e => {
          console.error('e', e);
          reject(e)
        })
        .pipe(debug())
        .pipe(ejs({}))

        .pipe(rename({ extname: '.html' }))
        .pipe(gulp.dest(this.buildPath))

        .on('end', resolve);

    });
  }

  async build() {
    await del([`${this.buildPath}**/*`]);

    await this._compileViews().catch(e => { console.error('caught1', e) });

    await this._copyResources([
      {
        glob: [`${this.config.src}/favicon.ico`],
        dest: '/'
      },
      {
        glob: [`${this.config.src}/images/**/*.*`],
        dest: '/images/'
      },
      {
        glob: [`${this.config.src}/video/*.mp4`],
        dest: '/video/'
      },
      {
        glob: [`${this.config.src}/fonts/**/*`],
        dest: '/fonts/'
      },
      {
        glob: [`${this.config.src}/js/**/*.js`],
        dest: '/js/'
      },
      {
        glob: [`${this.config.src}/css/**/*`],
        dest: '/css/'
      },
      {
        glob: [`${this.config.src}/images/src/*.svg`],
        dest: '/images/'
      }
    ])
      .catch(e => {
        console.error('caught', e);
      });

    if (this.stage !== 'dev') {
      await this._minh();
    }

  }

  // /**
  //  * Send a Slack or MS Teams notification
  //  *
  //  * @returns
  //  * @memberof Tasks
  //  */
  // notify() {
  //   let msg = `${this.target} was updated. See ${this.config.urls[this.target]}`;
  //   console.log(msg);
  //   if (this.target !== 'dev') {
  //     return slack(msg);
  //   }
  // }





  /**
   * Copies resources provided in resources hash
   * Removes any occurrences of `-crushed` presumably added by either handbrake (mp4) or tinypng (jpg, jpeg and png)
   *
   * @param {*} resources
   * @returns
   * @memberof Tasks
   */
  _copyResources(resources) {
    return Promise.all(resources.map(resource => {
      return new Promise((resolve, reject) => {
        gulp.src(resource.glob, { allowEmpty: true })
          .on('error', e => {
            console.error('error in copyresources', e);
            reject();
          })
          .pipe(rename((path) => {
            if ('.jpg.jpeg.png.mp4'.indexOf(path.extname.toLowerCase() > -1)) {
              path.basename = path.basename.replace(/-crushed$/gi, '');
            }
          }))
          .pipe(gulp.dest(this.buildPath + resource.dest))
          .on('end', resolve)
      });
    }));
  }


  /**
   * Minifies and concatenates globbed .HTML files including nested Javascript and CSS resources
   *
   * @returns
   * @memberof Tasks
   */
  _minh() {
    const self = this;
    return new Promise((resolve, reject) => {
      gulp.src(`${self.buildPath}/**.*.html`)
        .on('error', reject)
        .pipe(usemin({
          css: [function () { return minifyCss(); }, function () { return rev(); }],
          html: [function () { return htmlmin({ collapseWhitespace: true, removeComments: true }); }],
          js: [function () {
            return babili({
              mangle: {
                keepClassNames: true
              }
            });
          }, function () { return rev(); }],
          inlinejs: [babili({
            mangle: {
              keepClassNames: true
            }
          })],
          inlinecss: [minifyCss(), 'concat']
        }))
        .pipe(gulp.dest(self.buildPath))
        .on('end', resolve);
    })
  }


  /**
   * Compress png and jpgs. Calling manually for now until I can figure the optimal way to ensure I stay below 500 calls per month
   *
   * @returns
   * @memberof Tasks
   */
  async _crushPng() {
    return await gulp.src(['./src/img/src/**/*.jpg', './src/img/src/**/*.png'])
      .pipe(tinypng(this.config.tinypng.apikey))
      .pipe(rename((path) => {
        path.basename += '-crushed';
      }))
      .pipe(gulp.dest('./src/img'));
  }
}



module.exports = StaticS3
