import { dialog } from 'electron'

// Get original filename + extension
// Extract region tag from filename e.g. (USA), (JPN) fallback: "Unknown"
// Create displayName by stripping: region tag, dump tags ([!], [v1.1]), punctuation
// Save the file with region in the filename e.g. "Metroid Fusion (USA).gba"
// Build metadata with all fields
export async function importRom () {

  return dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
}
