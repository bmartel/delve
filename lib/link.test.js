const { linkDirectory } = require("./link");
const fs = require("fs/promises");
const path = require("path");

jest.mock("fs/promises");
jest.mock("path");

describe("linkDirectory", () => {
  const mockSource = "/path/to/source";
  const mockTarget = "/path/to/target";
  const mockParentDir = "/path/to";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  it("creates symlink when target is not a symlink", async () => {
    // Setup
    fs.lstat.mockResolvedValueOnce({ isSymbolicLink: () => false });
    path.resolve.mockReturnValueOnce(mockParentDir);
    fs.mkdir.mockResolvedValueOnce();
    fs.symlink.mockResolvedValueOnce();

    // Act
    await linkDirectory(mockSource, mockTarget);

    // Assert
    expect(fs.mkdir).toHaveBeenCalledWith(mockParentDir, { recursive: true });
    expect(fs.symlink).toHaveBeenCalledWith(mockSource, mockTarget);
  });

  it("does not create symlink when target is already a symlink", async () => {
    // Setup
    fs.lstat.mockResolvedValueOnce({ isSymbolicLink: () => true });

    // Act
    await linkDirectory(mockSource, mockTarget);

    // Assert
    expect(fs.symlink).not.toHaveBeenCalled();
  });

  it("creates parent directory if not exists", async () => {
    // Setup
    fs.lstat.mockResolvedValueOnce({ isSymbolicLink: () => false });
    path.resolve.mockReturnValueOnce(mockParentDir);
    fs.mkdir.mockResolvedValueOnce();
    fs.symlink.mockResolvedValueOnce();

    // Act
    await linkDirectory(mockSource, mockTarget);

    // Assert
    expect(fs.mkdir).toHaveBeenCalledWith(mockParentDir, { recursive: true });
  });
});
