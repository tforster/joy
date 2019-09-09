'use strict';

const Docker = require('../services/Docker');
const S3 = require('../services/S3');
const StaticGenerator = require('../services/StaticGenerator');
const Swagger = require('../services/Swagger');

/**
 * Single Controllers class for now but open to splitting into multiple controller.js files in this folder
 * if needed.
 */
class Controllers {
  constructor() { }


  /**
   *
   *
   * @param {*} x
   * @returns An exit code as an integer
   * @memberof Controllers
   */
  async help(x) {
    console.log('this is help');
    // TODO: parse help out of all the other stack items
    return 0;
  }

  async build() {
    console.log('Try build static, build swagger or build docker')
    return await 0;
  }

  async buildStatic(args) {
    if (!this.config.isJoy) {
      // TODO: Refactor this and it's repeats as a property in the joy.use() clause so we can shortcut hitting the controller
      console.error('This command can only be executed in a Joy project');
      return await 1;
    }

    // TODO: Cleanup services, folders, index.js files and requires so we don't get service.service as in below
    const staticGenerator = new StaticGenerator.StaticGenerator(this, args);
    await staticGenerator.build();

    // Return an exit code
    return await 0;
  }

  async buildSwagger() {
    if (!this.config.isJoy) {
      console.error('This command can only be executed in a Joy project');
      return await 1;
    }
    console.log('buildSwagger', this);
  }
  async buildDocker() {
    if (!this.config.isJoy) {
      console.error('This command can only be executed in a Joy project');
      return await 1;
    }
    console.log('buildDocker', this);
  }
}

const controllers = new Controllers();

// Export just the routes, aka public methods on Controllers instance
module.exports.help = controllers.help;
module.exports.build = controllers.build;
module.exports.buildStatic = controllers.buildStatic;
module.exports.buildSwagger = controllers.buildSwagger;
module.exports.buildDocker = controllers.buildDocker;
