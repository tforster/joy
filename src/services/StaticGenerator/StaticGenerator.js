'use strict';

// Node system dependencies
const fs = require('fs');
const path = require('path');

// StaticGenerator dependencies
const babili = require('gulp-babili');
const debug = require('gulp-debug');
const del = require('del');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const minifyCss = require('gulp-minify-css');
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const through = require('through2');
const usemin = require('gulp-usemin');


/**
 * Mostly template-agnostic static site generator 
 * @class StaticGenerator
 */
class StaticGenerator {


  /**
   * Creates an instance of StaticGenerator.
   * @param {class} joy An instance of the Joy framework
   * @memberof StaticGenerator
   */
  constructor(joy) {
    this.joy = joy;
    this.joy.config.src = path.join(this.joy.config.projectRoot, './src');
    this.joy.config.stage = joy.handler.params.stage;
    this.config = joy.config;
    this.stage = joy.handler.params.stage;

    // ! HACK: Had to tack stage on to renderData to get Jake's to work. Needs elegance++
    const renderData = require(path.join(this.joy.config.projectRoot, './src/_generator/data.json'));
    renderData.stage = this.stage;

    this.renderModule = new (require(path.join(this.joy.config.projectRoot, './src/_generator/renderer.js')))(renderData);

    // Set build path
    switch (this.stage.toLowerCase()) {
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

    this.buildPath = path.join(this.joy.config.projectRoot, this.buildPath);

    // TODO: Re-implement support for markdown-to-HTML
    // this.config = {
    // }
    // this.marked = marked;
    // this.marked.setOptions(this.config.marked);

    // TODO: Re-implement support for calling Slack webhook notifications
    // this.slack = require('gulp-slack')(this.config.slack);

    // TODO: Implement a -v, --verbose flag for output like the following
    console.log(`Using target: ${this.stage} from ${this.config.src} to ${this.buildPath}`);
  }

  /**
   * Constructs .html views from .ejs templates in src/views
   * @returns
   * @memberof Tasks
   */
  async _compileViews() {
    // See https://github.com/mde/ejs for options
    // TODO: replace gulp external dependency with simple vinyl-fs function

    const dest = path.join(this.buildPath);


    gulp
      .src(`${this.config.src}/_views/**/*.html`)

      // Setup error handler
      .on('error', (e) => {
        console.error('_compileViews:', e);
      })

      // Pipe stream to the various stages
      .pipe(debug())

      // TODO: Must be renderer agnostic. RenderModule to export generic render function so we don't have this.renderModule.ejs
      .pipe(this.renderModule.ejs({ d: this.renderModule }))

      // Remove folders and files starting with _ from the stream
      .pipe(
        through.obj((file, enc, cb) => {
          if (path.parse(file.path).name.indexOf('_') !== 0) {
            cb(null, file);
          } else {
            cb();
          }
        })
      )

      // Save to the build path
      .pipe(gulp.dest(dest));
  }


  /**
   * Compiles views and copies, including resources, to build path with optional concatenation and minification
   *
   * @param {*} dev : If dev = true then don't minify/concatenate
   */
  async build(dev = true) {
    // Prepare the build destination for a fresh build 
    // ! NOTE: rmdirSync recursive requires node 12.10.0 minimum
    fs.rmdirSync(this.buildPath, { recursive: true });
    fs.mkdirSync(this.buildPath);

    // Compile the views
    const r = await this._compileViews();

    await this._copyResources([
      {
        glob: [`${this.config.src}/favicon.ico`],
        dest: '/'
      },
      {
        glob: [`${this.config.src}/img/**/*.*`],
        dest: '/img/'
      },
      {
        glob: [`${this.config.src}/media/**/*.*`],
        dest: '/media/'
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
        glob: [`${this.config.src}/img/src/*.svg`],
        dest: '/img/'
      },
      {
        glob: [`${this.config.src}/service-worker.js`],
        dest: '/'
      },
      {
        glob: [`${this.config.src}/manifest.json`],
        dest: '/'
      },
      {
        glob: [`${this.config.src}/vendor/**/*.*`],
        dest: '/vendor/'
      }
    ]).catch((e) => {
      console.error('caught', e);
    });

    if (!dev) {
      // Pass through the minification and concatenation stream
      await this._minh().catch((reason) => {
        throw reason;
      })
      // Remove redundant files copied to the output
      await del([`${this.buildPath}/js`, `${this.buildPath}/css`]);
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
    return Promise.all(
      resources.map((resource) => {
        return new Promise((resolve, reject) => {
          gulp
            .src(resource.glob, { allowEmpty: true })
            .on('error', (e) => {
              console.error('error in copyresources', e);
              reject();
            })
            .pipe(
              rename((path) => {
                if ('.jpg.jpeg.png.mp4'.indexOf(path.extname.toLowerCase() > -1)) {
                  path.basename = path.basename.replace(/-crushed$/gi, '');
                }
              })
            )
            .pipe(gulp.dest(path.join(this.buildPath, resource.dest)))
            .on('end', resolve);
        });
      })
    );
  }


  // TODO: Figure out why this code throws a PluginError

  /**
   * Minifies and concatenates globbed .HTML files including nested Javascript and CSS resources
   *
   * @returns
   * @memberof Tasks
   */
  _minh() {
    const src = this.buildPath + '**/*.html';
    const dest = this.buildPath;

    return new Promise((resolve, reject) => {
      gulp
        .src(src)
        .pipe(debug())
        .on('error', (err) => {
          console.error('_minh', err);
          return reject();
        })
        .pipe(
          usemin({
            css: [
              function () {
                return minifyCss();
              },
              function () {
                return rev();
              }
            ],
            html: [
              function () {
                return htmlmin({ collapseWhitespace: true, removeComments: true });
              }
            ],
            js: [
              function () {
                return babili({
                  mangle: {
                    keepClassNames: true
                  }
                });
              },
              function () {
                return rev();
              }
            ],
            inlinejs: [
              babili({
                mangle: {
                  keepClassNames: true
                }
              })
            ],
            inlinecss: [minifyCss(), 'concat'],
            skipMissingResources: true
          })
        )
        .pipe(gulp.dest(dest))

        .on('end', () => {
          return resolve();
        });
    });
  }

  /**
   * Compress png and jpgs. Calling manually for now until I can figure the optimal way to ensure I stay below 500 calls per month
   *
   * @returns
   * @memberof Tasks
   */
  async _crushPng() {
    return await gulp
      .src(['./src/img/src/**/*.jpg', './src/img/src/**/*.png'])
      .pipe(this.tinypng(this.config.tinypng.apikey))
      .pipe(
        rename((path) => {
          path.basename += '-crushed';
        })
      )
      .pipe(gulp.dest('./src/img'));
  }
}

module.exports = StaticGenerator;
