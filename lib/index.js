const { getConfig } = require("./config");
const { checkoutRepo } = require("./repo");

const delve = async () => {
  const config = getConfig();

  for (const [packageName, repoConfig] of Object.entries(config.dependencies)) {
    console.log(`Checking out ${packageName}`, repoConfig, `to: ${cacheDir}`);
    await checkoutRepo(config.cacheDir, repoConfig);
  }
};

delve();

module.exports = delve;
