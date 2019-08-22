'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Build implements Joy commands for static S3 websites, swagger docs and docker images.
 *
 */
class Build {
  /**
   * @param {*} joy : Instance of a Joy class c/w config.json, env and helper functions
   *
   */
  constructor(joy) {
    const prog = joy.prog;
    prog
      .command('build', 'Build various artifacts including static sites, swagger definitions and docker images')
      //.argument('[staticS3]', 'staticS3', ['staticS3'])
      .argument('<artifact-type>', 'Type of artifact to build [static, swagger, docker]', ['static', 'swagger', 'docker'], 'static')
      .option('-s, --stage <stage>', 'Stage name [dev, stage or prod]', ['dev', 'stage', 'prod'], 'dev')
      .option('-n, --name <name>', 'Dockerfile prefix to use with [docker]')
      .option('-g --engine <engine>', 'Rendering engine to use with static [ejs]', ['ejs'], 'ejs')
      .action(async (args, options, logger) => {
        const code = await this[args.artifactType].call(joy, options, logger);
        return code;
      });
  }

  /**
   * @param {*} options : Additional CLI flags
   *
   */
  async static(options) {
    const RenderModule = require(path.join(this.config.projectRoot, './src/_generator/renderer.js'));
    const renderData = require(path.join(this.config.projectRoot, './src/_generator/data.json'));
    const renderModule = new RenderModule(renderData);

    const StaticGenerator = require('./StaticGenerator');
    const staticGenerator = new StaticGenerator(this.config, options, renderModule);
    await staticGenerator.build(options.stage === 'dev');

    // Return an exit code
    return 0;
  }

  // TODO: To be implemented
  swagger() {
    console.error('not implemented yet');
  }

  /**
   * Returns a Promise from invoking an external command to `docker build`
   *
   * @param {*} options : Additional CLI flags
   *
   */
  docker(options) {
    console.error('not implemented yet');
    const config = this.config;

    // Most of the image name is derived from overall config with the exception of the name that comes from the CLI
    const imageName = `${config.contextName}/${options.name}.${config.domain}.${config.tld}`;
    console.log(imageName);
    return this.invoke('docker', [
      'build',
      '--force-rm',
      '--no-cache',
      '-f',
      `.joy/docker/${options.name}.dockerfile`,
      '.',
      '-t',
      imageName
    ]);
  }
}

module.exports = Build;
