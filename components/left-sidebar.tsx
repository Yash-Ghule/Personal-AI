"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2, Edit2, Check, X, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function LeftSidebar() {
  const { leftSidebarOpen, setLeftSidebarOpen, chats, activeChat, setActiveChat, createChat, deleteChat, renameChat } =
    useStore()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const startEditing = (chatId: string, currentName: string) => {
    setEditingChatId(chatId)
    setEditingName(currentName)
  }

  const saveEdit = () => {
    if (editingChatId && editingName.trim()) {
      renameChat(editingChatId, editingName)
      setEditingChatId(null)
    }
  }

  const cancelEdit = () => {
    setEditingChatId(null)
  }

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId)
    // On mobile, close the sidebar after selecting a chat
    if (isMobile) {
      setLeftSidebarOpen(false)
    }
  }

  // If sidebar is closed, don't render anything
  if (!leftSidebarOpen) {
    return null
  }

  return (
    <div
      className={cn(
        "w-64 border-r border-border bg-card flex flex-col h-full",
        isMobile && "absolute left-0 top-0 z-50 h-full",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Chats</h2>
      </div>

      <div className="p-2">
        <Button
          className="w-full justify-start gap-2"
          onClick={createChat}
          aria-label="Create new chat"
          title="Create new chat"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 py-2">
          {chats
            .sort((a, b) => new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime())
            .map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group flex flex-col p-2 rounded-md cursor-pointer",
                  activeChat === chat.id ? "bg-accent" : "hover:bg-accent/50",
                )}
                onClick={() => handleChatSelect(chat.id)}
              >
                <div className="flex items-center justify-between">
                  {editingChatId === chat.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-7 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit()
                          if (e.key === "Escape") cancelEdit()
                        }}
                      />
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            saveEdit()
                          }}
                          aria-label="Save chat name"
                          title="Save chat name"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            cancelEdit()
                          }}
                          aria-label="Cancel editing"
                          title="Cancel editing"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium truncate">{chat.name}</span>
                      </div>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                        {!chat.isDefault && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditing(chat.id, chat.name)
                              }}
                              aria-label="Rename chat"
                              title="Rename chat"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteChat(chat.id)
                              }}
                              aria-label="Delete chat"
                              title="Delete chat"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>Created: {format(new Date(chat.createdAt), "MMM d, yyyy")}</span>
                  <span>Last: {format(new Date(chat.lastVisited), "MMM d")}</span>
                </div>
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  )
}
