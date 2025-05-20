"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { v4 as uuidv4 } from "uuid"

export type Message = {
  id: string
  content: string
  role: "user" | "assistant" | "system"
  createdAt: string
}

export type Chat = {
  id: string
  name: string
  messages: Message[]
  createdAt: string
  lastVisited: string
  isDefault?: boolean
}

export type Todo = {
  id: string
  content: string
  completed: boolean
  createdAt: string
}

interface StoreState {
  // UI state
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  setLeftSidebarOpen: (open: boolean) => void
  setRightSidebarOpen: (open: boolean) => void

  // Chat state
  chats: Chat[]
  activeChat: string | null
  setActiveChat: (id: string) => void
  createChat: () => void
  deleteChat: (id: string) => void
  renameChat: (id: string, name: string) => void
  addMessage: (
    chatId: string,
    message: Partial<Message> & { content: string; role: "user" | "assistant" | "system" },
  ) => void

  // Todo state
  todos: Todo[]
  addTodo: (content: string) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void

  // Initialization
  initializeStore: () => void
}

// Create a separate store for UI state
const createUIStore = () => {
  let state = {
    leftSidebarOpen: true,
    rightSidebarOpen: true,
  }

  return {
    getState: () => state,
    setState: (newState: Partial<typeof state>) => {
      state = { ...state, ...newState }
      return state
    },
  }
}

const uiStore = createUIStore()

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // UI state
      leftSidebarOpen: uiStore.getState().leftSidebarOpen,
      rightSidebarOpen: uiStore.getState().rightSidebarOpen,
      setLeftSidebarOpen: (open) => {
        uiStore.setState({ leftSidebarOpen: open })
        set({ leftSidebarOpen: open })
      },
      setRightSidebarOpen: (open) => {
        uiStore.setState({ rightSidebarOpen: open })
        set({ rightSidebarOpen: open })
      },

      // Chat state
      chats: [],
      activeChat: null,
      setActiveChat: (id) => {
        set({ activeChat: id })
        // Update lastVisited timestamp
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === id ? { ...chat, lastVisited: new Date().toISOString() } : chat,
          ),
        }))
      },
      createChat: () => {
        const newChat: Chat = {
          id: uuidv4(),
          name: "New Chat",
          messages: [],
          createdAt: new Date().toISOString(),
          lastVisited: new Date().toISOString(),
        }
        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChat: newChat.id,
        }))
      },
      deleteChat: (id) => {
        const { chats, activeChat } = get()
        const filteredChats = chats.filter((chat) => chat.id !== id)
        set({ chats: filteredChats })

        // If the active chat was deleted, set the first chat as active
        if (activeChat === id && filteredChats.length > 0) {
          set({ activeChat: filteredChats[0].id })
        }
      },
      renameChat: (id, name) => {
        set((state) => ({
          chats: state.chats.map((chat) => (chat.id === id ? { ...chat, name } : chat)),
        }))
      },
      addMessage: (chatId, message) => {
        const newMessage: Message = {
          id: message.id || uuidv4(),
          content: message.content,
          role: message.role,
          createdAt: message.createdAt || new Date().toISOString(),
        }

        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: [...chat.messages, newMessage],
                lastVisited: new Date().toISOString(),
              }
            }
            return chat
          }),
        }))
      },

      // Todo state
      todos: [],
      addTodo: (content) => {
        const newTodo: Todo = {
          id: uuidv4(),
          content,
          completed: false,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ todos: [newTodo, ...state.todos] }))
      },
      toggleTodo: (id) => {
        set((state) => ({
          todos: state.todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
        }))
      },
      deleteTodo: (id) => {
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        }))
      },

      // Initialization
      initializeStore: () => {
        const { chats } = get()

        // Initialize with default chats if none exist
        if (chats.length === 0) {
          const defaultChat: Chat = {
            id: "default-chat",
            name: "New Chat",
            messages: [],
            createdAt: new Date().toISOString(),
            lastVisited: new Date().toISOString(),
          }

          const todoChat: Chat = {
            id: "todo-chat",
            name: "To-Do Chat",
            messages: [],
            createdAt: new Date().toISOString(),
            lastVisited: new Date().toISOString(),
            isDefault: true,
          }

          set({
            chats: [defaultChat, todoChat],
            activeChat: "default-chat",
          })
        }
      },
    }),
    {
      name: "ai-chatbot-storage",
      partialize: (state) => ({
        chats: state.chats,
        todos: state.todos,
        // Don't persist UI state
      }),
    },
  ),
)
