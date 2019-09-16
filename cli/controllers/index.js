'use strict';

const Docker = require('../services/Docker');
const S3 = require('../services/S3');
const StaticGenerator = require('../services/StaticGenerator');
const Swagger = require('../services/Swagger');


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
  async buildStatic(options) {
    if (!this.config.isJoy) {
      // TODO: Refactor this and it's repeats as a property in the joy.use() clause so we can shortcut hitting the controller
      console.error('This command can only be executed in a Joy project');
      return await 1;
    }

    // TODO: Cleanup services, folders, index.js files and requires so we don't get service.service as in below
    const staticGenerator = new StaticGenerator.StaticGenerator(this, options);
    await staticGenerator.build(options.flags.stage === 'dev');

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
}

const controllers = new Controllers();

// Export just the routes, aka public methods on Controllers instance
module.exports.help = controllers.help;
module.exports.build = controllers.build;
module.exports.buildStatic = controllers.buildStatic;
module.exports.buildSwagger = controllers.buildSwagger;
module.exports.buildDocker = controllers.buildDocker;
