export class SyncError extends Error {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = "SyncError";
  }
}

export class RomProcessingError extends Error {
  constructor(
    message: string,
    public file: string,
    public reason: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = "RomProcessingError";
  }
}
