import { useState } from 'react'
import { formatDistance } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { BookOpen, Download, FileText, Trash2, Loader2, Music } from 'lucide-react'
import { Story } from '@/lib/hooks/useStories'
import { AudioPlayer } from './AudioPlayer'

interface StoryCardProps {
  story: Story
  onDelete: (id: string) => void
}

export const StoryCard = ({ story, onDelete }: StoryCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const downloadFile = (url: string | null, type: 'audio' | 'pdf') => {
    if (!url) return

    const link = document.createElement('a')
    link.href = url
    link.download = `${story.title}-${story.child_name}.${type === 'audio' ? 'mp3' : 'pdf'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getGenreBadgeColor = (genre: string) => {
    const colors: Record<string, string> = {
      przygodowa: 'bg-blue-100 text-blue-800',
      fantastyczna: 'bg-purple-100 text-purple-800',
      edukacyjna: 'bg-green-100 text-green-800',
      relaksacyjna: 'bg-teal-100 text-teal-800',
    }
    return colors[genre.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="aspect-video bg-gradient-to-br from-primary via-primary/80 to-accent rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <BookOpen className="w-16 h-16 text-white relative z-10" />
          </div>

          <h3 className="font-bold text-lg mb-2 line-clamp-1">
            Przygoda {story.child_name}
          </h3>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={getGenreBadgeColor(story.story_genre)}>
              {story.story_genre}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {story.child_age} lat
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistance(new Date(story.created_at), new Date(), {
                addSuffix: true,
                locale: pl,
              })}
            </span>
          </div>

          {story.status === 'completed' && story.audio_url && (
            <>
              <div className="mb-4">
                <AudioPlayer audioUrl={story.audio_url} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadFile(story.audio_url, 'audio')}
                  className="w-full"
                >
                  <Download className="w-3 h-3 mr-1" />
                  MP3
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full border border-red-100 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </>
          )}

          {story.status === 'generating' && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4 border-t">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generowanie bajki...</span>
            </div>
          )}

          {story.status === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                Wystąpił błąd podczas generowania bajki.
              </p>
              {story.error_message && (
                <p className="text-xs text-red-600 mt-1">{story.error_message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę bajkę?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Bajka "{story.title}" zostanie trwale usunięta
              wraz z plikami audio i PDF.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(story.id)
                setShowDeleteDialog(false)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Usuń bajkę
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
