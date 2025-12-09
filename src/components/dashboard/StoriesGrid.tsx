import { StoryCard } from './StoryCard'
import { Story } from '@/lib/hooks/useStories'

interface StoriesGridProps {
  stories: Story[]
  onDeleteStory: (id: string) => void
}

export const StoriesGrid = ({ stories, onDeleteStory }: StoriesGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} onDelete={onDeleteStory} />
      ))}
    </div>
  )
}
