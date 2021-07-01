const { exec } = require('child_process');
const path = require('path');

const WORKSPACE_PATH = path.join(__dirname, '..', '..', '..', '..');
const SCRIPTS_PATH = __dirname;
const AC_APPCIRCLE = !!process.env.AC_APPCIRCLE;

/**
 * Do not launch if we are on appcircle build, the library files should be imported anyways.
 * However, this condition might be removed since we have added markerplace code into the repository.
 */
if (AC_APPCIRCLE) {
  return;
}
exec(`npx sfMarketplaceService import library --packageFolder ${SCRIPTS_PATH} --wsPath ${WORKSPACE_PATH}`, (error, stdout, stderr)=> {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  if (stdout) {
    console.log(stdout);
  }
  if (stderr) {
    console.error('stderr :', stderr);
  }
})