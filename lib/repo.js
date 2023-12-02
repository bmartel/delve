const path = require("path");
const fs = require("fs/promises");
const _git = require("simple-git");
const { linkDirectory } = require("./link");

const git = _git();
const cache = new Map();
module.exports.cache = () => cache;

module.exports.cloneRepo = async (cacheDir, repoConfig) => {
  const cachePath = path.join(cacheDir, repoConfig.sourceRepo);
  if (module.exports.cache().has(cachePath)) {
    module.exports
      .cache()
      .set(cachePath, module.exports.cache().get(cachePath).concat(repoConfig));
    return;
  }
  module.exports.cache().set(cachePath, [repoConfig]);

  const isCommitHash = /^[a-f0-9]{40}$/i.test(repoConfig.branchOrCommit);
  const cloneConfig = {
    "--depth": 1,
    "--no-checkout": true,
  };

  cloneConfig["--branch"] =
    isCommitHash || !repoConfig.branchOrCommit
      ? "main"
      : repoConfig.branchOrCommit;

  const targetStats = await fs.lstat(cachePath).catch(() => null);
  if (!targetStats || !targetStats.isDirectory()) {
    await git.clone(repoConfig.sourceRepoUrl, cachePath, cloneConfig);
  }
};

module.exports.checkoutAllRepos = async () => {
  for (const [cachePath, configs] of module.exports.cache()) {
    const paths = configs.map((config) => config.targetRepoPath);
    const cwdGit = git.cwd(cachePath);
    await cwdGit.fetch();
    await cwdGit.raw("sparse-checkout", "init", "--cone");
    await cwdGit.raw("sparse-checkout", "set", paths.join(" "));
    await cwdGit.checkout();
    await cwdGit.pull();
  }
};

module.exports.symlinkAllRepos = async () => {
  for (const [cachePath, configs] of module.exports.cache()) {
    const cacheRootDir = path.resolve(
      cachePath.replace(configs[0].sourceRepo, "").replace(/\/$/, ""),
      ".."
    );

    // TODO: remove this later, keeping for reference
    // // link the main repo into the cache root (e.g. node_modules)
    // const parentTargetRepoPath = path.join(
    //   cacheRootDir,
    //   configs[0].sourceRepoPackage
    // );
    // const parentSourceRepoPath = cachePath;
    // await linkDirectory(parentSourceRepoPath, parentTargetRepoPath);

    // link each sub-repo into the cache root (e.g. node_modules)
    for (const config of configs) {
      const targetRepoPath = path.join(cacheRootDir, config.targetRepoPackage);
      const sourceRepoPath = path.join(cachePath, config.targetRepoPath);
      await linkDirectory(sourceRepoPath, targetRepoPath);
    }
  }
};
