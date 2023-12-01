const path = require("path");
const fs = require("fs");

// Get the package.json file from the project root
module.exports.getPackageJson = (projectRoot) => {
  const packagePath = path.join(projectRoot, "package.json");

  if (!fs.existsSync(packagePath)) {
    throw new Error(`package.json not found in ${projectRoot}`);
  }

  const packageJson = require(packagePath);

  return packageJson;
};
