import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fleet Dispatch',
  description: 'Fleet management dispatch board',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-background text-foreground antialiased min-h-screen">
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar />
            <div className="flex flex-col flex-1 min-w-0">
              <header className="h-12 flex items-center gap-3 px-4 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
                <SidebarTrigger className="h-7 w-7" />
                <div className="h-4 w-px bg-border" />
                <span className="text-sm text-muted-foreground">Fleet Corp</span>
              </header>
              <main className="flex-1">
                {children}
              </main>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  )
}
