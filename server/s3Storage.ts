import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Response } from "express";
import { randomUUID } from "crypto";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class S3StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost:9000';
    const accessKeyId = process.env.MINIO_ACCESS_KEY || 'minioadmin';
    const secretAccessKey = process.env.MINIO_SECRET_KEY || 'minioadmin';
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    
    this.bucketName = process.env.MINIO_BUCKET || 'checkin-uploads';

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

    return signedUrl;
  }

  async getObjectEntityFile(objectPath: string): Promise<{ key: string }> {
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
      return { key };
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        throw new ObjectNotFoundError();
      }
      throw error;
    }
  }

  async downloadObject(fileInfo: { key: string }, res: Response, cacheTtlSec: number = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileInfo.key,
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
