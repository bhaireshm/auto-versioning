// * Read arguments
const args = process.argv.slice(2);
if (args.length <= 0) {
  console.error(new Error("Argument is required."));
  require("process").exit(-1);
}

const arg = args[0];
const val = new RegExp(/^[0-9]*$/).test(args[1]) ? args[1] : false;
const msgStartIndex = val ? 2 : 1;
let message = args.slice(msgStartIndex, args.length - 1);
message = message.length > 0 ? message.join(" ") : "";

// console.log("args", args);
// console.log("arg", arg);
// console.log("val", val);
// console.log("msg", message);

let version;

if (val) {
  // * Import package.json
  const packageFile = JSON.parse(require("fs").readFileSync("package.json", "utf-8"));

  // * Read package.json
  const patchMaxValue = 99;
  const minorMaxValue = 99;
  const currVersion = packageFile.version;
  const versionObj = {
    major: +currVersion.split(".")[0],
    minor: +currVersion.split(".")[1],
    patch: +currVersion.split(".")[2],
  };

  // * Increment Version
  switch (arg) {
    case "patch":
      versionObj.patch = val ? val : versionObj.patch + 1;
      break;
    case "minor":
      versionObj.patch = 0;
      versionObj.minor = val ? val : versionObj.minor + 1;
      break;
    case "major":
      versionObj.patch = 0;
      versionObj.minor = 0;
      versionObj.major = val ? val : versionObj.major + 1;
      break;
    default:
      break;
  }

  // * Check for versions
  if (versionObj.patch > patchMaxValue) {
    versionObj.patch = 0;
    ++versionObj.minor;
  }
  if (versionObj.minor > minorMaxValue) {
    versionObj.minor = 0;
    ++versionObj.major;
  }

  version = Object.values(versionObj).join(".");
} else {
  version = arg;
}

// * Execute Command
updateVersion();

// Private Functions
// function executeCommand(cmd, path = __dirname) {
//   return new Promise((resolve, reject) => {
//     require("child_process").exec(cmd, { cwd: path }, (err, stdout, stderr) => {
//       if (err) return reject(err);
//       return resolve(stdout, stderr);
//     });
//   });
// }

function updateVersion() {
  if (message) message = ` -m "${val ? `${version} ` + message : message}"`;
  const cmd = `npm version ${version} --force${message}`;
  // console.log("cmd", cmd);

  // npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease [--preid=<prerelease-id>] | from-git] --force -m "message"
  // executeCommand(cmd)
  //   .then((result, stderr) => {
  //     if (stderr) console.log(stderr);
  //     console.log(`\nVersion updated to ${result}`);
  //   })
  //   .catch((err) => console.log(err));

  require("child_process").exec(cmd, { cwd: __dirname }, (err, stdout, stderr) => {
    if (err) console.log(new Error(err));
    console.log(`Version updated to ${stdout}`);
    if (stderr) console.log(stderr);
  });
}
