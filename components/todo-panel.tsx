"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function TodoPanel() {
  const { rightSidebarOpen, todos, addTodo, toggleTodo, deleteTodo } = useStore()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const [newTodo, setNewTodo] = useState("")

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo.trim())
      setNewTodo("")
    }
  }

  // If sidebar is closed, don't render anything
  if (!rightSidebarOpen) {
    return null
  }

  return (
    <div
      className={cn(
        "w-64 border-l border-border bg-card flex flex-col h-full",
        isMobile && "absolute right-0 top-0 z-50 h-full",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">To-Do List</h2>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex gap-2">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a task..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTodo()
            }}
          />
          <Button size="icon" onClick={handleAddTodo} disabled={!newTodo.trim()} aria-label="Add task" title="Add task">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {todos.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">No tasks yet. Add one above.</div>
          ) : (
            todos.map((todo) => (
              <div key={todo.id} className="flex items-center justify-between group p-2 rounded-md hover:bg-accent">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                    id={`todo-${todo.id}`}
                  />
                  <label
                    htmlFor={`todo-${todo.id}`}
                    className={cn("text-sm cursor-pointer", todo.completed && "line-through text-muted-foreground")}
                  >
                    {todo.content}
                  </label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label="Delete task"
                  title="Delete task"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
