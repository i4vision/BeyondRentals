import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import crypto from "crypto";
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

// Token signing utilities
const TOKEN_SECRET = process.env.TOKEN_SECRET;

if (!TOKEN_SECRET) {
  console.error('ERROR: TOKEN_SECRET environment variable is not set. Pre-fill URL generation will not work.');
}

function signToken(data: string): string {
  if (!TOKEN_SECRET) {
    throw new Error('TOKEN_SECRET is not configured');
  }
  const hmac = crypto.createHmac('sha256', TOKEN_SECRET);
  hmac.update(data);
  return hmac.digest('base64url');
}

function verifyToken(data: string, signature: string): boolean {
  try {
    const expectedSignature = signToken(data);
    const signatureBuffer = Buffer.from(signature, 'base64url');
    const expectedBuffer = Buffer.from(expectedSignature, 'base64url');
    
    // Check length first to avoid RangeError in timingSafeEqual
    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
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

  // Verify and decode pre-fill token
  app.post("/api/verify-prefill-token", async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        console.log('[Token Verify] Missing token in request');
        return res.status(400).json({ message: "Token is required" });
      }
      
      // Split token into data and signature
      const parts = token.split('.');
      if (parts.length !== 2) {
        console.log('[Token Verify] Invalid token format - expected 2 parts, got:', parts.length);
        return res.status(400).json({ message: "Invalid token format" });
      }
      
      const [dataToken, signature] = parts;
      console.log('[Token Verify] Data token (first 20 chars):', dataToken.substring(0, 20) + '...');
      console.log('[Token Verify] Signature (first 20 chars):', signature.substring(0, 20) + '...');
      
      // Verify signature
      const isValid = verifyToken(dataToken, signature);
      console.log('[Token Verify] Signature valid:', isValid);
      
      if (!isValid) {
        console.log('[Token Verify] REJECTED - Invalid signature');
        return res.status(400).json({ message: "Invalid token signature" });
      }
      
      // Decode data
      const jsonString = Buffer.from(dataToken, 'base64url').toString('utf8');
      const data = JSON.parse(jsonString);
      console.log('[Token Verify] ACCEPTED - Data:', JSON.stringify(data).substring(0, 100) + '...');
      
      res.json({ data, verified: true });
    } catch (error) {
      console.error("Error verifying token:", error);
      res.status(500).json({ message: "Failed to verify token" });
    }
  });

  // Generate pre-filled check-in URL
  app.post("/api/generate-prefill-url", async (req, res) => {
    try {
      const guestData = req.body;
      
      // Define whitelisted scalar fields that can be pre-filled
      const allowedFields = [
        'firstName', 'lastName', 'email', 'phone', 'phoneCountryCode',
        'dateOfBirth', 'country', 'arrivalDate', 'arrivalTime', 
        'departureDate', 'departureTime', 'arrivalNotes'
      ];
      
      // Filter and validate the data to only include allowed scalar fields
      const sanitizedData: Record<string, string> = {};
      for (const field of allowedFields) {
        if (guestData[field] !== undefined && guestData[field] !== null) {
          sanitizedData[field] = String(guestData[field]);
        }
      }
      
      // Get the base URL - use PUBLIC_URL env var if set, otherwise use request URL
      const baseUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
      
      // Option 1: Generate URL with signed token (compact) with proper UTF-8 encoding
      const jsonString = JSON.stringify(sanitizedData);
      const dataToken = Buffer.from(jsonString, 'utf8').toString('base64url');
      const signature = signToken(dataToken);
      const signedToken = `${dataToken}.${signature}`;
      const tokenUrl = `${baseUrl}/?token=${encodeURIComponent(signedToken)}`;
      
      // Option 2: Generate URL with query parameters (readable, unsigned)
      const params = new URLSearchParams(sanitizedData);
      const queryUrl = `${baseUrl}/?${params.toString()}`;
      
      res.json({
        tokenUrl,
        queryUrl,
        sanitizedData
      });
    } catch (error) {
      console.error("Error generating pre-fill URL:", error);
      res.status(500).json({ message: "Failed to generate pre-fill URL" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
