const path = require("path");
const fs = require("fs/promises");

module.exports.getFile = (filePath) => {
  return require(filePath);
};

// Get the package.json file from the project root
module.exports.getPackageJson = async (projectRoot) => {
  const packagePath = path.join(projectRoot, "package.json");

  const targetStats = await fs.lstat(packagePath).catch(() => null);
  if (!targetStats || !targetStats.isFile()) {
    throw new Error(`package.json not found in ${projectRoot}`);
  }

  const packageJson = module.exports.getFile(packagePath);

  return packageJson;
};

module.exports.getCacheDir = async (config) => {
  const cacheDir = path.join(config.projectRoot, config.cacheDir);

  const targetStats = await fs.lstat(cacheDir).catch(() => null);
  // Create it if it doesn't exist
  if (!targetStats || !targetStats.isDirectory()) {
    await fs.mkdir(cacheDir, { recursive: true });
  }

  return cacheDir;
};
