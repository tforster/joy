'use strict';

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
      .command('stack', 'Build, start, stop, restart the Docker stack')
      .argument('<subcommand>', 'subcommand', ['build', 'start', 'stop', 'restart'])
      .option('-n, --name <name>', 'Component name', prog.STRING)
      .action(async (args, options, logger) => {
        logger.debug('arguments: %j', args);
        logger.debug('options: %j', options);
        const code = await this[args.subcommand].call(joy, options, logger);
        return code;
      });
  }

  /**
   * Returns a Promise from restarting the named docker-compose stack
   *
   */
  restart() {
    return this.invoke('docker-compose', ['-f', `.joy/docker/docker-compose.yml`, 'restart']);
  }

  /**
   * Returns a Promise from invoking an external command to `docker-compose up build`
   *
   */
  start() {
    return this.invoke('docker-compose', ['-f', `.joy/docker/docker-compose.yml`, 'up', '-d']);
  }

  /**
   * Returns a Promise from invoking an external command to `docker-compose down`
   *
   */
  stop() {
    return this.invoke('docker-compose', ['-f', `.joy/docker/docker-compose.yml`, 'down']);
  }

  /**
   * Returns a Promise from invoking an external command to `docker build`
   *
   * @param {*} options : Additional CLI flags
   *
   */
  build(options) {
    const imageName = `${process.env.ORG}/${options.name}.${process.env.PRODUCT}.${process.env.TLD}`;
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
