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



  /**
   *
   * Creates and starts a new Joy private Docker registry container. If the container already exists and is stopped, it is restarted.
   * @param {object} options An object containing the route, parsed flags and route definition
   * @returns An exit code as an integer
   * @memberof Controllers
   */
  async startDockerRegistry(options) {
    // TODO: Add support to invoke for spawn AND exec. Exec will allow us to $(docker ps -a | grep registry.joy) to check if container is already running

    let retVal = await this.invoke('docker', [
      'run', '-d',
      '-p', '5000:5000',
      '--name', 'registry.joy',
      '-e', 'REGISTRY_STORAGE=s3',
      '-e', 'REGISTRY_STORAGE_S3_REGION=ca-central-1',
      '-e', 'REGISTRY_STORAGE_S3_BUCKET=registry.joy',
      '-e', `REGISTRY_STORAGE_S3_ACCESSKEY=${this.config.awsProfiles.registry.joy.aws_access_key_id}`,
      '-e', `REGISTRY_STORAGE_S3_SECRETKEY=${this.config.awsProfiles.registry.joy.aws_secret_access_key}`,
      'registry:2'
    ]);

    if (retVal !== 0) {
      console.log('Ignore the previous message, spawning now (this to be cleaned up in a future release).')

      retVal = await this.invoke('docker', [
        'start', 'registry.joy'
      ])
    }

    return retVal;
  }

  /**
   *
   * Stops the Joy private Docker registry if it is running
   * @param {object} options An object containing the route, parsed flags and route definition
   * @returns An exit code as an integer
   * @memberof Controllers
   */
  async stopDockerRegistry(options) {
    return await this.invoke('docker', [
      'stop', 'registry.joy'
    ]);
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
