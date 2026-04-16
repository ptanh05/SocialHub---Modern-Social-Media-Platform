import { AuthProvider } from '@/hooks/use-auth'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'SocialHub - Connect & Share',
    description:
        'A modern social media platform for connecting with friends and sharing your thoughts',
    generator: 'theanh.dev',
    icons: {
        icon: [
            {
                url: '/icon-light-32x32.png',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: '/icon-dark-32x32.png',
                media: '(prefers-color-scheme: dark)',
            },
            {
                url: '/icon.svg',
                type: 'image/svg+xml',
            },
        ],
        apple: '/apple-icon.png',
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang='en' className='bg-background'>
            <body className='font-sans antialiased'>
                <AuthProvider>{children}</AuthProvider>
                {process.env.NODE_ENV === 'production' && <Analytics />}
            </body>
        </html>
    )
}
