export function isAbsolutePath(p) {
  // Unix-style path.
  if (p.startsWith("/")) {
    return true;
  }

  // Windows-style X:\... path.
  if (p.length >= 3 && p.substring(1, 3) === ":\\") {
    const letter = p.substring(0, 1).toUpperCase();

    return letter >= "A" && letter <= "Z";
  }

  // Windows UNC path.
  if (p.startsWith("\\\\")) {
    return true;
  }

  return false;
}

// Refer to kopia/snapshot/source.go:ParseSourceInfo
// Returns { source } with userName, host and path, or { error }.
export function parsePolicyTarget(target, localUserName, localHost) {
  if (target === "(global)") {
    return { error: "Cannot create the global policy, it already exists." };
  }

  // Check for a path before anything else and short-circuit
  // On Windows this avoids issues with the colon in C:/path
  if (isAbsolutePath(target)) {
    return { source: { userName: localUserName, host: localHost, path: target } };
  }

  const p1 = target.indexOf("@");
  const p2 = target.indexOf(":");

  // user@host:path
  if (p1 > 0 && p2 > p1 + 1 && p2 + 1 < target.length) {
    const path = target.substring(p2 + 1);
    if (!isAbsolutePath(path)) {
      return { error: "Policies can not be defined for relative paths." };
    }

    return { source: { userName: target.substring(0, p1), host: target.substring(p1 + 1, p2), path } };
  }

  // @host and user@host without path
  if (p1 >= 0 && p2 < 0) {
    if (p1 + 1 < target.length) {
      return { source: { userName: target.substring(0, p1), host: target.substring(p1 + 1), path: "" } };
    }

    return { error: "Policies must have a hostname." };
  }

  // We already know it isn't an absolute path,
  // nor is it a fully specified policy target,
  // so it's either completely invalid, or a relative path
  return { error: "Policies can not be defined for relative paths." };
}

export function checkPolicyPath(path) {
  return parsePolicyTarget(path, "", "").error || null;
}

export function PolicyTypeName(s) {
  if (!s.host && !s.userName) {
    return "Global Policy";
  }

  if (!s.userName) {
    return "Host: " + s.host;
  }

  if (!s.path) {
    return "User: " + s.userName + "@" + s.host;
  }

  return "Directory: " + s.userName + "@" + s.host + ":" + s.path;
}

export function sourceQueryStringParams(src) {
  return (
    "userName=" +
    encodeURIComponent(src.userName) +
    "&host=" +
    encodeURIComponent(src.host) +
    "&path=" +
    encodeURIComponent(src.path)
  );
}

export function policyEditorURL(s) {
  return "/policies/edit?" + sourceQueryStringParams(s);
}
