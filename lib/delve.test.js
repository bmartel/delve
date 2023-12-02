const delveModule = require("./delve");
const configModule = require("./config");
const repoModule = require("./repo");

jest.mock("./config");
jest.mock("./repo");

describe("delve", () => {
  const mockConfig = {
    cacheDir: "/mock/cache/dir",
    dependencies: {
      package1: {},
      package2: {},
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    configModule.getConfig.mockResolvedValue(mockConfig);
    repoModule.cloneRepo.mockResolvedValue();
    repoModule.checkoutAllRepos.mockResolvedValue();
    repoModule.symlinkAllRepos.mockResolvedValue();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  it("orchestrates repository operations based on config", async () => {
    await delveModule.delve();

    // Check if getConfig was called
    expect(configModule.getConfig).toHaveBeenCalled();

    // Check if cloneRepo was called for each package
    for (const [packageName, repoConfig] of Object.entries(
      mockConfig.dependencies
    )) {
      expect(repoModule.cloneRepo).toHaveBeenCalledWith(
        mockConfig.cacheDir,
        repoConfig
      );
    }

    // Check if checkoutAllRepos and symlinkAllRepos were called
    expect(repoModule.checkoutAllRepos).toHaveBeenCalled();
    expect(repoModule.symlinkAllRepos).toHaveBeenCalled();
  });
});
