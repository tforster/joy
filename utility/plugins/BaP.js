const exec = require('child_process').exec;

// Build and Push Docker image
class BaP {

  static bap(program, cmd, options) {
    const config = program.config;
    const command = `docker build --no-cache --force-rm -f .joy/docker/${cmd}.dockerfile . -t ${config.org}/${config.buildTime.dockerImages[cmd]}:${options}`
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
    exec(`docker push ${config.org}/${config.buildTime.dockerImages[cmd]}:${options}`, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });

  }
}

exports.bap = BaP.bap;
