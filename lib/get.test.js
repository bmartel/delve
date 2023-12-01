// get.test.js
const fs = require("fs");
const path = require("path");

const { getPackageJson } = require("./get");

// Mocking file system and path
jest.mock("fs");
jest.mock("path");

describe("getPackageJson", () => {
  const fakePackageJson = {
    name: "test-package",
    version: "1.0.0",
  };

  beforeEach(() => {
    // Reset modules so we can require fresh each time
    jest.resetModules();
  });

  it("should correctly load a valid package.json file", () => {
    const projectRoot = "/fake/project/root";
    const fakePath = projectRoot + "/package.json";

    // Mocking path.join and fs.existsSync
    path.join.mockReturnValue(fakePath);
    fs.existsSync.mockReturnValue(true);

    // Mocking require to return fake package.json
    jest.mock(
      "/fake/project/root/package.json",
      () => ({ name: "test-package", version: "1.0.0" }),
      {
        virtual: true,
      }
    );

    const packageJson = getPackageJson(projectRoot);
    expect(packageJson).toEqual(fakePackageJson);
  });

  it("should throw an error if package.json does not exist", () => {
    const projectRoot = "/fake/project/root";
    const fakePath = path.join(projectRoot, "package.json");

    path.join.mockReturnValue(fakePath);
    fs.existsSync.mockReturnValue(false);

    expect(() => getPackageJson(projectRoot)).toThrow();
  });

  // Additional test cases can be added here as needed
});
