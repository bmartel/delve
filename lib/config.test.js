// config.test.js
const { getConfig } = require("./config");
const { findProjectRoot } = require("./find");
const { getPackageJson } = require("./get");

jest.mock("./find");
jest.mock("./get");

describe("getConfig", () => {
  it("returns delve config when present in package.json", () => {
    const fakeDelveConfig = { key: "value" };
    const fakePackageJson = { delve: fakeDelveConfig };

    findProjectRoot.mockReturnValue("/fake/project/root");
    getPackageJson.mockReturnValue(fakePackageJson);

    const config = getConfig();
    expect(config).toEqual(fakeDelveConfig);
  });

  it("throws an error when delve config is not present in package.json", () => {
    const fakePackageJson = {};

    findProjectRoot.mockReturnValue("/fake/project/root");
    getPackageJson.mockReturnValue(fakePackageJson);

    expect(() => getConfig()).toThrow("No delve config found in package.json");
  });

  it("throws an error when package.json is not found", () => {
    findProjectRoot.mockReturnValue("/fake/project/root");
    getPackageJson.mockImplementation(() => {
      throw new Error("package.json not found");
    });

    expect(() => getConfig()).toThrow("package.json not found");
  });
});
