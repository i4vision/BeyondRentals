# Check-In Application

## Overview

This is a full-stack web application for managing guest check-ins at hospitality venues. The application provides a comprehensive digital form where guests can submit their personal details, travel information, additional guest information, identity documents, and digital signatures. Built with a modern React frontend and Express.js backend, it features a clean, responsive interface with file upload capabilities and signature pad functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 2025)

### URL-Based Form Pre-fill Functionality (October 7, 2025)
- Implemented secure pre-filled form links to send personalized check-in forms to guests
- Three methods supported: signed tokens (secure), unsigned tokens (legacy), and query parameters
- HMAC-SHA256 signature verification prevents link tampering
- Proper UTF-8 encoding/decoding for international characters (José, García, España, etc.)
- Frontend uses TextDecoder for UTF-8 decoding, backend uses Buffer with utf8 encoding
- Whitelisted scalar fields only (no nested objects/arrays for security)
- TOKEN_SECRET environment variable required for signing (no hardcoded defaults)
- Backend endpoints: POST /api/generate-prefill-url and POST /api/verify-prefill-token
- Frontend shows "Form Pre-filled (Verified)" toast for signed tokens, error toast for tampered links
- Supports fields: firstName, lastName, email, phone, phoneCountryCode, dateOfBirth, country, arrivalDate/Time, departureDate/Time, arrivalNotes

### Containerized Deployment with MinIO Integration (October 6, 2025)
- Implemented unified storage interface (IStorageService) supporting both Google Cloud Storage and MinIO
- Created FileDescriptor pattern for type-safe file download operations across storage backends
- Added S3StorageService for MinIO/S3-compatible object storage in containerized deployments
- Updated ObjectStorageService to implement unified interface with GCSFileDescriptor wrapper
- Factory pattern in routes.ts switches storage backend based on STORAGE_TYPE environment variable
- MinIO service configured in docker-compose.yml with health checks and automatic bucket creation
- Removed all type casts - fully type-safe storage abstraction throughout the application
- AWS SDK (@aws-sdk/client-s3, @aws-sdk/s3-request-presigner) installed for S3-compatible operations
- Environment configuration supports both Replit (GCS) and containerized (MinIO) deployments

## Recent Changes (August 2025)

### Country Code and Selection Improvements
- Expanded country codes to 50+ countries with flags, alphabetically sorted by country name
- Fixed duplicate key issues for countries sharing the same phone code (US/Canada both +1)
- Added unique keys using country code, country abbreviation, and index
- Countries list now alphabetically sorted from Argentina to Vietnam

### Digital Signature Functionality (Fixed - August 12, 2025)
- Resolved signature drawing issue by implementing react-signature-canvas library
- After extensive debugging with custom canvas components, switched to proven third-party solution
- Library provides reliable cross-browser signature capture with touch and mouse support
- Signature pad now works consistently with proper stroke rendering and data export
- Maintained existing form integration and validation requirements
- Component supports clear functionality and signature data URL generation

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **State Management**: React Hook Form for form handling with Zod validation schemas
- **Data Fetching**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **File Uploads**: Multer middleware for handling multipart/form-data with file type validation and size limits
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **Object Storage**: Unified storage interface supporting Google Cloud Storage (Replit) and MinIO (containers)
- **API Design**: RESTful endpoints with JSON responses and proper error handling

### Form Management
- **Validation**: Zod schemas for type-safe form validation on both client and server
- **File Handling**: Support for identity document uploads (JPG, PNG, PDF) with 10MB size limit
- **Signature Capture**: HTML5 Canvas-based signature pad for digital signatures
- **Multi-step Flow**: Organized form sections for personal details, travel info, guests, documents, and signatures

### Data Layer
- **Current Implementation**: Memory-based storage using Map data structure
- **Schema Design**: Structured data model for check-ins including guest arrays and file paths
- **Database Ready**: Drizzle ORM configuration prepared for PostgreSQL migration
- **Type Safety**: Shared TypeScript types between frontend and backend

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: TypeScript strict mode with path mapping for clean imports
- **Development**: Hot module replacement and error overlay for rapid development
- **Deployment**: Production build with static asset optimization

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive set of accessible React components for form inputs, modals, and interactive elements
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe variant API for component styling

### Form and Validation
- **React Hook Form**: Performant form library with TypeScript support
- **Zod**: TypeScript-first schema validation library
- **@hookform/resolvers**: Integration between React Hook Form and Zod validation

### Data and State
- **TanStack React Query**: Async state management for server data
- **Wouter**: Minimalist routing library for React applications

### File Handling and Object Storage
- **Multer**: Express middleware for handling file uploads
- **File System**: Node.js fs module for file operations
- **Google Cloud Storage**: Google Cloud Storage SDK for Replit-hosted object storage
- **AWS S3 SDK**: AWS SDK for S3-compatible operations with MinIO in containerized deployments
- **MinIO**: Self-hosted S3-compatible object storage for Docker/container deployments

### Database (Configured)
- **Drizzle ORM**: Type-safe ORM with PostgreSQL support
- **Neon Database**: Serverless PostgreSQL provider (@neondatabase/serverless)
- **Drizzle Kit**: Database migration and schema management tools

### Development
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Static type checking and enhanced developer experience
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility
- **ESBuild**: Fast JavaScript bundler for production builds

### Containerization and Deployment
- **Docker**: Multi-stage Dockerfile for optimized production builds
- **Docker Compose**: Orchestrates application and MinIO services
- **MinIO**: S3-compatible object storage service for containerized deployments
- **Health Checks**: Built-in health monitoring for container orchestration (Portainer, Kubernetes)
- **Storage Abstraction**: Factory pattern switches between GCS (Replit) and MinIO (containers) based on STORAGE_TYPE env var