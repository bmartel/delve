const fs = require("fs");
const path = require("path");

// Looks for the closest package.json file to the current working directory and returns the path
module.exports.findProjectRoot = (currentDir = process.cwd()) => {
  while (true) {
    const packagePath = path.join(currentDir, "package.json");

    // Check if package.json exists in the current directory
    if (fs.existsSync(packagePath)) {
      return currentDir;
    }

    // Move up one directory level
    const parentDir = path.dirname(currentDir);

    // If we've reached the root of the file system, break
    if (currentDir === parentDir) {
      throw new Error("No package.json found in any parent directory.");
    }

    currentDir = parentDir;
  }
};

module.exports.lookupRepoFromPackage = (
  packageJson,
  packageTarget,
  targetName
) => {
  if (!packageJson) {
    throw new Error("No package.json found in any parent directory.");
  }

  const dependencies =
    packageJson["dependencies"] || packageJson["devDependencies"];
  if (!dependencies) {
    throw new Error("No dependencies or devDependencies found in package.json");
  }

  // separate packageName and packagePath from packageTarget
  // @org/packageName/path/to/package
  // @org/packageName
  // packageName/path/to/package
  // packageName

  let packageName = packageTarget;
  let packagePath = "";

  if (packageTarget.startsWith("@")) {
    const matchResult = packageTarget.match(/@([^/]+)\/([^/]+)(\/.*)?/);
    if (!matchResult) {
      throw new Error("Invalid scoped package format");
    }

    const [, org, potentialName, potentialPath] = matchResult;
    packageName = `@${org}/${potentialName}`;
    packagePath = potentialPath || "";
  } else {
    const matchResult = packageTarget.match(/([^/]+)(\/.*)?/);
    if (!matchResult) {
      throw new Error("Invalid package format");
    }

    const [, potentialName, potentialPath] = matchResult;
    packageName = potentialName;
    packagePath = potentialPath || "";
  }

  const repo = dependencies[packageName];

  if (!repo) {
    throw new Error("No repository found in package.json");
  }

  const [_, repoShortUrl, branchOrCommit] = repo.match(
    /git\+https:\/\/(.*)\.git#(.*)/
  );

  if (!repoShortUrl) {
    throw new Error("No repository found in package.json");
  }

  if (!branchOrCommit) {
    throw new Error("No branch or commit found for repository");
  }

  return {
    repo: repoShortUrl,
    branchOrCommit: branchOrCommit,
    path: packagePath,
    name: targetName,
  };
};
