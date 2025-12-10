export class TextToSpeechService {
  private apiKey: string

  constructor() {
    // Initialize credentials for Gemini 2.5 Flash TTS via Google Generative AI
    const apiKey = process.env.GOOGLE_API_KEY

    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is not set')
    }

    this.apiKey = apiKey
  }

  /**
   * Generates WAV audio from text using Gemini 2.5 Flash TTS via Google Generative AI
   * Uses Achernar voice (Polish professional storyteller)
   * Returns audio buffer ready for upload
   *
   * For long texts, splits into chunks and concatenates WAV files
   */
  async generateAudio(text: string): Promise<Buffer> {
    if (!text || text.length < 100) {
      throw new Error('Text is too short to generate audio')
    }

    console.log('[TTS] Generating audio for text length:', text.length, 'characters')

    try {
      // Gemini 2.5 Flash TTS via Vertex AI uses plain text (no SSML)
      // Text limit per request: ~5000 bytes for safety
      // We use 2000 bytes per chunk to ensure reliable processing
      const MAX_BYTES = 2000
      const textBytes = Buffer.byteLength(text, 'utf8')

      console.log(`[TTS] Text size: ${textBytes} bytes (max: ${MAX_BYTES} per chunk)`)

      if (textBytes <= MAX_BYTES) {
        // Single request - text is short enough
        console.log('[TTS] Text fits in single request')
        return await this.generateSingleAudio(text)
      } else {
        // Multiple requests - split text and concatenate audio
        console.log('[TTS] Text too long, splitting into chunks...')
        return await this.generateChunkedAudio(text, MAX_BYTES)
      }

    } catch (error: any) {
      console.error('[TTS] Error generating audio:', error)
      throw new Error(`Text-to-Speech API error: ${error.message}`)
    }
  }

  /**
   * Generates audio for a single text chunk using Gemini 2.5 Flash TTS via Google Generative AI API
   */
  private async generateSingleAudio(text: string): Promise<Buffer> {
    console.log(`[TTS] Generating audio for text length: ${text.length} chars`)

    // Use Google Generative AI API endpoint with correct model name
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${this.apiKey}`

    // Add style instruction for professional storyteller voice
    // Gemini 2.5 TTS uses natural language prompts to control style, pace, and tone
    const styledText = `Przeczytaj tę bajkę głosem profesjonalnego lektora bajek dla dzieci - ciepło, spokojnie, z odpowiednią melodią i emocją. Czytaj jak rodzic czytający dziecku bajkę na dobranoc:\n\n${text}`

    const requestBody = {
      contents: [{
        parts: [{
          text: styledText
        }]
      }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Achernar"
            }
          }
        }
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[TTS] Google Generative AI API error:', errorText)
      throw new Error(`Google Generative AI TTS API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content || !result.candidates[0].content.parts || !result.candidates[0].content.parts[0] || !result.candidates[0].content.parts[0].inlineData) {
      console.error('[TTS] Unexpected API response structure:', JSON.stringify(result, null, 2))
      throw new Error('No audio content received from Google Generative AI TTS API')
    }

    // Audio content is base64 encoded PCM audio (audio/L16;codec=pcm;rate=24000)
    const audioBase64 = result.candidates[0].content.parts[0].inlineData.data
    const audioPCM = Buffer.from(audioBase64, 'base64')

    console.log('[TTS] PCM audio generated, size:', audioPCM.length, 'bytes')

    // Convert PCM to WAV format (simple WAV header + PCM data)
    const wavBuffer = this.pcmToWav(audioPCM, 24000, 16, 1)

    console.log('[TTS] WAV audio generated successfully, size:', wavBuffer.length, 'bytes')

    return wavBuffer
  }

  /**
   * Converts PCM audio data to WAV format by adding WAV header
   * @param pcmData Raw PCM audio data (16-bit little-endian)
   * @param sampleRate Sample rate in Hz (e.g., 24000)
   * @param bitsPerSample Bits per sample (e.g., 16)
   * @param channels Number of channels (1 for mono, 2 for stereo)
   */
  private pcmToWav(pcmData: Buffer, sampleRate: number, bitsPerSample: number, channels: number): Buffer {
    const blockAlign = channels * (bitsPerSample / 8)
    const byteRate = sampleRate * blockAlign
    const dataSize = pcmData.length
    const headerSize = 44
    const fileSize = headerSize + dataSize - 8

    // Create WAV header
    const header = Buffer.alloc(headerSize)

    // RIFF chunk descriptor
    header.write('RIFF', 0)
    header.writeUInt32LE(fileSize, 4)
    header.write('WAVE', 8)

    // fmt sub-chunk
    header.write('fmt ', 12)
    header.writeUInt32LE(16, 16) // fmt chunk size
    header.writeUInt16LE(1, 20) // audio format (1 = PCM)
    header.writeUInt16LE(channels, 22)
    header.writeUInt32LE(sampleRate, 24)
    header.writeUInt32LE(byteRate, 28)
    header.writeUInt16LE(blockAlign, 32)
    header.writeUInt16LE(bitsPerSample, 34)

    // data sub-chunk
    header.write('data', 36)
    header.writeUInt32LE(dataSize, 40)

    // Combine header and PCM data
    return Buffer.concat([header, pcmData])
  }

  /**
   * Splits long text into chunks and generates audio for each
   * Then concatenates all audio chunks into a single WAV file
   */
  private async generateChunkedAudio(text: string, maxBytes: number): Promise<Buffer> {
    // Split text into sentences to avoid cutting mid-sentence
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]

    const chunks: string[] = []
    let currentChunk = ''

    for (const sentence of sentences) {
      const testChunk = currentChunk + sentence
      const testBytes = Buffer.byteLength(testChunk, 'utf8')

      if (testBytes > maxBytes && currentChunk.length > 0) {
        // Current chunk is full, save it and start new one
        chunks.push(currentChunk.trim())
        currentChunk = sentence
      } else {
        currentChunk = testChunk
      }
    }

    // Add remaining text
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim())
    }

    console.log(`[TTS] Split text into ${chunks.length} chunks`)

    // Generate audio for each chunk
    const audioBuffers: Buffer[] = []

    for (let i = 0; i < chunks.length; i++) {
      console.log(`[TTS] Generating chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`)
      const chunkAudio = await this.generateSingleAudio(chunks[i])
      audioBuffers.push(chunkAudio)
    }

    // Concatenate all WAV buffers
    const combinedAudio = await this.concatWavFiles(audioBuffers)
    console.log('[TTS] Combined audio size:', combinedAudio.length, 'bytes')

    return combinedAudio
  }


  /**
   * Concatenates multiple WAV buffers into a single WAV file
   * Strips WAV headers from all but the first file and combines audio data
   */
  private async concatWavFiles(audioBuffers: Buffer[]): Promise<Buffer> {
    if (audioBuffers.length === 0) {
      throw new Error('No audio buffers to concatenate')
    }

    if (audioBuffers.length === 1) {
      // Only one chunk, no need to concatenate
      return audioBuffers[0]
    }

    console.log(`[TTS] Concatenating ${audioBuffers.length} WAV audio chunks...`)

    // Extract audio data from all WAV files (skip 44-byte header)
    const headerSize = 44
    const audioDataChunks = audioBuffers.map(buffer => buffer.slice(headerSize))

    // Combine all audio data
    const combinedAudioData = Buffer.concat(audioDataChunks)

    // Create new WAV header with combined size
    const firstWavHeader = audioBuffers[0].slice(0, headerSize)
    const newHeader = Buffer.from(firstWavHeader)

    // Update file size in RIFF header
    const fileSize = headerSize + combinedAudioData.length - 8
    newHeader.writeUInt32LE(fileSize, 4)

    // Update data chunk size
    newHeader.writeUInt32LE(combinedAudioData.length, 40)

    // Combine new header with all audio data
    const combinedAudio = Buffer.concat([newHeader, combinedAudioData])

    console.log(`[TTS] ✓ WAV concatenation successful, output size: ${combinedAudio.length} bytes`)

    return combinedAudio
  }

  /**
   * Estimates audio duration in seconds based on text length
   * Useful for displaying approximate duration to users
   */
  estimateAudioDuration(text: string): number {
    // At 0.85 speed, approximately 105-115 words per minute (vs 150-180 at normal speed)
    const wordsPerMinute = 110
    const wordCount = text.split(/\s+/).length
    const durationMinutes = wordCount / wordsPerMinute
    const durationSeconds = Math.ceil(durationMinutes * 60)

    return durationSeconds
  }
}
