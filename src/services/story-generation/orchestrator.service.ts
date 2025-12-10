import { createClient } from '@supabase/supabase-js'
import { GeminiService, StoryFormData } from './gemini.service'
import { TextToSpeechService } from './text-to-speech.service'
import { getStorageService } from './storage.service'
import { EmailService } from '../email/email.service'

interface Story {
  id: string
  user_id: string
  child_name: string
  child_age: number
  story_genre: string
  story_tone: string
  story_lesson: string
  current_emotional_challenge?: string | null
  favorite_food_place?: string | null
  pet_mascot?: string | null
  request_dialog_humor?: boolean | null
  siblings_friends?: string | null
  status: string
  form_data?: any
}

export class StoryGenerationOrchestrator {
  private supabase: ReturnType<typeof createClient>
  private geminiService: GeminiService
  private ttsService: TextToSpeechService
  private emailService: EmailService

  constructor() {
    // Initialize Supabase with service role key (has full access)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Initialize services
    this.geminiService = new GeminiService()
    this.ttsService = new TextToSpeechService()
    this.emailService = new EmailService()
  }

  /**
   * Main orchestration method - processes story from start to finish
   * 1. Fetch story from database
   * 2. Generate text with Gemini
   * 3. Generate audio with TTS
   * 4. Upload to storage
   * 5. Update database with results
   */
  async processStory(storyId: string): Promise<void> {
    const startTime = Date.now()
    console.log(`\n========================================`)
    console.log(`[Orchestrator] Starting story generation`)
    console.log(`[Orchestrator] Story ID: ${storyId}`)
    console.log(`========================================\n`)

    try {
      // Step 1: Fetch story from database
      const story = await this.fetchStory(storyId)
      console.log(`[Orchestrator] Story fetched for child: ${story.child_name}, age: ${story.child_age}`)

      // Step 2: Generate story text with Gemini
      console.log(`\n[Orchestrator] Step 1/3: Generating text with Gemini...`)
      const storyText = await this.generateStoryText(story)
      console.log(`[Orchestrator] ✓ Text generated (${storyText.length} characters)`)

      // Update database with generated text
      await this.updateStory(storyId, {
        story_text: storyText,
        ai_model: 'gemini-pro',
      })

      // Step 3: Generate audio with Google Cloud TTS
      console.log(`\n[Orchestrator] Step 2/3: Generating audio with TTS...`)
      const audioBuffer = await this.ttsService.generateAudio(storyText)
      const estimatedDuration = this.ttsService.estimateAudioDuration(storyText)
      console.log(`[Orchestrator] ✓ Audio generated (${audioBuffer.length} bytes, ~${Math.round(estimatedDuration / 60)} minutes)`)

      // Step 4: Upload to storage
      console.log(`\n[Orchestrator] Step 3/3: Uploading to storage...`)
      const storageService = getStorageService()
      const filename = `story-${storyId}-${Date.now()}.mp3`
      const audioUrl = await storageService.uploadAudio(audioBuffer, filename, {
        story_id: storyId,
        user_id: story.user_id,
      })
      console.log(`[Orchestrator] ✓ Audio uploaded to ${storageService.getProviderName()}`)
      console.log(`[Orchestrator] URL: ${audioUrl}`)

      // Step 5: Update database with completed status
      const totalDuration = Date.now() - startTime
      await this.updateStory(storyId, {
        audio_url: audioUrl,
        status: 'completed',
        completed_at: new Date().toISOString(),
        generation_duration_ms: totalDuration,
      })

      console.log(`\n========================================`)
      console.log(`[Orchestrator] ✓ Story generation completed!`)
      console.log(`[Orchestrator] Total time: ${Math.round(totalDuration / 1000)}s`)
      console.log(`========================================\n`)

      // Optional: Send success notification
      await this.emailService.sendSuccessNotification(storyId, totalDuration)

    } catch (error: any) {
      console.error(`\n========================================`)
      console.error(`[Orchestrator] ✗ Story generation FAILED`)
      console.error(`[Orchestrator] Story ID: ${storyId}`)
      console.error(`[Orchestrator] Error:`, error.message)
      console.error(`========================================\n`)

      // Update database with error status
      await this.updateStory(storyId, {
        status: 'failed',
        error_message: error.message || 'Unknown error occurred',
        completed_at: new Date().toISOString(),
      })

      // Send error notification to admin
      await this.sendErrorEmail(storyId, error)

      // Re-throw error for API endpoint to handle
      throw error
    }
  }

  /**
   * Fetches story from database
   */
  private async fetchStory(storyId: string): Promise<Story> {
    const { data, error } = await this.supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single()

    if (error || !data) {
      throw new Error(`Story not found: ${storyId}`)
    }

    if (data.status !== 'generating') {
      throw new Error(`Story is not in generating status: ${data.status}`)
    }

    return data as Story
  }

  /**
   * Generates story text using Gemini
   */
  private async generateStoryText(story: Story): Promise<string> {
    const storyData: StoryFormData = {
      childName: story.child_name,
      childAge: story.child_age,
      storyGenre: story.story_genre,
      storyTone: story.story_tone,
      storyLesson: story.story_lesson,
      currentEmotionalChallenge: story.current_emotional_challenge,
      favoriteFoodPlace: story.favorite_food_place,
      petMascot: story.pet_mascot,
      requestDialogHumor: story.request_dialog_humor || false,
      siblingsFriends: story.siblings_friends,
    }

    return await this.geminiService.generateStory(storyData)
  }

  /**
   * Updates story in database
   */
  private async updateStory(
    storyId: string,
    updates: Partial<Story> & { [key: string]: any }
  ): Promise<void> {
    const { error } = await this.supabase
      .from('stories')
      .update(updates)
      .eq('id', storyId)

    if (error) {
      console.error('[Orchestrator] Database update error:', error)
      throw new Error(`Failed to update story: ${error.message}`)
    }
  }

  /**
   * Sends error notification email to admin
   */
  private async sendErrorEmail(storyId: string, error: Error): Promise<void> {
    try {
      // Fetch story details for email
      const { data: story } = await this.supabase
        .from('stories')
        .select('user_id, child_name, child_age')
        .eq('id', storyId)
        .single()

      await this.emailService.sendAdminAlert({
        subject: `Story Generation Failed: ${storyId}`,
        body: `
Story Generation Error Report
==============================

Story ID: ${storyId}
User ID: ${story?.user_id || 'Unknown'}
Child Name: ${story?.child_name || 'Unknown'}
Child Age: ${story?.child_age || 'Unknown'}
Time: ${new Date().toISOString()}

Error Message:
${error.message}

Stack Trace:
${error.stack || 'No stack trace available'}

Please check the application logs for more details.
        `,
        storyId,
        userId: story?.user_id,
      })
    } catch (emailError) {
      // Don't fail if email fails
      console.error('[Orchestrator] Failed to send error email:', emailError)
    }
  }
}
