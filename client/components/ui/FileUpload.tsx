"use client";

import { useState, useRef } from "react";
import { uploadFile, getPresignedUrl } from "@/lib/storage";
import { UploadCloud, X, File as FileIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

interface FileUploadProps {
  bucketId?: string;
  onUploadSuccess?: (fileId: string, url: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({ 
  bucketId = "default", 
  onUploadSuccess,
  accept = "image/*,application/pdf",
  maxSizeMB = 5
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);
    try {
      const { fileId, error } = await uploadFile(file, bucketId);
      
      if (error || !fileId) {
        toast.error(error?.message || "Failed to upload file");
        setIsUploading(false);
        return;
      }

      const url = await getPresignedUrl(fileId);
      if (url) {
        setPreviewUrl(url);
        onUploadSuccess?.(fileId, url);
        toast.success("File uploaded successfully");
      }
    } catch (err) {
      toast.error("An unexpected error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      {previewUrl ? (
        <div className="relative rounded-lg border border-zinc-200 dark:border-zinc-800 p-2 overflow-hidden group">
          {previewUrl.match(/\.(jpeg|jpg|gif|png)$/) != null || previewUrl.includes("image") ? (
            <div className="relative w-full h-48">
              <Image 
                src={previewUrl} 
                alt="Preview" 
                fill 
                className="object-cover rounded-md" 
              />
            </div>
          ) : (
            <div className="w-full h-32 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 rounded-md">
              <FileIcon className="w-10 h-10 text-zinc-400 mb-2" />
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Document Uploaded</span>
            </div>
          )}
          
          <button
            onClick={() => setPreviewUrl(null)}
            className="absolute top-4 right-4 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors
            ${isDragging 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900'
            }
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={accept}
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center text-blue-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="text-sm font-medium">Uploading to Nhost...</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Click or drag file to upload</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-xs">
                Supports {accept.split(',').join(', ')}. Max size: {maxSizeMB}MB
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
