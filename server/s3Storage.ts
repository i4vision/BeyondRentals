import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Response } from "express";
import { randomUUID } from "crypto";
import { FileDescriptor, IStorageService, ObjectNotFoundError } from "./storageInterface";

// S3 File descriptor implementing the unified interface
class S3FileDescriptor implements FileDescriptor {
  constructor(
    private s3Client: S3Client,
    private bucketName: string,
    private key: string
  ) {}

  async download(res: Response, cacheTtlSec: number = 3600): Promise<void> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: this.key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('No file body returned');
      }

      // Set appropriate headers
      res.set({
        "Content-Type": response.ContentType || "application/octet-stream",
        "Content-Length": response.ContentLength?.toString() || "",
        "Cache-Control": `private, max-age=${cacheTtlSec}`,
      });

      // Stream the file to the response
      const stream = response.Body as any;
      
      stream.on("error", (err: any) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });

      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }
}

export class S3StorageService implements IStorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private internalEndpoint: string;
  private publicEndpoint: string;
  private useSSL: boolean;

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost:9000';
    // Public endpoint is what the browser can access (e.g., localhost:5001)
    // If not set, use the same as internal endpoint
    const publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT || endpoint;
    const accessKeyId = process.env.MINIO_ACCESS_KEY || 'minioadmin';
    const secretAccessKey = process.env.MINIO_SECRET_KEY || 'minioadmin';
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    
    this.bucketName = process.env.MINIO_BUCKET || 'checkin-uploads';
    this.internalEndpoint = endpoint;
    this.publicEndpoint = publicEndpoint;
    this.useSSL = useSSL;

    this.s3Client = new S3Client({
      endpoint: `http${useSSL ? 's' : ''}://${endpoint}`,
      region: 'us-east-1', // MinIO doesn't use regions but SDK requires it
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const objectId = randomUUID();
    const key = `uploads/${objectId}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    // Generate presigned URL for PUT operation (15 minutes expiry)
    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 900,
    });

    // Replace internal endpoint with public endpoint for browser access
    if (this.internalEndpoint !== this.publicEndpoint) {
      const internalUrl = `http${this.useSSL ? 's' : ''}://${this.internalEndpoint}`;
      const publicUrl = `http${this.useSSL ? 's' : ''}://${this.publicEndpoint}`;
      return signedUrl.replace(internalUrl, publicUrl);
    }

    return signedUrl;
  }

  async getObjectEntityFile(objectPath: string): Promise<FileDescriptor> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }

    const entityId = parts.slice(1).join("/");
    const key = `uploads/${entityId}`;

    // Check if object exists
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
      
      // Return a descriptor that implements the FileDescriptor interface
      return new S3FileDescriptor(this.s3Client, this.bucketName, key);
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        throw new ObjectNotFoundError();
      }
      throw error;
    }
  }

  normalizeObjectEntityPath(rawPath: string): string {
    // Extract entity ID from MinIO presigned URL
    if (rawPath.includes(this.bucketName)) {
      const url = new URL(rawPath);
      const pathParts = url.pathname.split('/');
      const uploadsIndex = pathParts.indexOf('uploads');
      
      if (uploadsIndex !== -1 && pathParts.length > uploadsIndex + 1) {
        const entityId = pathParts.slice(uploadsIndex + 1).join('/');
        return `/objects/${entityId}`;
      }
    }
    
    return rawPath;
  }

  async canAccessObjectEntity(): Promise<boolean> {
    // For now, all authenticated requests can access
    // This can be extended with proper ACL logic later
    return true;
  }
}
