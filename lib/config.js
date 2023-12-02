const { findProjectRoot, lookupRepoFromPackage } = require("./find");
const { getPackageJson, getCacheDir } = require("./get");

module.exports.getConfig = async () => {
  const projectRoot = await findProjectRoot();
  const packageJson = await getPackageJson(projectRoot);
  const config = packageJson["delve"];

  if (!config) {
    throw new Error("No delve config found in package.json");
  }

  if (!config["packages"]) {
    throw new Error("No packages found in delve config");
  }

  config.projectRoot = projectRoot;
  config.cacheDir = config.cacheDir || "node_modules/.delve";
  cacheDir = await getCacheDir(config);

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
    //  sourceRepo: "github.com/facebook/react",
    //  sourceRepoUrl: "https://github.com/facebook/react.git",
    //  sourceRepoPackage: "react",
    //  branchOrCommit: "master"
    //  targetRepoPath: "packages/react-cache",
    //  targetRepoName: "react-cache"
    // }
    config.dependencies[packageName] = lookupRepoFromPackage(
      packageJson,
      packageTarget,
      packageName
    );
  }

  return config;
};
