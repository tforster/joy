'use strict';
const path = require('path');

/**
 * Docker implements Joy commands for building, starting, stopping and pushing Docker images
 *
 */
class Docker {
  /**
   * @param {*} joy : Instance of a Joy class c/w config.json, env and helper functions
   *
   */
  constructor(joy) {
    const prog = joy.prog;
    prog
      .command('stack', 'Start, stop, restart or push a Docker stack/image')
      .argument('<action>', 'Action to perform [start, stop, restart, push]', ['start', 'stop', 'restart', 'push'])
      .option('-n, --name <name>', 'Pushing docker images requires a name')
      .action(async (args, options, logger) => {
        const code = await this[args.subcommand].call(joy, options, logger);
        return code;
      });
  }

  /**
   * Returns a Promise from invoking an external command to `docker-compose up build`
   *
   */
  start(options) {
    // Parse config.containers and set up some environment variables
    const config = this.config;
    process.env['STAGE'] = options.stage;
    for (var c in config.containers) {
      const container = config.containers[c];
      if (container.port) {
        process.env[`PORT_${c.toUpperCase()}`] = container.port;
      }
      if (options.stage === 'dev') {
        process.env['BUILD_SOURCE'] = path.resolve('build/dev');
      }
    }
    console.log(process.env);
    let params = ['-f', `.joy/docker/docker-compose.yml`, 'up', '-d'];
    if (options.stage === 'dev') {
      params.splice(2, 0, '-f', `.joy/docker/docker-compose.dev.yml`);
    }
    console.log(params);
    return this.invoke('docker-compose', params);
  }

  /**
   * Returns a Promise from invoking an external command to `docker-compose down`
   *
   */
  stop() {
    return this.invoke('docker-compose', ['-f', `.joy/docker/docker-compose.yml`, 'down']);
  }

  /**
   * Returns a Promise from restarting the named docker-compose stack
   *
   */
  restart() {
    return this.invoke('docker-compose', ['-f', `.joy/docker/docker-compose.yml`, 'restart']);
  }

  /**
   * Returns a Promise from invoking an external command to `docker push`
   *
   * @param {*} options : Additional CLI flags
   *
   */
  push(options) {
    const imageName = `${process.env.ORG}/${options.name}.${process.env.PRODUCT}.${process.env.TLD}`;
    return this.invoke('docker', ['push', imageName]);
  }
}

module.exports = Docker;
