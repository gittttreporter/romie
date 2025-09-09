export interface SystemMapping {
  folderName: string;
  supportedFormats: string[];
}

export interface ArtworkConfig {
  enabled: boolean;
  pathPattern: string;
  supportedFormats: string[];
  maxWidth: number;
  maxHeight: number;
}

export interface DeviceProfile {
  id: string;
  name: string;
  romBasePath: string;
  biosBasePath: string;
  artworkConfig?: ArtworkConfig;
  systemMappings: Record<string, SystemMapping>;
}
