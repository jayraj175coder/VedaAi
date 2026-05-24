'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { joinUserRoom } from '@/services/socket'

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, login, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user) {
      joinUserRoom(user.id)
    }
  }, [isAuthenticated, user])

  const requireAuth = () => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login')
      return false
    }
    return true
  }

  return { user, token, isAuthenticated, isLoading, login, logout, requireAuth }
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  return { isAuthenticated, isLoading }
}
