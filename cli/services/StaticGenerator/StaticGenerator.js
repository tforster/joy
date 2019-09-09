'use strict';

// Node system dependencies
const fs = require('fs');
const path = require('path');
const url = require('url');

// StaticGenerator dependencies
const babili = require('gulp-babili');
const debug = require('gulp-debug');
const del = require('del');
const ejs = require('gulp-ejs');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const minifyCss = require('gulp-minify-css');
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const through = require('through2');
const usemin = require('gulp-usemin');

class StaticGenerator {
  constructor(joy, args) {
    this.args = args;
    this.joy = joy;
    this.joy.config.src = path.join(this.joy.config.projectRoot, './src');
    this.joy.config.stage = args.flags.stage;
    this.config = joy.config;
    this.stage = args.flags.stage.value;

    const renderData = require(path.join(this.joy.config.projectRoot, './src/_generator/data.json'));

    this.renderModule = new (require(path.join(this.joy.config.projectRoot, './src/_generator/renderer.js')))(renderData);


    // Joy says data should be in _generator/data.json
    //    this.payload = require(path.join(process.cwd(), config.src, '_generator/data.json'));
    // Attach the renderer function
    //  this.payload.renderer = this.renderer;

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
    // this.config = {
    // }
    // this.marked = marked;
    // this.marked.setOptions(this.config.marked);
    // this.slack = require('gulp-slack')(this.config.slack);
    console.log(`Using target: ${this.stage} from ${this.config.src} to ${this.buildPath}`);
  }

  /**
   * Constructs .html views from .ejs templates in src/views
   *
   * @returns
   * @memberof Tasks
   */
  async _compileViews() {
    //return new Promise((resolve, reject) => {
    // See https://github.com/mde/ejs for options
    // TODO: replace gulp external dependency with simple vinyl-fs function

    gulp
      .src(`${this.config.src}/_views/**/*.html`)

      // Setup error and end handlers
      .on('error', (e) => {
        console.error('_compileViews:', e);
        //    reject(e);
      })

      .on('end', () => {
        console.log('end')
        //          resolve()
      })

      // Pipe stream to the various stages
      .pipe(debug())

      // Pipe to ejs
      // TODO: Replace ejs with call to this.renderModule.renderLib
      //.pipe(ejs({ d: this.renderModule }))
      .pipe({ d: this.renderModule.renderFunction })

      // // Filter _private files out of the stream to dest
      .pipe(
        through.obj((file, enc, cb) => {
          if (path.parse(file.path).name.indexOf('_') !== 0) {
            cb(null, file);
          } else {
            cb();
          }
        })
      )
      .pipe(gulp.dest(path.join(`${this.config.projectRoot}`, this.buildPath)));
    //});
  }

  /**
   * Compiles views and copies, including resources, to build path with optional concatenation and minification
   *
   * @param {*} dev : If dev = true then don't minify/concatenate
   */
  async build(dev = true) {
    // Prepare the build destination for a fresh build
    fs.rmdirSync(this.buildPath, { recursive: true });
    fs.mkdirSync(this.buildPath);

    // Compile the views including 
    const r = await this._compileViews();

    console.log(r);
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
      }
    ]).catch((e) => {
      console.error('caught', e);
    });

    if (!dev) {
      // Pass through the minification and concatenation stream
      //await this._minh();
      // Remove redundant files copied to the output
      //await del([`${this.buildPath}/js`, `${this.buildPath}/css`]);
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
            .pipe(gulp.dest(this.buildPath + resource.dest))
            .on('end', resolve);
        });
      })
    );
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
      console.log('build path:', self.buildPath);
      gulp
        .src(`${self.buildPath}/**/*.html`)
        .pipe(debug())
        .on('error', reject)
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
            inlinecss: [minifyCss(), 'concat']
          })
        )
        .pipe(gulp.dest(self.buildPath))
        .on('end', resolve);
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
