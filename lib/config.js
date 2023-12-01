const { findProjectRoot, lookupRepoUrlFromPackage } = require("./find");
const { getPackageJson } = require("./get");

module.exports.getConfig = () => {
  const projectRoot = findProjectRoot();
  const packageJson = getPackageJson(projectRoot);
  const config = packageJson["delve"];

  if (!config) {
    throw new Error("No delve config found in package.json");
  }

  if (!config["packages"]) {
    throw new Error("No packages found in delve config");
  }

  config.dependencies = {};
  for (const packageName in config["packages"]) {
    const packageTarget = config["packages"][packageName];
    // delve config should be a reference to a package.json dependency with an optional subpath
    // ie. "react-cache": "react/packages/react-cache"
    //
    // packageTarget should be a standard package.json dependency
    // ie. "react": "https://github.com/facebook/react.git#master"
    //
    // and should result in
    // config.dependencies["react-cache"] = {
    //  repo: "react",
    //  branch: "master"
    //  path: "packages/react-cache",
    //  name: "react-cache"
    // }
    config.dependencies[packageName] = lookupRepoUrlFromPackage(
      packageJson,
      packageTarget,
      packageName
    );
  }

  return config;
};
