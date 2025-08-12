# Check-In Application

## Overview

This is a full-stack web application for managing guest check-ins at hospitality venues. The application provides a comprehensive digital form where guests can submit their personal details, travel information, additional guest information, identity documents, and digital signatures. Built with a modern React frontend and Express.js backend, it features a clean, responsive interface with file upload capabilities and signature pad functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 2025)

### Country Code and Selection Improvements
- Expanded country codes to 50+ countries with flags, alphabetically sorted by country name
- Fixed duplicate key issues for countries sharing the same phone code (US/Canada both +1)
- Added unique keys using country code, country abbreviation, and index
- Countries list now alphabetically sorted from Argentina to Vietnam

### Digital Signature Functionality (Fixed - August 12, 2025)
- Resolved critical signature drawing issue that prevented visible strokes
- Implemented path-based drawing system that stores all signature data
- Canvas now redraws complete signature on each update to prevent clearing
- Added proper stroke persistence during continuous drawing operations  
- Fixed mouse coordinate handling and canvas context management
- Signature pad now works reliably for both dots and continuous lines

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

### File Handling
- **Multer**: Express middleware for handling file uploads
- **File System**: Node.js fs module for file operations

### Database (Configured)
- **Drizzle ORM**: Type-safe ORM with PostgreSQL support
- **Neon Database**: Serverless PostgreSQL provider (@neondatabase/serverless)
- **Drizzle Kit**: Database migration and schema management tools

### Development
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Static type checking and enhanced developer experience
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility
- **ESBuild**: Fast JavaScript bundler for production builds