const { exit } = require("process");
const { readFileSync } = require("fs");
const { exec } = require("child_process");

const patchMaxValue = 9;
const minorMaxValue = 9;

// * Read arguments
const args = process.argv.slice(2);
const arg = args[0];
const val = +args[1] || false;

if (args.length === 0) {
  console.error(new Error("Argument is required."));
  exit(-1);
}

// * Import package.json
const packageFile = JSON.parse(readFileSync("package.json", "utf-8"));

// * Read package.json
const currVersion = packageFile.version;
const version = {
  major: +currVersion.split(".")[0],
  minor: +currVersion.split(".")[1],
  patch: +currVersion.split(".")[2],
};
let updatedVersion;

// * Increment Version
switch (arg) {
  case "patch":
    version.patch = val ? val : version.patch + 1;
    break;
  case "minor":
    version.minor = val ? val : version.minor + 1;
    break;
  case "major":
    version.major = val ? val : version.major + 1;
    break;
  default:
    break;
}

// * Check for versions
checkAndUpdateSiblings();

// * Execute Command
updatedVersion = Object.values(version).join(".");

const cmd = `npm version --force ${updatedVersion}`;
executeCommand(cmd)
  .then((result) => {
    console.log("Version updated to " + result);
  })
  .catch((err) => {
    console.error(err);
  });

// Private Functions
function executeCommand(cmd, path = __dirname) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: path }, (err, stdout, stderr) => {
      if (err) return reject(err);
      return resolve(stdout);
    });
  });
}

function checkAndUpdateSiblings() {
  if (version.patch > patchMaxValue) {
    version.patch = 0;
    ++version.minor;
  }

  if (version.minor > minorMaxValue) {
    version.minor = 0;
    ++version.major;
  }
}
