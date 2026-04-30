import sharp from 'sharp';

export interface ExifData {
  orientation?: number;
  exif?: any;
}

export class ExifStripper {
  /**
   * Remove EXIF data from image files
   * This protects privacy by removing metadata that may contain:
   * - GPS coordinates
   * - Camera information
   * - Date/time stamps
   * - Device information
   */
  static async stripExifData(file: File): Promise<File> {
    try {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        throw new Error('File is not an image');
      }

      // Convert file to buffer
      const buffer = await file.arrayBuffer();
      
      // Use sharp to process image and remove EXIF data
      const processedBuffer = await sharp(Buffer.from(buffer))
        .rotate() // Auto-orient based on EXIF orientation
        .removeAlpha() // Remove alpha channel if present
        .toFormat('jpeg', { 
          quality: 85, // Slightly reduced quality for smaller file size
          progressive: true // Progressive JPEG for better loading
        })
        .toBuffer();

      // Create new file without EXIF data
      const strippedFile = new File(
        [processedBuffer],
        file.name.replace(/\.[^/.]+$/, '.jpg'), // Convert to JPEG
        'image/jpeg',
        { lastModified: file.lastModified }
      );

      return strippedFile;
    } catch (error) {
      throw new Error(`Failed to strip EXIF data: ${error.message}`);
    }
  }

  /**
   * Extract basic EXIF information before stripping
   * This can be used for logging or validation
   */
  static async extractExifData(file: File): Promise<ExifData> {
    try {
      const buffer = await file.arrayBuffer();
      const metadata = await sharp(Buffer.from(buffer)).metadata();
      
      return {
        orientation: metadata.orientation,
        exif: metadata.exif
      };
    } catch (error) {
      return {
        orientation: undefined,
        exif: null
      };
    }
  }

  /**
   * Validate image file before processing
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${validTypes.join(', ')}`
      };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`
      };
    }

    return { valid: true };
  }

  /**
   * Get image dimensions and format information
   */
  static async getImageInfo(file: File): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
  }> {
    try {
      const buffer = await file.arrayBuffer();
      const metadata = await sharp(Buffer.from(buffer)).metadata();
      
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: file.size
      };
    } catch (error) {
      throw new Error(`Failed to get image info: ${error.message}`);
    }
  }

  /**
   * Optimize image for web use
   */
  static async optimizeForWeb(file: File): Promise<File> {
    try {
      const buffer = await file.arrayBuffer();
      
      // Optimize for web use
      const optimizedBuffer = await sharp(Buffer.from(buffer))
        .resize(1920, 1080, { // Max dimensions for web use
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 75, // Lower quality for web
          progressive: true,
          mozjpeg: true // Better compression
        })
        .toBuffer();

      return new File(
        [optimizedBuffer],
        file.name.replace(/\.[^/.]+$/, '.jpg'),
        'image/jpeg',
        { lastModified: file.lastModified }
      );
    } catch (error) {
      throw new Error(`Failed to optimize image: ${error.message}`);
    }
  }
}

export default ExifStripper;
