"use client"

import { useRef, useEffect } from "react"
import { useStore } from "@/lib/store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { PanelLeft, PanelRight } from "lucide-react"
import ChatInput from "@/components/chat-input"
import MessageComponent from "@/components/message"
import { v4 as uuidv4 } from "uuid"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function ChatArea() {
  const {
    leftSidebarOpen,
    rightSidebarOpen,
    setLeftSidebarOpen,
    setRightSidebarOpen,
    chats,
    activeChat,
    addMessage,
    addTodo,
  } = useStore()

  const isMobile = useMediaQuery("(max-width: 768px)")

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const currentChat = chats.find((chat) => chat.id === activeChat)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [currentChat?.messages])

  const handleSendMessage = async (content: string) => {
    if (!currentChat) return

    // On mobile, close sidebars when sending a message
    if (isMobile) {
      setLeftSidebarOpen(false)
      setRightSidebarOpen(false)
    }

    // Add user message
    addMessage(currentChat.id, {
      content,
      role: "user",
    })

    // If this is the todo chat, add the message as a todo
    if (currentChat.isDefault) {
      addTodo(content)
      addMessage(currentChat.id, {
        content: `Added "${content}" to your to-do list.`,
        role: "assistant",
      })
      return
    }

    // Create a temporary loading message ID
    const loadingMessageId = uuidv4()

    // Add loading message
    addMessage(currentChat.id, {
      id: loadingMessageId,
      content: "Loading...",
      role: "assistant",
      createdAt: new Date().toISOString(),
    })

    try {
      // Prepare messages for the API
      // Get the updated chat with the new user message
      const updatedChat = useStore.getState().chats.find((chat) => chat.id === currentChat.id)
      if (!updatedChat) throw new Error("Chat not found")

      // Filter out loading messages and format for the API
      const apiMessages = updatedChat.messages
        .filter((msg) => msg.content !== "Loading..." && msg.id !== loadingMessageId)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))

      // Ensure we have at least the user's message
      if (apiMessages.length === 0) {
        throw new Error("No messages to send to API")
      }

      // Add a system message if this is the first message in the chat
      const messagesForApi =
        apiMessages.length === 1 && apiMessages[0].role === "user"
          ? [{ role: "system", content: "You are a helpful assistant." }, ...apiMessages]
          : apiMessages

      console.log("Sending messages to API:", JSON.stringify(messagesForApi))

      // For regular chats, send to AI API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesForApi,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API error:", errorData)
        throw new Error(errorData.error || "Failed to fetch response")
      }

      const data = await response.json()

      // Replace the loading message with the actual response
      const updatedChats = useStore.getState().chats.map((chat) => {
        if (chat.id === currentChat.id) {
          const updatedMessages = chat.messages.map((msg) => {
            if (msg.id === loadingMessageId) {
              return {
                ...msg,
                content: data.content,
              }
            }
            return msg
          })

          return {
            ...chat,
            messages: updatedMessages,
          }
        }
        return chat
      })

      // Update the store with the new chats
      useStore.setState({ chats: updatedChats })
    } catch (error) {
      console.error("Error sending message:", error)

      // Replace loading message with error message
      const updatedChats = useStore.getState().chats.map((chat) => {
        if (chat.id === currentChat.id) {
          const updatedMessages = chat.messages.map((msg) => {
            if (msg.id === loadingMessageId) {
              return {
                ...msg,
                content: `Error: ${error.message || "Failed to get response from AI"}. Please try again.`,
              }
            }
            return msg
          })

          return {
            ...chat,
            messages: updatedMessages,
          }
        }
        return chat
      })

      // Update the store with the new chats
      useStore.setState({ chats: updatedChats })
    }
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Header with toggle buttons */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {/* Left sidebar toggle button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          aria-label={leftSidebarOpen ? "Hide chat list" : "Show chat list"}
          title={leftSidebarOpen ? "Hide chat list" : "Show chat list"}
        >
          <PanelLeft className="h-5 w-5" />
        </Button>

        <h2 className="text-lg font-semibold truncate max-w-[60%]">{currentChat?.name || "Select a chat"}</h2>

        {/* Right sidebar toggle button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          aria-label={rightSidebarOpen ? "Hide to-do list" : "Show to-do list"}
          title={rightSidebarOpen ? "Hide to-do list" : "Show to-do list"}
        >
          <PanelRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {!currentChat || currentChat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {currentChat?.isDefault
              ? "This is your To-Do chat. Any message you send here will be added to your to-do list."
              : "Send a message to start chatting."}
          </div>
        ) : (
          <div className="space-y-6">
            {currentChat.messages.map((message) => (
              <MessageComponent key={message.id} message={message} />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input area */}
      <div className="p-4 border-t border-border">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  )
}
