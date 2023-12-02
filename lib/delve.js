const { getConfig } = require("./config");
const { cloneRepo, checkoutAllRepos, symlinkAllRepos } = require("./repo");

module.exports.delve = async () => {
  const config = await getConfig();

  for (const [packageName, repoConfig] of Object.entries(config.dependencies)) {
    console.log(`${packageName}`, repoConfig);
    await cloneRepo(config.cacheDir, repoConfig);
  }

  await checkoutAllRepos();
  await symlinkAllRepos();
};
