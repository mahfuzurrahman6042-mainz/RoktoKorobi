import sharp from 'sharp';

// Magic bytes for common image formats
const FILE_SIGNATURES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  'image/gif': [0x47, 0x49, 0x46, 0x38],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

export async function validateFileContent(file: File, expectedType: string): Promise<boolean> {
  try {
    const buffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const signature = FILE_SIGNATURES[expectedType];

    if (!signature) return true; // If no signature defined, skip validation

    // Check if file starts with expected magic bytes
    for (let i = 0; i < signature.length; i++) {
      if (bytes[i] !== signature[i]) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

export function calculateChecksum(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const buffer = await crypto.subtle.digest('SHA-256', reader.result as ArrayBuffer);
        const hashArray = Array.from(new Uint8Array(buffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        resolve(hashHex);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export async function stripExifData(file: File): Promise<File> {
  try {
    const buffer = await file.arrayBuffer();
    
    // Use sharp to strip EXIF data while preserving image quality
    // rotate() auto-orients image based on EXIF orientation
    // toBuffer() outputs image without EXIF metadata
    const processedBuffer = await sharp(Buffer.from(buffer))
      .rotate()
      .toBuffer();
    
    // Convert Buffer to Uint8Array for File constructor
    return new File([new Uint8Array(processedBuffer)], file.name, { type: file.type });
  } catch (error) {
    // Error stripping EXIF data
    // If sharp fails, return original file
    return file;
  }
}

export async function scanForMalware(file: File): Promise<boolean> {
  // If no API key is configured, skip scanning (for development)
  if (!process.env.VIRUSTOTAL_API_KEY) {
    return true;
  }

  try {
    // Upload file to VirusTotal for scanning
    const formData = new FormData();
    formData.append('file', file);

    const uploadResponse = await fetch('https://www.virustotal.com/api/v3/files', {
      method: 'POST',
      headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY },
      body: formData
    });

    if (!uploadResponse.ok) {
      // VirusTotal upload failed
      // On API error, allow file (fail-open for availability)
      return true;
    }

    const uploadResult = await uploadResponse.json();
    const analysisId = uploadResult.data.id;

    // Poll for analysis results
    let attempts = 0;
    const maxAttempts = 10; // Wait up to 30 seconds

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds

      const analysisResponse = await fetch(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        {
          headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY }
        }
      );

      if (!analysisResponse.ok) {
        // VirusTotal analysis check failed - allow file
        return true;
      }

      const analysisResult = await analysisResponse.json();
      const status = analysisResult.data.attributes.status;

      if (status === 'completed') {
        const stats = analysisResult.data.attributes.stats;
        const malicious = stats.malicious || 0;
        return malicious === 0;
      }

      attempts++;
    }

    // If analysis doesn't complete in time, allow file for availability
    return true;
  } catch (error) {
    // Error scanning file with VirusTotal - allow file for availability
    return true;
  }
}
