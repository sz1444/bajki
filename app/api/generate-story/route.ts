import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { StoryGenerationOrchestrator } from '@/services/story-generation/orchestrator.service'

/**
 * POST /api/generate-story
 *
 * Triggers story generation process in the background
 * Called immediately after story is created in database
 *
 * Request body:
 * {
 *   "storyId": "uuid-of-story"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Story generation started",
 *   "storyId": "uuid"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { storyId } = body

    // Validate storyId
    if (!storyId || typeof storyId !== 'string') {
      return NextResponse.json(
        { error: 'storyId is required and must be a string' },
        { status: 400 }
      )
    }

    console.log('[API] Received story generation request for:', storyId)

    // Initialize Supabase to verify story exists
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify story exists and is in correct status
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('id, user_id, status')
      .eq('id', storyId)
      .single()

    if (fetchError || !story) {
      console.error('[API] Story not found:', storyId, fetchError)
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    if (story.status !== 'generating') {
      console.warn('[API] Story is not in generating status:', story.status)
      return NextResponse.json(
        { error: `Story is not in generating status (current: ${story.status})` },
        { status: 400 }
      )
    }

    console.log('[API] Story verified, starting background processing...')

    // Start background processing (fire and forget)
    // Don't await - return immediately to user
    const orchestrator = new StoryGenerationOrchestrator()

    // Run in background without blocking the response
    orchestrator.processStory(storyId).catch((error) => {
      // Error handling is done inside orchestrator
      // This catch prevents unhandled promise rejection
      console.error('[API] Background processing error (caught):', error.message)
    })

    console.log('[API] Background processing started for:', storyId)

    // Return success immediately
    return NextResponse.json(
      {
        success: true,
        message: 'Story generation started in background',
        storyId,
      },
      { status: 202 } // 202 Accepted (processing started)
    )

  } catch (error: any) {
    console.error('[API] Error in generate-story endpoint:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/generate-story?storyId=xxx
 *
 * Optional: Check status of story generation
 * Useful for debugging or monitoring
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const storyId = searchParams.get('storyId')

    if (!storyId) {
      return NextResponse.json(
        { error: 'storyId query parameter is required' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: story, error } = await supabase
      .from('stories')
      .select('id, status, audio_url, error_message, generation_duration_ms, completed_at')
      .eq('id', storyId)
      .single()

    if (error || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      storyId: story.id,
      status: story.status,
      audioUrl: story.audio_url,
      errorMessage: story.error_message,
      durationMs: story.generation_duration_ms,
      completedAt: story.completed_at,
    })

  } catch (error: any) {
    console.error('[API] Error checking story status:', error)

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
