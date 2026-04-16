'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

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

    // 🔥 FETCH USER (CORE FIX)
    const refreshUser = async () => {
        try {
            const res = await fetch('/api/auth/me', {
                credentials: 'include', // 🔥 QUAN TRỌNG
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
        }
    }

    // 🔥 INIT APP
    useEffect(() => {
        refreshUser()
    }, [])

    // 🔥 POLLING (optional nhưng tốt)
    useEffect(() => {
        const interval = setInterval(
            async () => {
                try {
                    const res = await fetch('/api/auth/me', {
                        credentials: 'include',
                    })

                    if (res.status === 401) {
                        setUser(null)
                    } else if (res.ok) {
                        const data = await res.json()
                        setUser(data)
                    }
                } catch (err) {
                    console.error('Polling error:', err)
                }
            },
            5 * 60 * 1000,
        )

        return () => clearInterval(interval)
    }, [])

    // 🔥 REGISTER
    const register = async (email: string, username: string, password: string, name: string) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // 🔥 FIX
            body: JSON.stringify({ email, username, password, name }),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Registration failed')
        }

        const data = await res.json()
        setUser(data.user)
    }

    // 🔥 LOGIN
    const login = async (email: string, password: string) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // 🔥 FIX
            body: JSON.stringify({ email, password }),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Login failed')
        }

        const data = await res.json()
        setUser(data.user)
    }

    // 🔥 LOGOUT
    const logout = async () => {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include', // 🔥 FIX
        })

        setUser(null)
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

// 🔥 HOOK
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
