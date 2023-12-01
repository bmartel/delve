module.exports.parseRepoDetails = (packageName, repoUrl) => {
  // Validate the inputs
  if (!packageName) {
    throw new Error("Package name is required");
  }
  if (!repoUrl) {
    throw new Error("Repository URL is required");
  }

  // Extract the base URL and the query string
  const [baseUrl, queryParams] = repoUrl.split("?");
  if (!baseUrl) {
    throw new Error("Invalid repository URL");
  }

  // Extract repository information from the base URL
  const repoMatch = baseUrl.match(/https:\/\/github\.com\/(.+\/.+)\.git/);
  if (!repoMatch) {
    throw new Error("Repository URL does not match the expected GitHub format");
  }
  const repository = repoMatch[1];

  // Parse query parameters
  const params = new URLSearchParams(queryParams);
  const path = params.get("path");
  const branch = params.get("branch");
  const commit = params.get("commit");
  const pkg = params.get("pkg");

  // Validate that the package name matches
  if (pkg !== packageName) {
    throw new Error(
      "Package name in the URL does not match the provided package name"
    );
  }

  // Validate the path, branch/commit presence
  if (!path) {
    throw new Error("Path parameter is required in the URL");
  }
  if (!branch && !commit) {
    throw new Error("Either branch or commit parameter is required in the URL");
  }

  return {
    package: packageName,
    repository: `github.com/${repository}`,
    path,
    branch: commit ? undefined : branch, // branch is ignored if commit is present
    commit,
  };
};
