'use strict';

// System dependencies (Built in modules)
const fs = require('fs').promises;
const path = require('path');

// Third party dependencies (Typically found in public NPM packages)
const slugify = require('slugify');

// Project code dependencies (Code modules defined in this project)
const StaticGenerator = require('../services/StaticGenerator');


/**
 * Single Controllers class for now but open to splitting into multiple controller.js files in this folder
 * if needed.
 * @class Controllers
 */
class Controllers {

  /**
   * Display top level help
   * @param {object} options An object containing the route, parsed flags and route definition
   * @returns An exit code as an integer
   * @memberof Controllers
   */
  async help(options) {
    console.log('this is help');
    console.log('not yet implemented');
    // TODO: parse help out of all the other stack items
    return 0;
  }


  /**
   * Display top level build information
   * @param {object} options An object containing the route, parsed flags and route definition
   * @returns An exit code as an integer
   * @memberof Controllers
   */
  async build(options) {
    console.log('Try build static, build swagger or build docker')
    return await 0;
  }


  /**
   * Build a static website using templates in /src and a custom generator i /src/_generator/renderer.js
   * @param {object} options An object containing the route, parsed flags and route definition
   * @returns An exit code as an integer
   * @memberof Controllers
   */
  async buildStatic() {
    if (!this.config.isJoy) {
      // TODO: Refactor this and it's repeats as a property in the joy.use() clause so we can shortcut hitting the controller
      console.error('This command can only be executed in a Joy project');
      return await 1;
    }

    // TODO: Cleanup services, folders, index.js files and requires so we don't get service.service as in below
    const staticGenerator = new StaticGenerator.StaticGenerator(this);
    await staticGenerator.build(this.handler.params.stage === 'dev');

    // Return an exit code
    return await 0;
  }


  /**
   * Build a Swagger definition from constituent yaml files and copy to /api/swagger
   * @param {object} options An object containing the route, parsed flags and route definition
   * @returns An exit code as an integer
   * @memberof Controllers
   */
  async buildSwagger(options) {
    if (!this.config.isJoy) {
      console.error('This command can only be executed in a Joy project');
      return await 1;
    }
    console.log('not yet implemented');
  }


  /**
   * Build a Docker image from a .joy/docker dockerfile
   * @param {object} options An object containing the route, parsed flags and route definition
   * @returns An exit code as an integer
   * @memberof Controllers
   */
  async buildDocker(options) {
    if (!this.config.isJoy) {
      console.error('This command can only be executed in a Joy project');
      return await 1;
    }
    console.log('not yet implemented');
  }


  /**
   *
   * Creates and starts a new Joy private Docker registry container. If the container already exists and is stopped, it is restarted.
   * @param {object} options An object containing the route, parsed flags and route definition
   * @returns An exit code as an integer
   * @memberof Controllers
   * 
   */
  async startDockerRegistry() {
    // Check to see if the registry.joy container exists
    let result = await this.invoke(['docker', 'ps -a | grep registry.joy'], true, { stdio: 'pipe' });
    if (result.code !== 0) {
      // Container does not exist. Create it and start it.
      result = await this.invoke(['docker',
        `run -d -p 5000:5000 --name registry.joy\
         -e REGISTRY_STORAGE=s3\
         -e REGISTRY_STORAGE_S3_REGION=ca-central-1\
         -e REGISTRY_STORAGE_S3_BUCKET=registry.joy\
         -e REGISTRY_STORAGE_S3_ACCESSKEY=${this.config.awsProfiles.registry.joy.aws_access_key_id}\
         -e REGISTRY_STORAGE_S3_SECRETKEY=${this.config.awsProfiles.registry.joy.aws_secret_access_key}\
         registry:2`
      ], false, { stdio: 'ignore' });
    } else {
      // Container exists. Start it.
      result = await this.invoke(['docker', 'start registry.joy'], false, { stdio: 'ignore' });
    }

    return result;
  }


  /**
   *
   * Stops the Joy private Docker registry if it is running
   * @param {object} options An object containing the route, parsed flags and route definition
   * @returns An exit code as an integer
   * @memberof Controllers
   */
  async stopDockerRegistry(options) {
    return await this.invoke(['docker', 'stop registry.joy'], false);
  }

  async gitCheckoutB() {
    let branchName = `${(`0000${this.handler.params.number}`).slice(-4)}-${slugify(this.handler.params.title, { lower: true })}`;
    return await this.invoke(['git', `checkout -b ${branchName}`], false, { stdio: 'ignore' });
  }


  /**
   * Create a new empty Joy project in the current folder. The current folder must be empty or an error is thrown.
   * Example: joy product new agency client brand project product
   * Note: Current args are not used yet. Intent is to build new product project outside of current directory
   *   by parsing args to create fully qualified filesystem path on the fly. Also use args to edit the 
   *   package.json and README.md files.
   *
   * @memberof Controllers
   */
  async productNew() {
    const root = this.config.projectRoot;
    const joyRoot = this.config.joyRoot;
    const src = path.join(root, 'src');

    // Check the specified project root is a directory
    if (!(await fs.stat(root)).isDirectory()) {
      let err = new Error('ENOTDIR')
      err.code = 'ENOTDIR';
      throw err;
    }

    // Check that the specified project root is empty
    if ((await fs.readdir(root)).length !== 0) {
      let err = new Error('ENOTEMPTY')
      err.code = "ENOTEMPTY";
      throw err;
    }

    // Create empty required directories
    await fs.mkdir('.joy/docker', { recursive: true });
    await fs.mkdir(src);

    // Copy required files from Joy src/templates/product-new to the new src subdirectory
    const files = await (fs.readdir(path.join(joyRoot, 'templates/product-new')));
    files.forEach(async (file) => {
      await fs.copyFile(path.join(joyRoot, 'templates/product-new', file), path.join(root, file));
    });

    // Create .git (via `git init`)
    await this.invoke(['git', 'init'], false, { stdio: 'ignore' });

    // Create package.json (via npm init)
    await this.invoke(['npm', 'init'], false, { stdio: 'inherit' });
  }

}

const controllers = new Controllers();

// Export just the routes, aka public methods on Controllers instance
module.exports.help = controllers.help;
module.exports.build = controllers.build;
module.exports.buildStatic = controllers.buildStatic;
module.exports.buildSwagger = controllers.buildSwagger;
module.exports.buildDocker = controllers.buildDocker;
module.exports.startDockerRegistry = controllers.startDockerRegistry;
module.exports.stopDockerRegistry = controllers.stopDockerRegistry;
module.exports.gitCheckoutB = controllers.gitCheckoutB;
module.exports.productNew = controllers.productNew;
