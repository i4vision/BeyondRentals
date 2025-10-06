import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertCheckInSchema } from "@shared/schema";
import { z } from "zod";
import { IStorageService, ObjectNotFoundError } from "./storageInterface";
import { ObjectStorageService } from "./objectStorage";
import { S3StorageService } from "./s3Storage";

// Factory function to get the appropriate storage service
function getStorageService(): IStorageService {
  const storageType = process.env.STORAGE_TYPE || 'gcs';
  
  if (storageType === 'minio' || storageType === 's3') {
    return new S3StorageService();
  }
  
  return new ObjectStorageService();
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
  });
  
  // Get upload URL for identity documents
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = getStorageService();
      // Pass the request host so MinIO URLs use the correct hostname/IP
      const requestHost = req.get('host');
      const uploadURL = await objectStorageService.getObjectEntityUploadURL(requestHost);
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Serve private objects (identity documents)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = getStorageService();
    try {
      const fileDescriptor = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      await fileDescriptor.download(res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Create check-in
  app.post("/api/check-ins", upload.single('identityDocument'), async (req, res) => {
    try {
      // Parse the JSON data from the form
      const formData = JSON.parse(req.body.data);
      
      // Validate the data
      const validatedData = insertCheckInSchema.parse({
        ...formData,
        identityDocumentPath: (req as any).file ? (req as any).file.path : null,
      });

      const checkIn = await storage.createCheckIn(validatedData);
      res.json(checkIn);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get all check-ins
  app.get("/api/check-ins", async (req, res) => {
    try {
      const checkIns = await storage.getAllCheckIns();
      res.json(checkIns);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get specific check-in
  app.get("/api/check-ins/:id", async (req, res) => {
    try {
      const checkIn = await storage.getCheckIn(req.params.id);
      if (!checkIn) {
        res.status(404).json({ message: "Check-in not found" });
        return;
      }
      res.json(checkIn);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
