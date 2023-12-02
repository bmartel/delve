const get = require("./get");
const fs = require("fs/promises");
const path = require("path");

const { getPackageJson, getCacheDir } = get;

jest.mock("fs/promises");
jest.mock("path");

describe("getPackageJson", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns package.json content when file exists", async () => {
    const mockProjectRoot = "/mock/project/root";
    const mockPackageJson = { name: "mock-package", version: "1.0.0" };

    path.join.mockReturnValue(`${mockProjectRoot}/package.json`);
    fs.lstat.mockResolvedValue({ isFile: () => true });

    // Simulate the behavior of require for the specific path
    jest.spyOn(get, "getFile").mockReturnValueOnce(mockPackageJson);

    const result = await getPackageJson(mockProjectRoot);
    expect(result).toEqual(mockPackageJson);

    // Clean up the mock
    jest.restoreAllMocks();
  });

  it("throws error when package.json is not found", async () => {
    const mockProjectRoot = "/mock/project/root";

    path.join.mockReturnValue(`${mockProjectRoot}/package.json`);
    fs.lstat.mockRejectedValue(new Error("File not found"));

    await expect(getPackageJson(mockProjectRoot)).rejects.toThrow(
      `package.json not found in ${mockProjectRoot}`
    );
  });
});

describe("getCacheDir", () => {
  it("returns path when cache directory exists", async () => {
    const mockConfig = { projectRoot: "/mock/project/root", cacheDir: "cache" };
    const expectedPath = `${mockConfig.projectRoot}/${mockConfig.cacheDir}`;

    path.join.mockReturnValue(expectedPath);
    fs.lstat.mockResolvedValue({ isDirectory: () => true });

    await expect(getCacheDir(mockConfig)).resolves.toBe(expectedPath);
  });

  it("creates and returns path when cache directory does not exist", async () => {
    const mockConfig = { projectRoot: "/mock/project/root", cacheDir: "cache" };
    const expectedPath = `${mockConfig.projectRoot}/${mockConfig.cacheDir}`;

    path.join.mockReturnValue(expectedPath);
    fs.lstat.mockRejectedValue(new Error("Directory not found"));
    fs.mkdir.mockResolvedValue();

    await expect(getCacheDir(mockConfig)).resolves.toBe(expectedPath);
    expect(fs.mkdir).toHaveBeenCalledWith(expectedPath, { recursive: true });
  });
});
