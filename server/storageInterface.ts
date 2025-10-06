import { Response } from "express";

// Unified file descriptor interface
export interface FileDescriptor {
  download(res: Response, cacheTtlSec?: number): Promise<void>;
}

// Base storage service interface
export interface IStorageService {
  getObjectEntityUploadURL(requestHost?: string): Promise<string>;
  getObjectEntityFile(objectPath: string): Promise<FileDescriptor>;
  normalizeObjectEntityPath(rawPath: string): string;
  canAccessObjectEntity(): Promise<boolean>;
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}
