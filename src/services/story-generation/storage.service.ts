/**
 * Abstract storage service interface
 * Allows easy switching between different storage providers (Mega, S3, Supabase, etc.)
 */

export interface IStorageService {
  /**
   * Uploads audio file to storage
   * @param audioBuffer - The audio file as a Buffer
   * @param filename - The filename for the audio file
   * @param metadata - Optional metadata (user_id, story_id, etc.)
   * @returns Public URL to access the uploaded file
   */
  uploadAudio(
    audioBuffer: Buffer,
    filename: string,
    metadata?: Record<string, any>
  ): Promise<string>

  /**
   * Deletes audio file from storage
   * @param url - The URL of the file to delete
   */
  deleteAudio(url: string): Promise<void>

  /**
   * Gets the storage provider name
   */
  getProviderName(): string
}

/**
 * Factory function to get the appropriate storage service
 * Based on environment variable STORAGE_PROVIDER
 */
export function getStorageService(): IStorageService {
  const provider = process.env.STORAGE_PROVIDER || 'mega'

  switch (provider.toLowerCase()) {
    case 'mega': {
      // Lazy load to avoid importing unnecessary dependencies
      const { MegaStorageService } = require('./storage/mega.storage')
      return new MegaStorageService()
    }

    case 'cloudflare':
    case 'r2': {
      // Lazy load to avoid importing unnecessary dependencies
      const { CloudflareR2StorageService } = require('./storage/cloudflare.storage')
      return new CloudflareR2StorageService()
    }

    case 'supabase': {
      // Lazy load to avoid importing unnecessary dependencies
      const { SupabaseStorageService } = require('./storage/supabase.storage')
      return new SupabaseStorageService()
    }

    case 's3': {
      throw new Error('S3 storage not implemented yet. Create storage/s3.storage.ts or use STORAGE_PROVIDER=cloudflare')
    }

    default:
      throw new Error(
        `Unknown storage provider: ${provider}. Supported: mega, cloudflare, supabase`
      )
  }
}
