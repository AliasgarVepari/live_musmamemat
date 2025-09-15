import { cn } from '@/lib/utils';
import { Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
    currentFile?: File | null;
    currentUrl?: string;
    accept?: string;
    maxSize?: number; // in MB
    className?: string;
    disabled?: boolean;
    handleClientRemoveFile?: () => void;
}

export function FileUpload({
    onFileSelect,
    currentFile,
    currentUrl,
    accept = '.svg,.svgz',
    maxSize = 10,
    className,
    handleClientRemoveFile,
    disabled = false,
}: FileUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Create preview URL when file changes
    const handleFileChange = useCallback((file: File | null) => {
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(null);
        }
        onFileSelect(file);
    }, [onFileSelect, previewUrl]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragOver(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        if (disabled) return;

        const files = Array.from(e.dataTransfer.files);
        const file = files[0];
        
        if (file) {
            // Validate file type
            const fileExtension = file.name.toLowerCase().split('.').pop();
            const allowedExtensions = accept.split(',').map(ext => ext.replace('.', ''));
            
            if (!allowedExtensions.includes(fileExtension || '')) {
                alert(`Invalid file type. Only ${accept} files are allowed.`);
                return;
            }

            // Validate file size
            if (file.size > maxSize * 1024 * 1024) {
                alert(`File size must be less than ${maxSize}MB.`);
                return;
            }

            handleFileChange(file);
        }
    }, [accept, maxSize, handleFileChange, disabled]);

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            // Validate file type
            const fileExtension = file.name.toLowerCase().split('.').pop();
            const allowedExtensions = accept.split(',').map(ext => ext.replace('.', ''));
            
            if (!allowedExtensions.includes(fileExtension || '')) {
                alert(`Invalid file type. Only ${accept} files are allowed.`);
                return;
            }

            // Validate file size
            if (file.size > maxSize * 1024 * 1024) {
                alert(`File size must be less than ${maxSize}MB.`);
                return;
            }
        }
        handleFileChange(file);
    }, [accept, maxSize, handleFileChange]);

    const handleRemoveFile = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        onFileSelect(null);
        handleClientRemoveFile?.();
    }, [previewUrl, onFileSelect, handleClientRemoveFile]);

    const displayUrl = previewUrl || currentUrl;

    return (
        <div className={cn('w-full', className)}>
            <div
                className={cn(
                    'relative border-2 border-dashed rounded-lg p-6 transition-colors',
                    isDragOver && !disabled
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-gray-400',
                    disabled && 'opacity-50 cursor-not-allowed',
                    !disabled && 'cursor-pointer'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept={accept}
                    onChange={handleFileInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    disabled={disabled}
                />
                
                {displayUrl ? (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <div className="bg-primary/10 flex h-20 w-20 items-center justify-center rounded-lg">
                                <img
                                    src={displayUrl}
                                    alt="File preview"
                                    className="h-16 w-16 object-contain"
                                />
                            </div>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">
                                {currentFile?.name || 'Current file'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {currentFile ? `${(currentFile.size / 1024 / 1024).toFixed(2)} MB` : 'Click or drag to replace'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-gray-100 flex h-20 w-20 items-center justify-center rounded-lg">
                            <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">
                                {isDragOver ? 'Drop the file here' : 'Upload SVG icon'}
                            </p>
                            <p className="text-xs text-gray-500">
                                Drag and drop or click to select
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Only {accept} files up to {maxSize}MB
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
