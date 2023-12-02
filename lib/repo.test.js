const repoModule = require("./repo");
const simpleGit = require("simple-git");
const path = require("path");
const fs = require("fs/promises");
const { linkDirectory } = require("./link");

jest.mock("simple-git", () => {
  const mockCWDGit = {
    cwd: jest.fn().mockReturnThis(),
    clone: jest.fn(),
    fetch: jest.fn(),
    raw: jest.fn(),
    checkout: jest.fn(),
    pull: jest.fn(),
  };

  return jest.fn(() => mockCWDGit);
});

jest.mock("fs/promises");
jest.mock("./link");

describe("repo.js", () => {
  let git;
  let cache;

  beforeEach(() => {
    jest.clearAllMocks();
    cache = new Map();
    git = simpleGit();
  });

  describe("cloneRepo", () => {
    const mockCacheDir = "/mock/cache/dir";
    const mockRepoConfig = {
      sourceRepo: "github.com/user/repo",
      sourceRepoUrl: "https://github.com/user/repo.git",
      branchOrCommit: "main",
    };
    const mockCachePath = path.join(mockCacheDir, mockRepoConfig.sourceRepo);

    it("clones repo when not in cache and directory does not exist", async () => {
      fs.lstat.mockRejectedValue(new Error("Directory not found"));
      await repoModule.cloneRepo(mockCacheDir, mockRepoConfig);

      expect(git.clone).toHaveBeenCalledWith(
        mockRepoConfig.sourceRepoUrl,
        mockCachePath,
        expect.any(Object)
      );
    });

    it("skips clone when repo is already in cache", async () => {
      cache.set(mockCachePath, [mockRepoConfig]);
      jest.spyOn(repoModule, "cache").mockImplementation(() => cache);
      await repoModule.cloneRepo(mockCacheDir, mockRepoConfig);

      expect(git.clone).not.toHaveBeenCalled();
    });

    it("skips clone when directory already exists", async () => {
      fs.lstat.mockResolvedValue({ isDirectory: () => true });
      await repoModule.cloneRepo(mockCacheDir, mockRepoConfig);

      expect(git.clone).not.toHaveBeenCalled();
    });
  });

  describe("checkoutAllRepos", () => {
    const mockCachePath = "/mock/cache/dir/github.com/user/repo";
    const mockConfig = {
      targetRepoPath: "path/to/repo",
      sourceRepo: "github.com/user/repo",
    };

    it("performs git operations on each cached repo", async () => {
      cache.set(mockCachePath, [mockConfig]);
      jest.spyOn(repoModule, "cache").mockImplementation(() => cache);
      await repoModule.checkoutAllRepos();

      expect(git.cwd).toHaveBeenCalledWith(mockCachePath);
      expect(git.fetch).toHaveBeenCalled();
      expect(git.raw).toHaveBeenCalledWith("sparse-checkout", "init", "--cone");
      expect(git.raw).toHaveBeenCalledWith(
        "sparse-checkout",
        "set",
        expect.any(String)
      );
      expect(git.checkout).toHaveBeenCalled();
      expect(git.pull).toHaveBeenCalled();
    });
  });

  describe("symlinkAllRepos", () => {
    const mockCachePath = "/mock/cache/path";
    const mockConfig = {
      targetRepoPackage: "target-package",
      targetRepoPath: "path/to/repo",
      sourceRepo: "github.com/user/repo",
    };
    const mockCacheRootDir = "/mock/cache";

    it("creates symlinks for cached repos", async () => {
      cache.set(mockCachePath, [mockConfig]);
      jest.spyOn(repoModule, "cache").mockImplementation(() => cache);
      // spy on path.resolve to return the mock cache root dir
      jest.spyOn(path, "resolve").mockReturnValueOnce(mockCacheRootDir);
      await repoModule.symlinkAllRepos();

      const expectedTargetRepoPath = path.join(
        mockCacheRootDir,
        mockConfig.targetRepoPackage
      );
      const expectedSourceRepoPath = path.join(
        mockCachePath,
        mockConfig.targetRepoPath
      );

      expect(linkDirectory).toHaveBeenCalledWith(
        expectedSourceRepoPath,
        expectedTargetRepoPath
      );
    });
  });
});
