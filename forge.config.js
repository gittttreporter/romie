import "dotenv/config";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

const S3_BUCKET = "romie.jzimz.com";
const S3_REGION = "us-east-1";
const S3_URL = `https://s3.${S3_REGION}.amazonaws.com/${S3_BUCKET}`;

export default {
  packagerConfig: {
    asar: true,
    name: "ROMie",
    executableName: "ROMie",
    // App icons (platform-specific)
    icon:
      process.platform === "darwin"
        ? "src/assets/icons/app/mac/icon.icns"
        : process.platform === "win32"
          ? "src/assets/icons/app/win/icon.ico"
          : "src/assets/icons/app/png/512x512.png",
    // Add these for better Windows experience
    win32metadata: {
      CompanyName: "JZimz Labs",
      FileDescription: "ROM Manager for Retro Handhelds",
      ProductName: "ROMie",
      InternalName: "romie",
    },
    // Allow for unsigned builds
    ...(process.env.SKIP_CODESIGN
      ? {}
      : {
          osxSign: {},
          osxNotarize: {
            appleId: process.env.APPLE_ID,
            appleIdPassword: process.env.APPLE_PASSWORD,
            teamId: process.env.APPLE_TEAM_ID,
          },
        }),
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "ROMie",
        authors: "JZimz Labs",
        description: "ROM Manager for Retro Handhelds",
      },
      config: (arch) => ({
        // Note that we must provide this S3 URL here
        // in order to generate delta updates
        remoteReleases: `${S3_URL}/releases/win32/${arch}`,
      }),
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
      config: (arch) => ({
        // Note that we must provide this S3 URL here
        // in order to support smooth version transitions
        // especially when using a CDN to front your updates
        macUpdateManifestBaseUrl: `${S3_URL}/releases/darwin/${arch}`,
      }),
    },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-s3",
      config: {
        bucket: S3_BUCKET,
        region: S3_REGION,
        keyResolver: (filename, platform, arch) => {
          return `releases/${platform}/${arch}/${filename}`;
        },
      },
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-vite",
      config: {
        // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
        // If you are familiar with Vite configuration, it will look really familiar.
        build: [
          {
            // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
            entry: "src/main.js",
            config: "vite.main.config.mjs",
            target: "main",
          },
          {
            entry: "src/preload.ts",
            config: "vite.preload.config.mjs",
            target: "preload",
          },
        ],
        renderer: [
          {
            name: "main_window",
            config: "vite.renderer.config.mjs",
          },
        ],
      },
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
