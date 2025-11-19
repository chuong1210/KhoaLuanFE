// lib/utils/file-utils.ts

/**
 * Check if value is a File object (works in both client and SSR)
 */
export function isFile(value: any): value is File {
  if (typeof window === 'undefined') {
    // Server-side: check for File-like properties
    return (
      value !== null &&
      typeof value === 'object' &&
      'name' in value &&
      'size' in value &&
      'type' in value &&
      typeof value.name === 'string' &&
      typeof value.size === 'number' &&
      typeof value.type === 'string'
    )
  }
  // Client-side: use instanceof
  return value instanceof File
}

/**
 * Check if value is a Blob object
 */
export function isBlob(value: any): value is Blob {
  if (typeof window === 'undefined') {
    return (
      value !== null &&
      typeof value === 'object' &&
      'size' in value &&
      'type' in value &&
      typeof value.size === 'number' &&
      typeof value.type === 'string'
    )
  }
  return value instanceof Blob
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxBytes
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const baseType = type.replace('/*', '')
      return file.type.startsWith(baseType + '/')
    }
    return file.type === type
  })
}

/**
 * Create preview URL for image file
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'))
      return
    }
    
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve(reader.result as string)
    }
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    reader.readAsDataURL(file)
  })
}