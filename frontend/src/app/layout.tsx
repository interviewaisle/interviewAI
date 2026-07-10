import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { buildCssVars } from '@/styles/colors'
import '@/styles/globals.css'
import 'xterm/css/xterm.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-ui',
  display: 'swap',
})

// Prevents flash of wrong theme before React hydrates
const themeScript = `(function(){var t=localStorage.getItem('iai-theme');if(t==='light'){document.documentElement.classList.remove('dark');}else if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}})();`

export const metadata: Metadata = {
  title: 'InterviewAI',
  description: 'Interactive AI engineering learning platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full`} suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <style dangerouslySetInnerHTML={{ __html: buildCssVars() }} />
      </head>
      <body className="bg-surface text-foreground min-h-full antialiased">{children}</body>
    </html>
  )
}
