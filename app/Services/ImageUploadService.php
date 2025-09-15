<?php
namespace App\Services;

use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use League\Flysystem\AwsS3V3\PortableVisibilityConverter;

class ImageUploadService
{
    const MAX_FILE_SIZE      = 2 * 1024 * 1024; // 2MB in bytes
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'svgz'];

    /**
     * Upload image to S3 with module-specific directories
     */
    public function uploadImage(UploadedFile $file, string $module = 'images', string $subFolder = ''): string
    {
        // Validate file type
        $this->validateFileType($file);

        // Process image (compress if needed)
        $processedImageData = $this->processImage($file);

        // Generate unique filename
        $filename = $this->generateFilename($file);

        // Create module-specific path
        $path = $module . '/';
        if (! empty($subFolder)) {
            $path .= $subFolder . '/';
        }
        $path .= $filename;

        // Upload to S3
        try {
            $uploaded = Storage::disk('s3')->put($path, $processedImageData);

            if (! $uploaded) {
                throw new Exception('S3 upload returned false - check bucket permissions and credentials');
            }
        } catch (\Aws\S3\Exception\S3Exception $e) {
            throw new Exception('AWS S3 Error: ' . $e->getMessage() . ' (Code: ' . $e->getAwsErrorCode() . ')');
        } catch (\Exception $e) {
            throw new Exception('Upload failed: ' . $e->getMessage());
        }

        // Optionally set ACL to public-read if allowed
        if (env('AWS_SET_PUBLIC_ACL', false)) {
            try {
                $visibilityConverter = new PortableVisibilityConverter();
                $visibility = $visibilityConverter->inverseForFile('public');
                Storage::disk('s3')->setVisibility($path, $visibility);
            } catch (\Throwable $e) {
                // ignore if not permitted
            }
        }

        // Return the S3 URL
        return Storage::disk('s3')->url($path);
    }

    /**
     * Validate file type only (size will be handled by compression)
     */
    private function validateFileType(UploadedFile $file): void
    {
        $extension = strtolower($file->getClientOriginalExtension());
        if (! in_array($extension, self::ALLOWED_EXTENSIONS)) {
            throw new Exception('Invalid file type. Allowed types: ' . implode(', ', self::ALLOWED_EXTENSIONS));
        }
    }

    /**
     * Process image - compress if larger than 2MB
     */
    private function processImage(UploadedFile $file): string
    {
        $fileSize = $file->getSize();
        // For SVG/SVGZ, do not alter; just return the raw bytes (compression not applicable)
        $ext = strtolower($file->getClientOriginalExtension());
        if ($ext === 'svg' || $ext === 'svgz') {
            return file_get_contents($file->getPathname());
        }

        $imageData = file_get_contents($file->getPathname());

        // If file is within limit, return as is
        if ($fileSize <= self::MAX_FILE_SIZE) {
            return $imageData;
        }

        // Compress raster image to 2MB or less
        return $this->compressImage($file);
    }

    /**
     * Compress image to fit within 2MB limit
     */
    private function compressImage(UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $imagePath = $file->getPathname();

        // Create image resource based on type
        switch ($extension) {
            case 'jpg':
            case 'jpeg':
                $image = imagecreatefromjpeg($imagePath);
                break;
            case 'png':
                $image = imagecreatefrompng($imagePath);
                break;
            case 'webp':
                $image = imagecreatefromwebp($imagePath);
                break;
            default:
                throw new Exception('Unsupported image type for compression');
        }

        if (! $image) {
            throw new Exception('Failed to create image resource for compression');
        }

        // Get original dimensions
        $originalWidth  = imagesx($image);
        $originalHeight = imagesy($image);

        // Start with quality 85 and reduce until file size is acceptable
        $quality    = 85;
        $compressed = false;

        while ($quality > 10 && ! $compressed) {
            ob_start();

            switch ($extension) {
                case 'jpg':
                case 'jpeg':
                    imagejpeg($image, null, $quality);
                    break;
                case 'png':
                    // PNG compression level (0-9, where 9 is max compression)
                    $pngQuality = (int) (9 - ($quality / 10));
                    imagepng($image, null, $pngQuality);
                    break;
                case 'webp':
                    imagewebp($image, null, $quality);
                    break;
            }

            $compressedData = ob_get_contents();
            ob_end_clean();

            // Check if compressed size is within limit
            if (strlen($compressedData) <= self::MAX_FILE_SIZE) {
                $compressed = true;
                imagedestroy($image);
                return $compressedData;
            }

            $quality -= 5;
        }

        // If still too large, try resizing
        if (! $compressed) {
            $newWidth  = (int) ($originalWidth * 0.8);
            $newHeight = (int) ($originalHeight * 0.8);

            $resizedImage = imagecreatetruecolor($newWidth, $newHeight);

            // Preserve transparency for PNG
            if ($extension === 'png') {
                imagealphablending($resizedImage, false);
                imagesavealpha($resizedImage, true);
            }

            imagecopyresampled($resizedImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $originalWidth, $originalHeight);

            ob_start();
            switch ($extension) {
                case 'jpg':
                case 'jpeg':
                    imagejpeg($resizedImage, null, 75);
                    break;
                case 'png':
                    imagepng($resizedImage, null, 6);
                    break;
                case 'webp':
                    imagewebp($resizedImage, null, 75);
                    break;
            }

            $finalData = ob_get_contents();
            ob_end_clean();

            imagedestroy($image);
            imagedestroy($resizedImage);

            return $finalData;
        }

        imagedestroy($image);
        throw new Exception('Unable to compress image to required size');
    }

    /**
     * Generate unique filename
     */
    private function generateFilename(UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        return uniqid() . '_' . time() . '.' . $extension;
    }

    /**
     * Delete image from S3
     */
    public function deleteImage(string $url): bool
    {
        try {
            $path = parse_url($url, PHP_URL_PATH);
            $path = ltrim($path, '/');

            $bucketName = config('filesystems.disks.s3.bucket');
            if (strpos($path, $bucketName . '/') === 0) {
                $path = substr($path, strlen($bucketName) + 1);
            }

            return Storage::disk('s3')->delete($path);
        } catch (Exception $e) {
            \Log::error("S3 Delete failed: {$url} - Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get image info
     */
    public function getImageInfo(UploadedFile $file): array
    {
        return [
            'size'      => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'extension' => strtolower($file->getClientOriginalExtension()),
        ];
    }
}
