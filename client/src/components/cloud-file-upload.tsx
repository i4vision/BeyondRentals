import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CloudUpload, FileText, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface CloudFileUploadProps {
  onFileUploaded: (fileUrl: string, fileName: string, fileSize: number, fileType: string, fileId: string) => void;
  accept: string;
  maxSize?: number;
  className?: string;
  uploadedFile?: {
    name: string;
    size: number;
    type: string;
    url: string;
  } | null;
}

export default function CloudFileUpload({ 
  onFileUploaded, 
  accept, 
  maxSize = 10 * 1024 * 1024,
  className = "",
  uploadedFile: externalUploadedFile = null
}: CloudFileUploadProps) {
  const [internalUploadedFile, setInternalUploadedFile] = useState<{
    name: string;
    size: number;
    type: string;
    url: string;
  } | null>(null);
  
  // Use external state if provided, otherwise use internal state
  const uploadedFile = externalUploadedFile || internalUploadedFile;
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log("CloudFileUpload component rendered, uploadedFile:", uploadedFile ? uploadedFile.name : "null");

  const handleFileSelect = async (file: File) => {
    try {
      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      if (file.size > maxSize) {
        alert(`File size exceeds ${formatFileSize(maxSize)} limit`);
        return;
      }

      setIsUploading(true);
      
      // Get upload URL
      console.log('Getting upload parameters...');
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const data = await response.json();
      console.log('Got upload URL:', data.uploadURL);
      
      // Upload file directly to cloud storage
      // Note: Don't include Content-Type header for S3/MinIO presigned URLs
      // as it must be part of the signature. The storage service will detect it automatically.
      const uploadResponse = await fetch(data.uploadURL, {
        method: 'PUT',
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to cloud storage');
      }

      console.log('File uploaded successfully to cloud storage');
      
      // Convert the storage URL to our app's object serving route
      const storageUrl = data.uploadURL.split('?')[0]; // Remove query parameters
      const urlParts = storageUrl.split('/');
      
      let finalUrl = storageUrl;
      let fileId = '';
      
      // Handle GCS URLs (replit-objstore bucket)
      const gcsIndex = urlParts.findIndex((part: string) => part.startsWith('replit-objstore'));
      if (gcsIndex !== -1 && urlParts[gcsIndex + 1] === '.private') {
        const objectPath = urlParts.slice(gcsIndex + 2).join('/');
        fileId = urlParts[urlParts.length - 1]; // Extract the file ID (last part of URL)
        finalUrl = `/objects/${objectPath}`;
        console.log('Converted GCS URL to app URL:', { storageUrl, appUrl: finalUrl, fileId });
      } 
      // Handle MinIO/S3 URLs (uploads/ prefix)
      else {
        const uploadsIndex = urlParts.indexOf('uploads');
        if (uploadsIndex !== -1 && urlParts.length > uploadsIndex + 1) {
          const objectPath = urlParts.slice(uploadsIndex + 1).join('/');
          fileId = urlParts[urlParts.length - 1]; // Extract the file ID (last part of URL)
          finalUrl = `/objects/${objectPath}`;
          console.log('Converted MinIO URL to app URL:', { storageUrl, appUrl: finalUrl, fileId });
        }
      }
      
      const fileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        url: finalUrl, // Use our app's route instead of direct GCS URL
      };
      
      console.log('Setting uploaded file info:', fileInfo);
      setInternalUploadedFile(fileInfo);
      onFileUploaded(fileInfo.url, fileInfo.name, fileInfo.size, fileInfo.type, fileId);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input change event triggered');
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    console.log('Upload button clicked');
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    console.log('Removing uploaded file');
    setInternalUploadedFile(null);
    onFileUploaded('', '', 0, '', '');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept={accept}
        className="hidden"
      />
      
      {!uploadedFile ? (
        <div className="space-y-4">
          <Button
            type="button"
            onClick={handleButtonClick}
            disabled={isUploading}
            className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 text-gray-600"
            variant="outline"
          >
            <div className="flex flex-col items-center space-y-2">
              <CloudUpload className="h-8 w-8" />
              <div className="text-center">
                <p className="text-sm font-medium">Upload Identity Document</p>
                <p className="text-xs text-gray-500">
                  Click to browse files
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, JPG, PNG up to {formatFileSize(maxSize)}
                </p>
              </div>
            </div>
          </Button>
          
          {isUploading && (
            <div className="text-center">
              <p className="text-sm text-blue-600">Uploading to cloud storage...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">{uploadedFile.name}</p>
                <p className="text-xs text-green-600">
                  {formatFileSize(uploadedFile.size)} • Uploaded to cloud storage
                </p>
              </div>
            </div>
            <Button 
              type="button"
              variant="ghost" 
              size="sm"
              onClick={removeFile}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}