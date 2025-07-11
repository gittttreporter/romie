import path from 'path';
import fs from 'fs/promises';
import { RomMetadata, ConsoleCode, RegionCode } from './rom.types';

export async function processRomFile(filePath: string): Promise<RomMetadata> {
  try {
    // Get original filename + extension
    const originalFilename = path.basename(filePath);
    const fileExtension = path.extname(originalFilename);

    // Determine console from file extension
    const console = determineConsoleFromExtension(fileExtension);

    // Extract region tag from filename e.g. (USA), (JPN) fallback: "Unknown"
    const region = extractRegionFromFilename(originalFilename);

    // Create displayName by stripping: region tag, dump tags ([!], [v1.1]), punctuation
    const displayName = cleanDisplayName(originalFilename);

    // Generate stable ID
    const id = generateStableId(console, displayName, region);

    // Get file size
    const stats = await fs.stat(filePath);
    const size = stats.size;

    // Create filename for saving (with region)
    const savedFilename = createSavedFilename(displayName, region, fileExtension);

    // Copy file to target location
    const targetPath = await copyRomToLibrary(filePath, console, savedFilename);

    // Get relative path for metadata
    const relativePath = getRelativePathForMetadata(targetPath);

    // Create metadata object
    const metadata: RomMetadata = {
      id,
      console,
      displayName,
      region,
      filename: savedFilename,
      originalFilename,
      path: relativePath,
      size,
      importedAt: new Date().toISOString(),
      tags: [],
      notes: ''
    };

    return metadata;

  } catch (error) {
    // Create a meaningful error that can be caught by importRoms()
    const romError = new Error(`Failed to process ROM: ${path.basename(filePath)}`);
    (romError as any).file = filePath;
    (romError as any).reason = error instanceof Error ? error.message : 'Unknown error';
    throw romError;
  }
}

// Stub functions to be implemented

function determineConsoleFromExtension(fileExtension: string): ConsoleCode {
  // TODO: Map file extensions to console codes
  // e.g. .gba -> 'gba', .snes/.sfc -> 'snes', etc.
  throw new Error('Not implemented');
}

function extractRegionFromFilename(filename: string): RegionCode {
  // TODO: Use regex to find region tags like (USA), (JPN), (EUR), etc.
  // Return 'OTHER' as fallback
  throw new Error('Not implemented');
}

function cleanDisplayName(filename: string): string {
  // TODO: Remove region tags, dump tags ([!], [v1.1]), file extension
  // Clean up punctuation and formatting for display
  throw new Error('Not implemented');
}

function generateStableId(console: ConsoleCode, displayName: string, region: RegionCode): string {
  // TODO: Create stable ID like "gba-metroid-fusion-usa"
  // Slugify displayName and combine with console and region
  throw new Error('Not implemented');
}

function createSavedFilename(displayName: string, region: RegionCode, extension: string): string {
  // TODO: Create filename like "Metroid Fusion (USA).gba"
  // Combine displayName with region tag and extension
  throw new Error('Not implemented');
}

async function copyRomToLibrary(sourcePath: string, console: ConsoleCode, filename: string): Promise<string> {
  // TODO: Copy file to appropriate directory structure
  // e.g. roms/GBA/Metroid Fusion (USA).gba
  // Handle directory creation and file conflicts
  throw new Error('Not implemented');
}

function getRelativePathForMetadata(absolutePath: string): string {
  // TODO: Convert absolute path to relative path for metadata storage
  // e.g. /app/roms/GBA/game.gba -> roms/GBA/game.gba
  throw new Error('Not implemented');
}
