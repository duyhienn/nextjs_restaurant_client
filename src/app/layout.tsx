import type { Metadata } from 'next'
import { Inter, Roboto_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import AppProvider from '@/components/app-provider'
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

export const metadata: Metadata = {
  title: 'Big Boy Restaurant',
  description: 'The best restaurant in the world',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable, roboto_mono.variable)}>
        <AppProvider>
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  )
}
