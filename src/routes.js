'use strict';

const controllers = require('./controllers');

module.exports = function (joy) {
  // To be deprecated
  joy.use('help', controllers.help);
  joy.use('build', controllers.build);

  // Static site commands
  joy.use('static/build/:stage', controllers.buildStatic);

  // Swagger commands
  joy.use('swagger/build', controllers.buildSwagger);

  // Docker commands
  joy.use('docker/image/build/:name', controllers.buildDocker);
  joy.use('docker/registry/start', controllers.startDockerRegistry);
  joy.use('docker/registry/stop', controllers.stopDockerRegistry);
  joy.use('docker/container/start/:name', controllers.startDockerContainer);

  // Git commands
  joy.use('git/branch/:number/:title', controllers.gitCheckoutB);
}

