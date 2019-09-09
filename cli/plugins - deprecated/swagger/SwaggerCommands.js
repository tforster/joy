#!/usr/bin/env node

'use strict';

const fs = require('fs');
const opn = require('opn');
const path = require('path');
const semver = require('semver');
const StaticServer = require('static-server');
const SwaggerParser = require('swagger-parser');
const watch = require('gulp-watch');
const writefile = require('util').promisify(fs.writeFile);

class SwaggerCommands {
  constructor(task, args, env) {
    this.task = task;
    this.args = args;
    this.joyPath = '~/joy';
    this.env = env;

    this.apiSource = path.join(process.env.JOYPROJECT, '/api/swagger/');
    // Path to Swagger source folder (follows Joy convention)
    this.swaggerSource = path.join(process.env.JOYPROJECT, '/swagger/');
    this.semver = '0.0.0';
  }

  /**
   * Watches the Swagger source directory for changes and rebuild
   */
  watch() {
    const self = this;
    return watch(self.swaggerSource, async function() {
      await self.build().catch((reason) => {
        console.log(`swagger.yaml errored at ${new Date().toISOString()} because ${reason}`);
      });
    });
  }

  async build() {
    try {
      this.packageJSON = await this._readPackageJSON();
      this.currentVersion = this.packageJSON.version;
      this.newVersion = this._bumpSemVer(this.currentVersion);
      this.swaggerJSON = await this._compileSwagger();

      await this._validateSwagger(this.swaggerJSON);
      await this._updateControlFiles();

      console.log(`package.json and swagger.yaml bumped to v${this.newVersion}`);
    } catch (e) {
      console.error('The following exception:', e, e.stack);
    }
  }

  async docs() {
    const server = new StaticServer({
      rootPath: path.join(process.env.HOME, 'joy/cli/plugins/swagger-ui'),
      port: 1337,
      name: 'Joy',
      cors: '*',
      followSymlink: true
    });

    server.start(() => {
      const apiurl = `${encodeURIComponent('http://localhost:10010/swagger')}`;
      console.log(`Serving Swagger docs from ${server.rootPath} on http://localhost:${server.port}/#/${apiurl}`);
      opn(`http://localhost:1337/#/${apiurl}`).then(() => {});
    });
  }

  /**
   * Reads package.json into a JSON object so that the version can be retrieved
   */
  async _readPackageJSON() {
    return new Promise((resolve, reject) => {
      fs.readFile('./package.json', 'utf8', (err, result) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(JSON.parse(result));
        }
      });
    });
  }

  /**
   * Compiles all the swagger files into one master Swagger.yaml
   */
  async _compileSwagger() {
    return new Promise((resolve, reject) => {
      SwaggerParser.bundle(`${this.swaggerSource}index.yaml`, {
        resolve: {
          external: true
        }
      })
        .then((swaggerJSON) => {
          resolve(swaggerJSON);
        })
        .catch((reason) => {
          console.error(`Bundle errored with ${reason}`);
          reject(reason);
        });
    });
  }

  /**
   * Validates the master Swagger.yaml created earlier with _compileSwagger()
   */
  _validateSwagger(swaggerJSON) {
    return new Promise((resolve, reject) => {
      SwaggerParser.validate(swaggerJSON, (err) => {
        if (err) {
          return reject(err);
        } else {
          return resolve();
        }
      });
    });
  }

  /**
   * Wrapper around NPMs semver library to allow easy patch increments
   * @param {} ver
   */
  _bumpSemVer(ver) {
    return semver.inc(ver, 'patch');
  }

  /**
   * Writes the in-memory package and swagger JSON objects to package.json and Swagger.yaml respectivley
   */
  async _updateControlFiles() {
    this.swaggerJSON.info.version = this.newVersion;
    this.packageJSON.version = this.newVersion;

    try {
      await writefile(`${this.apiSource}swagger.yaml`, SwaggerParser.YAML.stringify(this.swaggerJSON), 'utf8');
      await writefile(`${this.apiSource}swagger.json`, JSON.stringify(this.swaggerJSON), 'utf8');
      await writefile('./package.json', JSON.stringify(this.packageJSON, null, 2), 'utf8');
    } catch (e) {
      console.error('Error:', e);
    }
  }
}

(() => {
  const args = process.argv.slice(2);
  const task = args[0];
  const swaggerCommands = new SwaggerCommands(task, args, process.env);
  if (task && task.length && task.length > 1) {
    return swaggerCommands[task]();
  } else {
    console.error('no cmd?');
  }
})();

// exports.swagger = (task, args, env) => {
//   const swaggerCommands = new SwaggerCommands(task, args, env);

//   if (task && task.length && task.length > 1) {
//     const cmd = task[1];
//     console.log(cmd);
//     return swaggerCommands[cmd]();
//   } else {
//     console.error('no cmd?');
//   }
// };
