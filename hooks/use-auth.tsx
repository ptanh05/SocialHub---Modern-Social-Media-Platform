'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

interface User {
    id: string
    email: string
    username: string
    name: string
    bio?: string
    avatar?: string
    isVerified?: boolean
    badge?: string
}

interface AuthContextType {
    user: User | null
    loading: boolean
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    register: (email: string, username: string, password: string, name: string) => Promise<void>
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    // Prevent multiple simultaneous refresh calls
    const [refreshLock, setRefreshLock] = useState(false)

    // Fetch full user from /api/auth/me — use this AFTER login/register
    const refreshUser = useCallback(async () => {
        if (refreshLock) return
        setRefreshLock(true)
        try {
            const res = await fetch('/api/auth/me', {
                credentials: 'include',
            })
            if (res.ok) {
                const data = await res.json()
                setUser(data)
            } else {
                setUser(null)
            }
        } catch (err) {
            console.error('refreshUser error:', err)
            setUser(null)
        } finally {
            setLoading(false)
            setRefreshLock(false)
        }
    }, [refreshLock])

    // Init — chỉ chạy 1 lần khi mount
    useEffect(() => {
        refreshUser()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const login = async (email: string, password: string) => {
        setLoading(true)
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        })

        if (!res.ok) {
            setLoading(false)
            const error = await res.json()
            throw new Error(error.error || 'Đăng nhập thất bại')
        }

        // Sau login thành công, fetch full user từ /api/auth/me
        await refreshUser()
    }

    const register = async (email: string, username: string, password: string, name: string) => {
        setLoading(true)
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, username, password, name }),
        })

        if (!res.ok) {
            setLoading(false)
            const error = await res.json()
            throw new Error(error.error || 'Đăng ký thất bại')
        }

        // Sau register thành công, fetch full user từ /api/auth/me
        await refreshUser()
    }

    const logout = async () => {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        })
        setUser(null)
        setLoading(false)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
