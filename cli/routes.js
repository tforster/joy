'use strict';

const controllers = require('./controllers');

module.exports = function (joy) {
  joy.use('help',
    [], controllers.help);

  joy.use('build',
    [], controllers.build);

  joy.use('build/static',
    [{
      name: 'stage',
      flag: { short: '-s', long: '--stage' },
      help: 'The stage to build for (e.g. dev, stage, prod)'
    },
    {
      name: 'watch',
      flag: { short: '-w', long: '--watch' },
      help: 'Watch for changes in /src folder'
    }], controllers.buildStatic);

  joy.use('build/swagger',
    [{
      name: 'watch',
      flag: { short: '-w', long: '--watch' },
      help: 'Watch for changes in swagger folder'
    }], controllers.buildSwagger);

  joy.use('build/docker',
    [{
      name: 'name',
      flag: { short: '-n', long: '--name' },
      help: 'Docker file prefix (e.g. www, db, etc.'
    }], controllers.buildDocker);

  joy.use('start/docker/registry',
    [{
    }],
    controllers.startDockerRegistry);

  joy.use('stop/docker/registry', [{
  }], controllers.stopDockerRegistry);

  joy.use('start/docker/container',
    [{
      name: 'name',
      flag: { short: '-n', long: '--name' },
      help: 'Name of docker image from .joy/docker to start as a container'
    }], controllers.startDockerContainer);

}

