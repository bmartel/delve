const { findProjectRoot, lookupRepoFromPackage } = require("./find");
const fs = require("fs/promises");
const path = require("path");

jest.mock("fs/promises");
jest.mock("path");

describe("findProjectRoot", () => {
  const mockProjectRoot = "/mock/project/root";
  const mockParentDir = "/mock/project";
  const mockRootDir = "/";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns current directory when package.json is found", async () => {
    path.join.mockReturnValueOnce(`${mockProjectRoot}/package.json`);
    fs.lstat.mockResolvedValueOnce({ isFile: () => true });

    const result = await findProjectRoot(mockProjectRoot);
    expect(result).toBe(mockProjectRoot);
  });

  it("returns parent directory when package.json is found in parent directory", async () => {
    path.join
      .mockReturnValueOnce(`${mockProjectRoot}/package.json`)
      .mockReturnValueOnce(`${mockParentDir}/package.json`);
    path.dirname.mockReturnValueOnce(mockParentDir);
    fs.lstat
      .mockRejectedValueOnce(new Error("File not found")) // Simulate file not found in project root
      .mockResolvedValueOnce({ isFile: () => true }); // Simulate file found in parent dir

    const result = await findProjectRoot(mockProjectRoot);
    expect(result).toBe(mockParentDir);
  });

  it("throws error when no package.json is found", async () => {
    path.join
      .mockReturnValueOnce(`${mockProjectRoot}/package.json`)
      .mockReturnValueOnce(`${mockParentDir}/package.json`)
      .mockReturnValueOnce(`${mockRootDir}/package.json`);
    fs.lstat.mockRejectedValue(new Error("File not found"));

    await expect(findProjectRoot(mockProjectRoot)).rejects.toThrow(
      "No package.json found in any parent directory."
    );
  });
});

describe("lookupRepoFromPackage", () => {
  const mockPackageJson = {
    dependencies: {
      "my-package": "https://github.com/user/repo.git#main",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws error when packageJson is null", () => {
    expect(() =>
      lookupRepoFromPackage(null, "my-package", "targetName")
    ).toThrow("No package.json found in any parent directory.");
  });

  it("throws error when dependencies are empty", () => {
    const emptyDeps = {};
    expect(() =>
      lookupRepoFromPackage(emptyDeps, "my-package", "targetName")
    ).toThrow("No dependencies or devDependencies found in package.json");
  });

  it.skip("throws error for invalid non-scoped package format", () => {
    expect(() =>
      lookupRepoFromPackage(
        mockPackageJson,
        "invalid/package/format",
        "targetName"
      )
    ).toThrow("Invalid package format");
  });

  it.skip("throws error for invalid scoped package format", () => {
    expect(() =>
      lookupRepoFromPackage(
        mockPackageJson,
        "@invalid/scoped/format",
        "targetName"
      )
    ).toThrow("Invalid scoped package format");
  });

  it("throws error when repository is not found in dependencies", () => {
    expect(() =>
      lookupRepoFromPackage(mockPackageJson, "missing-package", "targetName")
    ).toThrow("No repository found in package.json");
  });

  it("throws error for invalid repository URL format", () => {
    const mockPackageJsonInvalidUrl = {
      dependencies: {
        "my-package": "invalid-url-format",
      },
    };
    expect(() =>
      lookupRepoFromPackage(
        mockPackageJsonInvalidUrl,
        "my-package",
        "targetName"
      )
    ).toThrow("No repository found in package.json");
  });

  it("returns repository details for valid inputs", () => {
    const result = lookupRepoFromPackage(
      mockPackageJson,
      "my-package",
      "targetName"
    );
    expect(result).toEqual({
      sourceRepo: "github.com/user/repo",
      sourceRepoUrl: "https://github.com/user/repo.git",
      sourceRepoPackage: "my-package",
      branchOrCommit: "main",
      targetRepoPath: "",
      targetRepoPackage: "targetName",
    });
  });
});
