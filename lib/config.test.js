const { getConfig } = require("./config");
const { findProjectRoot, lookupRepoFromPackage } = require("./find");
const { getPackageJson, getCacheDir } = require("./get");

jest.mock("./find");
jest.mock("./get");

describe("getConfig", () => {
  const mockProjectRoot = "/mock/project/root";
  const mockPackageJson = {
    delve: {
      packages: {
        "react-cache": "react/packages/react-cache",
      },
      cacheDir: "custom/cache/dir",
    },
  };
  const mockConfigDependency = {
    sourceRepo: "github.com/facebook/react",
    sourceRepoUrl: "https://github.com/facebook/react.git",
    sourceRepoPackage: "react",
    branchOrCommit: "master",
    targetRepoPath: "packages/react-cache",
    targetRepoPackage: "react-cache",
  };

  beforeEach(() => {
    findProjectRoot.mockResolvedValue(mockProjectRoot);
    getPackageJson.mockResolvedValue(mockPackageJson);
    getCacheDir.mockResolvedValue(`${mockProjectRoot}/custom/cache/dir`);
    lookupRepoFromPackage.mockReturnValue(mockConfigDependency);
  });

  it("returns valid config when package.json has valid delve config", async () => {
    const result = await getConfig();

    expect(result).toEqual({
      projectRoot: mockProjectRoot,
      cacheDir: "custom/cache/dir",
      packages: {
        "react-cache": "react/packages/react-cache",
      },
      dependencies: {
        "react-cache": mockConfigDependency,
      },
    });
  });

  it("throws error when package.json is missing", async () => {
    getPackageJson.mockRejectedValue(new Error("package.json not found"));

    await expect(getConfig()).rejects.toThrow("package.json not found");
  });

  it("throws error when delve config is missing", async () => {
    getPackageJson.mockResolvedValue({}); // package.json without delve config

    await expect(getConfig()).rejects.toThrow(
      "No delve config found in package.json"
    );
  });

  it("throws error when packages are missing in delve config", async () => {
    getPackageJson.mockResolvedValue({ delve: {} }); // delve config without packages

    await expect(getConfig()).rejects.toThrow(
      "No packages found in delve config"
    );
  });
});
