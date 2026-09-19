const fs = require("fs");
const path = require("path");
const os = require("os");

const RESTRICTED_PATTERNS = [
  /(^|[\\/])\.ssh([\\/]|$)/i,
  /(^|[\\/])\.aws([\\/]|$)/i,
  /(^|[\\/])\.docker([\\/]|$)/i,
  /(^|[\\/])\.kube([\\/]|$)/i,
  /(^|[\\/])\.gnupg([\\/]|$)/i,
  /docker\.sock$/i,
  /docker_engine$/i,
];

function isRootDirectory(resolvedPath) {
  const parsed = path.parse(resolvedPath);
  return parsed.root.toLowerCase() === resolvedPath.toLowerCase();
}

function isUserHomeDirectory(resolvedPath) {
  const home = path.resolve(os.homedir()).toLowerCase();
  return resolvedPath.toLowerCase() === home;
}

function isSystemDirectory(resolvedPath) {
  const lower = resolvedPath.toLowerCase();
  const homedir = path.resolve(os.homedir()).toLowerCase();
  const usersDir = path.resolve(path.dirname(homedir)).toLowerCase();
  const appData = path.join(homedir, "appdata");
  const local = path.join(appData, "local");
  const roaming = path.join(appData, "roaming");
  const localLow = path.join(appData, "locallow");
  const tempDir = path.resolve(os.tmpdir()).toLowerCase();

  const forbiddenExact = [
    usersDir,
    appData,
    local,
    roaming,
    localLow,
    tempDir,
  ];

  if (forbiddenExact.some((p) => lower === p)) {
    return true;
  }

  const systemPaths = [
    "c:\\windows",
    "c:\\program files",
    "c:\\program files (x86)",
    "c:\\programdata",
    "/etc",
    "/var",
    "/usr",
    "/bin",
    "/sbin",
    "/sys",
    "/proc",
    "/dev",
    "/boot",
  ];
  return systemPaths.some((sys) => lower === sys || lower.startsWith(`${sys}\\`) || lower.startsWith(`${sys}/`));
}

function validateWorkspacePath(requestedPath) {
  if (!requestedPath || typeof requestedPath !== "string" || requestedPath.trim().length === 0) {
    throw new Error("Workspace path must be a non-empty string.");
  }

  const resolved = path.resolve(requestedPath.trim());

  if (isRootDirectory(resolved)) {
    throw new Error(`Mounting root filesystem is denied: ${resolved}`);
  }

  if (isUserHomeDirectory(resolved)) {
    throw new Error(`Mounting user home directory is denied: ${resolved}`);
  }

  if (isSystemDirectory(resolved)) {
    throw new Error(`Mounting system directory is denied: ${resolved}`);
  }

  for (const pattern of RESTRICTED_PATTERNS) {
    if (pattern.test(resolved)) {
      throw new Error(`Mounting sensitive directory is denied: ${resolved}`);
    }
  }

  if (!fs.existsSync(resolved)) {
    throw new Error(`Workspace path does not exist: ${resolved}`);
  }

  let stats;
  try {
    stats = fs.statSync(resolved);
  } catch (err) {
    throw new Error(`Cannot access workspace path: ${err.message}`);
  }

  if (!stats.isDirectory()) {
    throw new Error(`Workspace path is not a directory: ${resolved}`);
  }

  return resolved;
}

module.exports = {
  validateWorkspacePath,
  isRootDirectory,
  isUserHomeDirectory,
  isSystemDirectory,
};
