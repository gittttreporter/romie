import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest'
import { startSync } from './sync'
import type { SyncOptions, SyncStatus } from '@/types/electron-api'
import type { Device } from '@/types/device'
import type { Rom } from '@/types/rom'
import type { DeviceProfile } from '@/packages/device-profiles'

// Mock all external dependencies
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
  },
  BrowserWindow: {
    getAllWindows: vi.fn(() => [
      {
        webContents: {
          send: vi.fn(),
        },
      },
    ]),
  },
  app: {
    getPath: vi.fn(() => '/mock/userData'),
  },
}))

vi.mock('electron-log/main', () => ({
  default: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('fs/promises', () => ({
  access: vi.fn(),
  rm: vi.fn(),
  mkdir: vi.fn(),
  copyFile: vi.fn(),
  readFile: vi.fn(),
  unlink: vi.fn(),
}))

vi.mock('../roms/romDatabase', () => ({
  listDevices: vi.fn(),
  listRoms: vi.fn(),
}))

vi.mock('../../utils/device-profiles', () => ({
  getDeviceProfile: vi.fn(),
}))

vi.mock('../roms/romUtils', () => ({
  calculateCRC32: vi.fn(),
}))

vi.mock('@/errors', () => ({
  SyncError: class extends Error {
    constructor(message: string, cause?: Error) {
      super(message)
      this.name = 'SyncError'
      this.cause = cause
    }
  },
}))

// Import the mocked modules to access them in tests
import fs from 'fs/promises'
import { BrowserWindow } from 'electron'
import { listDevices, listRoms } from '../roms/romDatabase'
import { getDeviceProfile } from '@/packages/device-profiles'
import { calculateCRC32 } from '../roms/romUtils'

// Test data
const mockDevice: Device = {
  id: 'device1',
  name: 'Test Device',
  deviceInfo: {
    mount: '/mock/mount',
  },
  profileId: 'profile1',
}

const mockProfile: DeviceProfile = {
  id: 'profile1',
  name: 'Test Profile',
  romBasePath: 'roms',
  systemMappings: {
    nes: {
      folderName: 'FC',
      supportedFormats: ['.nes'],
    },
    snes: {
      folderName: 'SFC',
      supportedFormats: ['.sfc', '.smc'],
    },
  },
}

const mockRoms: Rom[] = [
  {
    id: 'rom1',
    filename: 'game1.nes',
    displayName: 'Game 1',
    system: 'nes',
    tags: ['favorites'],
    crc32: 'abc123',
  },
  {
    id: 'rom2',
    filename: 'game2.sfc',
    displayName: 'Game 2',
    system: 'snes',
    tags: ['favorites'],
    crc32: 'def456',
  },
  {
    id: 'rom3',
    filename: 'game3.nes',
    displayName: 'Game 3',
    system: 'nes',
    tags: ['favorites'],
    crc32: 'ghi789',
  },
]

const mockSyncOptions: SyncOptions = {
  cleanDestination: false,
  verifyFiles: false,
}

describe('sync integration tests', () => {
  let notificationsSent: SyncStatus[] = []

  beforeEach(() => {
    notificationsSent = []
    
    // Reset all mocks
    vi.clearAllMocks()
    
    // Set up default mock implementations
    vi.mocked(listDevices).mockResolvedValue([mockDevice])
    vi.mocked(listRoms).mockResolvedValue(mockRoms)
    vi.mocked(getDeviceProfile).mockReturnValue(mockProfile)
    vi.mocked(fs.access).mockResolvedValue(undefined)
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.copyFile).mockResolvedValue(undefined)
    
    // Capture all sync notifications
    const mockWebContents = BrowserWindow.getAllWindows()[0]?.webContents
    vi.mocked(mockWebContents?.send).mockImplementation((channel, status) => {
      if (channel === 'sync:progress') {
        notificationsSent.push({ ...status })
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('successful sync sends expected notifications', async () => {
    // Make fs.access fail for destination paths (files don't exist)
    vi.mocked(fs.access).mockImplementation((path) => {
      if (typeof path === 'string' && path.includes('/mock/mount/roms/')) {
        return Promise.reject(new Error('File not found'))
      }
      return Promise.resolve(undefined)
    })

    await startSync(['favorites'], 'device1', mockSyncOptions)

    // Check the sequence of notifications
    expect(notificationsSent.length).toBeGreaterThan(0)
    
    // Should start with preparing phase
    expect(notificationsSent[0].phase).toBe('preparing')
    
    // Should have a copying phase
    const copyingNotifications = notificationsSent.filter(n => n.phase === 'copying')
    expect(copyingNotifications.length).toBeGreaterThan(0)
    
    // Should end with done phase
    const finalNotification = notificationsSent[notificationsSent.length - 1]
    expect(finalNotification.phase).toBe('done')
    
    // Should track progress correctly
    expect(finalNotification.totalFiles).toBe(3) // 3 ROMs matched
    expect(finalNotification.filesProcessed).toBe(3) // All processed
    expect(finalNotification.progressPercent).toBe(100)
    
    // Should have no failures or skips (since files don't exist)
    expect(finalNotification.filesFailed).toHaveLength(0)
    expect(finalNotification.filesSkipped).toHaveLength(0)
  })

  test('sync with file conflicts sends skip notifications', async () => {
    // Make fs.access succeed for destination paths (files already exist)
    vi.mocked(fs.access).mockResolvedValue(undefined)

    await startSync(['favorites'], 'device1', mockSyncOptions)

    const finalNotification = notificationsSent[notificationsSent.length - 1]
    
    // All files should be skipped because they already exist
    expect(finalNotification.filesSkipped).toHaveLength(3)
    expect(finalNotification.filesFailed).toHaveLength(0)
    expect(finalNotification.progressPercent).toBe(100)
    
    // Check skip reasons
    finalNotification.filesSkipped.forEach(skip => {
      expect(skip.reason).toBe('file_exists')
      expect(skip.details).toContain('File already exists at')
    })
  })

  test('sync with copy failures sends failure notifications', async () => {
    // Files don't exist, but copy fails
    vi.mocked(fs.access).mockImplementation((path) => {
      if (typeof path === 'string' && path.includes('/mock/mount/roms/')) {
        return Promise.reject(new Error('File not found'))
      }
      return Promise.resolve(undefined)
    })
    
    // Make copyFile fail for all files
    vi.mocked(fs.copyFile).mockRejectedValue(new Error('Disk full'))

    await expect(startSync(['favorites'], 'device1', mockSyncOptions)).rejects.toThrow()

    const finalNotification = notificationsSent[notificationsSent.length - 1]
    
    // Should have failures
    expect(finalNotification.filesFailed).toHaveLength(3)
    expect(finalNotification.filesSkipped).toHaveLength(0)
    
    // Check failure details
    finalNotification.filesFailed.forEach(failure => {
      expect(failure.error.message).toContain('Failed to copy')
      expect(failure.error.message).toContain('Disk full')
    })
  })

  test('sync with checksum verification failures', async () => {
    const verifyOptions: SyncOptions = {
      cleanDestination: false,
      verifyFiles: true,
    }

    // Files don't exist initially
    vi.mocked(fs.access).mockImplementation((path) => {
      if (typeof path === 'string' && path.includes('/mock/mount/roms/')) {
        return Promise.reject(new Error('File not found'))
      }
      return Promise.resolve(undefined)
    })
    
    // Copy succeeds
    vi.mocked(fs.copyFile).mockResolvedValue(undefined)
    
    // Read file for verification
    vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('fake file content'))
    
    // Return wrong CRC32 to simulate corruption
    vi.mocked(calculateCRC32).mockReturnValue('wrongcrc')
    
    // Mock unlink for cleanup
    vi.mocked(fs.unlink).mockResolvedValue(undefined)

    await expect(startSync(['favorites'], 'device1', verifyOptions)).rejects.toThrow()

    const finalNotification = notificationsSent[notificationsSent.length - 1]
    
    // All files should fail checksum verification
    expect(finalNotification.filesFailed).toHaveLength(3)
    expect(finalNotification.filesSkipped).toHaveLength(0)
    
    // Check failure reasons
    finalNotification.filesFailed.forEach(failure => {
      expect(failure.error.message).toBe('Copy verification failed: checksum mismatch')
    })
    
    // Verify files were deleted after checksum failure
    expect(fs.unlink).toHaveBeenCalledTimes(3)
  })

  test('mixed success and failure scenarios', async () => {
    // First file exists (skip), second file copies OK, third file copy fails
    vi.mocked(fs.access).mockImplementation((path) => {
      if (typeof path === 'string' && path.includes('game1.nes')) {
        return Promise.resolve(undefined) // File exists
      }
      if (typeof path === 'string' && path.includes('/mock/mount/roms/')) {
        return Promise.reject(new Error('File not found')) // Other files don't exist
      }
      return Promise.resolve(undefined)
    })
    
    vi.mocked(fs.copyFile).mockImplementation((src, dest) => {
      if (typeof dest === 'string' && dest.includes('game3.nes')) {
        return Promise.reject(new Error('Permission denied'))
      }
      return Promise.resolve(undefined)
    })

    await expect(startSync(['favorites'], 'device1', mockSyncOptions)).rejects.toThrow()

    const finalNotification = notificationsSent[notificationsSent.length - 1]
    
    expect(finalNotification.totalFiles).toBe(3)
    expect(finalNotification.filesProcessed).toBe(3)
    expect(finalNotification.filesSkipped).toHaveLength(1) // game1 exists
    expect(finalNotification.filesFailed).toHaveLength(1) // game3 copy failed
    
    // Check specific results
    expect(finalNotification.filesSkipped[0].rom.filename).toBe('game1.nes')
    expect(finalNotification.filesSkipped[0].reason).toBe('file_exists')
    
    expect(finalNotification.filesFailed[0].rom.filename).toBe('game3.nes')
    expect(finalNotification.filesFailed[0].error.message).toContain('Permission denied')
  })
})