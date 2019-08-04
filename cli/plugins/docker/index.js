'use strict';

class Docker {
  constructor(joy) {
    const prog = joy.prog;
    prog
      .command('stack', 'Build, start, stop, restart the Docker stack')
      .argument('<subcommand>', 'subcommand', ['build', 'start', 'stop', 'restart'])
      .option('-n, --name <name>', 'Component name', prog.STRING)
      .action(async (args, options, logger) => {
        logger.debug("arguments: %j", args);
        logger.debug("options: %j", options);
        const code = await this[args.subcommand].call(joy, options, logger);
        return code;
      });
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
   * @param {*} options 
   * @param {*} logger 
   */
  build(options, logger) {
    const imageName = `${process.env.ORG}/${options.name}.${process.env.PRODUCT}.${process.env.TLD}`;
    return this.invoke('docker', ['build', '--force-rm', '--no-cache', '-f', `.joy/docker/${options.name}.dockerfile`, '.', '-t', imageName])
  }


  /**
   * Returns a Promise from invoking an external command to `docker push`
   * 
   * @param {*} options 
   * @param {*} logger 
   */
  push(options, logger) {
    const imageName = `${process.env.ORG}/${options.name}.${process.env.PRODUCT}.${process.env.TLD}`;
    return this.invoke('docker', ['push', imageName]);
  }
}

module.exports = Docker;
