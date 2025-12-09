import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BookOpen, Sparkles } from 'lucide-react'

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-primary/10 rounded-full p-6 mb-6">
        <BookOpen className="w-16 h-16 text-primary" />
      </div>

      <h3 className="text-2xl font-bold mb-2">Nie masz jeszcze żadnych bajek</h3>

      <p className="text-muted-foreground mb-8 max-w-md">
        Stwórz swoją pierwszą magiczną bajkę spersonalizowaną dla Twojego dziecka.
        Zajmie to tylko chwilę!
      </p>

      <Button asChild variant="hero" size="lg" className="gap-2">
        <Link to="/stworz-bajke">
          <Sparkles className="w-5 h-5" />
          Stwórz Pierwszą Bajkę
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl">
        <div className="text-center">
          <div className="bg-teal-100 rounded-lg p-3 inline-flex mb-3">
            <span className="text-2xl">🎭</span>
          </div>
          <h4 className="font-semibold mb-1">Spersonalizowane</h4>
          <p className="text-sm text-muted-foreground">
            Każda bajka tworzona specjalnie dla Twojego dziecka
          </p>
        </div>

        <div className="text-center">
          <div className="bg-purple-100 rounded-lg p-3 inline-flex mb-3">
            <span className="text-2xl">🎧</span>
          </div>
          <h4 className="font-semibold mb-1">Z Lektorem AI</h4>
          <p className="text-sm text-muted-foreground">
            Profesjonalny głos z emocjami i ekspresją
          </p>
        </div>

        <div className="text-center">
          <div className="bg-blue-100 rounded-lg p-3 inline-flex mb-3">
            <span className="text-2xl">📚</span>
          </div>
          <h4 className="font-semibold mb-1">Do Pobrania</h4>
          <p className="text-sm text-muted-foreground">
            Pliki MP3 i PDF zawsze dostępne
          </p>
        </div>
      </div>
    </div>
  )
}
