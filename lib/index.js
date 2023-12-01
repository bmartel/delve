const path = require("path");
const findProjectRoot = require("./find").findProjectRoot;
const getPackageJson = require("./get").getPackageJson;

const delve = () => {
  const projectRoot = findProjectRoot();
  const packageJson = getPackageJson(projectRoot);

  return packageJson;
};
