import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from './AuthModal'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, User, Settings } from 'lucide-react'
import { toast } from 'sonner'

export const AuthButton = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleSignOut = async () => {
    try {
      console.log('Starting signOut...')
      await signOut()
      console.log('SignOut completed')
      toast.success('Wylogowano pomyślnie')

      // Small delay to ensure toast is visible before reload
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
    } catch (error) {
      console.error('Error in handleSignOut:', error)
      toast.error('Błąd podczas wylogowywania')
      // Force reload anyway to clear state
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    }
  }

  if (!user) {
    return (
      <>
        <Button onClick={() => setShowAuthModal(true)} variant="hero" size="default">
          Zaloguj się
        </Button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    )
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email?.[0].toUpperCase() || 'U'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url} alt={profile?.full_name || user.email || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white border-secondary" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.full_name || 'Użytkownik'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/dashboard')}>
          <User className="mr-2 h-4 w-4" />
          <span>Mój Panel</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/dashboard')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Ustawienia</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Wyloguj się</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
