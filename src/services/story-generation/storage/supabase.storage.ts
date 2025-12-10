import { createClient } from '@supabase/supabase-js'
import { IStorageService } from '../storage.service'

export class SupabaseStorageService implements IStorageService {
  private supabase: ReturnType<typeof createClient>
  private bucketName = 'story-audio'

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey)
  }

  /**
   * Ensures the storage bucket exists
   */
  private async ensureBucketExists(): Promise<void> {
    const { data: buckets } = await this.supabase.storage.listBuckets()

    const bucketExists = buckets?.some(b => b.name === this.bucketName)

    if (!bucketExists) {
      console.log(`[Supabase] Creating bucket: ${this.bucketName}`)

      const { error } = await this.supabase.storage.createBucket(this.bucketName, {
        public: true, // Make bucket public so audio files are accessible
        fileSizeLimit: 10485760, // 10MB limit per file
      })

      if (error) {
        console.error('[Supabase] Error creating bucket:', error)
        throw new Error(`Failed to create storage bucket: ${error.message}`)
      }
    }
  }

  /**
   * Uploads audio file to Supabase Storage
   */
  async uploadAudio(
    audioBuffer: Buffer,
    filename: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    console.log('[Supabase] Starting upload:', filename, 'Size:', audioBuffer.length, 'bytes')

    try {
      // Ensure bucket exists
      await this.ensureBucketExists()

      // Upload file
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filename, audioBuffer, {
          contentType: 'audio/mpeg',
          upsert: false, // Don't overwrite if exists
        })

      if (error) {
        console.error('[Supabase] Upload error:', error)
        throw new Error(`Failed to upload to Supabase Storage: ${error.message}`)
      }

      console.log('[Supabase] Upload completed:', filename)

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filename)

      const publicUrl = urlData.publicUrl
      console.log('[Supabase] Public URL:', publicUrl)

      return publicUrl

    } catch (error: any) {
      console.error('[Supabase] Upload error:', error)
      throw new Error(`Failed to upload to Supabase Storage: ${error.message}`)
    }
  }

  /**
   * Deletes audio file from Supabase Storage
   */
  async deleteAudio(url: string): Promise<void> {
    console.log('[Supabase] Deleting file with URL:', url)

    try {
      // Extract filename from URL
      // URL format: https://xxx.supabase.co/storage/v1/object/public/story-audio/filename.mp3
      const urlParts = url.split('/')
      const filename = urlParts[urlParts.length - 1]

      if (!filename) {
        console.warn('[Supabase] Could not extract filename from URL')
        return
      }

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filename])

      if (error) {
        console.error('[Supabase] Delete error:', error)
        // Don't throw - deletion errors shouldn't break the flow
        console.warn('[Supabase] Failed to delete file, continuing anyway')
      } else {
        console.log('[Supabase] File deleted successfully')
      }

    } catch (error: any) {
      console.error('[Supabase] Delete error:', error)
      // Don't throw - deletion errors shouldn't break the flow
      console.warn('[Supabase] Failed to delete file, continuing anyway')
    }
  }

  getProviderName(): string {
    return 'Supabase Storage'
  }
}
