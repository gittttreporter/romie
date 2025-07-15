import crypto from 'crypto';
import fs from 'fs/promises';
import CRC32 from 'crc-32';
import { app } from 'electron'
import path from 'path'
import type { PathLike } from 'fs';
import type { RomRegion } from './rom.types';

// Common region codes found in ROM filenames
export const REGION_CODES: Record<string, RomRegion> = {
  // English/North America
  'USA': 'USA',
  'US': 'USA',
  'U': 'USA',
  'NTSC-U': 'USA',
  'North America': 'USA',
  'NA': 'USA',

  // Europe
  'EUR': 'Europe',
  'Europe': 'Europe',
  'E': 'Europe',
  'PAL': 'Europe',
  'UK': 'Europe',
  'Germany': 'Europe',
  'France': 'Europe',
  'Spain': 'Europe',
  'Italy': 'Europe',

  // Japan
  'JPN': 'Japan',
  'Japan': 'Japan',
  'J': 'Japan',
  'NTSC-J': 'Japan',
  'JP': 'Japan',

  // World/International
  'World': 'World',
  'W': 'World',
  'International': 'World',
  'UE': 'World', // USA + Europe
  'JU': 'World', // Japan + USA
  'JUE': 'World', // Japan + USA + Europe

  // Other regions
  'Asia': 'Asia',
  'Korea': 'Korea',
  'KR': 'Korea',
  'China': 'China',
  'CH': 'China',
  'Australia': 'Australia',
  'AU': 'Australia',
  'Brazil': 'Brazil',
  'BR': 'Brazil',
  'Canada': 'Canada',
  'CA': 'Canada',
};

/**
 * Extracts region information from a ROM filename
 * Looks for region codes in parentheses like (USA), (Europe), (Japan), etc.
 *
 * @param filename - The ROM filename to extract region from
 * @returns The standardized region code or "Unknown" if no region found
 */
export function extractRegionFromFilename(filename: string): RomRegion | 'Unknown' {
  // Remove file extension for cleaner matching
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

  // Look for region codes in parentheses: (USA), (Europe), (J), etc.
  const parenthesesMatches = nameWithoutExt.match(/\(([^)]+)\)/g);

  if (parenthesesMatches) {
    // Process each match in parentheses
    for (const match of parenthesesMatches) {
      const content = match.slice(1, -1); // Remove parentheses
      const region = findRegionInText(content);
      if (region !== 'Unknown') {
        return region;
      }
    }
  }

  // Look for region codes in square brackets: [USA], [Europe], [J], etc.
  const bracketMatches = nameWithoutExt.match(/\[([^\]]+)\]/g);

  if (bracketMatches) {
    // Process each match in brackets
    for (const match of bracketMatches) {
      const content = match.slice(1, -1); // Remove brackets
      const region = findRegionInText(content);
      if (region !== 'Unknown') {
        return region;
      }
    }
  }

  // Fallback: look for region codes anywhere in the filename
  const fallbackRegion = findRegionInText(nameWithoutExt);
  if (fallbackRegion !== 'Unknown') {
    return fallbackRegion;
  }

  return 'Unknown';
}

export function cleanDisplayName(filename: string): string {
  // Remove file extension
  let name = filename.replace(/\.[^/.]+$/, '');

  // Remove everything in parentheses and brackets
  name = name.replace(/\([^)]*\)/g, '');
  name = name.replace(/\[[^\]]*\]/g, '');

  // Replace underscores and hyphens with spaces
  name = name.replace(/[_-]/g, ' ');

  // Clean up extra spaces and trim
  name = name.replace(/\s+/g, ' ').trim();

  // Convert to title case
  name = name.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );

  return name;
}

/**
 * Generates the three hash types required for libretro database lookups
 * @param {string} filePath - Path to the ROM file
 * @returns {Promise<Object>} Object containing CRC32, MD5, and SHA1 hashes
 */
export async function generateLibretroHashes(filePath: string): Promise<{
  crc32: string
  md5: string
  sha1: string
}> {
  const fileBuffer = await fs.readFile(filePath);

  return {
    crc32: calculateCRC32(fileBuffer),
    md5: crypto.createHash('md5').update(fileBuffer).digest('hex').toUpperCase(),
    sha1: crypto.createHash('sha1').update(fileBuffer).digest('hex').toUpperCase()
  };
}

export async function copyRomToLibrary(sourcePath: PathLike, destFileName: string): Promise<PathLike> {
  const appDataDir = app.getPath('userData')
  console.log('> ', appDataDir)
  const romsDir = path.join(appDataDir, 'roms')
  const destPath = path.join(romsDir, destFileName)
  console.log('> ', destPath)

  await fs.mkdir(romsDir, { recursive: true })
  await fs.copyFile(sourcePath, destPath)

  return 'destPath'
}

/**
 * CRC32 calculation using crc-32 library (libretro uses uppercase hex format)
 * @param {Buffer} buffer - File buffer
 * @returns {string} CRC32 hash in uppercase hex
 */
function calculateCRC32(buffer: Buffer<ArrayBufferLike>): string {
  const crc = CRC32.buf(buffer);
  return (crc >>> 0).toString(16).toUpperCase().padStart(8, '0');
}


/**
 * Helper function to find region codes within a text string
 * Handles complex region strings like "USA, Europe" or "Rev 1"
 */
function findRegionInText(text: string): RomRegion | 'Unknown' {
  // Clean up the text
  const cleanText = text.trim();

  // Direct exact match first
  if (cleanText in REGION_CODES) {
    return REGION_CODES[cleanText as keyof typeof REGION_CODES];
  }

  // Case-insensitive exact match
  const upperText = cleanText.toUpperCase();
  for (const [key, value] of Object.entries(REGION_CODES)) {
    if (key.toUpperCase() === upperText) {
      return value;
    }
  }

  // Handle comma-separated regions with priority
  if (cleanText.includes(',')) {
    const regions = cleanText.split(',').map(r => r.trim());
    // Prioritize: USA > Europe > Japan > Others
    const priority = ['USA', 'US', 'U', 'Europe', 'EUR', 'E', 'Japan', 'JPN', 'J'];

    for (const priorityRegion of priority) {
      for (const region of regions) {
        if (region.toUpperCase() === priorityRegion.toUpperCase()) {
          return findRegionInText(region);
        }
      }
    }

    // If no priority match, take the first valid region
    for (const region of regions) {
      const result = findRegionInText(region);
      if (result !== 'Unknown') {
        return result;
      }
    }
  }

  // Handle multi-region codes like "UE" (USA+Europe)
  if (cleanText.length <= 3) {
    for (const [key, value] of Object.entries(REGION_CODES)) {
      if (key === cleanText) {
        return value;
      }
    }
  }

  // Partial matching for longer region names
  for (const [key, value] of Object.entries(REGION_CODES)) {
    if (cleanText.toUpperCase().includes(key.toUpperCase()) && key.length > 1) {
      return value;
    }
  }

  return 'Unknown';
}

// Helper function to check if a region is valid
export function isValidRegion(region: string): region is RomRegion | 'Unknown' {
  return Object.values(REGION_CODES).includes(region as RomRegion) || region === 'Unknown';
}
