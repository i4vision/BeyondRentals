import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CloudUpload, FileText, X } from "lucide-react";
import { ObjectUploader } from "./ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { apiRequest } from "@/lib/queryClient";

interface CloudFileUploadProps {
  onFileUploaded: (fileUrl: string, fileName: string, fileSize: number, fileType: string) => void;
  accept: string;
  maxSize?: number;
  className?: string;
}

export default function CloudFileUpload({ 
  onFileUploaded, 
  accept, 
  maxSize = 10 * 1024 * 1024,
  className = "" 
}: CloudFileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    type: string;
    url: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  console.log("CloudFileUpload component rendered, uploadedFile:", uploadedFile ? uploadedFile.name : "null");

  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest('/api/objects/upload', 'POST');
      
      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const data = await response.json();
      return {
        method: 'PUT' as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error('Error getting upload parameters:', error);
      throw error;
    }
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    console.log('Upload completed:', result);
    
    if (result.successful && result.successful.length > 0) {
      const file = result.successful[0];
      const fileName = file.name || 'unknown';
      const fileSize = file.size || 0;
      const fileType = file.type || 'application/octet-stream';
      const fileUrl = file.uploadURL || '';
      
      const fileInfo = {
        name: fileName,
        size: fileSize,
        type: fileType,
        url: fileUrl,
      };
      
      console.log('Setting uploaded file info:', fileInfo);
      setUploadedFile(fileInfo);
      onFileUploaded(fileUrl, fileName, fileSize, fileType);
    }
    
    setIsUploading(false);
  };

  const removeFile = () => {
    console.log('Removing uploaded file');
    setUploadedFile(null);
    onFileUploaded('', '', 0, '');
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
      {!uploadedFile ? (
        <div className="space-y-4">
          <ObjectUploader
            maxNumberOfFiles={1}
            maxFileSize={maxSize}
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={handleUploadComplete}
            buttonClassName="w-full h-32 border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 text-gray-600"
          >
            <div className="flex flex-col items-center space-y-2">
              <CloudUpload className="h-8 w-8" />
              <div className="text-center">
                <p className="text-sm font-medium">Upload Identity Document</p>
                <p className="text-xs text-gray-500">
                  Click to browse or drag & drop files here
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, JPG, PNG up to {formatFileSize(maxSize)}
                </p>
              </div>
            </div>
          </ObjectUploader>
          
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