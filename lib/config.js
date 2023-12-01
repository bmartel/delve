const { findProjectRoot } = require("./find");
const { getPackageJson } = require("./get");

module.exports.getConfig = () => {
  const projectRoot = findProjectRoot();
  const packageJson = getPackageJson(projectRoot);
  const config = packageJson["delve"];

  if (!config) {
    throw new Error("No delve config found in package.json");
  }

  return config;
};
