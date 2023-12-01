const { parseRepoDetails } = require("./parse");

describe("parseRepoDetails", () => {
  const validUrl =
    "https://github.com/user/my-pkg.git?branch=main&path=libs/lib1&commit=4820ac91f83104fc5cf4561063b237990c7d3bca&pkg=lib1";

  it("returns correct details with valid input", () => {
    const result = parseRepoDetails("lib1", validUrl);
    expect(result).toEqual({
      package: "lib1",
      repository: "github.com/user/my-pkg",
      path: "libs/lib1",
      branch: undefined, // commit present, so branch is ignored
      commit: "4820ac91f83104fc5cf4561063b237990c7d3bca",
    });
  });

  it("throws error when package name is missing", () => {
    expect(() => parseRepoDetails("", validUrl)).toThrow(
      "Package name is required"
    );
  });

  it("throws error when repository URL is missing", () => {
    expect(() => parseRepoDetails("lib1", "")).toThrow(
      "Repository URL is required"
    );
  });

  it("throws error with invalid repository URL format", () => {
    expect(() => parseRepoDetails("lib1", "https://invalid-url")).toThrow(
      "Repository URL does not match the expected GitHub format"
    );
  });

  it("throws error when package names mismatch", () => {
    const mismatchUrl =
      "https://github.com/user/my-pkg.git?branch=main&path=libs/lib1&commit=4820ac91f83104fc5cf4561063b237990c7d3bca&pkg=lib2";
    expect(() => parseRepoDetails("lib1", mismatchUrl)).toThrow(
      "Package name in the URL does not match the provided package name"
    );
  });

  it("throws error when path is missing in URL", () => {
    const noPathUrl =
      "https://github.com/user/my-pkg.git?branch=main&commit=4820ac91f83104fc5cf4561063b237990c7d3bca&pkg=lib1";
    expect(() => parseRepoDetails("lib1", noPathUrl)).toThrow(
      "Path parameter is required in the URL"
    );
  });

  it("throws error when both branch and commit are missing", () => {
    const noBranchCommitUrl =
      "https://github.com/user/my-pkg.git?path=libs/lib1&pkg=lib1";
    expect(() => parseRepoDetails("lib1", noBranchCommitUrl)).toThrow(
      "Either branch or commit parameter is required in the URL"
    );
  });

  it("commit presence overrides branch", () => {
    const bothBranchCommitUrl =
      "https://github.com/user/my-pkg.git?branch=main&path=libs/lib1&commit=4820ac91f83104fc5cf4561063b237990c7d3bca&pkg=lib1";
    const result = parseRepoDetails("lib1", bothBranchCommitUrl);
    expect(result.branch).toBeUndefined();
    expect(result.commit).toBeDefined();
  });
});
