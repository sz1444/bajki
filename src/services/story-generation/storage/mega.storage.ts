import { Storage, File } from 'megajs'
import { IStorageService } from '../storage.service'

export class MegaStorageService implements IStorageService {
  private storage: Storage | null = null
  private folderName = 'bajki-audio'

  /**
   * Connects to Mega.nz with credentials from environment
   */
  private async connect(): Promise<Storage> {
    if (this.storage) {
      return this.storage
    }

    const email = process.env.MEGA_EMAIL
    const password = process.env.MEGA_PASSWORD

    if (!email || !password) {
      throw new Error('MEGA_EMAIL and MEGA_PASSWORD environment variables are required')
    }

    console.log('[Mega] Connecting to Mega.nz...')

    try {
      this.storage = await new Storage({
        email,
        password,
        // userAgent: 'Bajki-App/1.0', // Optional: identify your app
      }).ready

      console.log('[Mega] Connected successfully')
      return this.storage

    } catch (error: any) {
      console.error('[Mega] Connection error:', error)
      throw new Error(`Failed to connect to Mega.nz: ${error.message}`)
    }
  }

  /**
   * Gets or creates the folder for storing audio files
   */
  private async getOrCreateFolder(storage: Storage): Promise<any> {
    // Check if folder already exists
    let folder = storage.root.children?.find((c: any) => c.name === this.folderName)

    if (!folder) {
      console.log(`[Mega] Creating folder: ${this.folderName}`)
      folder = await storage.mkdir(this.folderName)
    }

    return folder
  }

  /**
   * Uploads audio file to Mega.nz
   */
  async uploadAudio(
    audioBuffer: Buffer,
    filename: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    console.log('[Mega] Starting upload:', filename, 'Size:', audioBuffer.length, 'bytes')

    try {
      const storage = await this.connect()
      const folder = await this.getOrCreateFolder(storage)

      // Upload file to folder
      const uploadStream = storage.upload({
        name: filename,
        size: audioBuffer.length,
        attributes: metadata || {},
      }, audioBuffer, folder)

      // Wait for upload to complete
      const file: File = await uploadStream.complete

      console.log('[Mega] Upload completed:', filename)

      // Generate public link
      const link = await file.link()
      console.log('[Mega] Public link generated:', link)

      return link

    } catch (error: any) {
      console.error('[Mega] Upload error:', error)
      throw new Error(`Failed to upload to Mega.nz: ${error.message}`)
    }
  }

  /**
   * Deletes audio file from Mega.nz
   * Note: Requires parsing the file ID from URL
   */
  async deleteAudio(url: string): Promise<void> {
    console.log('[Mega] Deleting file with URL:', url)

    try {
      const storage = await this.connect()

      // Parse file ID from Mega URL
      // Mega URLs look like: https://mega.nz/file/FILE_ID#KEY
      const match = url.match(/file\/([^#]+)/)
      if (!match) {
        throw new Error('Invalid Mega.nz URL format')
      }

      const fileId = match[1]

      // Find file in storage
      const folder = await this.getOrCreateFolder(storage)
      const file = folder.children?.find((f: any) => f.nodeId === fileId)

      if (!file) {
        console.warn('[Mega] File not found, might be already deleted')
        return
      }

      // Delete file
      await file.delete()
      console.log('[Mega] File deleted successfully')

    } catch (error: any) {
      console.error('[Mega] Delete error:', error)
      // Don't throw - deletion errors shouldn't break the flow
      console.warn('[Mega] Failed to delete file, continuing anyway')
    }
  }

  getProviderName(): string {
    return 'Mega.nz'
  }
}
