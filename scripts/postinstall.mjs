import { fileURLToPath } from "url";
import path, { dirname } from "path";
import fs from "fs";
import { platform, arch } from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fixed permissions for 7zip binaries on non-Windows platforms
if (platform() !== "win32") {
  const binaryFolder =
    platform() === "darwin"
      ? arch() === "arm64"
        ? "mac/arm64"
        : "mac/x64"
      : arch() === "x64"
        ? "linux/x64"
        : "linux/ia32";

  const binaryPath = path.join(
    __dirname,
    "../node_modules/7zip-bin",
    binaryFolder,
    "7za",
  );

  if (fs.existsSync(binaryPath)) {
    fs.chmodSync(binaryPath, 0o755);
    console.log(`Fixed permissions for ${binaryPath}`);
  }
}
