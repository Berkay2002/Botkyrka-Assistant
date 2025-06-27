import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Botkyrka Assist",
  description: "Multilingual Q&A assistant for Botkyrka kommun - Get answers in Swedish, English, Somali, Arabic, Turkish and more",
  generator: 'Botkyrka Kommune',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <body className={cn("flex min-h-svh flex-col antialiased", inter.className)}>
        <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
      </body>
    </html>
  )
}

import './globals.css'