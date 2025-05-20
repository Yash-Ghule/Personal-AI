"use client"

import { useEffect } from "react"
import { useStore } from "@/lib/store"
import LeftSidebar from "@/components/left-sidebar"
import ChatArea from "@/components/chat-area"
import TodoPanel from "@/components/todo-panel"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function Home() {
  const { initializeStore, activeChat, setActiveChat, chats, setLeftSidebarOpen, setRightSidebarOpen } = useStore()

  const isMobile = useMediaQuery("(max-width: 768px)")

  // Initialize the store on client-side
  useEffect(() => {
    initializeStore()
  }, [initializeStore])

  // Set the first chat as active if none is selected
  useEffect(() => {
    if (chats.length > 0 && !activeChat) {
      setActiveChat(chats[0].id)
    }
  }, [chats, activeChat, setActiveChat])

  // Close sidebars on mobile by default
  useEffect(() => {
    if (isMobile) {
      setLeftSidebarOpen(false)
      setRightSidebarOpen(false)
    }
  }, [isMobile, setLeftSidebarOpen, setRightSidebarOpen])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full relative">
          <div className="absolute top-4 right-4 z-10">
            <ThemeToggle />
          </div>
          <ChatArea />
        </div>

        {/* Right Sidebar (Todo Panel) */}
        <TodoPanel />
      </div>
    </ThemeProvider>
  )
}
