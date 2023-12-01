// find.test.js
const fs = require("fs");
const path = require("path");

const findProjectRoot = require("./find").findProjectRoot;

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
