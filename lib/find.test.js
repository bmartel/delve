// find.test.js
const fs = require("fs");
const path = require("path");

const { findProjectRoot } = require("./find");
const { lookupRepoFromPackage } = require("./find");

describe("findProjectRoot", () => {
  it("should find package.json in the current directory", () => {
    // Mock process.cwd() to return a specific path
    jest.spyOn(process, "cwd").mockReturnValue(__dirname);

    // Ensure there's a package.json in the __dirname
    fs.writeFileSync(path.join(__dirname, "package.json"), "{}");

    expect(findProjectRoot()).toBe(__dirname);

    // Cleanup
    fs.unlinkSync(path.join(__dirname, "package.json"));
  });

  it("should find package.json in a parent directory", () => {
    // Mock process.cwd() to return a path one level deep
    const mockDir = path.join(__dirname, "testDir");
    fs.mkdirSync(mockDir);
    jest.spyOn(process, "cwd").mockReturnValue(mockDir);

    // Ensure there's a package.json in the parent directory (__dirname)
    fs.writeFileSync(path.join(__dirname, "package.json"), "{}");

    expect(findProjectRoot()).toBe(__dirname);

    // Cleanup
    fs.unlinkSync(path.join(__dirname, "package.json"));
    fs.rmdirSync(mockDir);
  });

  it("should throw an error if no package.json is found", () => {
    jest.spyOn(process, "cwd").mockReturnValue("/"); // root directory
    expect(() => findProjectRoot()).toThrow(
      "No package.json found in any parent directory."
    );
  });
});

describe("lookupRepoFromPackage", () => {
  it("returns correct details with valid input", () => {
    const packageJson = {
      dependencies: {
        "my-package": "git+https://github.com/user/repo.git#main",
      },
      delve: {
        packages: {
          "my-sub-package": "my-package",
        },
      },
    };
    const result = lookupRepoFromPackage(
      packageJson,
      "my-package",
      "targetName"
    );
    expect(result).toEqual({
      repo: "github.com/user/repo",
      branchOrCommit: "main",
      path: "",
      name: "targetName",
    });
  });

  it("throws error when package.json is missing", () => {
    expect(() =>
      lookupRepoFromPackage(null, "my-package", "targetName")
    ).toThrow("No package.json found in any parent directory.");
  });

  it("throws error when dependencies are missing", () => {
    const packageJson = {};
    expect(() =>
      lookupRepoFromPackage(packageJson, "my-package", "targetName")
    ).toThrow("No dependencies or devDependencies found in package.json");
  });

  it("throws error for invalid packageTarget format", () => {
    const packageJson = {
      dependencies: {
        "my-package": "git+https://github.com/user/repo.git#main",
      },
    };
    expect(() =>
      lookupRepoFromPackage(packageJson, "@invalidformat", "targetName")
    ).toThrow("Invalid scoped package format");
  });

  it("throws error when repository is not in dependencies", () => {
    const packageJson = { dependencies: {} };
    expect(() =>
      lookupRepoFromPackage(packageJson, "missing-package", "targetName")
    ).toThrow("No repository found in package.json");
  });
});
