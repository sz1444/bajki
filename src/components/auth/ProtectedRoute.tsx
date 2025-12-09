"use client";

import { ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from './AuthModal'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requireSubscription?: boolean
}

export const ProtectedRoute = ({
  children,
  requireSubscription = false
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const router = useRouter()

  // Handle redirect when not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [loading, user, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Ładowanie...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show auth modal
  if (!user) {
    return <AuthModal isOpen={true} onClose={() => setShowAuthModal(false)} />
  }

  // TODO: Add subscription check when subscription system is implemented
  // if (requireSubscription && !hasActiveSubscription) {
  //   router.push('/checkout')
  //   return null
  // }

  return <>{children}</>
}

export default ProtectedRoute
