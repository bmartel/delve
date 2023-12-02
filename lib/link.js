const path = require("path");
const fs = require("fs/promises");

module.exports.linkDirectory = async (source, target) => {
  // check if the target is already a symlink
  const targetStats = await fs.lstat(target).catch(() => null);
  const targetIsSymlink = targetStats && targetStats.isSymbolicLink();

  if (!targetIsSymlink) {
    console.log("Linking", { source, target });
    // mkdir -p up to the parent directory of target
    const parentDir = path.resolve(target, "..");
    await fs.mkdir(parentDir, { recursive: true });
    await fs.symlink(source, target);
  }
};
