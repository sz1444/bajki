import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/config/supabase'
import { toast } from 'sonner'

/**
 * Zaktualizowany interfejs Story, uwzględniający nowe pola z formularza 
 * oraz wszystkie pola techniczne (zgodne z ostatnią pełną wersją tabeli).
 */
export interface Story {
  id: string
  user_id: string
  title: string
  child_name: string
  child_age: number
  story_genre: string
  story_tone: string
  story_lesson: string
  current_emotional_challenge: string | null 
  favorite_food_place: string | null         
  pet_mascot: string | null                  
  request_dialog_humor: boolean | null       
  siblings_friends: string | null            
  form_data: any
  story_text: string
  audio_url: string | null
  ai_model: string | null
  generation_duration_ms: number | null
  status: 'generating' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  completed_at: string | null
}

export const useStories = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: stories, isLoading, error, refetch } = useQuery({
    queryKey: ['stories', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching stories:', error)
        // If table doesn't exist yet (schema not run), return empty array gracefully
        if (error.message?.includes('does not exist') || error.code === 'PGRST204' || error.code === '42P01') {
          console.warn('Stories table does not exist yet. Please run the SQL schema.')
          return []
        }
        return [] // Return empty array instead of throwing to prevent infinite loading
      }

      return data as Story[]
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1, // Only retry once to avoid long loading times
  })

  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user!.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories', user?.id] })
      toast.success('Bajka została usunięta')
    },
    onError: (error) => {
      console.error('Error deleting story:', error)
      toast.error('Nie udało się usunąć bajki')
    },
  })

  return {
    stories: stories || [],
    isLoading,
    error,
    refetch,
    deleteStory: deleteStoryMutation.mutate,
    isDeletingStory: deleteStoryMutation.isPending,
  }
}