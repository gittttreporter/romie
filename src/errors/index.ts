export class SyncError extends Error {
  constructor(
    message: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'SyncError';
  }
}

export class RomProcessingError extends Error {
  constructor(
    message: string,
    public file: string,
    public reason: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'RomProcessingError';
  }
}

export class AppError extends Error {
  constructor(
    message: string,
    public userMessage: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'AppError';
  }

  /**
   * Creates a UserFacingError with the same message for both technical and user display
   */
  static simple(message: string, cause?: Error): AppError {
    return new AppError(message, message, cause);
  }

  /**
   * Creates a UserFacingError with detailed technical message and simplified user message
   */
  static detailed(technicalMessage: string, userMessage: string, cause?: Error): AppError {
    return new AppError(technicalMessage, userMessage, cause);
  }
}
