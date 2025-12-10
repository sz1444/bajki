import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { IStorageService } from '../storage.service'

export class CloudflareR2StorageService implements IStorageService {
  private s3Client: S3Client
  private bucketName: string
  private publicUrl: string

  constructor() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'story-audio'
    const publicDomain = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, and CLOUDFLARE_R2_SECRET_ACCESS_KEY are required'
      )
    }

    this.bucketName = bucketName

    // If custom domain is set, use it. Otherwise use R2.dev domain
    this.publicUrl = publicDomain || `https://${bucketName}.${accountId}.r2.cloudflarestorage.com`

    // Configure S3 client for Cloudflare R2
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })

    console.log('[Cloudflare R2] Storage service initialized')
    console.log('[Cloudflare R2] Bucket:', this.bucketName)
    console.log('[Cloudflare R2] Public URL:', this.publicUrl)
  }

  /**
   * Uploads audio file to Cloudflare R2
   */
  async uploadAudio(
    audioBuffer: Buffer,
    filename: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    console.log('[Cloudflare R2] Starting upload:', filename, 'Size:', audioBuffer.length, 'bytes')

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
        Body: audioBuffer,
        ContentType: 'audio/mpeg',
        Metadata: metadata
          ? Object.fromEntries(Object.entries(metadata).map(([k, v]) => [k, String(v)]))
          : undefined,
      })

      await this.s3Client.send(command)

      const publicUrl = `${this.publicUrl}/${filename}`
      console.log('[Cloudflare R2] Upload completed:', filename)
      console.log('[Cloudflare R2] Public URL:', publicUrl)

      return publicUrl
    } catch (error: any) {
      console.error('[Cloudflare R2] Upload error:', error)
      throw new Error(`Failed to upload to Cloudflare R2: ${error.message}`)
    }
  }

  /**
   * Deletes audio file from Cloudflare R2
   */
  async deleteAudio(url: string): Promise<void> {
    console.log('[Cloudflare R2] Deleting file with URL:', url)

    try {
      // Extract filename from URL
      // URL format: https://bucket.accountid.r2.cloudflarestorage.com/filename.mp3
      // or custom domain: https://cdn.yourdomain.com/filename.mp3
      const urlParts = url.split('/')
      const filename = urlParts[urlParts.length - 1]

      if (!filename) {
        console.warn('[Cloudflare R2] Could not extract filename from URL')
        return
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
      })

      await this.s3Client.send(command)

      console.log('[Cloudflare R2] File deleted successfully')
    } catch (error: any) {
      console.error('[Cloudflare R2] Delete error:', error)
      // Don't throw - deletion errors shouldn't break the flow
      console.warn('[Cloudflare R2] Failed to delete file, continuing anyway')
    }
  }

  getProviderName(): string {
    return 'Cloudflare R2'
  }
}
