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

module.exports.getCacheDir = (config) => {
  const cacheDir = path.join(config.projectRoot, config.cacheDir);

  // Create it if it doesn't exist
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  return cacheDir;
};
