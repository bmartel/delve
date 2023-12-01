const path = require('path');
const fs = require('fs');
const _git = require('simple-git');

const git = _git();
const cache = {};

module.exports.checkoutRepo = async (cacheDir, repoConfig) => {
  const cachePath = path.join(cacheDir, repoConfig.repo)
  if (cache[cachePath]) {
    return
  }
  cache[cachePath] = true;

  const isCommitHash = /^[a-f0-9]{40}$/i.test(repoConfig.branchOrCommit);
  const cloneConfig = {
    '--depth': 1,
    '--no-checkout': true,
  }

  cloneConfig['--branch'] = isCommitHash || !repoConfig.branchOrCommit ? 'main' : repoConfig.branchOrCommit;
    
  if (!fs.existsSync(cachePath)) {
    await git.clone(repoConfig.repoUrl, cachePath, cloneConfig);
  } 

  await git.cwd(cachePath).fetch();
  await git.cwd(cachePath).checkout(repoConfig.branchOrCommit);
  await git.cwd(cachePath).pull();
};
