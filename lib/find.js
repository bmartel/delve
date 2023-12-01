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
