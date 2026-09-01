export class InvalidMimeTypeError extends Error {
  constructor(mimeType: string) {
    super(`Invalid MIME type: ${mimeType}. Allowed: jpeg, png, webp, avif`);
    this.name = 'InvalidMimeTypeError';
  }
}

export class FileTooLargeError extends Error {
  constructor(size: number, maxSize: number) {
    super(`File too large: ${size} bytes (max ${maxSize} bytes)`);
    this.name = 'FileTooLargeError';
  }
}
