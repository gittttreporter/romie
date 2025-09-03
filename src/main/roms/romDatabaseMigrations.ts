import log from "electron-log/main";
import { RomDatabase } from "@/types/rom";
import { lookupRomByHash, unloadHashDatabase } from "./romLookup";
import { determineSystemFromRAConsoleId } from "@/utils/systems";

export async function ensureDatabaseSchema(
  data: RomDatabase,
  toVersion: string,
) {
  switch (data.version) {
    case "1.0.0":
      migrateToVersion_2_0_0(data);
    case "2.0.0":
      await migrateToVersion_3_0_0(data);
  }

  data.lastUpdated = Date.now();
}

//== Internal migration functions ==//

function migrateToVersion_2_0_0(data: RomDatabase) {
  log.info(`Migrating rom database from ${data.version} to version 2.0.0`);
  data.version = "2.0.0";

  data.roms.forEach((rom) => {
    rom.source ??= "import";
  });
}

async function migrateToVersion_3_0_0(data: RomDatabase) {
  log.info(`Migrating rom database from ${data.version} to version 3.0.0`);
  data.version = "3.0.0";
  // New fields for app settings and RA integration.
  data.integrations ??= {};
  data.settings ??= {
    theme: "system",
  };

  for (const rom of data.roms) {
    // ROM hashes should be lowercase for consistency with RA data.
    rom.crc32 = rom.crc32.toLowerCase();
    rom.md5 = rom.md5.toLowerCase();
    rom.sha1 = rom.sha1.toLowerCase();
    // New field to mark RA verified ROMs. Default to false.
    rom.verified ??= false;

    // Attempt to verify existing ROMs against RA database. This happens during import now.
    const game = await lookupRomByHash(rom.md5);
    if (game) {
      rom.verified = true;
      rom.displayName = game.title;
      rom.system = determineSystemFromRAConsoleId(game.consoleId) || rom.system;
    }
  }
  unloadHashDatabase();
}
